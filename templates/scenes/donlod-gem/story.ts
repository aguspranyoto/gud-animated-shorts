// REFERENCE SCENE (explainer) — "Kalo Kamu Download Game, Gamenya Itu Ada di Mana Sih?".
// Copy this folder to src/videos/<name>/, rename the constants, keep the grammar.
// Timeline: explainer, table (hook/closing)
// + white studio teardown (internet flow, SSD, folder explosion, NAND cells, page/block, delete ghost).
// Camera grammar: hard cuts at set changes, smootherstep settle glides, creeping holds, 4-5 deg rolls.
import {
  FPS as ENGINE_FPS, V3, Key, Dof,
  dolly, pushK, shotAt as shotAtE, layersAt as layersAtE, camAt as camAtE, dofAt as dofAtE,
} from "../../engine/camera";

export const FPS = ENGINE_FPS;
export const TOTAL = 1650; // 55.0 s — synced to voice.wav (54.27 s)

export type Light = "day";
export type ShotDef = { id: number; a: number; b: number; light: Light; tau: (t: number) => number };
// boundaries = narration line starts (words.json / line_XX durations at 30 fps)
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 107, light: "day", tau: (t) => t },      // L1 hook: desk + laptop click download
  { id: 2, a: 107, b: 186, light: "day", tau: (t) => t },    // L2a internet: router -> laptop packets
  { id: 3, a: 186, b: 260, light: "day", tau: (t) => t },    // L2b "ditulis jadi file. Namanya SSD."
  { id: 4, a: 260, b: 429, light: "day", tau: (t) => t },    // L3 folder explode + compress
  { id: 5, a: 429, b: 550, light: "day", tau: (t) => t },    // L4 steamapps folder
  { id: 6, a: 550, b: 619, light: "day", tau: (t) => t },    // L5 "Terus, gimana caranya?" + play press
  { id: 7, a: 619, b: 806, light: "day", tau: (t) => t },    // L6 read -> decompress -> RAM
  { id: 8, a: 806, b: 907, light: "day", tau: (t) => t },    // L7 "Tapi kok datanya bisa diam..."
  { id: 9, a: 907, b: 1104, light: "day", tau: (t) => t },   // L8 NAND cells + electrons 1/0
  { id: 10, a: 1104, b: 1223, light: "day", tau: (t) => t }, // L9 page write vs block erase
  { id: 11, a: 1223, b: 1339, light: "day", tau: (t) => t }, // L10 delete surprise
  { id: 12, a: 1339, b: 1505, light: "day", tau: (t) => t }, // L11 ghost data stays
  { id: 13, a: 1505, b: TOTAL, light: "day", tau: (t) => t }, // L12 closing desk
];
export const XFADE: Record<number, number> = { 13: 8 };
export const FLASH_AT = 106;

export const shotAt = (f: number) => shotAtE(SHOTS, f);
export const layersAt = (f: number) => layersAtE(SHOTS, XFADE, f);

// -- rig anchors (metres) --
export const RIG: V3 = [0, 1.04, 0];      // studio teardown centre
export const DESK: V3 = [0, 0.88, 0.02];  // laptop screen centre on the desk
const SSD_L: V3 = [-0.2, 1.04, 0.06];
const RAM_R: V3 = [0.2, 1.08, -0.02];

