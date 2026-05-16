import * as THREE from "three";
import type { ConcreteBox } from "@/domain/types";
import { Edges } from "@react-three/drei";
import { useViewStore } from "@/store/useViewStore";
import { getConcreteTextures } from "@/three/materials/proceduralMaterials";

interface Props {
  box: ConcreteBox;
  clippingPlanes: THREE.Plane[];
}

export function ConcreteMesh({ box, clippingPlanes }: Props) {
  const show = useViewStore((s) => s.showConcrete);
  const opacity = useViewStore((s) => s.concreteOpacity);
  const renderMode = useViewStore((s) => s.renderMode);
  const explode = useViewStore((s) => s.explode);
  if (!show) return null;
  // 混凝土向上爆炸到比所有钢筋更远的位置
  const yOffset = explode * 1500;
  const concreteTextures = renderMode === "realistic" ? getConcreteTextures() : null;
  return (
    <mesh
      position={[box.center.x, box.center.y + yOffset, box.center.z]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[box.size.x, box.size.y, box.size.z]} />
      <meshPhysicalMaterial
        color={renderMode === "realistic" ? "#b7b0a6" : "#cbd5e1"}
        map={concreteTextures?.map}
        bumpMap={concreteTextures?.bumpMap}
        bumpScale={renderMode === "realistic" ? 0.055 : 0}
        metalness={0.0}
        roughness={renderMode === "realistic" ? 0.96 : 0.9}
        transparent
        opacity={opacity}
        depthWrite={false}
        clippingPlanes={clippingPlanes}
        side={THREE.DoubleSide}
      />
      <Edges threshold={1} color="#475569" />
    </mesh>
  );
}
