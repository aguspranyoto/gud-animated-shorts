// Reusable detailed interior house component: dining room (Ruang Makan).
// ---------------------------------------------------------------------------
// Lives in the skill so every short reuses the same room: copy this file to
// <your-project>/src/shared/house/house.ts (or import from templates/),
// plus the engine (three + templates/engine/{paint,shade}). Scene story
// props (plates of food, characters) live OUTSIDE this file — the caller
// places them on the exported anchors.
//
//   import { buildHouse, HOUSE } from "../../shared/house/house";
//   const { group, anchors } = buildHouse(); scene.add(group);
//   // anchors.tableTop / anchors.plateKid / anchors.plateMom / ...
//   // anchors.kidSeat / anchors.momSeat / anchors.windowPos / ...
//
// Contract (world units = metres, floor y=0, room faces +z toward camera):
// - Room shell: 6.0 (x) × 3.0 (h) × 4.5 (z) m, back wall z=-2.25, open front.
// - exports HOUSE dims + buildHouse(opts?: { day?: boolean }) for day/night.
// - All materials MeshLambertMaterial + engine twoTone() so the ink pass,
//   grade and fog treat the house like the rest of the world.
import * as THREE from "three";
import { ctex, rng } from "../../engine/paint";
import { twoTone } from "../../engine/shade";

export const HOUSE = {
  w: 6.0,
  h: 3.0,
  d: 4.5,
  wallT: 0.12,
  winW: 1.8,
  winH: 1.4,
  winY: 1.55, // sill height
  table: { w: 1.7, d: 0.95, h: 0.74, top: 0.05 },
  // open-plan living corner beyond the dining area (fills OTS backgrounds):
  // floor slab z 2.25..5.15, pieces kept off the wide-shot axes (S1/S6).
  // The 4th (front) wall closes the box at z = front.z.
  live: { z0: 2.25, z1: 5.15, shelfX: 1.3, shelfZ: 3.4, plantX: -0.9, plantZ: 3.3, lampX: 2.3, lampZ: 3.0 },
  front: { z: 5.2 },
  // gable roof: eaves y=2.95 at x=±3.3, ridge y=4.6. castShadow stays OFF so
  // the interior lighting is untouched (flip it on for exterior shots).
  roof: { eaveX: 3.3, eaveY: 2.95, ridgeY: 4.6 },
} as const;

export type V3 = [number, number, number];

export interface HouseAnchors {
  tableTop: V3; // centre of table surface (put plates/food here)
  plateKid: V3; // plate centre, kid side
  plateMom: V3; // plate centre, mom side
  kidSeat: V3; // chair seat top, kid side (+z side of table)
  momSeat: V3; // chair seat top, mom side (-z side of table)
  windowPos: V3; // window centre (daylight source/motivator)
  lampPos: V3; // pendant bulb (warm practical at night)
  doorPos: V3;
}

// --- painted textures (house-local, Canvas2D via engine ctex) ---

function plankFloorTex() {
  return ctex("houseFloor", 1024, 1024, (g: CanvasRenderingContext2D) => {
    const R = rng(7);
    g.fillStyle = "#b0824f";
    g.fillRect(0, 0, 1024, 1024);
    for (let p = 0; p < 8; p++) {
      const y = p * 128;
      g.fillStyle = p % 2 ? "#ad7c4b" : "#b58a56";
      g.fillRect(0, y, 1024, 128);
      // grain
      g.strokeStyle = "rgba(90,55,25,0.18)";
      g.lineWidth = 2;
      for (let i = 0; i < 9; i++) {
        const gy = y + 8 + R() * 112;
        g.beginPath();
        g.moveTo(0, gy);
        for (let x = 0; x <= 1024; x += 64) g.lineTo(x, gy + Math.sin(x / 90 + p) * 4);
        g.stroke();
      }
      // butt joints + nails
      const jx = R() * 1024;
      g.fillStyle = "#5e3a1c";
      g.fillRect(jx, y, 5, 128);
      g.fillStyle = "#3a2512";
      g.beginPath();
      g.arc(jx / 2, y + 64, 5, 0, 7);
      g.arc(jx / 2 + 512 > 1024 ? jx - 300 : jx + 300, y + 64, 5, 0, 7);
      g.fill();
    }
    // plank gaps
    g.fillStyle = "rgba(70,40,18,0.85)";
    for (let p = 0; p <= 8; p++) g.fillRect(0, p * 128 - 2, 1024, 5);
  });
}

