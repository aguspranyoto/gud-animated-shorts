# shared/tech — hardware props for explainer shorts

Reusable desk + hardware for any "daily tech" explainer (where a downloaded game
lives, what an SSD is, how RAM works, …). Proven on **donlod-gem** (2026-11-15).

```
laptop    buildLaptop()    open laptop, dark store screen, download bar, play button, cursor
router    buildRouter()    home router + LEDs + wifi arcs + data packets
ssd       buildSSD()       M.2 2280 stick: PCB, gold teeth, 2 NAND packages, controller, write glow
ram       buildRam()       upright RAM module, 8 chips that light one by one
desk      buildDeskRoom()  bright room + desk + mug + notebook + window (y=0 floor)
label     makeLabel()      canvas text pill; faceLabels(labels, cam) each frame
```

Preview: `preview.jpg` (desk room with all four props).

## Usage

```ts
import { buildDeskRoom, buildLaptop, buildRouter, buildSSD, buildRam, makeLabel, faceLabels, popIn } from "../../shared/tech/tech";

const room = buildDeskRoom();
scene.add(room.group);

const laptop = buildLaptop();                        // origin = base centre on the desk
laptop.group.position.set(...room.anchors.laptopSeat);
laptop.setProgress(0.65);                            // download bar
laptop.setPlayPress(0.4);                            // press squash + glow
laptop.setCursor(0.1, -0.03);                        // screen-local metres
scene.add(laptop.group);

const router = buildRouter();
router.group.position.set(...room.anchors.routerSeat);
router.setTarget([0.4, 0.14, 0.12]);                 // packets fly here (world space)
router.animate(t, true);                             // t = seconds, false hides arcs + packets
scene.add(router.group);

const ssd = buildSSD({ scale: 0.85 });               // lies flat; yaw it, don't stand it up
ssd.group.position.set(...room.anchors.ssdSeat);
ssd.setWrite(0.8, t);                                // write-rim pulse
scene.add(ssd.group);

const ram = buildRam();
ram.setFill(0.75);                                   // 6 of 8 chips lit
scene.add(ram.group);

const lab = makeLabel("steamapps", 0.42);
lab.position.set(0, 1.3, 0);
scene.add(lab);
// per frame, after the camera moves:
faceLabels([lab], camera);
```

## Contract

- Metres, +y up, props face **+z** toward the camera, `y = 0` = floor / prop base.
- Materials are `MeshLambertMaterial` + engine `twoTone()`, so ink / grade / fog treat
  them like the rest of the world; self-lit parts (screen, LEDs, indicators, labels)
  are `MeshBasicMaterial` and can bloom above 1.0.
- Every builder returns `{ group, ...handles }`; nothing is added to your scene and
  no globals are touched. Animate through the returned methods only.
- Deterministic: no `Date.now()` / `Math.random()` inside; pass `t` in seconds.
- Labels are canvas planes with `alphaTest`, so `noInkFallback()` moves them to the
  **NOINK** layer. The ink pass enables that layer on the main camera; if you render
  without `InkPass`, call `camera.layers.enable(NOINK)` yourself or labels vanish.

## Dimensions (TECH)

| prop | size |
|---|---|
| desk room | floor 14×14 m, wall at z −1.5, desk 1.18 × 0.64 m, top y 0.7725 |
| laptop | base 0.5 × 0.34 m, lid tilted −0.2 rad, screen 0.46 × 0.30 |
| router | 0.17 × 0.11 × 0.045 m, wifi arcs 0.12 above the base |
| SSD | 0.30 × 0.105 × 0.012 m (oversize M.2 for readability) |
| RAM | 0.34 × 0.10 m, 8 chips |

## Gotchas (learned the hard way in donlod-gem)

1. Put the SSD where the laptop is not: laptop footprint is x ±0.25, z −0.07…0.27 —
   a 0.3 m stick needs ≥ 0.28 m of lateral clearance or the PCB corner slides into the
   laptop body. `anchors.ssdSeat` is already clear, parallel to the laptop.
2. The wifi arcs are a *shot* effect: call `router.animate(t, false)` outside the data
   shot, otherwise a cut-off arc hangs at the frame edge and reads as a stray symbol.
3. Labels pop: reveal them with `popIn(label, f, f0)` instead of toggling `visible`
   (unplanned frame-diff pops trip the QA pass).
4. `buildSSD` lies flat (thickness on Y). If you rotate it, keep the NAND packages on
   top or the write glow ends up under the board.
5. Keep the pixel/piece scale: the ink pass draws 3–5 px lines at 1080 wide, so props
   smaller than ~5 cm lose their outline and read as blobs.