export const CAMS: Record<number, Key[]> = {
  // S1 desk wide, lateral drift so the laptop travels L->R (3.6 s)
  1: [{ f: 0, dur: 107, s: (f) => dolly([1.85 - 0.85 * (f / 107), 1.46, 2.05], DESK, pushK(f, 0, 0.0011), { fov: 42, roll: 0.026 }) }],
  // S2 router -> laptop, low and close, slow slide (2.6 s)
  2: [{ f: 107, dur: 79, s: (f) => dolly([1.05 - 0.4 * ((f - 107) / 79), 1.26, 1.45], [0.0, 0.95, 0.02], pushK(f, 107, 0.0012), { fov: 38, roll: -0.026 }) }],
  // S3 SSD write close-up (2.5 s)
  3: [{ f: 186, dur: 74, s: (f) => dolly([0.52 - 0.14 * ((f - 186) / 74), 1.46, 1.2], [0, 1.05, 0], pushK(f, 186, 0.0012), { fov: 36, roll: 0.044 }) }],
  // S4 exploded folder: settle glide 32 f, then creep (5.6 s)
  4: [
    { f: 260, dur: 32, s: (f) => dolly([-1.05, 1.4, 1.55], [0, 1.08, 0], pushK(f, 260, 0.0011), { fov: 44, roll: -0.035 }) },
    { f: 330, dur: 34, s: (f) => dolly([-0.82, 1.36, 1.3], [0, 1.08, 0], pushK(f, 330, 0.0012), { fov: 43, roll: -0.05 }) },
  ],
  // S5 steamapps folder, lateral drift (4.0 s)
  5: [{ f: 429, dur: 121, s: (f) => dolly([0.84 - 0.36 * ((f - 429) / 121), 1.42, 1.45], [0, 1.1, 0], pushK(f, 429, 0.001), { fov: 38, roll: 0.035 }) }],
  // S6 play button close-up on the laptop screen (2.3 s)
  6: [{ f: 550, dur: 69, s: (f) => dolly([0.26, 1.17, 0.76], [0, 0.93, -0.02], pushK(f, 550, 0.0012), { fov: 27, roll: -0.045 }) }],
  // S7 SSD -> decompress -> RAM (6.2 s)
  7: [
    { f: 619, dur: 90, s: (f) => dolly([0.06 - 0.2 * ((f - 619) / 90), 1.44, 1.95], [0, 1.05, 0], pushK(f, 619, 0.0009), { fov: 46, roll: 0.026 }) },
    { f: 715, dur: 30, s: (f) => dolly([-0.12, 1.42, 1.85], [0, 1.05, 0], pushK(f, 715, 0.001), { fov: 45, roll: 0.017 }) },
  ],
  // S8 chip macro bridge (3.4 s)
  8: [{ f: 806, dur: 101, s: (f) => dolly([0.6 - 0.1 * ((f - 806) / 101), 1.52, 1.5], [0, 1.05, 0], pushK(f, 806, 0.0011), { fov: 42, roll: -0.03 }) }],
  // S9 NAND cells + electrons (6.6 s)
  9: [
    { f: 907, dur: 60, s: (f) => dolly([0.26, 1.5, 1.55], [0, 1.05, 0], pushK(f, 907, 0.001), { fov: 42, roll: 0.017 }) },
    { f: 975, dur: 32, s: (f) => dolly([-0.22, 1.48, 1.5], [0, 1.05, 0], pushK(f, 975, 0.0011), { fov: 42, roll: 0.035 }) },
  ],
  // S10 page write / block erase (4.0 s)
  10: [{ f: 1104, dur: 119, s: (f) => dolly([-0.62 + 0.3 * ((f - 1104) / 119), 1.5, 1.6], [0, 1.03, 0], pushK(f, 1104, 0.001), { fov: 38, roll: -0.026 }) }],
  // S11 delete: cells stay filled while the folder disappears (3.9 s)
  11: [{ f: 1223, dur: 116, s: (f) => dolly([0.7 - 0.2 * ((f - 1223) / 116), 1.5, 1.55], [0, 1.05, 0], pushK(f, 1223, 0.001), { fov: 42, roll: 0.044 }) }],
  // S12 ghost data stays, new data overwrites (5.5 s)
  12: [{ f: 1339, dur: 100, s: (f) => dolly([0.5, 1.48, 1.52], [0, 1.05, 0], pushK(f, 1339, 0.0009), { fov: 42, roll: -0.017 }) }],
  // S13 closing desk wide, drift back (4.8 s)
  13: [
    { f: 1505, dur: 90, s: (f) => dolly([-1.15, 1.5, 2.15], DESK, pushK(f, 1505, 0.0008), { fov: 44, roll: -0.026 }) },
    { f: 1590, dur: 44, s: (f) => dolly([0.92, 1.28, 1.78], [0.24, 0.9, 0.14], pushK(f, 1590, 0.0007), { fov: 43, roll: -0.05 }) },
  ],
};

export const KICKS: [number, number][] = [[107, 0.5], [550, 0.3], [1223, 0.4]];
export const camAt = (id: number, f: number) => camAtE(CAMS, KICKS, id, f);

const ssdFocus = (f: number): V3 => [SSD_L[0], SSD_L[1], SSD_L[2]];
export const DOF: Dof[] = [
  { f: 0, cInf: 0 },
  { f: 107, dur: 30, cInf: 12, focus: () => [...DESK] },
  { f: 186, dur: 30, cInf: 8, focus: () => [...RIG] },
  { f: 260, dur: 30, cInf: 9, focus: () => [...RIG] },
  { f: 429, dur: 30, cInf: 8, focus: () => [...RIG] },
  { f: 550, dur: 30, cInf: 12, focus: () => [...DESK] },
  { f: 619, dur: 30, cInf: 6, focus: ssdFocus },
  { f: 806, dur: 30, cInf: 8, focus: () => [...RIG] },
  { f: 907, dur: 30, cInf: 8, focus: () => [...RIG] },
  { f: 1104, dur: 30, cInf: 8, focus: () => [...RIG] },
  { f: 1223, dur: 30, cInf: 7, focus: () => [...RIG] },
  { f: 1339, dur: 30, cInf: 8, focus: () => [...RIG] },
  { f: 1505, dur: 40, cInf: 0 },
];
export const dofAt = (f: number) => dofAtE(DOF, f);

export const FOREGROUND: [] = [];
export { SSD_L, RAM_R };