function wallTex() {
  return ctex("houseWall", 1024, 512, (g: CanvasRenderingContext2D) => {
    // upper warm cream with subtle sponge mottling
    g.fillStyle = "#f3e6cf";
    g.fillRect(0, 0, 1024, 512);
    const R = rng(21);
    for (let i = 0; i < 260; i++) {
      g.fillStyle = `rgba(${190 + R() * 30},${160 + R() * 25},${125 + R() * 20},0.10)`;
      g.beginPath();
      g.arc(R() * 1024, R() * 512, 6 + R() * 22, 0, 7);
      g.fill();
    }
  });
}

function wainscotTex() {
  return ctex("houseWains", 1024, 256, (g: CanvasRenderingContext2D) => {
    g.fillStyle = "#7fa6a3"; // dusty teal panels
    g.fillRect(0, 0, 1024, 256);
    const R = rng(4);
    for (let i = 0; i < 4; i++) {
      const x = 24 + i * 250;
      g.strokeStyle = "#5d7f7c";
      g.lineWidth = 10;
      g.strokeRect(x, 26, 202, 204);
      g.strokeStyle = "rgba(255,255,255,0.25)";
      g.lineWidth = 3;
      g.strokeRect(x + 10, 36, 182, 184);
      void R;
    }
  });
}

function rugTex() {
  return ctex("houseRug", 512, 512, (g: CanvasRenderingContext2D) => {
    g.fillStyle = "#b8452e"; // terracotta
    g.fillRect(0, 0, 512, 512);
    g.strokeStyle = "#f0d9a8";
    g.lineWidth = 14;
    g.strokeRect(24, 24, 464, 464);
    g.strokeStyle = "#7d2c1c";
    g.lineWidth = 6;
    g.strokeRect(56, 56, 400, 400);
    // diamond medallion
    g.save();
    g.translate(256, 256);
    g.rotate(Math.PI / 4);
    g.strokeStyle = "#f0d9a8";
    g.lineWidth = 8;
    g.strokeRect(-110, -110, 220, 220);
    g.restore();
    const R = rng(9);
    for (let i = 0; i < 160; i++) {
      g.fillStyle = `rgba(0,0,0,${0.04 + R() * 0.05})`;
      g.fillRect(R() * 512, R() * 512, 3, 3);
    }
  });
}

function runnerTex() {
  return ctex("houseRunner", 512, 256, (g: CanvasRenderingContext2D) => {
    g.fillStyle = "#f5efdd";
    g.fillRect(0, 0, 512, 256);
    g.fillStyle = "#c65b3a";
    for (let x = 0; x < 512; x += 64) g.fillRect(x, 0, 26, 256);
    g.fillStyle = "rgba(120,70,30,0.25)";
    for (let x = 0; x < 512; x += 16) g.fillRect(x, 0, 2, 256);
  });
}

function curtainTex() {
  return ctex("houseCurtain", 256, 512, (g: CanvasRenderingContext2D) => {
    g.fillStyle = "#e8a13c";
    g.fillRect(0, 0, 256, 512);
    for (let x = 0; x < 256; x += 32) {
      const gr = g.createLinearGradient(x, 0, x + 32, 0);
      gr.addColorStop(0, "rgba(120,60,10,0.45)");
      gr.addColorStop(0.5, "rgba(255,220,150,0.25)");
      gr.addColorStop(1, "rgba(120,60,10,0.45)");
      g.fillStyle = gr;
      g.fillRect(x, 0, 32, 512);
    }
  });
}

// --- small builders ---

function lam(color: number | string, extra: Record<string, unknown> = {}) {
  const m = new THREE.MeshLambertMaterial({ color, ...(extra as object) });
  return twoTone(m);
}

