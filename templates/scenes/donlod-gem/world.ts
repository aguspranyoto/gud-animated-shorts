// "Kalo Kamu Download Game, Gamenya Itu Ada di Mana Sih?" — explainer teardown.
// Two sets: (A) a bright desk room (hook + play press + closing) and (B) a white studio
// rig where the hardware is dissected: internet packets, SSD, exploded folder + pak,
// steamapps folder, SSD -> unzip -> RAM, NAND cells with electrons, page/block, delete.
// Everything is procedural three.js; labels are canvas-textured cards on the NOINK layer.
import * as THREE from "three";
import { LIGHTS } from "../../engine/lights";
import { TONE, twoTone } from "../../engine/shade";
import { smooth, clamp01, V3 } from "../../engine/camera";
import { camAt, RIG, DESK, SSD_L, RAM_R } from "./story";

const popIn = (mesh: THREE.Object3D, f: number, f0: number, n = 7) => {
  const u = clamp01((f - f0) / n);
  const e = u * u * (3 - 2 * u);
  mesh.scale.setScalar(Math.max(0.001, e));
};
const lam = (color: string | number) => twoTone(new THREE.MeshLambertMaterial({ color }));
const glow = (color: string | number) => new THREE.MeshBasicMaterial({ color });
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

/** dark pill label card; billboarded toward the camera every frame */
const labelMesh = (text: string, w = 0.46, color = "#141c2b") => {
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
  g.font = "900 92px Arial Black, Arial, Helvetica, sans-serif";
  g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(text, cv.width / 2, cv.height / 2 + 4);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, (w * cv.height) / cv.width),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.5, depthWrite: false, side: THREE.DoubleSide })
  );
  return mesh;
};

export class World {
  root = new THREE.Group();
  sun = new THREE.DirectionalLight("#fff3e0", 2.8);
  tmp = new THREE.Vector3();
  // sets
  roomGroup = new THREE.Group();
  studioGroup = new THREE.Group();
  deskGroup = new THREE.Group();
  ssdGroup = new THREE.Group();
  folderGroup = new THREE.Group();
  steamGroup = new THREE.Group();
  ramGroup = new THREE.Group();
  chipGroup = new THREE.Group();
  pageGroup = new THREE.Group();
  labels: THREE.Mesh[] = [];
  bit1!: THREE.Mesh;
  bit0!: THREE.Mesh;
  // animated bits
  progressFill!: THREE.Mesh;
  cursor!: THREE.Object3D;
  playTile!: THREE.Mesh;
  playMat!: THREE.MeshBasicMaterial;
  packets: THREE.Mesh[] = [];
  wifiArcs: THREE.MeshBasicMaterial[] = [];
  wifiMeshes: THREE.Mesh[] = [];
  routerLeds: THREE.MeshBasicMaterial[] = [];
  ssdChips: THREE.Mesh[] = [];
  writeGlow!: THREE.MeshBasicMaterial;
  writeSweep!: THREE.Mesh;
  files: THREE.Mesh[] = [];
  pak!: THREE.Group;
  pakLabel!: THREE.Mesh;
  folderBack!: THREE.Mesh;
  folderFront!: THREE.Mesh;
  ramChips: THREE.MeshBasicMaterial[] = [];
  flow: THREE.Mesh[] = [];
  unzip!: THREE.Group;
  unzipFlap!: THREE.Mesh;
  cells: THREE.Mesh[] = [];
  cellMats: THREE.MeshBasicMaterial[] = [];
  electrons: THREE.Mesh[] = [];
  pages: THREE.Mesh[] = [];
  pageMats: THREE.MeshLambertMaterial[] = [];
  blockBox!: THREE.Mesh;
  blockMat!: THREE.MeshBasicMaterial;
  newData: THREE.Mesh[] = [];
  deskChip!: THREE.Group;
  deskChipGlow!: THREE.MeshBasicMaterial;

  constructor() {
    const L = LIGHTS.day;
    TONE.uLitCol.value.set(...L.lit);
    TONE.uShadeCol.value.set(...L.shade);
    TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert;
    TONE.uSideK.value = L.sideK;
    TONE.uTerm.value = L.term;
    TONE.uBounce.value.set(0, 0, 0);
    TONE.uSat.value = 1.02;
    this.sun.position.set(3.4, 5.2, 2.6);
    this.sun.target.position.set(0, 0.9, 0);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.camera.left = -3.2;
    this.sun.shadow.camera.right = 3.2;
    this.sun.shadow.camera.top = 3.2;
    this.sun.shadow.camera.bottom = -3.2;
    this.sun.shadow.camera.near = 1;
    this.sun.shadow.camera.far = 16;
    this.sun.shadow.bias = L.bias;
    this.sun.shadow.normalBias = L.normalBias;
    this.root.add(this.sun, this.sun.target);
    this.root.add(new THREE.HemisphereLight("#ffffff", "#d8dce2", 0.8));
    this.buildRoom();
    this.buildStudio();
    this.buildDesk();
    this.buildSsd();
    this.buildFolder();
    this.buildSteam();
    this.buildRam();
    this.buildChip();
    this.buildPages();
    this.root.add(this.roomGroup, this.studioGroup, this.deskGroup, this.ssdGroup,
      this.folderGroup, this.steamGroup, this.ramGroup, this.chipGroup, this.pageGroup);
  }

