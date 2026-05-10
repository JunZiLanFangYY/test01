import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, GizmoHelper, GizmoViewport, Grid } from '@react-three/drei';
import { useMemo, useRef, useEffect, type PropsWithChildren } from 'react';
import * as THREE from 'three';
import { useBeamStore } from '../store/useBeamStore';
import { buildBeamModel } from '../model/builder';
import ConcreteMesh from './ConcreteMesh';
import RebarGroup from './RebarGroup';
import StirrupInstances from './StirrupInstances';
import { sceneRefs } from './sceneRefs';

/**
 * 把 mm 单位整体缩放到 m，便于相机/光照配置。
 * 顶层 group scale = 0.001 即可，所有子几何继续以 mm 编写。
 */
const MM_TO_M = 0.001;

export default function BeamScene() {
  const params = useBeamStore((s) => s.params);
  const view = useBeamStore((s) => s.view);
  const model = useMemo(() => buildBeamModel(params), [params]);

  // 相机距离根据梁总长度自适应
  const L_m = model.totalLength * MM_TO_M;
  const cameraPos: [number, number, number] = [L_m * 0.6, L_m * 0.45, L_m * 0.7];

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: cameraPos, fov: 40, near: 0.1, far: 1000 }}
      gl={{ localClippingEnabled: true, antialias: true, preserveDrawingBuffer: true }}
    >
      <color attach="background" args={["#0f172a"]} />
      {/* 三点光照 + 半球光，避免依赖 HDR 资源（CDN 可能不可达）。 */}
      <hemisphereLight args={["#cbd5e1", "#1e293b", 0.6]} />
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[L_m, L_m * 1.2, L_m * 0.6]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-L_m, L_m * 0.8, -L_m * 0.4]} intensity={0.4} />
      <directionalLight position={[0, -L_m, L_m]} intensity={0.25} />

      {/* 内部几何均以 mm 为单位编写；外层 scale=0.001 转 m。position 以 m 为单位居中。 */}
      <ContentRoot scale={MM_TO_M} position={[-L_m / 2, 0, 0]}>
        <ConcreteMesh model={model} opacity={view.concreteOpacity} wireframe={view.wireframe} />
        {view.showRebar && (
          <>
            <RebarGroup model={model} />
            <StirrupInstances model={model} />
          </>
        )}
      </ContentRoot>
      <SceneRefSync />

      <Grid
        args={[20, 20]}
        position={[0, -((model.section.h * MM_TO_M) / 2) - 0.05, 0]}
        cellColor="#334155"
        sectionColor="#475569"
        fadeDistance={30}
        infiniteGrid
      />

      <OrbitControls makeDefault enableDamping />
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
      </GizmoHelper>
    </Canvas>
  );
}

/** 把内容根 group 的引用注册到 sceneRefs，便于导出 GLTF 时只导出可见构件。 */
function ContentRoot({
  children,
  ...props
}: PropsWithChildren<{ scale: number; position: [number, number, number] }>) {
  const ref = useRef<THREE.Group>(null);
  useEffect(() => {
    sceneRefs.contentRoot = ref.current;
    return () => {
      sceneRefs.contentRoot = null;
    };
  }, []);
  return (
    <group ref={ref} {...props}>
      {children}
    </group>
  );
}

/** 把 renderer/scene/camera 注册到 sceneRefs（截图用）。 */
function SceneRefSync() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    sceneRefs.gl = gl;
    sceneRefs.scene = scene;
    sceneRefs.camera = camera;
    return () => {
      sceneRefs.gl = null;
      sceneRefs.scene = null;
      sceneRefs.camera = null;
    };
  }, [gl, scene, camera]);
  return null;
}
