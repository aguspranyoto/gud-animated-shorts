#!/usr/bin/env python3
"""VoiceStudio per-line, per-speaker VO generation for gud-animated-shorts.

Reads voice/script.txt:
    <title>
    Speaker 1 (laki) [curious]
    line text...
    Speaker 2 (perempuan) [explaining]
    line text...

- One take per narration line with that line's speaker profile, then
  concatenated to voice.wav (48 kHz mono). Output: line_XX_spN.wav +
  voice.wav + cast.json (speaker -> profile mapping).
- Casting: the 6 canonical voices live in VoiceStudio (local backend,
  source of truth -- NOT the repo folder). The script AUTO-PICKS one
  voice per Speaker from the Speaker label (`Speaker 1 (laki)` ->
  adult male, `Speaker 2 (anak perempuan)` -> little girl female) and
  REPORTS the mapping in `cast.json`. The project DEFAULT VO is
  `young male` (VOICE_DEFAULT_PROFILE): it is used for single-speaker
  scripts and for any speaker whose label has no gender/age. CLI args /
  VOICE_MAP only override the auto-pick when explicitly passed.
- `voice-backup/*.ovsvoice` in this repo is BACKUP ONLY (exported via
  POST /personas/export). It is never read directly: import a bundle
  into VoiceStudio first (POST /personas/import or UI Import Persona),
  then generate from the live profile.
- Bracket tags are stripped (VoiceStudio would read them literally) and never
  sent as `instruct` unless in INSTRUCT_OK: the sidecar rejects unknown
  instruct items with HTTP 400.

Usage:
  python3 templates/scripts/voice_gen_voicestudio.py [scene_dir] [N="voice name" ...]
  python3 templates/scripts/voice_gen_voicestudio.py --list
  scene_dir holds voice/script.txt; wavs land in voice/.
  Env: VOICESTUDIO_URL (default http://127.0.0.1:3900), VOICE_DEFAULT_PROFILE
  (default VO for single-speaker / unlabeled speakers, default `young male`),
  VOICE_PROFILE_ID (hard single-speaker override, any label),
  VOICE_MAP (optional override, e.g. '1=adult male,2=little girl female').
  CLI per-speaker args (e.g. 2="young female") override VOICE_MAP and the auto-pick.
Requires: VoiceStudio app running, ffmpeg on PATH.
"""
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request

BACKEND = os.environ.get("VOICESTUDIO_URL", "http://127.0.0.1:3900")
# Hard override for a single speaker (any label). Empty = not set.
DEFAULT_PROFILE = os.environ.get("VOICE_PROFILE_ID", "")
# Project default VO: used for single-speaker scripts and for speakers whose
# label has no gender/age hint. A labeled speaker keeps its auto-pick.
DEFAULT_VOICE = os.environ.get("VOICE_DEFAULT_PROFILE", "young male")
LANGUAGE = "Indonesian"

# The 6 canonical voices (live VoiceStudio profiles = source of truth).
# voice-backup/*.ovsvoice holds exports of these as backup only.
CANONICAL_VOICES = [
    "adult male",
    "adult female",
    "young male",
    "young female",
    "little boy male",
    "little girl female",
]

# emotion tag -> VoiceStudio instruct vocabulary (verified working). Anything
# else is OMITTED: the sidecar 400s on unsupported instruct items.
INSTRUCT_OK = {"whispering": "whisper"}

MALE_WORDS = {"laki", "laki-laki", "cowo", "cowok", "male", "boy", "bapak", "ayah"}
FEMALE_WORDS = {"perempuan", "wanita", "cewe", "cewek", "female", "girl", "ibu", "mama"}
CHILD_WORDS = {"anak", "kecil", "bocil", "bocah", "balita", "kid", "child", "boy", "girl"}
YOUNG_WORDS = {"muda", "remaja", "young", "teen", "pemuda", "abg"}
# label (age, gender) -> canonical voice name
VOICE_BY_ROLE = {
    ("adult", "male"): "adult male",
    ("adult", "female"): "adult female",
    ("young", "male"): "young male",
    ("young", "female"): "young female",
    ("child", "male"): "little boy male",
    ("child", "female"): "little girl female",
}


def norm_gender(s):
    toks = set(re.split(r"[\s_-]+", (s or "").strip().lower()))
    if toks & FEMALE_WORDS:  # check female FIRST ("cewek" has no male issue,
        return "female"      # but explicit beats heuristic anyway)
    if toks & MALE_WORDS:
        return "male"
    return "unknown"


def norm_age(s):
    toks = set(re.split(r"[\s_-]+", (s or "").strip().lower()))
    if toks & CHILD_WORDS:
        return "child"
    if toks & YOUNG_WORDS:
        return "young"
    return "adult"  # default: adult


def api_get(path):
    with urllib.request.urlopen(BACKEND + path, timeout=30) as r:
        return json.load(r)


