# Gud Animated Shorts

The free Claude skill from the video **"How to Make Viral Animated Shorts Using Claude (Full Workflow)"**, adapted for Indonesian educational content.

It makes 45-60 s vertical animated educational shorts in Bahasa Indonesia kasual (Aku/Kamu): 2D characters in a colourful 3D world, with ink outlines, a painted town, lens blur, gliding cameras, AI TTS voice with emotion tags, march score and sound effects. Storytelling is escalating — from an everyday phenomenon to deeper science/tech (see `references/VIDEO_FORMAT.md`). Everything is rendered with three.js inside Remotion on your own PC, with no AI video generator.

Proven look: **The Bridge That Fell for a Song**, a 67 s short about the 1831 Broughton bridge. Keep its visual style, use the VIDEO_FORMAT formula for story/script/voice.

## What's inside

| Path                               | What it is                                                                                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `SKILL.md`                         | The skill: the full pipeline, every rule, every fix, and the final look values                                                                                     |
| `templates/engine/`                | The reusable engine: 2D cartoon cards, painted-texture kit, scenery kit, two-tone shade, ink pass, lens blur, grade, camera grammar, audio DSP kit                 |
| `templates/scenes/broughton-1831/` | The finished example scene (Broughton 1831, 67 s): story/camera tables, town + chain-bridge world, marching-column cast, composer — copy this to start a new short |
| `templates/audio/`                 | The synthesized sound: SFX, march music, the mix with ducking and loudness                                                                                         |
| `templates/scripts/`               | Stills, side-by-side sheets, shot merge and frame-by-frame QA helpers                                                                                              |
| `references/VIDEO_FORMAT.md`        | Content format source of truth: escalating storytelling, script formula, emotion tags, topic rules, script.txt standard |
| `references/STYLE_BIBLE.md`        | The script and visual formula measured from 20 reference shorts                                                                                                    |
| `references/reports/`              | Seven measured reports: motion, depth, textures, characters, lighting, outlines, grade                                                                             |
| `references/frames/`               | 38 full-size reference frames (540x960) to compare your frames against                                                                                             |
| `references/sheets/`               | 20 contact sheets, one per reference short, 60 frames each (1,200 frames)                                                                                          |

## Install

1. Copy this folder to `~/.claude/skills/gud-animated-shorts/` (clone it there, or download the ZIP).
2. You need [Remotion](https://www.remotion.dev/) with `@remotion/three`, plus Node, Python 3 and ffmpeg.
3. In Claude Code, say: _"Pakai skill gud animated shorts, buatkan short tentang …"_.

Claude then follows `SKILL.md` + `references/VIDEO_FORMAT.md`: topic and facts, then script (`script.txt` Bahasa Indonesia + emotion tags), then voice (AI TTS), then the shot plan in `story.ts`, then stills, then renders. Agents check your frames against the reports and the frames, and you get the final 2K render and sound mix.

## Notes

- Language: Bahasa Indonesia kasual (Aku/Kamu) only. Target Indonesia, tone ceria/lucu/energik, durasi 45-60 detik untuk Shorts/TikTok/Reels.
- Script output is TTS-only: `script.txt` = judul + narasi + emotion tags, tanpa timestamp/arahan visual.
- Set `REMOTION_TMP` to a folder on a big drive. Every Remotion bundle copies `public/` (~1.3 GB) into the temp folder.
- Story, characters and voice should always be your own. Use the references for the look, not the content.

## License

The code and docs are MIT (see `LICENSE`). The reference frames are included for style study only.
