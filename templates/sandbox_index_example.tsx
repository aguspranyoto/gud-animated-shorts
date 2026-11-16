// Sandbox entry for the look pass: renders only one scene folder (an isolated copy of your short).
import React from "react";
import { Composition, registerRoot } from "remotion";
import { BroughtonShort as Short, BROUGHTON_FRAMES as FRAMES } from "../../videos/broughton-1831/Broughton";
// ^ scene example: broughton-1831 (the Broughton 1831 short). Your scene exports its own <Name>Short + <NAME>_FRAMES.

const Root: React.FC = () => <Composition id="BroughtonShort" component={Short} durationInFrames={FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);
