/**
 * Interim Wattson renderer, automatically imported during the loading experience.
 * @packageDocumentation
 */

import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  AnimationMixer,
  Box3,
  PerspectiveCamera,
  Vector3,
  type Group,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { HeroStats } from './LocalHero';
import { HERO_MODEL_URL } from './heroAsset';

/** Rendering controls for the same-origin, owner-approved interim model. */
interface SceneProps {
  playing: boolean;
  /**
   * Receive one sample from the current local model mount.
   * @param stats - Loading interval and previous-frame renderer counters.
   */
  onStats: (stats: HeroStats) => void;
  startedAt: number;
  /**
   * Report streamed model bytes independently of parsing, texture preparation and first-frame readiness.
   * @param loaded - Actual response-body bytes reported by Three's FileLoader.
   */
  onDownload: (loaded: number) => void;
}

/**
 * Play the original animation with lifecycle ownership and sample renderer counters after a frame.
 * @param props - Playback gate and local evidence callback.
 * @returns The original local GLB scene, without eager preload or remote decoder requests.
 */
function Model(props: SceneProps) {
  const frames = useRef(0);
  const group = useRef<Group>(null);
  const pivot = useRef<Group>(null);
  const { scene, animations } = useLoader(
    GLTFLoader,
    HERO_MODEL_URL,
    undefined,
    (event) => props.onDownload(event.loaded),
  );
  const mixer = useMemo(() => new AnimationMixer(scene), [scene]);
  const renderer = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera))
      throw new Error('Perspective camera required');
    if (size.width <= 0 || size.height <= 0) return;
    // Recompute from authored coordinates instead of accumulating centering across resizes.
    group.current?.position.set(0, 0, 0);
    const yaw = pivot.current?.rotation.y ?? 0;
    pivot.current?.rotation.set(0, 0, 0);
    group.current?.updateWorldMatrix(true, true);
    const box = new Box3().setFromObject(scene);
    const center = box.getCenter(new Vector3());
    const extent = box.getSize(new Vector3());
    const radius = extent.length() / 2;
    if (pivot.current) pivot.current.rotation.y = yaw;
    if (!Number.isFinite(radius) || radius <= 0)
      throw new Error('Model bounds unavailable');
    group.current?.position.copy(center).negate();
    // Fit height and the full yaw envelope independently; portrait canvases must not
    // shrink a tall character as though its width equalled the bounding-sphere diameter.
    const orbitWidth = Math.hypot(extent.x, extent.z);
    const aspect = size.width / Math.max(size.height, 1);
    const halfFovTangent = Math.tan((camera.fov * Math.PI) / 360);
    const distance =
      (Math.max(extent.y / 2, orbitWidth / (2 * aspect)) / halfFovTangent +
        orbitWidth / 2) *
      1.15;
    camera.position.set(0, extent.y * 0.05, distance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, invalidate, scene, size]);

  useEffect(() => {
    const clip = animations.find((item) => item.name === 'All Animations');
    if (!clip) throw new Error('Temporary model animation missing');
    const action = mixer.clipAction(clip);
    action.reset().play();
    mixer.update(0);
    return () => {
      action.stop();
      mixer.uncacheRoot(scene);
    };
  }, [animations, mixer, scene]);

  useFrame((_, delta) => {
    // A hidden-tab return must not jump through a long animation interval.
    if (props.playing) {
      const step = Math.min(delta, 0.1);
      mixer.update(step);
      if (pivot.current) pivot.current.rotation.y += step * 0.12;
    }
    frames.current += 1;
    // Static/reduced-motion previews still receive a completed-frame diagnostic sample.
    if (frames.current === 1) invalidate();
    if (frames.current === 2)
      props.onStats({
        loadMs: performance.now() - props.startedAt,
        triangles: renderer.info.render.triangles,
        drawCalls: renderer.info.render.calls,
        dpr: renderer.getPixelRatio(),
      });
  });
  return (
    <group ref={pivot}>
      <group ref={group}>
        <primitive object={scene} dispose={null} />
      </group>
    </group>
  );
}

/**
 * Supply passive native-canvas fallback content; actual WebGL errors notify through the boundary.
 * @returns Model-specific poster and a graphics-support explanation.
 */
function UnavailableGraphics() {
  return (
    <div className="local-hero-placeholder">
      <img
        src="/hero/wattson-poster.png"
        width="640"
        height="640"
        alt="Wattson character on black"
      />
      <p role="status">
        WebGL unavailable — the poster image remains available.
      </p>
    </div>
  );
}

/**
 * Frame the temporary asset without retaining the legacy page's arbitrary world offset.
 * @param props - Local playback gate and renderer-sample callback.
 * @returns A bounded-DPR canvas or a static unsupported-WebGL fallback.
 */
export default function LocalHeroScene(props: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 40, near: 0.001, far: 1000 }}
      dpr={[1.5, 3]}
      frameloop={props.playing ? 'always' : 'demand'}
      fallback={<UnavailableGraphics />}
    >
      <ambientLight intensity={1.5} />
      <directionalLight position={[3, 4, 5]} intensity={3} />
      <Model {...props} />
    </Canvas>
  );
}
