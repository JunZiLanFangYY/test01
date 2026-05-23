import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, GizmoHelper, GizmoViewport, Grid } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useModelStore } from "@/store/useModelStore";
import { useViewStore } from "@/store/useViewStore";
import { ConcreteMesh } from "./ConcreteMesh";
import { RebarTube } from "./RebarTube";

/** 场景单位为 mm，统一缩放到 m 显示更舒适 */
const SCALE = 0.001;

function ModelGroup() {
  const geometry = useModelStore((s) => s.geometry);
  const setSelected = useViewStore((s) => s.setSelected);
  const { clipX, clipY, clipZ } = useViewStore();

  // 把构件最大尺寸映射到剖切面位置
  const planes = useMemo(() => {
    const ps: THREE.Plane[] = [];
    const sx = geometry.concrete.size.x;
    const sy = geometry.concrete.size.y;
    const sz = geometry.concrete.size.z;
    if (clipX !== null) ps.push(new THREE.Plane(new THREE.Vector3(-1, 0, 0), (clipX * sx) / 2));
    if (clipY !== null) ps.push(new THREE.Plane(new THREE.Vector3(0, -1, 0), (clipY * sy) / 2));
    if (clipZ !== null) ps.push(new THREE.Plane(new THREE.Vector3(0, 0, -1), (clipZ * sz) / 2));
    return ps;
  }, [clipX, clipY, clipZ, geometry.concrete.size]);

  return (
    <group scale={SCALE} onPointerMissed={() => setSelected(null)}>
      <ConcreteMesh box={geometry.concrete} clippingPlanes={planes} />
      {geometry.rebars.map((r) => (
        <RebarTube key={r.id} rebar={r} clippingPlanes={planes} />
      ))}
    </group>
  );
}

function CameraControls({ controlsRef }: { controlsRef: React.MutableRefObject<OrbitControlsImpl | null> }) {
  const { camera } = useThree();
  const fit = useViewStore((s) => s.cameraFit);
  const zin = useViewStore((s) => s.cameraZoomIn);
  const zout = useViewStore((s) => s.cameraZoomOut);
  const geometry = useModelStore((s) => s.geometry);
  const geometryRef = useRef(geometry);

  useEffect(() => {
    geometryRef.current = geometry;
  }, [geometry]);

  // Fit
  useEffect(() => {
    if (fit === 0) return;
    const s = geometryRef.current.concrete.size;
    const max = Math.max(s.x, s.y, s.z) * 0.001; // 转 m
    const dist = max * 2.2 + 1;
    camera.position.set(dist, dist * 0.8, dist);
    camera.lookAt(0, 0, 0);
    controlsRef.current?.target.set(0, 0, 0);
    controlsRef.current?.update();
  }, [fit, camera, controlsRef]);

  // Zoom in/out via dolly
  useEffect(() => {
    if (zin === 0) return;
    camera.position.multiplyScalar(0.85);
    controlsRef.current?.update();
  }, [zin, camera, controlsRef]);
  useEffect(() => {
    if (zout === 0) return;
    camera.position.multiplyScalar(1.15);
    controlsRef.current?.update();
  }, [zout, camera, controlsRef]);

  return null;
}

interface SceneProps {
  onReady?: (gl: THREE.WebGLRenderer, scene: THREE.Scene) => void;
}

export function Scene({ onReady }: SceneProps) {
  const onceRef = useRef(false);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  return (
    <Canvas
      shadows
      camera={{ position: [4, 4, 6], fov: 45, near: 0.1, far: 200 }}
      gl={{ localClippingEnabled: true, preserveDrawingBuffer: true, antialias: true }}
      onCreated={({ gl, scene }) => {
        gl.localClippingEnabled = true;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.12;
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        if (!onceRef.current && onReady) {
          onceRef.current = true;
          onReady(gl, scene);
        }
      }}
    >
      <color attach="background" args={["#051424"]} />
      <ambientLight intensity={0.22} />
      <hemisphereLight args={["#dbeafe", "#2f1d13", 0.5]} />
      <directionalLight
        position={[7, 10, 5]}
        intensity={1.45}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-6, 3, -8]} intensity={0.72} color="#8fb5ff" />
      <directionalLight position={[0, -4, 7]} intensity={0.28} color="#ffb36b" />
      <Grid
        infiniteGrid
        cellSize={0.5}
        sectionSize={2}
        sectionColor="#475569"
        cellColor="#334155"
        fadeDistance={50}
        position={[0, -3, 0]}
      />
      <ModelGroup />
      <CameraControls controlsRef={controlsRef} />
      <OrbitControls
        ref={(controls) => {
          controlsRef.current = controls;
        }}
        makeDefault
        enableDamping
      />
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport labelColor="white" axisHeadScale={1} />
      </GizmoHelper>
    </Canvas>
  );
}