function box(
  w: number,
  h: number,
  d: number,
  mat: THREE.Material,
  x: number,
  y: number,
  z: number,
  ry = 0,
) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.rotation.y = ry;
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function frameRect(
  parent: THREE.Group,
  w: number,
  h: number,
  bar: number,
  depth: number,
  mat: THREE.Material,
  x: number,
  y: number,
  z: number,
) {
  // flat picture-frame moulding in the XY plane
  const g = new THREE.Group();
  g.add(box(w, bar, depth, mat, 0, h / 2 - bar / 2, 0));
  g.add(box(w, bar, depth, mat, 0, -h / 2 + bar / 2, 0));
  g.add(box(bar, h - 2 * bar, depth, mat, -w / 2 + bar / 2, 0, 0));
  g.add(box(bar, h - 2 * bar, depth, mat, w / 2 - bar / 2, 0, 0));
  g.position.set(x, y, z);
  parent.add(g);
  return g;
}

/** open-plan living corner past the dining area (no 4th wall on this set):
 *  floor extension + bookshelf + big plant + floor lamp. Gives the OTS shots
 *  (cameras near the back wall looking +z) a real background, and stays clear
 *  of the S1/S6 wide axes. Part of the reusable house shell. */
function addLivingCorner(parent: THREE.Group) {
  const { live } = HOUSE;
  const W = HOUSE.w;
  // floor extension slab (abuts the dining floor at z = D/2)
  const slab = new THREE.Mesh(
    new THREE.PlaneGeometry(W, live.z1 - live.z0),
    lam("#ffffff", { map: plankFloorTex() }),
  );
  slab.rotation.x = -Math.PI / 2;
  slab.position.set(0, -0.001, (live.z0 + live.z1) / 2);
  slab.receiveShadow = true;
  parent.add(slab);
  // second rug under the shelf corner
  const rug2 = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.8), lam("#ffffff", { map: rugTex() }));
  rug2.rotation.x = -Math.PI / 2;
  rug2.rotation.z = 0.12;
  rug2.position.set(1.1, 0.02, 3.5); // 2 cm above slab: no z-fighting shimmer
  rug2.receiveShadow = true;
  parent.add(rug2);

  // bookshelf (faces -z, toward the dining table)
  const shelf = new THREE.Group();
  const shelfMat = lam("#6e4525");
  shelf.add(box(0.9, 1.9, 0.06, shelfMat, 0, 0.95, 0.17)); // back
  shelf.add(box(0.9, 1.9, 0.05, shelfMat, -0.425, 0.95, 0)); // sides
  shelf.add(box(0.9, 1.9, 0.05, shelfMat, 0.425, 0.95, 0));
  shelf.add(box(0.9, 0.06, 0.34, shelfMat, 0, 1.87, 0)); // top/bottom
  shelf.add(box(0.9, 0.08, 0.34, shelfMat, 0, 0.04, 0));
  const bookCols = [0xc65b3a, 0x3f6d8e, 0xe8a13c, 0x4d7d3a, 0x8e4a6d, 0xd9d2c0];
  const R = rng(31);
  for (let s = 0; s < 3; s++) {
    const sy = 0.5 + s * 0.45;
    shelf.add(box(0.8, 0.04, 0.3, shelfMat, 0, sy, 0));
    let bx = -0.36;
    while (bx < 0.3) {
      const bw = 0.045 + R() * 0.045, bh = 0.26 + R() * 0.14;
      const bk = box(bw, bh, 0.2, lam(bookCols[Math.floor(R() * bookCols.length)]), bx + bw / 2, sy + 0.02 + bh / 2, 0);
      if (R() < 0.12) bk.rotation.z = -0.18;
      shelf.add(bk);
      bx += bw + 0.012;
    }
  }
  // small frame + tiny plant on top
  frameRect(shelf, 0.3, 0.36, 0.04, 0.04, lam("#5b3a22"), -0.18, 2.08, -0.05);
  const art = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.28), lam("#3f6d8e"));
  art.position.set(-0.18, 2.08, -0.06);
  art.rotation.y = Math.PI;
  shelf.add(art);
  const tp = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.09, 10), lam("#b4502e"));
  tp.position.set(0.25, 1.95, 0);
  shelf.add(tp);
  const tl = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), lam("#3f7d3a"));
  tl.scale.set(1, 1.3, 1);
  tl.position.set(0.25, 2.08, 0);
  shelf.add(tl);
  shelf.position.set(live.shelfX, 0, live.shelfZ);
  shelf.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  parent.add(shelf);

  // big leafy plant
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.13, 0.3, 14), lam("#b4502e"));
  pot.position.set(live.plantX, 0.15, live.plantZ);
  pot.castShadow = true;
  parent.add(pot);
  const leafM = lam("#2f6b33");
  for (let i = 0; i < 8; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), leafM);
    leaf.scale.set(0.55, 1.5, 0.55);
    leaf.position.set(
      live.plantX + (rng(100 + i)() - 0.5) * 0.45,
      0.6 + rng(110 + i)() * 0.6,
      live.plantZ + (rng(120 + i)() - 0.5) * 0.45,
    );
    leaf.rotation.z = (rng(130 + i)() - 0.5) * 0.7;
    leaf.castShadow = true;
    parent.add(leaf);
  }

  // floor lamp (warm practical, emissive shade mouth)
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.55, 10), lam("#3a2c22"));
  pole.position.set(live.lampX, 0.85, live.lampZ);
  pole.castShadow = true;
  parent.add(pole);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.04, 14), lam("#3a2c22"));
  base.position.set(live.lampX, 0.02, live.lampZ);
  parent.add(base);
  const shade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.22, 0.26, 16, 1, true),
    lam("#f5e6c4", { side: THREE.DoubleSide }),
  );
  shade.position.set(live.lampX, 1.68, live.lampZ);
  parent.add(shade);
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 10, 8),
    new THREE.MeshBasicMaterial({ color: "#ffdf9e" }),
  );
  glow.position.set(live.lampX, 1.62, live.lampZ);
  parent.add(glow);
}

