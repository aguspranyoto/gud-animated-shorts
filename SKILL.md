---
name: gud-animated-shorts
description: Make a 45-60 s vertical cartoon educational short in Bahasa Indonesia in the "2D characters in a colourful 3D world" style (flat bean-head cartoon cards with ink outlines, painted 3D town/world with black ink lines, saturated sky, depth-of-field backgrounds, gliding cameras, synthesized SFX + music), rendered with three.js inside Remotion. Voice is ALWAYS VoiceStudio voice cloning (one saved voice profile per speaker: `Speaker 1`, `Speaker 2`, ..., generated per line, one WAV per script line, then concatenated; talking mouths follow words.json timing). Captions are ALWAYS on (max 2 words per chunk, timed to words.json). Storytelling follows references/VIDEO_FORMAT.md (escalating from everyday phenomenon to complex science/tech). Use when the user asks for an educational animation short, "like the bridge video" look, "in that cartoon 3D style", or says "use the cartoon short skill".
---

# Cartoon 3D educational short (three.js + Remotion, Bahasa Indonesia)

Content format source of truth: **references/VIDEO_FORMAT.md** (escalating educational storytelling, 45-60 s, Bahasa Indonesia kasual Aku/Kamu, target Indonesia).
Visual style reference: **The Bridge That Fell for a Song** (67 s, 1831 Broughton bridge). Keep its look, replace its story formula with VIDEO_FORMAT.md.
- Code: a scene folder `src/videos/<name>/` of your Remotion project (e.g. the example `templates/scenes/broughton-1831/`, composition `BroughtonShort`, 1080x1920, 30 fps) on top of the reusable engine `templates/engine/`.
- Script, voice and sound: `~/bridge-short/` (but script format follows VIDEO_FORMAT.md: `script.txt` with `Speaker N` labels + narration + emotion tags, no timestamps/visual directions).
- Style research: `references/` (VIDEO_FORMAT.md for storytelling/script/voice, STYLE_BIBLE.md + reports/*.md + frames/ for visuals).

The style reference is a channel studied privately (`references/`: STYLE_BIBLE.md, reports/*.md, frames/).
- Those videos are private study material. Never upload, publish or send them.
- Never copy their scripts, characters or shots. Story, characters and voice are always OUR OWN.
- Never say the channel's name in a voice-over or description.

User rules that apply:
- Captions are ALWAYS on (see Captions). Never ship without them.
- Voice is ALWAYS VoiceStudio voice cloning, one saved voice profile PER SPEAKER (see Casting below). Never use another TTS.
- Audio is ALWAYS generated per line: one VoiceStudio take per `script.txt` narration line with that line's speaker profile, then concatenated to `voice.wav`. Never one giant single generation for the whole script.
- Emotion tags (`[curious]`, `[excited]`, `[seriously]`, `[surprised]`, `[explaining]`, `[enthusiastic]`, `[amazed]`, `[energetic]`, `[playful]`, `[whispering]`) are performance directions in `script.txt` only. VoiceStudio does NOT read bracket tags, so strip them before generating and map each line's tag to that line's VoiceStudio `Style` field instead. Every narration line still carries one tag; never monotone.
- **Casting (AI auto-picks, never ask the user).** The project owns 6 canonical voices, and they live in VoiceStudio (local backend `http://127.0.0.1:3900`) — that is the source of truth, NOT the repo folder: `adult male`, `adult female`, `young male`, `young female`, `little boy male`, `little girl female` (backups in `voice-backup/*.ovsvoice`, import-first, never read directly). Label each line `Speaker 1`, `Speaker 2`, ... with gender/age where known (`Speaker 2 (perempuan)`, `Speaker 3 (anak laki)`); the helper auto-picks from the label (`laki` → adult male, `anak perempuan` → little girl female, `remaja` → young ...) and reports the mapping in `cast.json`. Only pass an explicit voice (`VOICE_MAP` / CLI `N="voice"`) to override the auto-pick. Single-speaker default is `adult male`.
- Bahasa Indonesia kasual only (gaya Aku/Kamu). Never English narration.
- Target market Indonesia. Tone ceria, lucu, energik.
- Durasi 45-60 detik. Platform YouTube Shorts, TikTok, Reels.
- Jokes are researched real facts. Information accuracy checked; never sacrifice accuracy for sensation.
- Standard mix: music +3 dB, SFX -6 dB, voice unchanged.
- Final export 2K vertical: 1440x2560, `--scale 1.3333`.
- Opus max verifies every check.
- Save after every step.
- "Just do it" once the script is approved.

## Pipeline
1. **Topic and facts.** Pick one topic that starts from something easy to imagine, has a scientific/logical explanation, can escalate to something more complex, has interesting animation potential, and gives the viewer new knowledge (see VIDEO_FORMAT.md section 5). Good categories: everyday science/physics, daily tech, human body, nature, history, transport, economy, unique Indonesian phenomena.
   - Write the facts with their source at the top of `SCRIPT.md`. Check accuracy before writing.
2. **Script** (45-60 s, Bahasa Indonesia kasual Aku/Kamu). Escalating formula from VIDEO_FORMAT.md, not the old bridge beats:
   - **Hook "Kalo kamu...":** everyday relatable situation ("Kalo kamu nyalain AC, kamar kamu jadi dingin...").
   - **Basic Explanation:** explain the phenomenon simply (AC memindahkan panas, bukan menciptakan dingin).
   - **Key Information "Ini namanya...":** introduce the scientific term naturally (Ini namanya refrigeran).
   - **Escalation:** connect to a more complex system (indoor/outdoor AC, kompresor, kondensor...).
   - **Deep Explanation:** components/process/how-it-works step by step.
   - **Closing:** conclusion or surprising fact so the viewer leaves with new knowledge.
   - Mandatory storytelling bridges: "Kalo kamu...", "Nah, ini namanya...", "Tapi tunggu dulu!", "Terus, gimana caranya?". Never jump straight to the main topic; let the viewer discover it gradually.
   - Every narration line gets one speaker label + one emotion tag. Output standard: `script.txt` contains only title + `Speaker N` (+ optional gender) + narration + emotion tags (no timestamps, visual directions, scene descriptions, or editing notes — that file is TTS-only).
   - English words in the narration MUST be respelled the way they sound in Indonesian orthography, so the Indonesian TTS pronounces them right (lowbat → lowbet, summary → sameri). Never write the original English spelling in `script.txt`.
   - Never describe on screen what the viewer already sees.
3. **Voice (ALWAYS VoiceStudio, per line, per speaker).** Strip the `[tags]` from `script.txt` (they are directions only — VoiceStudio would read them as literal words), then generate ONE take per narration line with that line's speaker profile (see Casting above; default single-speaker profile is `adult male`, and multi-speaker voices are auto-picked from the Speaker labels):
   - VoiceStudio Clone page (or API `POST /generate` on the local backend `http://127.0.0.1:3900` with `profile_id`): text = one stripped line, language Indonesian, `Style` = that line's emotion tag without brackets (e.g. `[excited]` → Style `excited`). Template helper: `templates/scripts/voice_gen_voicestudio.py` (parses speakers, auto-picks each speaker's voice from the label, concatenates).
   - VoiceStudio Clone page (or API `POST /generate` on the local backend `http://127.0.0.1:3900` with `profile_id`): text = one stripped line, language Indonesian, `Style` = that line's emotion tag without brackets (e.g. `[excited]` → Style `excited`).
   - Keep the reference clip ≤20 s with a matching transcript, or the sidecar fails with `REFERENCE_STT_MISSING` (see troubleshooting: short 3-10 s reference is ideal).
   - Concatenate the per-line WAVs in script order to `voice.wav` (5-10 ms crossfade or silence gap between lines).
   - Then make per-line word timings with any speech-to-text with word times and offset each line's times by its start in the concat → `words.json` (`[{ w, s, e, sp }]` — `sp` = speaker number, so each character's mouth follows only its own lines via `mouthAt(words.filter(w => w.sp === N), t)`). Hand-fix the timings. Then QA the display text: STT transcribes what it hears (the TTS respellings), so restore proper display spelling in `w` WITHOUT touching `s`/`e` (e.g. `enol.` → `E0.`, `edi,` → `eddy,`, `standless.` → `stainless.`). The voice audio keeps the respelled pronunciation; captions show the correct written form. Everything (shots, SFX, captions, mouths) is timed to words.json.
   - Put them in the project folder, e.g. `~/bridge-short/voice/` (`line_01.wav`, `line_02.wav`, ... + `voice.wav` + `words.json`).
4. **Shot plan** in `story.ts`: copy `templates/scenes/broughton-1831/` (the finished example scene) to `src/videos/<name>/`, import the engine from `templates/engine/`, register a new composition in `src/Root.tsx`, and rename scene constants to your story. Generic camera grammar lives in `templates/engine/camera.ts`; the scene's story.ts holds only your SHOTS/CAMS/DOF/story-physics tables.
   - `SHOTS`: id, a/b frames, light day/golden/night, crowd mode, `tau` story time.
   - `XFADE`: crossfades at place/time changes.
   - `FLASH_AT`: a white flash after the hook.
   - `CAMS`: per-shot keys `{f, dur?, cut?, s: f => {pos, look, fov, roll}}`.
   - `KICKS`: impact flip-shakes.
   - `DOF`/`dofAt`: lens blur per beat.
   - `FOREGROUND`: near framing props.
   - Every visual reaction lands 0-3 frames before its word.
5. **World.**
   - `lights.ts`: LIGHTS plus the LOOK sky/river/cloud palette per light.
   - `shade.ts`: two-tone shading and `untone()`.
   - `build.ts`: town, houses and Kenney CC0 kit props, recoloured, with sight-line culling of anything blocking a camera.
   - `templates/shared/house/`: reusable indoor dining room (`buildHouse()` + anchors: tableTop/plateKid/plateMom/kidSeat/momSeat/windowPos/lampPos/doorPos). Copy to your project's `src/shared/house/` for any indoor dialogue short instead of rebuilding a room.
   - `paint.ts`: HD Canvas2D painted textures with seams painted in as dark tints.
   - `world.ts`: sky shader, fog = horizon colour, river, per-frame posing, sun frozen per shot and camera-relative.
6. **Characters.**
   - `toon.ts`: the Canvas2D `Pen` drawing API, 600x1000 design canvas, soles at y = 975, bean heads, stick limbs, plum variable-width outline, face library.
   - `cast.ts`: camera-facing billboards, crowds, effect cards, blinks, walk cycles. All billboards go on the `NOINK` layer.
   - `cardshade.ts`: cards lit by the scene light, no emissive.
   - **Talking mouths (mandatory for every speaking shot).** Expression carries the emotion; the jaw follows the voice: feed that speaker's `words.json` timings into `mouthAt(words, t, seed)` (engine `cast.ts`) and pass the result as the character's `FrontOpts`/`SideOpts` `mouth` (0 closed .. 1 open). Below ~0.12 the static expression mouth is drawn; above it the jaw opens. Silence = mouth shut.
   - **Back view (OTS foregrounds, wides).** `person(cam, who, x, y, z, { side: false, mirror: false, back: true }, {}, {}, scale, { mode: "sit" | "stand" })` draws hair + shoulders with no face (`bodyBack` in `toon.ts`, bonnet renders as headscarf). Use it whenever a character faces away from the camera instead of faking it with a side profile.
7. **Post** (`<Name>.tsx` composer + engine `ink.ts` + `lensblur.ts` + `grade.ts`).
   - Composer order: ink → lens pre → lens main → bloom → NEUTRAL tone map → grade (MSAA 4).
   - Every pixel parameter scales with output height / 1920.
8. **Sound** (engine kit `templates/engine/audio/`: dsp.py, instruments.py, sfx_gen.py; scene composition `audio/`: timeline.py, sfx.py, music.py, mix.py, cues.md).
   - Event table → synthesized SFX plus an original score ducked under the voice.
   - Output: mix.wav (48 kHz, exact length), stems and cues.md.
   - Lock the picture's time constants before the sound is made. Any later timing change means re-running the sound.
9. **Look checks.** Run `node scripts/stills.mjs out/<name>/x_ 100,400 0.5`.
   - Set `ENTRY=src/sandboxes/<n>/index.tsx` (and `COMP=<Comp>`) to render a sandbox copy.
   - Make side-by-sides against reference frames with `python scripts/sbs_sheet.py out.jpg --ours ... --ref ...`.
   - Send them to an Opus max verifier: 1-3 images, a ≤200-word verdict.
10. **Contact sheet gate (MANDATORY — never render video before this passes).**
    - Render one still per second: `node scripts/stills.mjs out/<name>/sheet/f_ 0,30,60,... 0.3`, then tile with `python3 scripts/sheet.py out/<name>/sheet f_ out/<name>/sheet_<name>.jpg 10` (10 columns, like `references/sheets/*.jpg`).
    - Review the WHOLE sheet for: broken/void frames, characters missing or eclipsed, wrong facing, caption timing/overlap, flicker-risk geometry (camera passing through cards/furniture). Fix, re-sheet, repeat until clean.
    - Only then proceed; the 2K render must use the exact code the approved sheet was made from.
11. **Final render.**
    - `npx remotion render src/index.ts <Comp> out/<name>/video.mp4 --codec h264 --crf 16 --scale 1.3333 --concurrency=1 --browser-executable="<path to Chrome or Brave>"`
      (`--concurrency=1` is MANDATORY, not optional: parallel render tabs share one GPU process, and under contention some frames get captured before WebGL finishes — whole-scene gray flashes (~20 % of frames) that never appear in stills. Proven 2026-11-14: 362 pop frames with default concurrency vs 5 benign ones with `--concurrency=1` on the same scene.)
    - Mux with `-map 0:v:0 -map 1:a:0` (Remotion writes a silent audio track).
    - QA: `python scripts/short_qa.py final.mp4 out/<name>/qa shots.json` checks every frame for black, white, frozen and pop frames, plus loudness and sheets. A pop count far above the cut/flash/caption budget means re-render (see concurrency rule above) — never ship flicker.
    - Fix anything it finds, then run a deep Opus audit.
12. **Deliver.** SendUserFile the final mp4, update memory, write notes.

## Captions (ALWAYS on; every short ships with them)
Reference style (`references/frames/*.jpg`, measured in STYLE_BIBLE.md): one chunk of
max 2 words, a single line, white bold sans with a black outline, centred
lower-middle (~64 % of frame height), hard swaps on each chunk. Gaps between chunks
show nothing. Template: `templates/engine/captions.tsx` (`chunkWords` / `captionAt`
/ `CaptionOverlay`); copy it into the scene and render the overlay on top of the
shot stack in the composer (`<AbsoluteFill>` over the `ShotView`s, DOM so it scales
with `--scale` automatically). Timing source of truth is the scene's
`voice/words.json` (`[{ w, s, e }]` seconds); chunk words greedily in order (casing
and punctuation as spoken). QA: every chunk is timed to words.json, max 2 words,
one line only (`whiteSpace: nowrap`), nothing overlaps the safe bottom band,
display spelling is the correct written form, never the TTS respelling
(`E0` not `enol`, `eddy` not `edi` — see Voice step for the words.json text QA).

## Final look values (Broughton 1831 after 4 verifier rounds; presets in `templates/engine/`, example scene in `templates/scenes/broughton-1831/`)
Start every new short from the engine + the example scene (copy `templates/scenes/broughton-1831/` to `src/videos/<name>/`): the look lives in these engine values, the
story lives in the scene's story.ts / world layout / cast roles. Opus max scores at the end: colour day 7, golden 5-6,
lighting 5-6, ink 6, textures 5-6, characters 7, depth 6-7, composition 6-7 (from 5/3/4/5/4/7/4/6 at the start).
- **Light presets** (`lights.ts`, sun camera-relative and frozen per shot):
  - day: az 75 / el 48, lit [1.58,1.5,1.33], shade [.30,.29,.36], lift [.05,.06,.11] (cool tint ONLY in shade), sky
    top #3e7fd2 → horizon #b8d0ec, fog = horizon, 25→300 m, uSat 1.08, ~15 % blue haze past 60 m.
  - golden: az 6 / el 7 (backlit low sun), key toward #FFB36B ×1.5, violet-blue shade (facade ≈ #444380), sky
    #ffc47c → #8a6f8a, peach fog only past 50 m, sun disc #ffcf9e + bloom, contact blobs + real card shadows.
  - night: az -30 / el 35 (pale moon, no real card shadows), cool-blue lit [.55,.62,.85], dark shade
    [.10,.11,.20], sky top #060a1a → horizon #1a2440, fog #141c33 20→260 m, moon disc #e8ecf5 + bloom, uSat 0.95.
    For a night scene just set `light: "night"` in `story.ts` SHOTS — the LIGHTS / LOOK / GRADES night presets
    do the rest. Never invent a new light key, never edit the engine for time-of-day.
- **Albedos** (`paint.ts`/`build.ts`): muted brick / cream / ochre / terracotta houses with plinth, cornice, sills,
  hoods, door step, chimney + pot, heights 7 / 8.4 / 9.8 m; warm grey/beige stone (saturation −35 % from "storybook");
  ochre wood deck C* ~51-58 with near-black seams; iron dark and desaturated. Never lemon, never lavender lit faces.
- **Ink** (`ink.ts`): #030303, 5.1 px near (6 m) → 3.3 px far (90 m) at 1080x1920, creases ×0.8 from 35°, depth
  jumps from 1 %, fog tint 0.3 only far; character cards on layer `NOINK` (they carry their own plum ink).
- **Lens** (`lensblur.ts` + `dofAt` in story.ts): cInf px at 1080: hook/river CU 15-16, close-ups 12-14, MS 10-12,
  park 7, golden sway 5, wides/aerials 0. Focus on the eyes of the front row.
- **Post** (`<Name>.tsx` composer): ink → lens pre → lens main → bloom (thr 1.0, int .5, 6 levels, radius .6) → NEUTRAL tone
  map → grade; MSAA 4. Film grain exists but is OFF (reference measures no grain; it quadruples the file size).
- **Characters** (`toon.ts`/`cast.ts`/`cardshade.ts`): bean heads h/w .94, plum ink #241726, eyes .26 W apart, no blush,
  14 expressions; adults 3.5 head-heights; walk bob 5 %, lean 1-7°, planted 0.8 m stride; blinks 0.5-2.3 s; tight
  contact shadow ~.5 under the feet + sun-direction tail by day; golden rim inner only (never an offset outer copy).
- **Camera** (`story.ts`): cuts on big jumps, smootherstep glides 18-40 f, every hold creeps (no static hold ≥4 f),
  flip kicks decaying over 7 f on impacts, 4-4.6° rolls, foreground props (`FOREGROUND`) in ~1/3 of shots.
  Pacing: cut every ~4 s (120 f) through the hook/first 13 s — never a single continuous push-in longer than
  ~5 s. Prefer lateral tracking drifts (camera slides sideways, subject travels L→R) over push-in zooms for
  B-roll variety. Split any shot longer than ~150 f into two keys (reframe glide ~32 f, then creep ≤0.0012/f).
  Ease every prop animation with smootherstep over ≥60 f; never snap positions between shots.

## Look targets (measured from the reference; see references/reports/)
- **Ink:**
  - World lines: about 3 px at 1080 wide, near-black #0b0a0c, nearly constant with distance. Silhouettes, depth jumps and normal creases only. No line on wall/floor joins or the horizon. Character cards are never outlined by the world ink.
  - Character ink: dark plum #201628-#2f1d28, thicker on the bottom/shadow side.
- **Colour:**
  - Day median luma ~.57. Non-ink p5 ~.23 (no crushed blacks). Lit chroma C* p90 ~55. Day sky top ~#5e93d9, horizon 1.28x brighter.
  - Golden: peach horizon #ffd08a, violet-blue shadows (never brown), backlit sun.
- **Depth:**
  - DOF on about 1/3 of screen time (CU, MS, inserts), cInf 10-16 px at 1080, focus on the eyes. Establishing and wide shots stay sharp.
  - Fog = horizon colour, 25→420 m day, 20→360 m golden, 20→260 m night (fog #141c33).
  - Bloom only on HDR emissives: threshold 1.0.
- **Camera:**
  - Hard cuts on big jumps. Everything else is a smootherstep glide of 18-40 f, peak ≤ 25 px/f at 720p.
  - Every hold pushes in 0.15-0.35 %/f, with 0.6 %/f on punch words.
  - Pacing: a fresh cut every ~4 s (120 f) in the hook; no single push-in runs longer than ~5 s.
  - B-roll variety comes from lateral tracking drifts (camera slides sideways, subject travels L→R),
    not from repeated push-in zooms. Keep the subject fully in frame with margin — never crop the hero prop.
  - Shots longer than ~150 f get two keys (reframe glide ~32 f, then creep ≤0.0012/f).
  - Prop animation (slides, lifts, reveals) always eased with smootherstep over ≥60 f, timed clear of camera cuts.
  - Rolls of 4-5°.
  - No hand-held float. Impact shakes flip sign every frame and decay over 7 f.
- **Characters:**
  - About 3.5 head-heights tall, legs 1.4 HH.
  - Stick limbs about 0.055 of head width, ink-dot hands.
  - Bean head (h/w ~0.93, narrower chin, pointier crown).
  - No blush or eye highlights. Faces at brightness ~.93.
  - Walk bob 3-7 %, lean 1-7°, planted feet.
  - Blinks every 0.5-2.3 s, lasting 4 f.

## Look-match loop (how the bridge look was reached; reuse for any "make it look like X" pass)
1. **Measure the reference first.** One analysis agent per topic (motion, depth, textures, characters, lighting, outlines, grade), each writing numbers, not adjectives, to `references/reports/<topic>.md`. Shared brief: `compare/CONTEXT.md`. Reports are the source of truth for every agent after.
2. **Sandboxes, one owner per file.** Copy the project folder to `src/videos/<name>_{cam,world,mat,char,post}` with entries `src/sandboxes/<n>/index.tsx` (same `index.tsx` as main, only the import path changed). Ownership used for the example scene:
   - cam: story.ts (camera keys, cuts, kicks, DOF table, foreground props)
   - world: world.ts, lights.ts, shade.ts, grade.ts (sun, sky, fog, river, colour, grade)
   - mat: paint.ts, build.ts (painted textures, buildings, props)
   - char: toon.ts, cast.ts, cardshade.ts (character drawing, posing, card lighting, fx cards)
   - post: ink.ts, <Name>.tsx, lensblur.ts (outline pass, composer, lens blur, bloom)
   Agents only edit their own files in their own sandbox and render stills with `ENTRY=src/sandboxes/<n>/index.tsx node scripts/stills.mjs out/<name>/<n>/x_ <frames> 0.5`.
3. **Merge** with `SCENE=src/videos/<name> python scripts/merge.py [cam,world,mat,char,post]` (backs main up to `backup/<scene>_<time>/`, copies owned files only). Then `npx tsc --noEmit` (filter to the project folder), then **re-sync every sandbox from main** (`cp -f src/videos/<name>/* src/videos/<name>_<n>/`) before the next round.
4. **Verify** with a fresh Opus max agent: side-by-side sheets (`python scripts/sbs_sheet.py out.jpg --ours a b --ref r1 r2`), score each area out of 10 (colour day / golden, lighting, ink, textures, characters, depth, composition) plus a numbered fix list with frame numbers. Map each fix to the file owner and resume that owner's agent with SendMessage (keeps its context). Bridge scores: round 1 5/3/4/5/4/7/4/6 → round 2 5/4/5/6/4/7/6/6 → round 3 see notes.
5. Contracts between owners live in exported constants (e.g. `NOINK` layer from ink.ts, `dofAt`/`FOREGROUND` from story.ts, `LIGHTS`/`LOOK` from lights.ts). Changing a contract means telling every owner that reads it.

## Gotchas
- Time of day is a shot property, never an engine edit: for a night/"malam hari" scene just set
  `light: "night"` in `story.ts` SHOTS. The engine already carries day/golden/night presets
  (LIGHTS / LOOK / GRADES / GRADE_STRENGTH / CONTACT); moon, lamps or other night props go in the
  scene's own world.ts, not in `templates/engine/`.
- Kenney nature-kit materials are teal: recolour them by material name in build.ts.
- Cameras end up inside houses: the sight-line culler in build.ts/world.ts removes anything blocking any camera ray.
- Ink in the same merged effect pass as DOF gets overwritten. Ink must be its own pass before the blur.
- Pixel-sized post parameters must scale with resolution: stills are at 0.5, the final at 1.333. R3F clamps dpr to ≥ 1, so `--scale 0.5` stills still render a 1080x1920 buffer.
- **Disk:** every Remotion bundle copies `public/` (~1.3 GB) into `the temp folder\remotion-webpack-bundle-*` and never deletes it. 60+ GB filled the system drive during the bridge passes and a render died with ENOSPC. Always render with `export TEMP='<big drive>/remotion-tmp' TMP='<big drive>/remotion-tmp'` (stills.mjs sets it itself) and ask the user before deleting old bundle folders in the shared the temp folder (auto mode blocks the sweep). <big drive>/remotion-tmp fills too (~500 folders / 110 GB after the 4 bridge rounds): when a project is finished and nothing is rendering, delete its `remotion-webpack-bundle-*` and `puppeteer_dev_chrome_profile-*` folders there.
- In JS strings write `"<big drive>/remotion-tmp"`, never `"<big drive>\remotion-tmp"` (`\r` becomes a carriage return).
- Remotion writes a silent audio track: mux with `-map 0:v:0 -map 1:a:0`.
- Sub-agents can't write report files in this harness: ask them for a ≤150-word final message and save it yourself to `out/<name>/<n>/REPORT.md`.
- Scratch `.ts` files inside `out/` break `tsc`: name them `.txt`.
- 2K renders run ~4 fps (≈10 min for 67 s). Stills at 0.5 take 3-8 s each after a ~40 s bundle.
- Film grain at 2.5 % made the 2K file 910 MB instead of ~250 MB and will turn to mush on YouTube; the reference has none. Keep it off.

## Readability traps the verifier caught (check every new prop/shot for these)
- **A swing drawn as one rope that disappears behind the kid reads as a HANGING.** Always two ropes to a wide plank
  with the kid between them (`swingKid` in toon.ts), and a frame whose legs clear the arc (A-frame at each end).
- Props or flotsam closer than ~2 m to a lens become huge cut-off blobs at the frame edge. When a camera moves, re-check
  every prop near its new position (the river cameras moved into the floating hats).
- A foreground bush cut by the frame edge reads as a "green ball"; a foreground prop must be recognisable or gone.
- Flags: red + yellow star/diamond reads as Vietnam's. Use a period-correct flag (St George's cross for England 1831).
- Painted signs lit by a side sun go grey-blue and unreadable: give the sign face an unlit material.
- Golden rim light done as an offset outer copy turns every hat into a picture frame: inner rim only, head/torso only.
- Balcony/railing rails at chest height through characters: put the lens ~2.5 m up so rails cross legs, not torsos.
- Flat holds read as freezes in QA (frozen span ≥12 f): every hold needs a creeping push-in.
