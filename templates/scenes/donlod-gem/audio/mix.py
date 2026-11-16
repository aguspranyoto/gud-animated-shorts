#!/usr/bin/env python3
"""Sound design for "Kalo Kamu Download Game, Gamenya Itu Ada di Mana Sih?"
(explainer reference scene). All sound synthesized in numpy: UI clicks, data
blips, folder/pak whooshes, NAND electron zaps, page-write ticks, erase thud,
ghost shimmer, plus an original plucky bed.
Standard mix: music +3 dB, SFX -6 dB under the voice, ducked by a 400 ms follower.
Usage: python3 audio/mix.py [voice_dir]     (default: ./voice next to this scene)
       voice_dir holds voice.wav + words.json; writes voice_dir/mix.wav
"""
import json, os, subprocess, sys
import numpy as np

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
VDIR = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(os.path.dirname(HERE), "voice")


def load_voice(vdir):
    q = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(vdir, "voice.wav"),
                        "-ar", str(SR), "-ac", "1", "-f", "f32le", "-"], capture_output=True, check=True)
    v = np.frombuffer(q.stdout, dtype=np.float32).copy()
    peak = np.max(np.abs(v)) or 1.0
    return (v / peak * 0.89).astype(np.float32)


def env(n, a=0.005, r=0.08):
    e = np.ones(n)
    na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    na, nr = min(na, n), min(nr, n)
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] *= np.linspace(1, 0, nr)
    return e


def tone(freq, dur, gain=0.2, kind="sine", slide=0.0, a=0.005, r=0.25):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = freq + slide * t
    ph = 2 * np.pi * np.cumsum(f) / SR
    if kind == "sine":
        x = np.sin(ph)
    elif kind == "tri":
        x = 2 * np.abs(2 * ((ph / (2 * np.pi)) % 1) - 1) - 1
    else:
        x = np.sign(np.sin(ph))
    return (x * env(n, a, r) * gain).astype(np.float32)


def noise(dur, gain=0.2, lp_k=0.25, a=0.01, r=0.2, seed=3):
    rng = np.random.default_rng(seed)
    n = int(dur * SR)
    x = rng.standard_normal(n).astype(np.float32)
    # one-pole low-pass for a soft "air" character
    y = np.zeros_like(x)
    acc = 0.0
    for i in range(n):
        acc += lp_k * (x[i] - acc)
        y[i] = acc
    return (y / (np.max(np.abs(y)) or 1) * env(n, a, r) * gain).astype(np.float32)


def put(dst, sig, t, gain=1.0):
    i = int(t * SR)
    if i >= len(dst) or i < 0:
        return
    n = min(len(sig), len(dst) - i)
    dst[i:i + n] += sig[:n] * gain


def click(pitch=1.0):
    out = np.zeros(int(0.22 * SR), dtype=np.float32)
    put(out, tone(1900 * pitch, 0.05, 0.5, "sine"), 0)
    put(out, tone(900 * pitch, 0.09, 0.3, "tri"), 0.004)
    put(out, noise(0.05, 0.25, 0.6, 0.001, 0.03, 7), 0)
    return out


def blip(freq=720.0, dur=0.12, gain=0.35):
    out = np.zeros(int(dur * SR), dtype=np.float32)
    put(out, tone(freq, dur, gain, "sine", slide=freq * 1.2), 0)
    return out


def whoosh(dur=0.7, up=True, gain=0.35, seed=5):
    rng = np.random.default_rng(seed)
    n = int(dur * SR)
    x = rng.standard_normal(n).astype(np.float32)
    # sweeping band: amplitude of a resonant-ish low-pass follows an arc
    y = np.zeros_like(x)
    acc = 0.0
    for i in range(n):
        u = i / n
        k = 0.06 + (0.5 * u if up else 0.5 * (1 - u))
        acc += k * (x[i] - acc)
        y[i] = acc
    shape = np.sin(np.linspace(0, np.pi, n)) ** 1.5
    return (y / (np.max(np.abs(y)) or 1) * shape * gain).astype(np.float32)


def zipshrink(dur=0.5, gain=0.4):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 1400 * np.exp(-3.2 * t) + 180
    ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * env(n, 0.004, 0.12) * gain).astype(np.float32)