/** front-wall decor (faces -z into the room): main door + window + curtains.
 *  Mounted on the surface like the back-wall decor (no holes cut). */
function addFrontDecor(parent: THREE.Group) {
  const fz = HOUSE.front.z - HOUSE.wallT / 2; // inner face
  const trimMat = lam("#fbf6ea");
  const doorMat = lam("#8a5a33");
  // main door (left of centre)
  frameRect(parent, 1.0, 2.15, 0.09, 0.14, trimMat, -1.8, 1.075, fz - 0.02);
  parent.add(box(0.86, 2.02, 0.07, doorMat, -1.8, 1.01, fz - 0.02));
  for (const py of [1.45, 0.62]) parent.add(box(0.6, 0.62, 0.02, lam("#74491f"), -1.8, py, fz - 0.06));
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), lam("#d9b45b"));
  knob.position.set(-1.48, 1.0, fz - 0.1);
  parent.add(knob);
  // window (right of centre) with curtains
  const frameMat = lam("#8a5a33");
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(HOUSE.winW, HOUSE.winH),
    new THREE.MeshBasicMaterial({ color: new THREE.Color("#cfe4f7") }),
  );
  glass.rotation.y = Math.PI;
  glass.position.set(1.2, HOUSE.winY, fz - 0.02);
  parent.add(glass);
  for (const fx of [-HOUSE.winW / 6, HOUSE.winW / 6])
    parent.add(box(0.05, HOUSE.winH, 0.06, frameMat, 1.2 + fx, HOUSE.winY, fz - 0.03));
  parent.add(box(HOUSE.winW, 0.05, 0.06, frameMat, 1.2, HOUSE.winY, fz - 0.03));
  frameRect(parent, HOUSE.winW + 0.16, HOUSE.winH + 0.16, 0.09, 0.1, frameMat, 1.2, HOUSE.winY, fz - 0.02);
  parent.add(box(HOUSE.winW + 0.3, 0.06, 0.22, trimMat, 1.2, HOUSE.winY - HOUSE.winH / 2 - 0.11, fz - 0.08));
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, HOUSE.winW + 0.9, 10), lam("#5b3a22"));
  rod.rotation.z = Math.PI / 2;
  rod.position.set(1.2, HOUSE.winY + HOUSE.winH / 2 + 0.22, fz - 0.16);
  parent.add(rod);
  const curtMat = lam("#ffffff", { map: curtainTex(), side: THREE.DoubleSide });
  for (const s of [-1, 1]) {
    const c = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 1.9, 6, 1), curtMat);
    const pos = c.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getX(i) * 18) * 0.05);
    c.geometry.computeVertexNormals();
    c.rotation.y = Math.PI;
    c.position.set(1.2 + s * (HOUSE.winW / 2 + 0.32), HOUSE.winY + 0.1, fz - 0.18);
    c.castShadow = true;
    parent.add(c);
  }
  // small frame between door and window
  frameRect(parent, 0.5, 0.62, 0.06, 0.06, lam("#5b3a22"), -0.2, 2.05, fz - 0.04);
  const art = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.5), lam("#8e4a6d"));
  art.rotation.y = Math.PI;
  art.position.set(-0.2, 2.05, fz - 0.045);
  parent.add(art);
}