def resolve_profile(want, profiles):
    """Match a wanted voice by profile id (exact) or name (case-insensitive,
    full name first, then substring). Returns (profile_id, name)."""
    w = (want or "").strip()
    if not w:
        raise SystemExit("empty voice choice")
    for p in profiles:
        if p["id"] == w:
            return p["id"], p.get("name", "")
    low = w.lower()
    for p in profiles:  # exact name first
        if (p.get("name", "") or "").lower() == low:
            return p["id"], p.get("name", "")
    hits = [(p["id"], p.get("name", "")) for p in profiles
            if low in (p.get("name", "") or "").lower()]
    if len(hits) == 1:
        return hits[0]
    if not hits:
        avail = ", ".join(f"{pid} '{nm}'" for pid, nm in
                          [(p["id"], p.get("name", "")) for p in profiles])
        raise SystemExit(f"voice '{want}' not found. Available: {avail}")
    amb = ", ".join(f"{pid} '{nm}'" for pid, nm in hits)
    raise SystemExit(f"voice '{want}' is ambiguous: {amb}. Name one exactly.")


def parse_explicit_map(spk_args):
    """Parse CLI N="voice" pairs + VOICE_MAP env ('1=adult male,2=young female').
    CLI wins over env. Returns {speaker_N: wanted voice}."""
    explicit = {}
    for chunk in os.environ.get("VOICE_MAP", "").split(","):
        chunk = chunk.strip()
        if not chunk or "=" not in chunk:
            continue
        k, v = chunk.split("=", 1)
        k, v = k.strip(), v.strip().strip("\"'")
        if k.isdigit() and v:
            explicit[int(k)] = v
    for a in spk_args:
        k, v = a.split("=", 1)
        v = v.strip().strip("\"'")
        if v:
            explicit[int(k.strip())] = v
    return explicit


def pick_profiles(speakers, explicit=None):
    """speakers: {N: (gender, age)}. explicit: {N: wanted voice name/id}.
    Auto-picks from the Speaker label; explicit choice wins.
    Returns {N: (profile_id, name)} + notes."""
    profiles = api_get("/profiles")
    if not profiles:
        raise SystemExit("no saved voice profiles: create one in VoiceStudio Clone first")
    avail = [(p["id"], p.get("name", "")) for p in profiles]
    by_name = {name.lower(): (pid, name) for pid, name in avail}
    explicit = explicit or {}

    def auto_pick(gender, age, used):
        # Project default VO: any speaker whose label says nothing about
        # gender/age gets 'young male' (override with VOICE_DEFAULT_PROFILE).
        if gender == "unknown" and DEFAULT_VOICE:
            hit = by_name.get(DEFAULT_VOICE.lower())
            if hit and hit[0] not in used:
                return hit, f"default VO '{DEFAULT_VOICE}' (label has no gender/age)"
        want = VOICE_BY_ROLE.get((age, gender))
        if want and want in by_name and by_name[want][0] not in used:
            return by_name[want], f"auto: {age} {gender} -> '{want}'"
        # fallback: any unused profile matching gender
        for pid, name in avail:
            if pid in used:
                continue
            low = name.lower()
            if gender == "female" and "female" in low:
                return (pid, name), f"auto fallback (gender {gender})"
            if gender == "male" and "male" in low and "female" not in low:
                return (pid, name), f"auto fallback (gender {gender})"
        rest = [(pid, name) for pid, name in avail if pid not in used] or avail
        return rest[0], "auto fallback (whatever is available)"

    mapping, used, notes = {}, set(), []
    for n in sorted(speakers):
        gender, age = speakers[n]
        if n in explicit:
            pid, name = resolve_profile(explicit[n], profiles)
            mapping[n] = (pid, name)
            reused = " (reused)" if pid in used else ""
            used.add(pid)
            notes.append(f"Speaker {n} ({gender}/{age}): {pid} '{name}' (override{reused})")
            continue
        if len(speakers) == 1 and DEFAULT_PROFILE:
            mapping[n] = (DEFAULT_PROFILE, "(VOICE_PROFILE_ID)")
            notes.append(f"Speaker {n}: single-voice default {DEFAULT_PROFILE}")
            continue
        (pid, name), how = auto_pick(gender, age, used)
        used.add(pid)
        mapping[n] = (pid, name)
        notes.append(f"Speaker {n} ({gender}/{age}): {pid} '{name}' ({how})")
    return mapping, notes


