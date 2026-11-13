# Voice backup (BACKUP ONLY — bukan sumber voice)

File `.ovsvoice` di folder ini adalah hasil export dari VoiceStudio
(`POST /personas/export/{profile_id}`), satu file per voice:

- `adult male`, `adult female`
- `young male`, `young female`
- `little boy male`, `little girl female`

Sumber kebenaran (source of truth) adalah **live profile di VoiceStudio**
(`GET http://127.0.0.1:3900/profiles`). Script generate
(`templates/scripts/voice_gen_voicestudio.py`) TIDAK PERNAH membaca file
di sini — ia selalu generate dari live profile.

## Restore (kalau profile hilang dari VoiceStudio)

Via API:

```bash
curl -X POST http://127.0.0.1:3900/personas/import \
  -F "file=@voice-backup/adult_male.ovsvoice"
```

atau dari UI VoiceStudio: Import Persona, pilih file `.ovsvoice`.

## Export ulang (update backup)

```bash
curl -X POST http://127.0.0.1:3900/personas/export/81996991 \
  -o voice-backup/adult_male.ovsvoice
```

Cek daftar profile + id dulu dengan:

```bash
python3 templates/scripts/voice_gen_voicestudio.py --list
```
