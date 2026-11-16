# SCRIPT.md — "Kalo Kamu Download Game, Gamenya Itu Ada di Mana Sih?"

Judul dari user: "kalo kamu download game, gamenya ada dimana sih?"
→ dirapikan tanda baca/kapital tanpa mengubah maksud: **Kalo Kamu Download Game, Gamenya Itu Ada di Mana Sih?**

Tipe: **explainer** (teardown objek, tanpa karakter bicara).
Formula: hook "Kalo kamu..." → penjelasan dasar (data jadi file di penyimpanan) → istilah kunci (SSD / sel NAND) → eskalasi (paket kompresi + RAM) → penjelasan dalam (halaman vs blok) → closing mengejutkan (hapus game ≠ data hilang).

## Fakta (sudah dicek)
- Download = data dari server mengalir lewat internet lalu **ditulis jadi file** di penyimpanan lokal. Default library Steam di Windows: `C:\Program Files (x86)\Steam\steamapps\common` (macOS: `~/Library/Application Support/Steam/steamapps/common`). Satu game = satu folder di `common`.
  Sumber: PCGamingWiki (Glossary:Game data), docs.57studios.net (default install path), technobezz.com (2026), sectorgaming.blog (2026).
- Isi folder game **bukan satu file besar**: ribuan file, sebagian besar aset dikemas dalam arsip paket terkompresi (.pak, .vpk, .arc). Steam mengirim konten sebagai chunk ber-hash dan memverifikasinya; kalau chunk gagal verifikasi, diunduh ulang.
  Sumber: Steamworks Documentation (Content system / SteamPipe), PCGamingWiki.
- Saat main: aset dibaca dari penyimpanan, didekompresi, lalu dimuat ke RAM. RAM volatile (hilang saat mati) dan jauh lebih kecil dari ukuran game → game modern mengalirkan data terus-menerus dari drive (streaming). Karena itu kecepatan baca SSD berpengaruh ke loading.
  Sumber: PCGamingWiki (game data), materi umum arsitektur PC; Unreal/Unity docs soal paket aset.
- Di dalam SSD: sel NAND flash = transistor dengan floating gate / charge-trap. Menulis = menyuntikkan elektron lewat terowongan (Fowler–Nordheim), elektron terperangkap dan mengubah threshold voltage → dibaca sebagai 0/1. Tidak butuh daya untuk menyimpan.
  Sumber: Western Digital "Flash 101 and Flash Management" (white paper), eyesonflash.com (Flash Foundations pt.2), Purdue CS448 handout, debtman.dev (2026).
- Ukuran akses NAND: **tulis/baca per page** (kasar 2–16 KB), **hapus per block** (ratusan page, orde MB). Page tidak bisa ditimpa di tempat; controller menulis ke page baru dan menandai page lama invalid (FTL mapping).
  Sumber: Western Digital Flash 101, red-gate.com Storage 101, spdk.io (NAND flash SSD internals), hardwaretheory.net.
- Menghapus file = sistem melepas alamat logisnya; TRIM memberi tahu SSD bahwa blok itu bebas. Isi fisiknya tetap ada sampai block itu di-erase/ditimpa saat garbage collection.
  Sumber: debtman.dev (TRIM & alignment), spdk.io (deallocate/unmap/trim), vikingtechnology SSD primer (TRIM).
- (Cadangan, tidak dipakai di narasi) Di Android, game terpasang di memori internal `/data/app`, data tambahan di `/Android/obb`, bukan di internet dan bukan otomatis di SD card.

## Aturan produksi (VIDEO_FORMAT.md + SKILL.md)
- Bahasa Indonesia kasual Aku/Kamu, tone ceria, target Indonesia.
- Single speaker: `Speaker 1 (laki)` → auto-pick `adult male` (VoiceStudio).
- 12 baris, 1 emotion tag per baris, 1 take VoiceStudio per baris → concat `voice.wav`.
- Kata Inggris ditulis ulang ejaan Indonesia di `script.txt`: donlod, gem, fail, stim, stimaps, es es de, ram, nand, plei.
  Caption (`words.json`) memakai ejaan benar: download, game, file, Steam, steamapps, SSD, RAM, NAND, play.
- Durasi final: **54,27 detik** (12 take, 141 kata ter-whisper) — di dalam target 45–60 dtk.
- Suara: `voice.wav` + `words.json` (141 kata, timing per kata), mix di `voice/mix.wav` (lihat `cues.md`).

## script.txt (TTS-only)
→ `voice/script.txt`

## Storyboard final (13 shot, semua timing dari `voice/words.json` @30 fps)
| shot | frame | isi |
|---|---|---|
| S1 | 0–107 | meja: laptop, router, klik download + bar progres, kursor |
| S2 | 107–186 | paket data mengalir router → laptop, busur wifi |
| S3 | 186–260 | SSD di pedestal, tulisan "SSD", rim chip berdenyut |
| S4 | 260–429 | folder terbuka → 14 file bertebaran → dipadatkan jadi kotak PAK |
| S5 | 429–550 | folder "steamapps" + 6 kartu file |
| S6 | 550–619 | close-up tombol play di layar laptop, ditekan |
| S7 | 619–806 | SSD → kotak unzip → RAM, partikel mengalir |
| S8 | 806–907 | glide ke chip NAND, grid sel menyala per baris (label NAND) |
| S9 | 907–1104 | makro sel: elektron masuk, sel jadi 1, kartu "1"/"0" |
| S10 | 1104–1223 | tumpukan halaman ditulis satu per satu, volume BLOCK muncul |
| S11 | 1223–1339 | hapus: sel tetap menyala, label KOSONG |
| S12 | 1339–1505 | data lama masih menyala, blok baru menimpa (sel biru) |
| S13 | 1505–1650 | balik ke meja, push ke SSD kecil di samping laptop |

## Catatan teknis scene
- `src/videos/donlod-gem/{story.ts, world.ts, DonlodGem.tsx}`, komposisi `DonlodGem` di `Root.tsx`.
- Semua prop prosedural (three.js), label teks = canvas texture card di layer NOINK (wajib `g.add(label)` — kalau cuma didaftarkan di `this.labels`, label tidak pernah masuk scene).
- FOV kamera = vertikal: half-width = d·tan(fov/2)·0.5625 (aspect 9:16), jangan pakai rumus horizontal.
- Mix: `scripts/mix_donlod.py` → `voice/mix.wav` (−14,1 LUFS, true peak −1,0 dBTP).