def chime(root=523.25, gain=0.3):
    out = np.zeros(int(1.6 * SR), dtype=np.float32)
    for i, m in enumerate([1, 1.5, 2, 3]):
        put(out, tone(root * m, 1.5, gain * (0.5 if i == 0 else 0.22), "sine", r=0.9), i * 0.05)
    return out


def tick(freq=2400.0):
    out = np.zeros(int(0.09 * SR), dtype=np.float32)
    put(out, tone(freq, 0.05, 0.34, "tri", r=0.04), 0)
    put(out, noise(0.03, 0.12, 0.7, 0.001, 0.02, 11), 0)
    return out


def thud(gain=0.5):
    out = np.zeros(int(0.8 * SR), dtype=np.float32)
    put(out, tone(70, 0.7, gain, "sine", slide=-25, r=0.5), 0)
    put(out, noise(0.3, gain * 0.5, 0.12, 0.005, 0.25, 13), 0)
    return out


def shimmer(dur=1.4, gain=0.22, seed=17):
    out = np.zeros(int(dur * SR), dtype=np.float32)
    rng = np.random.default_rng(seed)
    for i, f in enumerate([880, 1174.7, 1567.98, 2093.0]):
        put(out, tone(f, 1.0, gain * (0.7 ** i), "sine", r=0.6), i * 0.08)
    put(out, noise(0.5, gain * 0.4, 0.5, 0.02, 0.4, seed), 0.02)
    return out


def music_bed(dur, gain=1.0):
    """Plucky tech bed: C - G - Am - F, 112 BPM, soft triangle arps + sub."""
    bpm = 112.0
    beat = 60.0 / bpm
    prog = [261.63, 196.00, 220.00, 174.61]
    out = np.zeros(int((dur + 1.0) * SR), dtype=np.float32)
    t = 0.0
    bar = 4 * beat
    k = 0
    while t < dur:
        root = prog[k % 4]
        for b in range(4):
            tt = t + b * beat
            # arp
            for j, mult in enumerate([1.0, 1.5, 2.0, 1.5]):
                f = root * mult
                put(out, tone(f, 0.34, 0.075 if j == 0 else 0.045, "tri", r=0.28), tt + j * beat / 4)
            put(out, tone(root / 2, beat * 0.9, 0.09, "sine", r=0.2), tt)
            put(out, noise(0.06, 0.02, 0.5, 0.004, 0.05, 21 + b), tt + beat * 0.5)
        t += bar
        k += 1
    out *= gain
    # gentle fade in/out
    n = len(out)
    out[: int(0.6 * SR)] *= np.linspace(0, 1, int(0.6 * SR))
    out[-int(1.6 * SR):] *= np.linspace(1, 0, int(1.6 * SR))
    return out


def find_time(words, *keys):
    for w in words:
        wl = w["w"].lower().strip(".,?!")
        for k in keys:
            if k in wl:
                return w["s"]
    return None


