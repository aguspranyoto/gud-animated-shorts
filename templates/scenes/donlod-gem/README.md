# donlod-gem — explainer reference scene

Reference for **`explainer`** shorts: a technical teardown of one object, no characters.
Proven output: 55 s, "Kalo Kamu Download Game, Gamenya Itu Ada di Mana Sih?" (where a
downloaded game actually lives). Shot grammar, camera table, label cards, prop reveals
and the SFX cue sheet are all here — copy the folder, rename, replace the topic.

Sibling reference for the **`story`** type: `templates/scenes/broughton-1831/`.

## What this scene teaches

| idea | where |
|---|---|
| hybrid set: everyday desk room (hook/closing) ⇄ white studio rig (teardown) | `world.ts` — `buildRoom()` / `buildStudio()`, `deskMode` in `update()` |
| 13-shot table with boundaries taken from the narration line starts | `story.ts` — `SHOTS` (frames = `words.json` line starts × 30) |
| camera grammar: lateral drift in the hook, settle glide + creep per shot, 1.5-3° rolls | `story.ts` — `CAMS` |
| per-shot prop reveal with eased `popIn` (kills QA frame pops) | `world.ts` — labels, bit cards, new-data blocks |
| canvas text cards on the NOINK layer, billboarded each frame | `world.ts` — `labelMesh()` + `billboard()` |
| exploded folder → compressed `PAK` | `world.ts` — `s4()` |
| SSD → unzip → RAM flow with particles | `world.ts` — `s7()` |
| NAND cell grid: write per page, erase per block, ghost data after delete | `world.ts` — `s8()`…`s12()` |
| captions from `voice/words.json`, always on | `DonlodGem.tsx` — `CaptionOverlay` |
| SFX + music bed cued off the same words | `cues.md`, `audio/mix.py` |

Reusable hardware (laptop, router, SSD, RAM, desk) lives in `templates/shared/tech/`;
this scene predates it and carries its own copies, so read both when copying.

## Using it

1. `cp -r templates/scenes/donlod-gem <project>/src/videos/<name>` and rename
   `DonlodGem` → `<Name>` (composition + exported frames constant) in the composer,
   `Root.tsx` registration, and `SCRIPT.md`.
2. Write `SCRIPT.md` (facts + sources) and `voice/script.txt`, then run
   `templates/scripts/voice_gen_voicestudio.py <scene>`.
3. Whisper the concatenated `voice.wav` with `--word_timestamps True`, build
   `voice/words.json`, fix the display spelling (see SKILL.md step 3).
4. Recompute `SHOTS[*].a/b` from the line starts, keep `TOTAL = last line + ~1 s`.
5. `python3 audio/mix.py voice` → `voice/mix.wav`, then mux with `-map 0:v:0 -map 1:a:0`.
6. Contact sheet (`scripts/stills.mjs` + `scripts/sheet.py`) **before** any 2K render.

## Scene constants worth keeping

- Desk room: desk 1.18 × 0.64 m at y 0.7725, laptop 0.5 × 0.34, router at x −0.4,
  SSD seat x +0.43 z 0.12 (parallel to the laptop, ≥ 4 cm clear of its body).
- Studio: pedestal r 0.47, top y 1.0, props at 1.02–1.06, camera 1.5–1.9 m out.
- Lens: `cInf` 7–9 for studio close-ups (8 for shots with text cards), 11–13 for the desk.
- Labels: 0.26–0.54 m wide pills, 0.2–0.3 m above the prop, `popIn` over 7 frames.

## Voice / audio in this folder

`voice/script.txt` is the finished narration (12 lines, `Speaker 1 (laki)`, emotion tags)
and `voice/words.json` its word timings — keep them as an example of the expected format,
replace them for a new topic. `audio/mix.py` regenerates `voice/mix.wav` from any
`voice.wav` + `words.json` pair (numpy only, no samples).
