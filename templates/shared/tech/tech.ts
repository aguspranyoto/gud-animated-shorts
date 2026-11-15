// Reusable tech props for explainer shorts: laptop, wifi router, SSD (M.2), RAM,
// plus the desk room they sit in and a canvas text-label card.
// ---------------------------------------------------------------------------
// Lives in the skill so every tech short reuses the same hardware instead of
// rebuilding it. Copy this file to <your-project>/src/shared/tech/tech.ts (or
// import from templates/) — it only needs the engine (three + templates/engine/shade).
//
//   import { buildDeskRoom, buildLaptop, buildRouter, buildSSD, buildRam, makeLabel, faceLabels } from "../../shared/tech/tech";
//   const room = buildDeskRoom(); scene.add(room.group);
//   const laptop = buildLaptop(); laptop.group.position.set(...room.anchors.laptopSeat);
//   laptop.setProgress(0.6); laptop.setPlayPress(1);
//   const ssd = buildSSD(); ssd.setWrite(0.8);
//
// Contract (metres, +y up, props face +z toward the camera, y=0 is the floor):
// - Every builder returns { group, ...handles } — never edit the caller's scene.
// - Meshes are MeshLambertMaterial + engine twoTone() (ink / grade / fog treat
//   them like the rest of the world); self-lit bits (screens, LEDs, indicators)
//   are MeshBasicMaterial so bloom can catch them above 1.0.
// - Animations are driven by the caller: pass a 0..1 factor (setProgress,
//   setPlayPress, setWrite, setFill) or seconds (router.animate(t, on)).
// - Labels are canvas cards with alphaTest, so `noInkFallback()` puts them on the
//   NOINK layer: call faceLabels([label], camera) once per frame.
import * as THREE from "three";
import { twoTone } from "../../engine/shade";

export type V3 = [number, number, number];

export const TECH = {
  desk: { w: 1.18, h: 0.055, d: 0.64, top: 0.7725 }, // table top surface height
  laptop: { w: 0.5, d: 0.34, lidW: 0.5, lidH: 0.34, screenW: 0.46, screenH: 0.3 },
  router: { w: 0.17, d: 0.11, h: 0.045 },
  ssd: { w: 0.3, d: 0.105, t: 0.012 }, // M.2 2280, drawn oversize for readability
  ram: { w: 0.34, h: 0.1, chips: 8 },
} as const;

const lam = (color: THREE.ColorRepresentation) => twoTone(new THREE.MeshLambertMaterial({ color }));
const glow = (color: THREE.ColorRepresentation) => new THREE.MeshBasicMaterial({ color });

const box = (w: number, h: number, d: number, m: THREE.Material, x = 0, y = 0, z = 0) => {
  const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  me.position.set(x, y, z);
  me.castShadow = true;
  me.receiveShadow = true;
  return me;
};
const cyl = (r: number, h: number, m: THREE.Material, x = 0, y = 0, z = 0, seg = 28) => {
  const me = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m);
  me.position.set(x, y, z);
  me.castShadow = true;
  me.receiveShadow = true;
  return me;
};
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
/** pop a label/prop in over `n` frames instead of switching `visible` (kills QA pops) */
export const popIn = (o: THREE.Object3D, f: number, f0: number, n = 7) => {
  o.scale.setScalar(Math.max(0.001, smooth((f - f0) / n)));
};

// ---------------- canvas text label ----------------
/** Rounded dark pill with bold white text, drawn on a canvas and mapped to a
 *  plane of width `w` metres. alphaTest + transparent ⇒ NOINK layer. */
