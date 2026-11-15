// REFERENCE SCENE (explainer) — composer for the donlod-gem teardown.
// Same post chain as the proven explainer: InkPass -> lens pre+main -> bloom -> NEUTRAL tone map -> grade, MSAA 4.
import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, getInputProps, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { World } from "./world";
import { InkPass, noInkFallback, NOINK } from "../../engine/ink";
import { LensBlur, GrainEffect } from "../../engine/lensblur";
import { GradeEffect, GRADES, GRADE_STRENGTH, gradeFor } from "../../engine/grade";
import { CaptionOverlay } from "../../engine/captions";
import { TOTAL, FLASH_AT, SHOTS, layersAt, dofAt, shotAt } from "./story";
import words from "./voice/words.json";

export const DONLODGEM_FRAMES = TOTAL;

type PostToggles = { ink: boolean; lens: boolean; pre: boolean; bloom: boolean; grade: boolean; grain: boolean };
const toggles = (): PostToggles => ({ ink: true, lens: true, pre: true, bloom: true, grade: true, grain: false, ...((getInputProps() as { post?: Partial<PostToggles> }).post ?? {}) });

const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.5, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
  const mip = b.mipmapBlurPass;
  const setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};

const fwd = new THREE.Vector3(), fpt = new THREE.Vector3();
const BG_ROOM = new THREE.Color("#efe9dd");
const BG_WHITE = new THREE.Color("#e9ecf1");

const Inner: React.FC<{ id: number }> = ({ id }) => {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const world = useMemo(() => new World(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const on = useMemo(toggles, []);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
    lens: new LensBlur({ maxCoC: 24, nearScale: 1.2 }),
    bloom: makeBloom(),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADES.day, GRADE_STRENGTH.day),
    grain: new GrainEffect({ amount: 0.025, cellPx: 1.5 }),
  }), [camera, scene]);
  useEffect(() => () => fx.ink.dispose(), [fx]);
  const post = useMemo(() => {
    const kids: React.ReactElement[] = [];
    if (on.ink) kids.push(<primitive key="ink" object={fx.ink} dispose={null} />);
    if (on.lens && on.pre) kids.push(<primitive key="pre" object={fx.lens.pre} dispose={null} />);
    if (on.lens) kids.push(<primitive key="lens" object={fx.lens.main} dispose={null} />);
    if (on.bloom) kids.push(<primitive key="bloom" object={fx.bloom} dispose={null} />);
    kids.push(<primitive key="tone" object={fx.tone} dispose={null} />);
    if (on.grade) kids.push(<primitive key="grade" object={fx.grade} dispose={null} />);
    if (on.grain) kids.push(<primitive key="grain" object={fx.grain} dispose={null} />);
    return <EffectComposer multisampling={4}>{kids}</EffectComposer>;
  }, [fx, on]);
  const cam = camera as THREE.PerspectiveCamera;
  const deskShot = [1, 2, 6, 13].includes(shotAt(f).id);
  scene.background = (deskShot ? BG_ROOM : BG_WHITE).clone();
  target.copy(world.update(id, f, cam));
  cam.layers.enable(NOINK);
  noInkFallback(world.root);
  const d = dofAt(f);
  cam.getWorldDirection(fwd);
  if (d.focus) fpt.set(...d.focus(f)); else fpt.copy(target);
  fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd));
  fx.lens.cInf = d.cInf;
  gradeFor(fx.grade, SHOTS[id - 1].light);
  fx.grain.seed = f;
  return (
    <>
      <primitive object={world.root} dispose={null} />
      {post}
    </>
  );
};

const dprOverride = () => (getInputProps() as { post?: { dpr?: number } }).post?.dpr;
const ShotView: React.FC<{ id: number; alpha: number }> = ({ id, alpha }) => (
  <AbsoluteFill style={{ opacity: alpha }}>
    <ThreeCanvas width={1080} height={1920} {...(dprOverride() ? { dpr: dprOverride() } : {})} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }} camera={{ fov: 40, near: 0.05, far: 400 }}>
      <Inner id={id} />
    </ThreeCanvas>
  </AbsoluteFill>
);

export const DonlodGemShort: React.FC = () => {
  const f = useCurrentFrame();
  const flash = f >= FLASH_AT && f < FLASH_AT + 4 ? [1, 0.75, 0.45, 0.2][f - FLASH_AT] : 0;
  return (
    <AbsoluteFill style={{ background: "#eef0f3" }}>
      {layersAt(f).map((l, i) => <ShotView key={i ? "over" : "base"} id={l.id} alpha={l.alpha} />)}
      {flash > 0 && <AbsoluteFill style={{ background: "#ffffff", opacity: flash }} />}
      <CaptionOverlay words={words as { w: string; s: number; e: number }[]} fps={30} />
    </AbsoluteFill>
  );
};