/** gable roof over the whole box (ridge along z). Shadow casting OFF so the
 *  interior look is untouched — enable castShadow for exterior shots. */
function addRoof(parent: THREE.Group) {
  const { eaveX, eaveY, ridgeY } = HOUSE.roof;
  const z0 = -HOUSE.d / 2 - 0.3, z1 = HOUSE.front.z + 0.3;
  const len = z1 - z0, zc = (z0 + z1) / 2;
  const slope = Math.hypot(eaveX, ridgeY - eaveY);
  const ang = Math.atan2(ridgeY - eaveY, eaveX);
  const roofMat = lam("#8a4a3a");
  for (const s of [-1, 1]) {
    const slab = box(slope + 0.2, 0.1, len, roofMat, (s * eaveX) / 2, (eaveY + ridgeY) / 2, zc);
    slab.rotation.z = -s * ang;
    slab.castShadow = false;
    slab.receiveShadow = false;
    parent.add(slab);
  }
  // gable triangles (front + back)
  const shape = new THREE.Shape();
  shape.moveTo(-eaveX, eaveY);
  shape.lineTo(eaveX, eaveY);
  shape.lineTo(0, ridgeY);
  shape.closePath();
  const ggeo = new THREE.ShapeGeometry(shape);
  const g1 = new THREE.Mesh(ggeo, lam("#a08b74"));
  g1.position.set(0, 0, -HOUSE.d / 2);
  const g2 = new THREE.Mesh(ggeo, lam("#a08b74"));
  g2.rotation.y = Math.PI;
  g2.position.set(0, 0, HOUSE.front.z);
  for (const g of [g1, g2]) {
    g.castShadow = false;
    parent.add(g);
  }
  // ridge beam
  const ridge = box(0.12, 0.12, len, lam("#5b3a22"), 0, ridgeY, zc);
  ridge.castShadow = false;
  parent.add(ridge);
}