def parse_script(path):
    with open(path, encoding="utf-8") as f:
        raw = [ln.rstrip("\n") for ln in f]
    title = ""
    lines = []  # (speaker, gender, age, tag, text)
    sp, gender, age, tag, buf = 1, "unknown", "adult", "explaining", []
    header = re.compile(r"^Speaker\s+(\d+)(?:\s*\(([^)]*)\))?\s*(?:\[(\w+)\])?\s*$", re.IGNORECASE)
    tagline = re.compile(r"^\[(\w+)\]\s*$")

    def flush():
        if buf:
            lines.append((sp, gender, age, tag, " ".join(buf)))

    for ln in raw:
        s = ln.strip()
        if not s:
            continue
        m = header.match(s)
        if m:
            flush()
            buf = []
            sp = int(m.group(1))
            gender = norm_gender(m.group(2))
            age = norm_age(m.group(2))
            tag = (m.group(3) or "explaining").lower()
            continue
        m2 = tagline.match(s)
        if m2:
            flush()
            buf = []
            tag = m2.group(1).lower()
            continue
        if not title and not lines and not buf and sp == 1 and gender == "unknown":
            title = s  # first line is the title until proven otherwise
            continue
        buf.append(s)
    flush()
    # single-voice script without headers: title consumed line 1 by mistake?
    if not lines:
        raise SystemExit("script.txt has no narration lines")
    return title, lines


def generate(text, profile_id, tag, out_path, ref_text=None):
    fields = {"text": text, "language": LANGUAGE, "profile_id": profile_id}
    if tag in INSTRUCT_OK:
        fields["instruct"] = INSTRUCT_OK[tag]
    if ref_text:  # sidecar needs the matching reference transcript,
        fields["ref_text"] = ref_text  # else it demands an STT model
    boundary = "----voicestudio-boundary"
    body = b""
    for k, v in fields.items():
        body += f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode("utf-8")
    body += f"--{boundary}--\r\n".encode("utf-8")
    req = urllib.request.Request(
        BACKEND + "/generate", data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=600) as r:
            data = r.read()
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}: {e.read().decode('utf-8', 'replace')[:800]}")
        raise
    with open(out_path, "wb") as f:
        f.write(data)


def list_profiles():
    profiles = api_get("/profiles")
    print(f"live VoiceStudio profiles ({BACKEND}):")
    for p in profiles:
        print(f"  {p['id']}  '{p.get('name', '')}'  lang={p.get('language', '')}")
    print("canonical 6: " + ", ".join(CANONICAL_VOICES))
    print(f"project default VO: {DEFAULT_VOICE} (single speaker / unlabeled speakers)")
    print("backup only (import first, never read directly): voice-backup/*.ovsvoice")


def main():
    args = sys.argv[1:]
    if "--list" in args:
        list_profiles()
        return
    scene, spk_args = ".", []
    for a in args:
        if "=" in a and a.split("=", 1)[0].strip().isdigit():
            spk_args.append(a)
        elif scene == ".":
            scene = a
        else:
            print(f"ignoring unknown arg: {a}")
    explicit = parse_explicit_map(spk_args)
    vdir = os.path.join(scene, "voice") if not scene.endswith("voice") else scene
    title, lines = parse_script(os.path.join(vdir, "script.txt"))
    print(f"title: {title}\nlines: {len(lines)}")
    genders = {}
    for sp, gender, age, _tag, _text in lines:
        genders.setdefault(sp, (gender, age))
    mapping, notes = pick_profiles(genders, explicit)
    print("casting:")
    for n in notes:
        print("  " + n)
    ref_map = {p["id"]: p.get("ref_text") or "" for p in api_get("/profiles")}
    wavs = []
    for i, (sp, _gender, _age, tag, text) in enumerate(lines, 1):
        pid, _name = mapping[sp]
        out = os.path.join(vdir, f"line_{i:02d}_sp{sp}.wav")
        print(f"[{i}/{len(lines)}] sp{sp} ({tag}) {text[:60]}...", flush=True)
        generate(text, pid, tag, out, ref_map.get(pid))
        wavs.append(out)
    lst = os.path.join(vdir, "concat.txt")
    with open(lst, "w", encoding="utf-8") as f:
        for w in wavs:
            f.write(f"file '{os.path.basename(w)}'\n")
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", lst,
                    "-ar", "48000", "-ac", "1", os.path.join(vdir, "voice.wav")],
                   check=True, capture_output=True, cwd=vdir)
    total = 0.0
    for w in wavs:
        q = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                            "-of", "default=noprint_wrappers=1:nokey=1", w],
                           capture_output=True, text=True, check=True)
        total += float(q.stdout.strip())
    cast = {"title": title, "backend": BACKEND,
            "speakers": {str(n): {"profile_id": pid, "name": name,
                                  "gender": genders[n][0], "age": genders[n][1]}
                         for n, (pid, name) in mapping.items()}}
    json.dump(cast, open(os.path.join(vdir, "cast.json"), "w"), indent=1, ensure_ascii=False)
    print(f"voice.wav total = {total:.2f}s (words.json still needs its own STT pass)")


if __name__ == "__main__":
    main()
