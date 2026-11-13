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
- Casting: GET /profiles on the local backend, pick by saved-profile name:
  name containing "female" = female voice, name containing "male" = male voice
  (check "female" FIRST — it contains the substring "male"). No match? Use
  whatever profile is available and REPORT the mapping so proper profiles
  can be created later.
- Bracket tags are stripped (VoiceStudio would read them literally) and never
  sent as `instruct` unless in INSTRUCT_OK: the sidecar rejects unknown
  instruct items with HTTP 400.

Usage: python3 templates/scripts/voice_gen_voicestudio.py [scene_dir]
  scene_dir holds voice/script.txt; wavs land in voice/.
  Env: VOICESTUDIO_URL (default http://127.0.0.1:3900), VOICE_PROFILE_ID
  (default profile when script.txt has no Speaker labels).
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
DEFAULT_PROFILE = os.environ.get("VOICE_PROFILE_ID", "")
LANGUAGE = "Indonesian"

# emotion tag -> VoiceStudio instruct vocabulary (verified working). Anything
# else is OMITTED: the sidecar 400s on unsupported instruct items.
INSTRUCT_OK = {"whispering": "whisper"}

MALE_WORDS = {"laki", "laki-laki", "cowo", "cowok", "male", "bapak", "ayah"}
FEMALE_WORDS = {"perempuan", "wanita", "cewe", "cewek", "female", "ibu", "mama"}


def norm_gender(s):
    s = (s or "").strip().lower()
    if s in MALE_WORDS:
        return "male"
    if s in FEMALE_WORDS:
        return "female"
    return "unknown"


def api_get(path):
    with urllib.request.urlopen(BACKEND + path, timeout=30) as r:
        return json.load(r)


def pick_profiles(speakers):
    """speakers: {N: gender}. Returns {N: (profile_id, name)} + notes."""
    profiles = api_get("/profiles")
    if not profiles:
        raise SystemExit("no saved voice profiles: create one in VoiceStudio Clone first")
    avail = [(p["id"], p.get("name", "")) for p in profiles]

    def by_gender(gender, used):
        cands = []
        for pid, name in avail:
            if pid in used:
                continue
            low = name.lower()
            if gender == "female" and "female" in low:
                cands.append((pid, name))
            elif gender == "male" and "male" in low and "female" not in low:
                cands.append((pid, name))
        if not cands:  # fallback: whatever is available ("sedapetnya")
            cands = [(pid, name) for pid, name in avail if pid not in used] or avail
        return cands[0]

    mapping, used, notes = {}, set(), []
    for n in sorted(speakers):
        gender = speakers[n]
        if len(speakers) == 1 and DEFAULT_PROFILE:
            mapping[n] = (DEFAULT_PROFILE, "(VOICE_PROFILE_ID)")
            notes.append(f"Speaker {n}: single-voice default {DEFAULT_PROFILE}")
            continue
        pid, name = by_gender(gender, used)
        used.add(pid)
        mapping[n] = (pid, name)
        notes.append(f"Speaker {n} ({gender}): {pid} '{name}'")
    return mapping, notes


def parse_script(path):
    with open(path, encoding="utf-8") as f:
        raw = [ln.rstrip("\n") for ln in f]
    title = ""
    lines = []  # (speaker, gender, tag, text)
    sp, gender, tag, buf = 1, "unknown", "explaining", []
    header = re.compile(r"^Speaker\s+(\d+)(?:\s*\(([^)]*)\))?\s*(?:\[(\w+)\])?\s*$", re.IGNORECASE)
    tagline = re.compile(r"^\[(\w+)\]\s*$")

    def flush():
        if buf:
            lines.append((sp, gender, tag, " ".join(buf)))

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


def generate(text, profile_id, tag, out_path):
    fields = {"text": text, "language": LANGUAGE, "profile_id": profile_id}
    if tag in INSTRUCT_OK:
        fields["instruct"] = INSTRUCT_OK[tag]
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


def main():
    scene = sys.argv[1] if len(sys.argv) > 1 else "."
    vdir = os.path.join(scene, "voice") if not scene.endswith("voice") else scene
    title, lines = parse_script(os.path.join(vdir, "script.txt"))
    print(f"title: {title}\nlines: {len(lines)}")
    genders = {}
    for sp, gender, _tag, _text in lines:
        genders.setdefault(sp, gender)
    mapping, notes = pick_profiles(genders)
    print("casting:")
    for n in notes:
        print("  " + n)
    wavs = []
    for i, (sp, _gender, tag, text) in enumerate(lines, 1):
        pid, _name = mapping[sp]
        out = os.path.join(vdir, f"line_{i:02d}_sp{sp}.wav")
        print(f"[{i}/{len(lines)}] sp{sp} ({tag}) {text[:60]}...", flush=True)
        generate(text, pid, tag, out)
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
            "speakers": {str(n): {"profile_id": pid, "name": name, "gender": genders[n]}
                         for n, (pid, name) in mapping.items()}}
    json.dump(cast, open(os.path.join(vdir, "cast.json"), "w"), indent=1, ensure_ascii=False)
    print(f"voice.wav total = {total:.2f}s (words.json still needs its own STT pass)")


if __name__ == "__main__":
    main()