export function buildHouse(opts: { day?: boolean } = {}): {
  group: THREE.Group;
  anchors: HouseAnchors;
} {
  const day = opts.day ?? true;
  const G = new THREE.Group();
  const { w: W, h: H, d: D, wallT: T } = HOUSE;

  // --- floor + rug ---
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(W, D),
    lam("#ffffff", { map: plankFloorTex() }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  G.add(floor);
  const rug = new THREE.Mesh(
    new THREE.PlaneGeometry(3.1, 2.2),
    lam("#ffffff", { map: rugTex() }),
  );
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, 0.02, 0.35); // 2 cm above floor: no z-fighting shimmer
  rug.receiveShadow = true;
  G.add(rug);

  // --- walls: back (z=-D/2), left (x=-W/2), right (x=+W/2); open front ---
  const wallMat = lam("#ffffff", { map: wallTex() });
  const wainsMat = lam("#ffffff", { map: wainscotTex() });
  const trimMat = lam("#fbf6ea");
  const mkWall = (ww: number, x: number, z: number, ry: number) => {
    const grp = new THREE.Group();
    const upper = box(ww, H - 0.95, T, wallMat, 0, 0.95 + (H - 0.95) / 2, 0);
    const lower = box(ww, 0.95, T + 0.015, wainsMat, 0, 0.475, 0);
    const chair = box(ww, 0.06, T + 0.04, trimMat, 0, 0.95, 0); // chair rail
    const base = box(ww, 0.12, T + 0.03, trimMat, 0, 0.06, 0); // baseboard
    const crown = box(ww, 0.1, T + 0.03, trimMat, 0, H - 0.05, 0); // crown
    grp.add(upper, lower, chair, base, crown);
    grp.position.set(x, 0, z);
    grp.rotation.y = ry;
    grp.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.receiveShadow = true;
      }
    });
    G.add(grp);
    return grp;
  };
  mkWall(W, 0, -D / 2, 0);
  mkWall(D, -W / 2, 0, Math.PI / 2);
  mkWall(D, W / 2, 0, -Math.PI / 2);
  // 4th wall: closes the box (front). No shadow casting — interior light first.
  const front = mkWall(W, 0, HOUSE.front.z, Math.PI);
  front.traverse((o) => {
    if (o instanceof THREE.Mesh) o.castShadow = false;
  });
  addFrontDecor(G);
  addRoof(G);

  // --- ceiling (spans the whole box: dining + living) ---
  const ceilD = HOUSE.front.z + D / 2;
  const ceil = box(W, 0.08, ceilD, lam("#f7f1e3"), 0, H + 0.04, (HOUSE.front.z - D / 2) / 2);
  ceil.castShadow = false;
  G.add(ceil);

  // --- window on LEFT wall (daylight motivator) + curtains + sill plant ---
  const winC: V3 = [-W / 2 + T / 2, HOUSE.winY, 0.1];
  const frameMat = lam("#8a5a33");
  const glassMat = new THREE.MeshBasicMaterial({
    color: day ? new THREE.Color("#cfe4f7") : new THREE.Color("#1c2742"),
  });
  const winGrp = new THREE.Group();
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(HOUSE.winW, HOUSE.winH), glassMat);
  winGrp.add(glass);
  // muntins: 3 cols x 2 rows
  for (const fx of [-HOUSE.winW / 6, HOUSE.winW / 6])
    winGrp.add(box(0.05, HOUSE.winH, 0.06, frameMat, fx, 0, 0.01));
  winGrp.add(box(HOUSE.winW, 0.05, 0.06, frameMat, 0, 0, 0.01));
  frameRect(winGrp, HOUSE.winW + 0.16, HOUSE.winH + 0.16, 0.09, 0.1, frameMat, 0, 0, 0);
  // sill
  winGrp.add(box(HOUSE.winW + 0.3, 0.06, 0.22, trimMat, 0, -HOUSE.winH / 2 - 0.11, 0.06));
  winGrp.position.set(...winC);
  winGrp.rotation.y = Math.PI / 2;
  G.add(winGrp);
  // curtain rod + curtains
  const rod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, HOUSE.winW + 0.9, 10),
    lam("#5b3a22"),
  );
  rod.rotation.z = Math.PI / 2;
  rod.position.set(-W / 2 + 0.16, HOUSE.winY + HOUSE.winH / 2 + 0.22, 0.1);
  G.add(rod);
  const curtMat = lam("#ffffff", { map: curtainTex(), side: THREE.DoubleSide });
  for (const s of [-1, 1]) {
    const c = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 1.9, 6, 1), curtMat);
    const pos = c.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i);
      pos.setZ(i, Math.sin(px * 18) * 0.05);
    }
    c.geometry.computeVertexNormals();
    c.position.set(
      -W / 2 + 0.18,
      HOUSE.winY + 0.1,
      0.1 + s * (HOUSE.winW / 2 + 0.32),
    );
    c.rotation.y = Math.PI / 2;
    c.castShadow = true;
    G.add(c);
  }
  // small potted plant on sill
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.055, 0.12, 12), lam("#b4502e"));
  pot.position.set(-W / 2 + 0.22, HOUSE.winY - HOUSE.winH / 2 - 0.02, 0.55);
  G.add(pot);
  const leafMat = lam("#3f7d3a");
  for (let i = 0; i < 5; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), leafMat);
    leaf.scale.set(1, 1.5, 1);
    leaf.position.set(
      pot.position.x + (rng(3)() - 0.5) * 0.1,
      pot.position.y + 0.14 + rng(3)() * 0.08,
      pot.position.z + (rng(3)() - 0.5) * 0.1,
    );
    leaf.castShadow = true;
    G.add(leaf);
  }

  // --- door on back wall (right side) ---
  const doorX = 1.85;
  const doorMat = lam("#8a5a33");
  frameRect(G, 1.0, 2.15, 0.09, 0.14, trimMat, doorX, 1.075, -D / 2 + 0.02);
  const door = box(0.86, 2.02, 0.07, doorMat, doorX, 1.01, -D / 2 + 0.02);
  G.add(door);
  for (const py of [1.45, 0.62]) {
    const panel = box(0.6, 0.62, 0.02, lam("#74491f"), doorX, py, -D / 2 + 0.06);
    G.add(panel);
  }
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), lam("#d9b45b"));
  knob.position.set(doorX - 0.32, 1.0, -D / 2 + 0.1);
  G.add(knob);

  // --- wall decor: clock + 2 frames on back wall ---
  const clockF = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.05, 24), lam("#5b3a22"));
  clockF.rotation.x = Math.PI / 2;
  clockF.position.set(-1.9, 2.1, -D / 2 + 0.09);
  G.add(clockF);
  const clockD = new THREE.Mesh(
    new THREE.CylinderGeometry(0.155, 0.155, 0.055, 24),
    lam("#fbf6ea"),
  );
  clockD.rotation.x = Math.PI / 2;
  clockD.position.set(-1.9, 2.1, -D / 2 + 0.095);
  G.add(clockD);
  const handMat = lam("#333333");
  const hourH = box(0.025, 0.09, 0.01, handMat, -1.9, 2.13, -D / 2 + 0.13);
  const minH = box(0.02, 0.13, 0.01, handMat, -1.9, 2.1, -D / 2 + 0.13);
  minH.rotation.z = -1.1;
  G.add(hourH, minH);
  const picCols = ["#c65b3a", "#3f6d8e"];
  picCols.forEach((c, i) => {
    const px = -0.85 + i * 0.75;
    frameRect(G, 0.5, 0.62, 0.06, 0.06, lam("#5b3a22"), px, 2.05, -D / 2 + 0.06);
    const art = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.5), lam(c));
    art.position.set(px, 2.05, -D / 2 + 0.065);
    G.add(art);
  });
  // light switch
  G.add(box(0.09, 0.13, 0.02, lam("#fbf6ea"), 1.28, 1.25, -D / 2 + 0.08));

  // --- dining table + runner ---
  const woodMat = lam("#8a5a33");
  const woodDark = lam("#6e4525");
  const tx = 0;
  const tz = 0.35;
  const topY = HOUSE.table.h;
  const top = box(HOUSE.table.w, HOUSE.table.top, HOUSE.table.d, woodMat, tx, topY - HOUSE.table.top / 2, tz);
  G.add(top);
  G.add(box(HOUSE.table.w - 0.3, 0.07, HOUSE.table.d - 0.24, woodDark, tx, topY - 0.1, tz)); // apron
  for (const [lx, lz] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    G.add(
      box(
        0.08, topY - 0.05, 0.08, woodDark,
        tx + (lx * (HOUSE.table.w / 2 - 0.12)),
        (topY - 0.05) / 2, tz + (lz * (HOUSE.table.d / 2 - 0.12)),
      ),
    );
  }
  const runner = new THREE.Mesh(
    new THREE.PlaneGeometry(1.9, 0.5),
    lam("#ffffff", { map: runnerTex() }),
  );
  runner.rotation.x = -Math.PI / 2;
  runner.position.set(tx, topY + 0.012, tz); // 1.2 cm above table: no shimmer
  runner.receiveShadow = true;
  G.add(runner);

  // --- 3 chairs (kid +z side, mom -z side, one spare angled) ---
  const chairAt = (x: number, z: number, ry: number, scale = 1, backK = 1) => {
    const c = new THREE.Group();
    const seatM = lam("#a06a3c");
    c.add(box(0.44 * scale, 0.06, 0.42 * scale, seatM, 0, 0.45 * scale, 0));
    // backrest slats
    for (const sx of [-0.16, 0, 0.16]) {
      const s = box(0.06 * scale, 0.55 * scale, 0.05 * scale, seatM, sx * scale, 0.75 * scale * backK, -0.19 * scale);
      c.add(s);
    }
    c.add(box(0.44 * scale, 0.09, 0.05 * scale, seatM, 0, 1.0 * scale * backK, -0.19 * scale));
    for (const [lx, lz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      c.add(box(0.055 * scale, 0.45 * scale, 0.055 * scale, woodDark, lx * 0.17 * scale, 0.225 * scale, lz * 0.16 * scale));
    }
    c.position.set(x, 0, z);
    c.rotation.y = ry;
    c.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    G.add(c);
    return c;
  };
  chairAt(0.15, tz + 0.78, Math.PI, 0.82, 0.62); // kid (low back: face clears it)
  chairAt(-0.15, tz - 0.78, 0); // mom
  chairAt(1.35, tz + 0.25, -Math.PI / 2.4); // spare, angled

  // --- credenza against right wall + vase + books ---
  const cred = new THREE.Group();
  cred.add(box(1.5, 0.62, 0.45, lam("#7d5234"), 0, 0.45, 0));
  cred.add(box(1.54, 0.05, 0.49, woodMat, 0, 0.79, 0));
  for (const dx of [-0.38, 0, 0.38]) {
    cred.add(box(0.3, 0.4, 0.02, lam("#8a5a33"), dx, 0.42, 0.23));
    const knob2 = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 8), lam("#d9b45b"));
    knob2.position.set(dx, 0.42, 0.25);
    cred.add(knob2);
  }
  for (const lx of [-0.65, 0.65]) for (const lz of [-0.15, 0.15])
    cred.add(box(0.06, 0.16, 0.06, woodDark, lx, 0.08, lz));
  // vase + books on top
  const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.06, 0.26, 14), lam("#3f6d8e"));
  vase.position.set(-0.45, 0.94, 0);
  vase.castShadow = true;
  cred.add(vase);
  const bookCols = [0xc65b3a, 0x3f7d3a, 0xe8a13c];
  bookCols.forEach((bc, i) => {
    const b = box(0.05, 0.24, 0.17, lam(bc), 0.25 + i * 0.06, 0.93, 0.02);
    b.rotation.z = i === 2 ? -0.25 : 0;
    cred.add(b);
  });
  cred.position.set(W / 2 - 0.35, 0, -0.9);
  cred.rotation.y = -Math.PI / 2;
  cred.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  G.add(cred);

  // --- corner plant (right-back) ---
  const pot2 = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.28, 14), lam("#b4502e"));
  pot2.position.set(W / 2 - 0.45, 0.14, -D / 2 + 0.45);
  pot2.castShadow = true;
  G.add(pot2);
  const leafM = lam("#3f7d3a");
  for (let i = 0; i < 7; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), leafM);
    leaf.scale.set(0.7, 1.6, 0.7);
    leaf.position.set(
      pot2.position.x + (rng(i + 40)() - 0.5) * 0.3,
      0.55 + rng(i + 50)() * 0.45,
      pot2.position.z + (rng(i + 60)() - 0.5) * 0.3,
    );
    leaf.rotation.z = (rng(i + 70)() - 0.5) * 0.6;
    leaf.castShadow = true;
    G.add(leaf);
  }

  // --- pendant lamp over table (hung high so it never covers faces in wides) ---
  const lampY = topY + 1.16; // shade centre: clears adult heads (~1.5 m)
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, H - lampY - 0.1, 8), lam("#333333"));
  cord.position.set(tx, (H + lampY + 0.14) / 2, tz);
  G.add(cord);
  const shadeM = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.3, 0.28, 18, 1, true),
    lam("#c65b3a", { side: THREE.DoubleSide }),
  );
  shadeM.position.set(tx, lampY, tz);
  G.add(shadeM);
  const bulbMat = new THREE.MeshBasicMaterial({
    color: day ? new THREE.Color("#fff6e0") : new THREE.Color("#ffd9a0"),
  });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), bulbMat);
  bulb.position.set(tx, lampY - 0.09, tz);
  G.add(bulb);

  const anchors: HouseAnchors = {
    tableTop: [tx, topY, tz],
    plateKid: [0.15, topY + 0.01, tz + 0.2],
    plateMom: [-0.15, topY + 0.01, tz - 0.2],
    kidSeat: [0.15, 0.45 * 0.82, tz + 0.78],
    momSeat: [-0.15, 0.45, tz - 0.78],
    windowPos: winC,
    lampPos: [tx, topY + 1.07, tz],
    doorPos: [doorX, 1.0, -D / 2 + 0.1],
  };
  addLivingCorner(G);
  return { group: G, anchors };
}