export function makeLabel(text: string, w = 0.3, color = "#141c2b", fontPx = 92): THREE.Mesh {
  const cv = document.createElement("canvas");
  cv.width = 640; cv.height = 160;
  const g = cv.getContext("2d")!;
  g.clearRect(0, 0, cv.width, cv.height);
  const r = 54;
  g.beginPath();
  g.moveTo(r, 12); g.lineTo(cv.width - r, 12); g.quadraticCurveTo(cv.width - 12, 12, cv.width - 12, r);
  g.lineTo(cv.width - 12, cv.height - r); g.quadraticCurveTo(cv.width - 12, cv.height - 12, cv.width - r, cv.height - 12);
  g.lineTo(r, cv.height - 12); g.quadraticCurveTo(12, cv.height - 12, 12, cv.height - r);
  g.lineTo(12, r); g.quadraticCurveTo(12, 12, r, 12);
  g.closePath();
  g.fillStyle = color; g.fill();
  g.strokeStyle = "#f2f4f8"; g.lineWidth = 10; g.stroke();
  g.fillStyle = "#ffffff";
  g.font = `900 ${fontPx}px Arial Black, Arial, Helvetica, sans-serif`;
  g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(text, cv.width / 2, cv.height / 2 + 4);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, (w * cv.height) / cv.width),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.5, depthWrite: false, side: THREE.DoubleSide }),
  );
  mesh.userData.isLabel = true;
  return mesh;
}

const tmpV = new THREE.Vector3();
/** yaw every label card toward the camera (call once per frame) */
export function faceLabels(labels: THREE.Mesh[], cam: THREE.PerspectiveCamera) {
  for (const l of labels) {
    if (!l.visible) continue;
    l.getWorldPosition(tmpV);
    l.rotation.y = Math.atan2(cam.position.x - tmpV.x, cam.position.z - tmpV.z);
  }
}

// ---------------- desk room (bright room + desk + mug + notebook) ----------------
export interface DeskRoom {
  group: THREE.Group;
  anchors: {
    deskTop: V3;        // centre of the desk surface
    laptopSeat: V3;     // where buildLaptop().group sits (its base centre)
    routerSeat: V3;
    ssdSeat: V3;        // free desk space right of the laptop
    mugSeat: V3;
    notebookSeat: V3;
    window: V3;         // daylight poster on the wall
  };
}
export function buildDeskRoom(opts: { floor?: string; wall?: string; wood?: string } = {}): DeskRoom {
  const g = new THREE.Group();
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), lam(opts.floor ?? "#e6e0d4"));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.02;
  floor.receiveShadow = true;
  g.add(floor);
  const wall = box(9, 5, 0.1, lam(opts.wall ?? "#eee8dc"), 0, 2.4, -1.5);
  g.add(wall);
  // soft daylight window on the wall (self-lit pane + slim frame)
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 0.86),
    new THREE.MeshBasicMaterial({ color: "#fff8e8", transparent: true, opacity: 0.9, depthWrite: false }));
  pane.position.set(-1.35, 2.28, -1.44);
  g.add(pane);
  const rail = lam("#c6bda9");
  g.add(box(1.33, 0.06, 0.05, rail, -1.35, 2.74, -1.43));
  g.add(box(1.33, 0.06, 0.05, rail, -1.35, 1.82, -1.43));
  g.add(box(0.06, 0.98, 0.05, rail, -2.0, 2.28, -1.43));
  g.add(box(0.06, 0.98, 0.05, rail, -0.7, 2.28, -1.43));
  // desk
  const wood = lam(opts.wood ?? "#bf9a6b");
  g.add(box(TECH.desk.w, TECH.desk.h, TECH.desk.d, wood, 0, TECH.desk.top - TECH.desk.h / 2, 0.12));
  for (const [x, z] of [[-0.52, -0.14], [0.52, -0.14], [-0.52, 0.36], [0.52, 0.36]])
    g.add(box(0.05, 0.72, 0.05, lam("#9d7b53"), x, 0.36, z));
  // mug + notebook so the desk reads lived-in
  const mugMat = lam("#e8e4dc");
  g.add(cyl(0.035, 0.09, mugMat, 0.52, TECH.desk.top + 0.045, 0.02, 20));
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.008, 8, 16), mugMat);
  handle.position.set(0.56, TECH.desk.top + 0.045, 0.02);
  handle.rotation.y = Math.PI / 2;
  g.add(handle);
  g.add(box(0.2, 0.012, 0.26, lam("#7f8fa6"), -0.44, TECH.desk.top + 0.006, 0.3));
  const top = TECH.desk.top;
  return {
    group: g,
    anchors: {
      deskTop: [0, top, 0.1],
      laptopSeat: [0, top + 0.006, 0.1],
      routerSeat: [-0.4, top + 0.003, -0.02],
      ssdSeat: [0.43, top + 0.006, 0.12],
      mugSeat: [0.52, top, 0.02],
      notebookSeat: [-0.44, top, 0.3],
      window: [-1.35, 2.28, -1.44],
    },
  };
}