  // ---------------- set A: bright desk room ----------------
  buildRoom() {
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), lam("#e6e0d4"));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.roomGroup.add(floor);
    const wall = box(9, 5, 0.1, lam("#eee8dc"), 0, 2.4, -1.5);
    wall.receiveShadow = true;
    this.roomGroup.add(wall);
    // soft daylight window: warm pane + a slim frame (no ladder of bars)
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 0.86),
      new THREE.MeshBasicMaterial({ color: "#fff8e8", transparent: true, opacity: 0.9, depthWrite: false }));
    pane.position.set(-1.35, 2.28, -1.44);
    this.roomGroup.add(pane);
    const rail = lam("#c6bda9");
    this.roomGroup.add(box(1.33, 0.06, 0.05, rail, -1.35, 2.74, -1.43));
    this.roomGroup.add(box(1.33, 0.06, 0.05, rail, -1.35, 1.82, -1.43));
    this.roomGroup.add(box(0.06, 0.98, 0.05, rail, -2.0, 2.28, -1.43));
    this.roomGroup.add(box(0.06, 0.98, 0.05, rail, -0.7, 2.28, -1.43));
    // a mug and a notebook so the desk reads lived-in
    const mug = cyl(0.035, 0.09, lam("#e8e4dc"), 0.52, 0.818, 0.02, 20);
    this.roomGroup.add(mug);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.008, 8, 16), lam("#e8e4dc"));
    handle.position.set(0.56, 0.818, 0.02);
    handle.rotation.y = Math.PI / 2;
    this.roomGroup.add(handle);
    const book = box(0.2, 0.012, 0.26, lam("#7f8fa6"), -0.44, 0.779, 0.3);
    this.roomGroup.add(book);
  }


  // ---------------- set B: white studio rig ----------------
  buildStudio() {
    const ground = new THREE.Mesh(new THREE.CircleGeometry(7, 48), lam("#e4e8ee"));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    ground.receiveShadow = true;
    this.studioGroup.add(ground);
    const ped = cyl(0.47, 0.98, lam("#eceff4"), 0, 0.49, 0, 56);
    this.studioGroup.add(ped);
    const pedTop = cyl(0.49, 0.02, lam("#f6f8fb"), 0, 0.99, 0, 56);
    this.studioGroup.add(pedTop);
  }

  buildDesk() {
    const g = this.deskGroup;
    g.add(box(1.18, 0.055, 0.64, lam("#bf9a6b"), 0, 0.745, 0.12));
    for (const [x, z] of [[-0.52, -0.14], [0.52, -0.14], [-0.52, 0.36], [0.52, 0.36]])
      g.add(box(0.05, 0.72, 0.05, lam("#9d7b53"), x, 0.36, z));
    // ---- laptop ----
    const alu = lam("#cdd2d8");
    g.add(box(0.5, 0.024, 0.34, alu, 0, 0.79, 0.1));
    g.add(box(0.36, 0.004, 0.14, lam("#9aa0a8"), 0, 0.803, 0.13)); // keyboard
    g.add(box(0.13, 0.003, 0.08, lam("#b3b8bf"), 0, 0.803, 0.19)); // trackpad
    const lid = new THREE.Group();
    lid.add(box(0.5, 0.34, 0.016, alu, 0, 0.17, 0));
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.3),
      new THREE.MeshBasicMaterial({ color: "#22304a" }));
    screen.position.set(0, 0.17, 0.011);
    lid.add(screen);
    // storefront tiles
    for (let i = 0; i < 3; i++) {
      const tile = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.085),
        new THREE.MeshBasicMaterial({ color: ["#e2874a", "#4a7fd0", "#57a86c"][i] }));
      tile.position.set(-0.14 + i * 0.14, 0.235, 0.012);
      lid.add(tile);
    }
    // download bar
    const barBg = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.034),
      new THREE.MeshBasicMaterial({ color: "#101726" }));
    barBg.position.set(0, 0.1, 0.013);
    lid.add(barBg);
    this.progressFill = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.03), glow("#5fd0ff"));
    this.progressFill.position.set(-0.19, 0.1, 0.015);
    this.progressFill.scale.x = 0.02;
    lid.add(this.progressFill);
    // play tile
    this.playMat = glow("#2b3f63");
    this.playTile = new THREE.Mesh(new THREE.PlaneGeometry(0.115, 0.115), this.playMat);
    this.playTile.position.set(0, -0.045, 0.014);
    lid.add(this.playTile);
    const tri = new THREE.Shape();
    tri.moveTo(-0.022, -0.032); tri.lineTo(0.034, 0); tri.lineTo(-0.022, 0.032); tri.closePath();
    const playTri = new THREE.Mesh(new THREE.ShapeGeometry(tri), glow("#ffffff"));
    playTri.position.set(0.004, -0.045, 0.017);
    lid.add(playTri);
    // cursor lives on the screen plane
    this.cursor = new THREE.Group();
    const cur = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.042, 3), glow("#ffffff"));
    cur.rotation.z = Math.PI;
    cur.rotation.x = Math.PI / 2;
    this.cursor.add(cur);
    this.cursor.position.set(0.12, -0.02, 0.03);
    lid.add(this.cursor);
    lid.position.set(0, 0.802, -0.07);
    lid.rotation.x = -0.2;
    g.add(lid);
    // ---- router ----
    const rtr = new THREE.Group();
    rtr.add(box(0.17, 0.045, 0.11, lam("#eceff3"), 0, 0.023, 0));
    rtr.add(box(0.17, 0.006, 0.11, lam("#c2c8d0"), 0, 0.0, 0));
    for (let i = 0; i < 2; i++) {
      const ant = box(0.012, 0.1, 0.012, lam("#b9c0c8"), (i ? 1 : -1) * 0.06, 0.09, -0.03);
      ant.rotation.x = -0.25;
      rtr.add(ant);
    }
    for (let i = 0; i < 3; i++) {
      const m = glow("#3cd07f");
      this.routerLeds.push(m);
      rtr.add(box(0.014, 0.008, 0.005, m, -0.04 + i * 0.04, 0.026, 0.057));
    }
    rtr.position.set(-0.4, 0.775, -0.02);
    g.add(rtr);
    // wifi arcs above the router
    for (let i = 0; i < 3; i++) {
      const m = new THREE.MeshBasicMaterial({ color: "#57b8ff", transparent: true, opacity: 0 });
      this.wifiArcs.push(m);
      const arc = new THREE.Mesh(new THREE.TorusGeometry(0.05 + i * 0.045, 0.007, 8, 40, Math.PI), m);
      arc.position.set(-0.4, 0.9, -0.02);
      this.wifiMeshes.push(arc);
      g.add(arc);
    }
    // data packets router -> laptop
    for (let i = 0; i < 9; i++) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.026, 0.026), glow("#7fe3ff"));
      p.userData = { ph: i / 9 };
      this.packets.push(p);
      g.add(p);
    }
    // the SSD itself, lying on the desk for the closing reveal
    this.deskChip = new THREE.Group();
    this.deskChipGlow = new THREE.MeshBasicMaterial({ color: "#8be8ff", transparent: true, opacity: 0.25 });
    const dPcb = box(0.3, 0.012, 0.105, lam("#1d5c2e"), 0, 0.006, 0);
    this.deskChip.add(dPcb);
    for (let i = 0; i < 9; i++) this.deskChip.add(box(0.008, 0.013, 0.02, lam("#d8a742"), -0.135 + i * 0.011, 0.007, 0.0));
    for (let i = 0; i < 2; i++) this.deskChip.add(box(0.075, 0.014, 0.065, lam("#14181c"), -0.05 + i * 0.09, 0.014, 0));
    const rim = new THREE.Mesh(new THREE.PlaneGeometry(0.31, 0.11), this.deskChipGlow);
    rim.rotation.x = -Math.PI / 2;
    rim.position.set(0, 0.002, 0);
    this.deskChip.add(rim);
    this.deskChip.position.set(0.43, 0.778, 0.12);
    this.deskChip.rotation.y = 0;          // sejajar dengan laptop, di samping kanannya
    this.deskChip.scale.setScalar(0.85);
    g.add(this.deskChip);
  }


  // ---------------- SSD (M.2 stick) ----------------
  buildSsd() {
    const g = this.ssdGroup;
    const pcb = box(0.34, 0.012, 0.115, lam("#1d5c2e"), 0, 0, 0);
    g.add(pcb);
    // gold connector teeth
    for (let i = 0; i < 9; i++) g.add(box(0.008, 0.013, 0.02, lam("#d8a742"), -0.155 + i * 0.011, 0.001, 0.0));
    // two NAND packages + controller
    const packageMat = lam("#14181c");
    for (let i = 0; i < 2; i++) {
      const chip = box(0.085, 0.014, 0.075, packageMat, -0.055 + i * 0.1, 0.013, 0);
      this.ssdChips.push(chip);
      g.add(chip);
      for (let k = 0; k < 3; k++) g.add(box(0.07, 0.002, 0.006, lam("#3a4048"), -0.055 + i * 0.1, 0.021, -0.02 + k * 0.02));
    }
    g.add(box(0.06, 0.012, 0.05, packageMat, 0.115, 0.012, 0.02));
    // write glow: a rim strip on top of each NAND package (pulses while writing)
    this.writeGlow = new THREE.MeshBasicMaterial({ color: "#7dffb0", transparent: true, opacity: 0 });
    for (let i = 0; i < 2; i++) {
      const rim = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.07), this.writeGlow);
      rim.rotation.x = -Math.PI / 2;
      rim.position.set(-0.055 + i * 0.1, 0.023, 0);
      g.add(rim);
    }
    this.writeSweep = new THREE.Mesh(new THREE.PlaneGeometry(0.001, 0.001), this.writeGlow);
    this.writeSweep.visible = false;
    g.add(this.writeSweep);
    const lab = labelMesh("SSD", 0.26);
    lab.position.set(0, 0.115, 0);
    this.labels.push(lab);
    g.add(lab);
    g.userData.label = lab;
  }

  // ---------------- exploded folder + files + pak ----------------
  buildFolder() {
    const g = this.folderGroup;
    const paper = lam("#f2e3c6");
    const kraft = lam("#d8b57c");
    this.folderBack = box(0.4, 0.28, 0.012, kraft, 0, 0.02, -0.03);
    this.folderFront = box(0.4, 0.24, 0.012, kraft, 0, -0.02, 0.03);
    g.add(this.folderBack, this.folderFront);
    g.add(box(0.12, 0.03, 0.012, kraft, -0.13, 0.17, -0.03)); // tab
    // files (fan out of the folder)
    for (let i = 0; i < 14; i++) {
      const f = box(0.09, 0.115, 0.006, paper, 0, 0.02, 0);
      f.castShadow = false;
      const line = box(0.05, 0.018, 0.004, lam("#c8b48c"), -0.008, 0.02, 0.005);
      line.castShadow = false;
      f.add(line);
      f.userData = { i };
      this.files.push(f);
      g.add(f);
    }
    // pak archive (compressed container)
    this.pak = new THREE.Group();
    const body = box(0.17, 0.13, 0.11, lam("#4a6ea8"), 0, 0, 0);
    this.pak.add(body);
    this.pak.add(box(0.175, 0.035, 0.115, lam("#e8c45c"), 0, 0.01, 0));
    this.pak.add(box(0.05, 0.012, 0.012, lam("#2b3f5e"), 0, 0.055, 0.058));
    this.pak.visible = false;
    g.add(this.pak);
    this.pakLabel = labelMesh("PAK", 0.26, "#2b3f5e");
    this.pakLabel.position.set(0, -0.16, 0);
    this.labels.push(this.pakLabel);
    this.pak.add(this.pakLabel);
  }

  // ---------------- steamapps folder tree ----------------
  buildSteam() {
    const g = this.steamGroup;
    const kraft = lam("#dcbb85");
    const paper = lam("#f7efdc");
    // one folder, opened toward the camera
    const back = box(0.44, 0.3, 0.012, kraft, 0, 0.03, -0.04);
    back.rotation.x = 0.1;
    g.add(back);
    g.add(box(0.13, 0.032, 0.012, kraft, -0.14, 0.19, -0.04));
    const front = box(0.44, 0.16, 0.012, kraft, 0, -0.09, 0.07);
    front.rotation.x = -0.22;
    g.add(front);
    // file tiles inside the folder
    for (let i = 0; i < 6; i++) {
      const tx = -0.13 + (i % 3) * 0.13, ty = 0.06 + Math.floor(i / 3) * 0.1;
      const f = box(0.1, 0.085, 0.006, paper, tx, ty, 0.05 + (i % 3) * 0.004);
      f.castShadow = false;
      const line = box(0.056, 0.014, 0.004, lam("#c8b48c"), -0.01, 0, 0.005);
      line.castShadow = false;
      f.add(line);
      f.rotation.z = (i % 2 ? 0.05 : -0.04);
      g.add(f);
    }
    const lab = labelMesh("steamapps", 0.42, "#2b3f5e");
    lab.position.set(0, 0.31, 0.02);
    this.labels.push(lab);
    g.add(lab);
    g.userData.label = lab;
  }


  // ---------------- RAM stick ----------------
  buildRam() {
    const g = this.ramGroup;
    const pcb = box(0.34, 0.1, 0.01, lam("#2f7d4f"), 0, 0, 0);
    g.add(pcb);
    for (let i = 0; i < 8; i++) {
      const m = glow("#14181c");
      this.ramChips.push(m);
      g.add(box(0.032, 0.05, 0.008, m, -0.14 + i * 0.04, 0.008, 0.008));
    }
    for (let i = 0; i < 9; i++) g.add(box(0.004, 0.012, 0.012, lam("#d8a742"), -0.15 + i * 0.037, -0.048, 0));
    const lab = labelMesh("RAM", 0.26);
    lab.position.set(0, 0.1, 0);
    this.labels.push(lab);
    g.add(lab);
    g.userData.label = lab;
    // flow particles (SSD -> unzip -> RAM)
    for (let i = 0; i < 12; i++) {
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), glow("#8fe6ff"));
      p.userData = { ph: i / 12 };
      this.flow.push(p);
      this.root.add(p);
    }
    // unzip box in the middle
    this.unzip = new THREE.Group();
    this.unzip.add(box(0.15, 0.15, 0.15, lam("#8f6cc4"), 0, 0, 0));
    this.unzipFlap = box(0.155, 0.012, 0.15, lam("#b79ee0"), 0, 0.078, -0.075);
    this.unzip.add(this.unzipFlap);
    this.unzip.add(box(0.07, 0.03, 0.014, lam("#3a2b52"), 0, 0.02, 0.078));
    this.root.add(this.unzip);
  }

  // ---------------- NAND die with cell grid ----------------
  buildChip() {
    const g = this.chipGroup;
    g.add(box(0.62, 0.055, 0.54, lam("#181c22"), 0, 0, 0));
    g.add(box(0.6, 0.008, 0.52, lam("#252c36"), 0, 0.031, 0));
    // pins around the die
    for (let i = 0; i < 11; i++) {
      g.add(box(0.018, 0.008, 0.02, lam("#c9a24a"), -0.25 + i * 0.05, 0.004, 0.265));
      g.add(box(0.018, 0.008, 0.02, lam("#c9a24a"), -0.25 + i * 0.05, 0.004, -0.265));
    }
    // 12 x 9 cells
    for (let ix = 0; ix < 12; ix++) {
      for (let iz = 0; iz < 9; iz++) {
        const m = glow("#2a3340");
        const c = box(0.032, 0.014, 0.032, m, -0.1925 + ix * 0.035, 0.041, -0.14 + iz * 0.035);
        c.userData = { ix, iz };
        this.cellMats.push(m);
        this.cells.push(c);
        g.add(c);
      }
    }
    // electrons
    for (let i = 0; i < 8; i++) {
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.009, 10, 8), glow("#ffe57a"));
      e.userData = { ph: i / 8 };
      this.electrons.push(e);
      g.add(e);
    }
    // new data blocks arriving (S12)
    for (let i = 0; i < 6; i++) {
      const m = glow("#7fe3ff");
      const b = box(0.05, 0.05, 0.05, m, 0, 0, 0);
      this.newData.push(b);
      this.root.add(b);
    }
    const lab = labelMesh("NAND", 0.28);
    lab.position.set(0, 0.22, 0);
    this.labels.push(lab);
    g.add(lab);
    g.userData.label = lab;
    this.bit1 = labelMesh("1", 0.14, "#7a4a17");
    this.bit1.position.set(-0.1, 0.19, 0.02);
    this.labels.push(this.bit1);
    g.add(this.bit1);
    this.bit0 = labelMesh("0", 0.14, "#1f3a5e");
    this.bit0.position.set(0.1, 0.19, 0.02);
    this.labels.push(this.bit0);
    g.add(this.bit0);
    const kosong = labelMesh("KOSONG", 0.34, "#7a2f17");
    kosong.position.set(0, 0.25, 0);
    this.labels.push(kosong);
    g.add(kosong);
    g.userData.kosong = kosong;
  }


  // ---------------- page slab + block ----------------
  buildPages() {
    const g = this.pageGroup;
    for (let i = 0; i < 8; i++) {
      const m = lam("#d5dbe3");
      this.pageMats.push(m);
      const p = box(0.42, 0.012, 0.3, m, 0, -0.08 + i * 0.022, 0);
      this.pages.push(p);
      g.add(p);
    }
    g.add(box(0.44, 0.012, 0.32, lam("#8d96a1"), 0, -0.096, 0));
    // block = the erase unit: a translucent volume around the whole page stack
    this.blockMat = new THREE.MeshBasicMaterial({ color: "#ff8a3d", transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
    const blk = box(0.46, 0.24, 0.34, this.blockMat, 0, 0, 0);
    blk.castShadow = false;
    blk.receiveShadow = false;
    this.blockBox = blk;
    g.add(blk);
    const labPage = labelMesh("PAGE", 0.26, "#7a4a17");
    labPage.position.set(0, 0.15, 0.04);
    this.labels.push(labPage);
    g.add(labPage);
    g.userData.labelPage = labPage;
    const labBlock = labelMesh("BLOCK", 0.32, "#7a2f17");
    labBlock.position.set(0, 0.21, 0.04);
    this.labels.push(labBlock);
    g.add(labBlock);
    g.userData.labelBlock = labBlock;
  }


  // ---------------- per-frame ----------------
  update(id: number, f: number, cam: THREE.PerspectiveCamera): THREE.Vector3 {
    const c = camAt(id, f);
    cam.position.set(...c.pos);
    cam.lookAt(...c.look);
    cam.fov = c.fov;
    cam.updateProjectionMatrix();
    if (c.roll) cam.rotateZ(c.roll);
    cam.updateMatrixWorld();
    const tt = f / 30;
    const deskMode = id === 1 || id === 2 || id === 6 || id === 13;
    this.roomGroup.visible = deskMode;
    this.deskGroup.visible = deskMode;
    this.studioGroup.visible = !deskMode;
    for (const g of [this.ssdGroup, this.folderGroup, this.steamGroup, this.ramGroup, this.chipGroup, this.pageGroup]) g.visible = false;
    for (const l of this.labels) l.visible = false;
    this.unzip.visible = false;
    this.flow.forEach((p) => (p.visible = false));
    this.newData.forEach((p) => (p.visible = false));

    // --- shared desk animation (progress bar fills, cursor) ---
    const fill = id === 1 ? smooth((f - 12) / 80) * 0.72 : 1;
    this.progressFill.scale.x = Math.max(0.02, fill);
    this.progressFill.position.x = -0.17 + 0.17 * Math.max(0.02, fill);
    const wifiOn = id === 2;
    this.wifiMeshes.forEach((m) => (m.visible = wifiOn));
    this.wifiArcs.forEach((m, i) => {
      m.opacity = wifiOn ? (0.25 + 0.6 * (0.5 + 0.5 * Math.sin(tt * 4 - i * 0.8))) : 0;
    });
    this.routerLeds.forEach((m, i) => {
      const on = 0.4 + 0.6 * (Math.sin(tt * 6 + i * 2) > 0 ? 1 : 0.2);
      m.color.setRGB(0.15 * on, 1.4 * on, 0.5 * on);
    });
    this.packets.forEach((p) => {
      const u = p.userData as { ph: number };
      const k = (u.ph + tt * 0.35) % 1;
      const on = deskMode && id === 2;
      p.visible = on;
      if (!on) return;
      const x = -0.4 + 0.42 * k;
      const y = 0.87 + Math.sin(k * Math.PI) * 0.1 + k * 0.03;
      const z = -0.02 + 0.1 * k;
      p.position.set(x, y, z);
      const s = 0.7 + 0.5 * Math.sin(tt * 8 + u.ph * 12);
      p.scale.setScalar(s);
    });
    // play tile press
    const press = id === 6 ? smooth((f - 645) / 10) : 0;
    this.playTile.scale.setScalar(1 - 0.18 * press);
    this.playMat.color.setRGB(0.35 + 0.9 * press, 0.55 + 0.6 * press, 0.95);
    // desk cursor
    if (id === 6) {
      const k = smooth((f - 636) / 14);
      this.cursor.position.set(0.14 - 0.12 * k, -0.02 - 0.02 * k, 0.03);
    }
    this.cursor.visible = deskMode;
    this.deskChip.visible = id === 13;
    if (id === 13) {
      const k = 0.75 + 0.25 * Math.sin(tt * 2.2);
      this.deskChipGlow.opacity = 0.25 + 0.35 * k;
    }

    if (id === 1) this.cursor.position.set(0.14 - 0.16 * smooth((f - 8) / 44), -0.02 + 0.0 * smooth((f - 30) / 16), 0.03);
    if (id === 3) this.s3(f, tt);
    if (id === 4) this.s4(f, tt);
    if (id === 5) this.s5(f, tt);
    if (id === 7) this.s7(f, tt);
    if (id === 8) this.s8(f, tt);
    if (id === 9) this.s9(f, tt);
    if (id === 10) this.s10(f, tt);
    if (id === 11) this.s11(f, tt);
    if (id === 12) this.s12(f, tt);
    const look = new THREE.Vector3(...c.look);
    this.billboard(cam);
    return look;
  }

  billboard(cam: THREE.PerspectiveCamera) {
    for (const l of this.labels) {
      if (!l.visible) continue;
      l.rotation.y = Math.atan2(cam.position.x - l.getWorldPosition(this.tmp).x, cam.position.z - l.getWorldPosition(this.tmp).z);
    }
  }

  // S3: SSD on the pedestal, the write head sweeps over the NAND packages
  s3(f: number, tt: number) {
    this.ssdGroup.visible = true;
    this.ssdGroup.position.set(RIG[0], RIG[1], RIG[2]);
    this.ssdGroup.rotation.set(0, 0.62, 0);
    const sLab = this.ssdGroup.userData.label as THREE.Mesh;
    sLab.visible = f > 236;
    sLab.position.set(0, 0.115, 0);
    popIn(sLab, f, 236);
    const k = smooth((f - 186) / 74);
    this.writeGlow.opacity = f > 196 ? 0.35 + 0.35 * Math.sin(tt * 9) : 0;
    void k;
    this.ssdChips.forEach((chip, i) => {
      const a = 0.5 + 0.5 * Math.sin(tt * 7 + i * 2);
      chip.position.y = 0.013 + 0.002 * a;
    });
    return new THREE.Vector3(RIG[0], RIG[1] + 0.02, RIG[2]);
  }

  // S4: folder explodes into many files, then they get packed into one pak
  s4(f: number, tt: number) {
    const g = this.folderGroup;
    g.visible = true;
    g.position.set(RIG[0], RIG[1] - 0.02, RIG[2]);
    g.rotation.set(-0.12, 0.18, 0);
    const fan = smooth((f - 288) / 40);      // files fan out
    const pack = smooth((f - 398) / 26);     // compress into the pak
    this.folderBack.position.z = -0.03;
    this.folderFront.position.z = 0.03 - 0.02 * pack;
    this.files.forEach((file, i) => {
      const u = file.userData as { i: number };
      const col = i % 5, row = Math.floor(i / 5);
      const tx = -0.26 + col * 0.13;
      const ty = 0.04 + row * 0.13;
      const tz = 0.06 + (i % 2) * 0.02;
      const x0 = 0, y0 = 0.02, z0 = 0;
      file.position.set(
        (x0 + (tx - x0) * fan) * (1 - pack),
        (y0 + (ty - y0) * fan) * (1 - pack) + 0.02 * pack,
        (z0 + (tz - z0) * fan) * (1 - pack)
      );
      file.rotation.z = (1 - pack) * (i % 2 ? 0.12 : -0.1) * fan;
      file.visible = pack < 0.98;
    });
    this.pak.visible = pack > 0.02;
    this.pak.scale.setScalar(0.25 + 0.75 * pack);
    this.pak.position.set(0, 0.02, 0);
    this.pak.rotation.y = (1 - pack) * 0.6;
    this.pakLabel.visible = pack > 0.6;
    return new THREE.Vector3(RIG[0], RIG[1] + 0.05, RIG[2]);
  }

  // S5: steamapps folder
  s5(f: number, tt: number) {
    const g = this.steamGroup;
    g.visible = true;
    g.position.set(RIG[0], RIG[1] - 0.02, RIG[2]);
    g.rotation.set(-0.1, 0.2, 0);
    const lab = g.userData.label as THREE.Mesh;
    lab.visible = f > 470;
    popIn(lab, f, 470);
    g.children.forEach((c, i) => {
      const isFolder = i < 6;
      if (!isFolder) return;
      const k = smooth((f - 470 - i * 4) / 22);
      c.position.y += 0;
      c.userData.k = k;
      c.scale.setScalar(0.82 + 0.18 * k);
    });
    return new THREE.Vector3(RIG[0], RIG[1] + 0.06, RIG[2]);
  }

  // S7: SSD reads, decompress box, RAM fills
  s7(f: number, tt: number) {
    this.ssdGroup.visible = true;
    this.ssdGroup.position.set(SSD_L[0], SSD_L[1], SSD_L[2]);
    this.ssdGroup.rotation.set(0.25, 1.05, 0.06);
    const sLab = this.ssdGroup.userData.label as THREE.Mesh;
    sLab.visible = true;
    sLab.position.set(0.1, 0.26, 0);

    this.ramGroup.visible = true;
    this.ramGroup.position.set(RAM_R[0], RAM_R[1], RAM_R[2]);
    this.ramGroup.rotation.set(0.1, -0.8, 0);
    const rLab = this.ramGroup.userData.label as THREE.Mesh;
    rLab.visible = true;
    rLab.position.set(-0.1, 0.26, 0);

    this.unzip.visible = true;
    this.unzip.position.set(0, RIG[1] + 0.06, 0);
    const flap = smooth((f - 672) / 18);
    this.unzipFlap.rotation.x = -1.5 * flap;
    this.unzipFlap.position.set(0, 0.078 + 0.04 * flap, -0.075 - 0.03 * flap);

    const live = f > 640;
    this.flow.forEach((p) => {
      const u = p.userData as { ph: number };
      const k = (u.ph + tt * 0.55) % 1;
      p.visible = live;
      const from: V3 = [SSD_L[0], SSD_L[1], SSD_L[2]];
      const mid: V3 = [0, RIG[1] + 0.1, 0];
      const to: V3 = [RAM_R[0], RAM_R[1], RAM_R[2]];
      const t = k < 0.45 ? 0 : 1;
      const kk = k < 0.45 ? k / 0.45 : (k - 0.45) / 0.55;
      const a: V3 = t ? mid : from;
      const b: V3 = t ? to : mid;
      p.position.set(a[0] + (b[0] - a[0]) * kk, a[1] + (b[1] - a[1]) * kk + Math.sin(kk * Math.PI) * 0.1, a[2] + (b[2] - a[2]) * kk);
      p.scale.setScalar(t ? 1 : 0.8);
    });
    this.ramChips.forEach((m, i) => {
      const on = f > 710 + i * 6 ? 1 : 0.18;
      m.color.setRGB(0.1 + 0.5 * on, 0.1 + 1.2 * on, 0.12 + 0.9 * on);
    });
    this.folderGroup.visible = false;
    return new THREE.Vector3(0, RIG[1] + 0.04, 0);
  }

  // S8: the chip emerges from the SSD, cells light up
  s8(f: number, tt: number) {
    const g = this.chipGroup;
    g.visible = true;
    g.position.set(RIG[0], RIG[1] + 0.05, RIG[2]);
    g.rotation.set(0.1, 0.35, 0);
    (g.userData.label as THREE.Mesh).visible = f > 860;
    popIn(g.userData.label as THREE.Mesh, f, 860);
    const k = smooth((f - 806) / 80);
    this.cells.forEach((c, i) => {
      const u = c.userData as { ix: number; iz: number };
      const on = clamp01((k * 90 - (u.iz * 12 + u.ix)) * 0.5);
      const m = this.cellMats[i];
      const v = 0.12 + 0.9 * on;
      m.color.setRGB(v * 0.55, v * 0.62, v * 0.75);
    });
    this.electrons.forEach((e) => (e.visible = false));
    this.bit1.visible = false;
    this.bit0.visible = false;
    return new THREE.Vector3(RIG[0], RIG[1] + 0.02, RIG[2]);
  }

  // S9: electrons tunnel into cells; filled = 1, empty = 0
  s9(f: number, tt: number) {
    const g = this.chipGroup;
    g.visible = true;
    g.position.set(RIG[0], RIG[1] + 0.02, RIG[2]);
    g.rotation.set(0.06, 0.2, 0);
    (g.userData.label as THREE.Mesh).visible = false;
    this.cells.forEach((c, i) => {
      const u = c.userData as { ix: number; iz: number };
      const order = u.iz * 12 + u.ix;
      const fillK = smooth((f - (950 + order * 5)) / 6);
      const m = this.cellMats[i];
      const pulse = 0.85 + 0.15 * Math.sin(tt * 6 + i);
      m.color.setRGB(0.16 + (1.05 * pulse - 0.16) * fillK, 0.19 + (0.5 * pulse - 0.19) * fillK, 0.24 + (0.13 * pulse - 0.24) * fillK);
    });
    this.bit1.visible = f > 1058;
    this.bit0.visible = f > 1092;
    this.electrons.forEach((e) => {
      const u = e.userData as { ph: number };
      const k = (u.ph + tt * 0.7) % 1;
      const ix = Math.floor((u.ph * 37) % 12), iz = Math.floor((u.ph * 53) % 9);
      const tx = -0.1925 + ix * 0.035, tz = -0.14 + iz * 0.035;
      e.visible = true;
      e.position.set(tx, 0.31 - 0.26 * k + 0.02, tz);
      e.scale.setScalar(0.8 + 0.4 * Math.sin(k * Math.PI));
    });
    return new THREE.Vector3(RIG[0], RIG[1], RIG[2]);
  }

  // S10: data written page by page, block is the erase unit
  s10(f: number, tt: number) {
    const g = this.pageGroup;
    g.visible = true;
    g.position.set(RIG[0], RIG[1] + 0.02, RIG[2]);
    g.rotation.set(0.12, 0.3, 0);
    const labPage = g.userData.labelPage as THREE.Mesh;
    const labBlock = g.userData.labelBlock as THREE.Mesh;
    labPage.visible = f < 1170;
    labBlock.visible = f > 1172;
    if (f > 1172) popIn(labBlock, f, 1172);
    this.pages.forEach((p, i) => {
      const on = smooth((f - (1119 + i * 6)) / 6);
      const m = this.pageMats[i];
      m.color.setRGB(0.8 - 0.18 * on, 0.8 + 0.2 * on, 0.78 + 0.34 * on);
      p.position.y = -0.08 + i * 0.022 + 0.004 * on;
    });
    this.blockMat.opacity = f > 1172 ? 0.22 : 0;
    this.blockBox.position.y = 0.0;
    return new THREE.Vector3(RIG[0], RIG[1] + 0.03, RIG[2]);
  }

  // S11: delete the game — the folder shrinks, the block is just marked free
  s11(f: number, tt: number) {
    const g = this.chipGroup;
    g.visible = true;
    g.position.set(RIG[0], RIG[1] + 0.02, RIG[2]);
    g.rotation.set(0.08, 0.28, 0);
    (g.userData.label as THREE.Mesh).visible = false;
    (g.userData.kosong as THREE.Mesh).visible = f > 1252;
    popIn(g.userData.kosong as THREE.Mesh, f, 1252);
    const k = smooth((f - 1250) / 40);
    this.cells.forEach((c, i) => {
      const u = c.userData as { ix: number; iz: number };
      const order = u.iz * 12 + u.ix;
      const still = i % 3 !== 0;
      const m = this.cellMats[i];
      const dim = 0.35 + 0.65 * (1 - k);
      if (still) m.color.setRGB(1.0 * dim, 0.48 * dim, 0.12 * dim);
      else m.color.setRGB(0.16, 0.19, 0.24);
      c.position.y = 0.04 + 0.01 * Math.sin(tt * 4 + order);
    });
    this.electrons.forEach((e) => (e.visible = false));
    this.bit1.visible = false;
    this.bit0.visible = false;
    return new THREE.Vector3(RIG[0], RIG[1], RIG[2]);
  }

  // S12: the data is still there; a new write finally overwrites it
  s12(f: number, tt: number) {
    const g = this.chipGroup;
    g.visible = true;
    g.position.set(RIG[0], RIG[1] + 0.02, RIG[2]);
    g.rotation.set(0.06, 0.22, 0);
    (g.userData.label as THREE.Mesh).visible = f < 1420;
    (g.userData.kosong as THREE.Mesh).visible = false;
    const ghost = smooth((f - 1360) / 30);
    this.cells.forEach((c, i) => {
      const u = c.userData as { ix: number; iz: number };
      const order = u.iz * 12 + u.ix;
      const m = this.cellMats[i];
      const pulse = 0.8 + 0.2 * Math.sin(tt * 3 + order * 0.7);
      m.color.setRGB(0.7 * pulse * (0.6 + 0.4 * ghost), 0.35 * pulse, 0.1 * pulse);
    });
    // new data arrives and settles on the right half (overwrite)
    this.newData.forEach((p, i) => {
      const t0 = 1428 + i * 7;
      const k = smooth((f - t0) / 26);
      p.visible = f > t0;
      if (p.visible) p.scale.setScalar(Math.max(0.001, smooth((f - t0) / 8)) * (0.6 + 0.4 * k));
      const tx = -0.05 + (i % 3) * 0.06;
      const tz = -0.02 + Math.floor(i / 3) * 0.06;
      p.position.set(tx, 0.34 - 0.3 * k, tz);
    });
    // overwritten cells go fresh-blue
    this.cells.forEach((c, i) => {
      const u = c.userData as { ix: number; iz: number };
      if (u.ix < 5 || u.iz < 3) return;
      if (f < 1452) return;
      const m = this.cellMats[i];
      m.color.setRGB(0.35, 0.85, 1.25);
    });
    return new THREE.Vector3(RIG[0], RIG[1], RIG[2]);
  }
}