def main():
    voice = load_voice(VDIR)
    dur = len(voice) / SR
    words = json.load(open(os.path.join(VDIR, "words.json"), encoding="utf-8"))
    bed = music_bed(dur)[: len(voice)]
    sfx = np.zeros_like(voice)

    def at(*keys):
        return find_time(words, *keys)

    # --- UI + download ---
    t = at("klik")
    if t is not None:
        put(sfx, click(1.0), t)
    t = at("download")
    if t is not None:
        put(sfx, whoosh(0.9, up=True, gain=0.3, seed=9), t - 0.1)
        for i in range(4):
            put(sfx, blip(680 + i * 90, 0.1, 0.22), t + 0.25 + i * 0.18)
    # --- internet flow ---
    t = at("server", "ngalir")
    if t is not None:
        for i in range(6):
            put(sfx, blip(900 - i * 60, 0.09, 0.2), t + i * 0.22)
    # --- write to the drive + SSD reveal ---
    t = at("ditulis")
    if t is not None:
        put(sfx, tick(2600), t)
        put(sfx, tick(2100), t + 0.12)
    t = at("ssd")
    if t is not None:
        put(sfx, chime(587.33, 0.26), t)
    # --- folder opens, many files, compression ---
    t = at("tunggu")
    if t is not None:
        put(sfx, whoosh(0.8, up=False, gain=0.34, seed=23), t + 0.1)
    t = at("foldernya", "folder")
    if t is not None:
        put(sfx, whoosh(0.7, up=True, gain=0.3, seed=31), t)
    t = at("ribuan")
    if t is not None:
        for i in range(7):
            put(sfx, tick(1700 + (i % 3) * 400), t + i * 0.09, 0.7)
    t = at("dipadatkan")
    if t is not None:
        put(sfx, zipshrink(0.5, 0.42), t - 0.05)
        put(sfx, click(1.3), t + 0.34)
    # --- steamapps ---
    t = at("steamapps")
    if t is not None:
        put(sfx, click(1.15), t)
        put(sfx, blip(520, 0.16, 0.2), t + 0.12)
    t = at("buka", "sendiri")
    if t is not None:
        put(sfx, whoosh(0.5, up=True, gain=0.22, seed=41), t)
    # --- play press ---
    t = at("pencet", "play")
    if t is not None:
        put(sfx, click(0.9), t)
        put(sfx, chime(659.25, 0.3), t + 0.18)
    # --- read -> unzip -> RAM ---
    t = at("dibaca")
    if t is not None:
        for i in range(8):
            put(sfx, blip(760 + i * 40, 0.08, 0.18), t + i * 0.13)
    t = at("dibuka")
    if t is not None:
        put(sfx, zipshrink(0.45, 0.3), t)
    t = at("ram")
    if t is not None:
        put(sfx, chime(783.99, 0.24), t)
    t = at("berat")
    if t is not None:
        put(sfx, whoosh(0.9, up=True, gain=0.22, seed=53), t)
    # --- chip macro ---
    t = at("kotak", "sekecil")
    if t is not None:
        put(sfx, whoosh(0.9, up=False, gain=0.34, seed=61), t - 0.1)
        put(sfx, tick(1200), t + 0.5)
    t = at("miliaran")
    if t is not None:
        for i in range(6):
            put(sfx, blip(1500 + i * 120, 0.06, 0.12), t + i * 0.08)
    # --- electrons ---
    t = at("elektron")
    if t is not None:
        for i in range(5):
            put(sfx, blip(2200 + i * 220, 0.05, 0.1), t + 0.15 + i * 0.28)
    t = at("nol")
    if t is not None:
        put(sfx, tick(900), t)
    # --- page writes / block ---
    t = at("halaman")
    if t is not None:
        for i in range(8):
            put(sfx, tick(1900 + i * 70), t + i * 0.11, 0.8)
    t = at("blok")
    if t is not None:
        put(sfx, thud(0.42), t)
        put(sfx, whoosh(0.6, up=False, gain=0.2, seed=71), t + 0.05)
    # --- delete + ghost ---
    t = at("hapus")
    if t is not None:
        put(sfx, whoosh(0.7, up=False, gain=0.4, seed=83), t)
        put(sfx, click(0.75), t + 0.25)
    t = at("sistemnya", "nandain")
    if t is not None:
        put(sfx, tick(1400), t + 0.2)
    t = at("isinya", "masih")
    if t is not None:
        put(sfx, shimmer(1.4, 0.2), t)
    t = at("ketimpa")
    if t is not None:
        put(sfx, blip(520, 0.2, 0.3), t)
        for i in range(4):
            put(sfx, blip(700 + i * 90, 0.09, 0.2), t + 0.18 + i * 0.14)
    # --- closing ---
    t = at("internet")
    if t is not None:
        put(sfx, whoosh(1.1, up=False, gain=0.24, seed=97), t - 0.2)
    if words:
        put(sfx, chime(523.25, 0.3), max(0.2, words[-1]["s"] - 0.9))

    # --- duck the bed under the voice ---
    win = int(0.4 * SR)
    pad = np.pad(np.abs(voice), (win, win))
    foll = np.convolve(pad, np.ones(win) / win, mode="valid")[: len(voice)]
    duck = 1.0 / (1.0 + 4.0 * np.clip((foll - 0.05) * 8, 0, 1))
    music_db, sfx_db = 3.0, -6.0
    mix = voice + bed * duck * (10 ** (music_db / 20)) * 0.32 + sfx * (10 ** (sfx_db / 20))
    mix = mix / max(1.0, np.max(np.abs(mix)) / 0.895)
    stereo = np.stack([mix, mix], axis=1)
    out = os.path.join(VDIR, "mix.wav")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                    "-c:a", "pcm_s16le", out], input=stereo.astype(np.float32).tobytes(), check=True)
    print(f"mix.wav: {dur:.2f}s  ({len(words)} words, {int(dur * SR)} samples)")


if __name__ == "__main__":
    main()