// ---------------- laptop ----------------
export interface Laptop {
  group: THREE.Group;
  lid: THREE.Group;
  screen: THREE.Mesh;
  progress: THREE.Mesh;      // scale.x 0..1 = download bar
  playTile: THREE.Mesh;
  cursor: THREE.Object3D;    // lives on the screen plane
  anchors: { screenCentre: V3; playButton: V3 };
  setProgress(k: number): void;   // 0..1 fill of the download bar
  setPlayPress(k: number): void;  // 0..1 press squash + glow
  setCursor(x: number, y: number): void; // screen-local metres (x right, y up)
}
/** Open laptop: 0.5 × 0.34 m base, 0.5 × 0.34 m lid tilted back 0.2 rad,
 *  dark UI screen with three storefront tiles, a download bar and a play button.
 *  Origin = base centre on the desk surface (its bottom face is y = 0). */
export function buildLaptop(opts: { alu?: string; screen?: string; tiles?: string[] } = {}): Laptop {
  const g = new THREE.Group();
  const alu = lam(opts.alu ?? "#cdd2d8");
  const base = box(TECH.laptop.w, 0.024, TECH.laptop.d, alu, 0, 0.012, 0);
  g.add(base);
  g.add(box(0.36, 0.004, 0.14, lam("#9aa0a8"), 0, 0.025, 0.03));   // keyboard
  g.add(box(0.13, 0.003, 0.08, lam("#b3b8bf"), 0, 0.025, 0.09));   // trackpad
  const lid = new THREE.Group();
  lid.add(box(TECH.laptop.lidW, TECH.laptop.lidH, 0.016, alu, 0, 0.17, 0));
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(TECH.laptop.screenW, TECH.laptop.screenH),
    new THREE.MeshBasicMaterial({ color: opts.screen ?? "#22304a" }));
  screen.position.set(0, 0.17, 0.011);
  lid.add(screen);
  const tiles = opts.tiles ?? ["#e2874a", "#4a7fd0", "#57a86c"];
  for (let i = 0; i < tiles.length; i++) {
    const tile = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.085), new THREE.MeshBasicMaterial({ color: tiles[i] }));
    tile.position.set(-0.14 + i * 0.14, 0.235, 0.012);
    lid.add(tile);
  }
  const barBg = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.034), new THREE.MeshBasicMaterial({ color: "#101726" }));
  barBg.position.set(0, 0.1, 0.013);
  lid.add(barBg);
  const progress = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.03), glow("#5fd0ff"));
  progress.position.set(-0.19, 0.1, 0.015);
  progress.scale.x = 0.02;
  lid.add(progress);
  const playMat = glow("#2b3f63");
  const playTile = new THREE.Mesh(new THREE.PlaneGeometry(0.115, 0.115), playMat);
  playTile.position.set(0, -0.045, 0.014);
  lid.add(playTile);
  const tri = new THREE.Shape();
  tri.moveTo(-0.022, -0.032); tri.lineTo(0.034, 0); tri.lineTo(-0.022, 0.032); tri.closePath();
  const playTri = new THREE.Mesh(new THREE.ShapeGeometry(tri), glow("#ffffff"));
  playTri.position.set(0.004, -0.045, 0.017);
  lid.add(playTri);
  // cursor drawn on the screen plane (a 3-sided cone reads as an arrow at any size)
  const cursor = new THREE.Group();
  const cur = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.042, 3), glow("#ffffff"));
  cur.rotation.z = Math.PI;
  cur.rotation.x = Math.PI / 2;
  cursor.add(cur);
  cursor.position.set(0.12, -0.02, 0.03);
  lid.add(cursor);
  lid.position.set(0, 0.024, -0.17);
  lid.rotation.x = -0.2;
  g.add(lid);
  return {
    group: g, lid, screen, progress, playTile, cursor,
    anchors: { screenCentre: [0, 0.19, -0.14], playButton: [0, 0.145, -0.14] },
    setProgress: (k) => {
      const s = Math.max(0.02, clamp01(k));
      progress.scale.x = s;
      progress.position.x = -0.19 + 0.19 * s;
    },
    setPlayPress: (k) => {
      const u = clamp01(k);
      playTile.scale.setScalar(1 - 0.18 * u);
      playMat.color.setRGB(0.35 + 0.9 * u, 0.55 + 0.6 * u, 0.95);
    },
    setCursor: (x, y) => cursor.position.set(x, y, 0.03),
  };
}

// ---------------- wifi router ----------------
export interface Router {
  group: THREE.Group;
  leds: THREE.MeshBasicMaterial[];
  arcs: THREE.Mesh[];
  packets: THREE.Mesh[];
  anchors: { top: V3; arcs: V3 };
  /** t seconds, on = show wifi arcs + packets (false ⇒ hidden, no stray arcs at frame edges) */
  animate(t: number, on: boolean): void;
  /** packets travel from the router toward `to` (world space) when on */
  setTarget(to: V3): void;
}
/** Small home router: 0.17 × 0.11 m body, two antennas, three LEDs, wifi arcs
 *  and nine data packets that fly to the laptop. Origin = bottom centre. */
export function buildRouter(opts: { body?: string } = {}): Router {
  const g = new THREE.Group();
  g.add(box(TECH.router.w, TECH.router.h, TECH.router.d, lam(opts.body ?? "#eceff3"), 0, TECH.router.h / 2, 0));
  g.add(box(TECH.router.w, 0.006, TECH.router.d, lam("#c2c8d0"), 0, 0.003, 0));
  for (let i = 0; i < 2; i++) {
    const ant = box(0.012, 0.1, 0.012, lam("#b9c0c8"), (i ? 1 : -1) * 0.06, 0.09, -0.03);
    ant.rotation.x = -0.25;
    g.add(ant);
  }
  const leds: THREE.MeshBasicMaterial[] = [];
  for (let i = 0; i < 3; i++) {
    const m = glow("#3cd07f");
    leds.push(m);
    g.add(box(0.014, 0.008, 0.005, m, -0.04 + i * 0.04, 0.026, 0.057));
  }
  const arcs: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const m = new THREE.MeshBasicMaterial({ color: "#57b8ff", transparent: true, opacity: 0 });
    const arc = new THREE.Mesh(new THREE.TorusGeometry(0.05 + i * 0.045, 0.007, 8, 40, Math.PI), m);
    arc.position.set(0, 0.12, 0);
    arc.visible = false;
    arcs.push(arc);
    g.add(arc);
  }
  const packets: THREE.Mesh[] = [];
  for (let i = 0; i < 9; i++) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.026, 0.026), glow("#7fe3ff"));
    p.userData = { ph: i / 9 };
    p.visible = false;
    packets.push(p);
    g.add(p);
  }
  let target: V3 = [0.42, 0.16, 0.12];
  return {
    group: g, leds, arcs, packets,
    anchors: { top: [0, TECH.router.h, 0], arcs: [0, 0.12, 0] },
    setTarget: (to) => { target = to; },
    animate: (t, on) => {
      arcs.forEach((a, i) => {
        a.visible = on;
        (a.material as THREE.MeshBasicMaterial).opacity = on ? 0.25 + 0.6 * (0.5 + 0.5 * Math.sin(t * 4 - i * 0.8)) : 0;
      });
      leds.forEach((m, i) => {
        const k = 0.4 + 0.6 * (Math.sin(t * 6 + i * 2) > 0 ? 1 : 0.2);
        m.color.setRGB(0.15 * k, 1.4 * k, 0.5 * k);
      });
      packets.forEach((p) => {
        const u = p.userData as { ph: number };
        const k = (u.ph + t * 0.35) % 1;
        p.visible = on;
        if (!on) return;
        p.position.set(target[0] * k, 0.14 + Math.sin(k * Math.PI) * 0.1 + target[1] * k, target[2] * k);
        p.scale.setScalar(0.7 + 0.5 * Math.sin(t * 8 + u.ph * 12));
      });
    },
  };
}

// ---------------- SSD (M.2 2280) ----------------
export interface Ssd {
  group: THREE.Group;
  chips: THREE.Mesh[];              // the NAND packages
  setWrite(k: number, t?: number): void; // 0..1 glow of the write rim strips (t = seconds, for the pulse)
  anchors: { label: V3; chipCentre: V3 };
}
/** M.2 stick: green PCB, gold connector teeth, two NAND packages + controller.
 *  Origin = PCB centre, lying flat (the caller yaws/tilts it). */
export function buildSSD(opts: { pcb?: string; scale?: number } = {}): Ssd {
  const g = new THREE.Group();
  const s = opts.scale ?? 1;
  g.scale.setScalar(s);
  g.add(box(TECH.ssd.w, TECH.ssd.t, TECH.ssd.d, lam(opts.pcb ?? "#1d5c2e"), 0, 0, 0));
  for (let i = 0; i < 9; i++)
    g.add(box(0.008, 0.013, 0.02, lam("#d8a742"), -0.135 + i * 0.011, 0.001, 0));
  const chips: THREE.Mesh[] = [];
  const pkg = lam("#14181c");
  for (let i = 0; i < 2; i++) {
    const chip = box(0.075, 0.014, 0.065, pkg, -0.05 + i * 0.09, 0.013, 0);
    chips.push(chip);
    g.add(chip);
    for (let k = 0; k < 3; k++) g.add(box(0.06, 0.002, 0.006, lam("#3a4048"), -0.05 + i * 0.09, 0.021, -0.018 + k * 0.018));
  }
  g.add(box(0.055, 0.012, 0.045, pkg, 0.105, 0.012, 0.015)); // controller
  const writeMat = new THREE.MeshBasicMaterial({ color: "#7dffb0", transparent: true, opacity: 0 });
  for (let i = 0; i < 2; i++) {
    const rim = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.06), writeMat);
    rim.rotation.x = -Math.PI / 2;
    rim.position.set(-0.05 + i * 0.09, 0.022, 0);
    g.add(rim);
  }
  return {
    group: g, chips,
    setWrite: (k, t = 0) => { writeMat.opacity = 0.55 * clamp01(k) * (0.65 + 0.35 * Math.sin(t * 9)); },
    anchors: { label: [0, 0.115 * s, 0], chipCentre: [0, 0.02 * s, 0] },
  };
}

// ---------------- RAM stick ----------------
export interface Ram {
  group: THREE.Group;
  chips: THREE.MeshBasicMaterial[];
  setFill(k: number): void;   // 0..1 how many chips light up left→right
  anchors: { label: V3 };
}
/** RAM module standing upright: green PCB, 8 black chips, gold contacts.
 *  Origin = PCB centre (caller rotates it to face the camera). */
export function buildRam(opts: { pcb?: string } = {}): Ram {
  const g = new THREE.Group();
  g.add(box(TECH.ram.w, TECH.ram.h, 0.01, lam(opts.pcb ?? "#2f7d4f"), 0, 0, 0));
  const chips: THREE.MeshBasicMaterial[] = [];
  for (let i = 0; i < TECH.ram.chips; i++) {
    const m = glow("#14181c");
    chips.push(m);
    g.add(box(0.032, 0.05, 0.008, m, -0.14 + i * 0.04, 0.008, 0.008));
  }
  for (let i = 0; i < 9; i++) g.add(box(0.004, 0.012, 0.012, lam("#d8a742"), -0.15 + i * 0.037, -0.048, 0));
  return {
    group: g, chips,
    setFill: (k) => {
      const n = Math.round(clamp01(k) * chips.length);
      chips.forEach((m, i) => {
        const on = i < n ? 1 : 0.18;
        m.color.setRGB(0.1 + 0.5 * on, 0.1 + 1.2 * on, 0.12 + 0.9 * on);
      });
    },
    anchors: { label: [0, 0.14, 0] },
  };
}
