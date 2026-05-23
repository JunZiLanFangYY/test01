import { useMemo } from "react";
import * as THREE from "three";
import { buildRebarTubeGeometry } from "../geometry/rebarCurve";
import type { RebarPolyline, RebarRole } from "@/domain/types";
import { useViewStore } from "@/store/useViewStore";
import { getRebarRibTexture } from "@/three/materials/proceduralMaterials";

const ROLE_COLORS: Record<RebarRole, string> = {
  柱纵筋: "#ef4444",
  柱箍筋: "#f59e0b",
  梁上部通长: "#ef4444",
  梁下部纵筋: "#3b82f6",
  梁腰筋: "#10b981",
  梁拉筋: "#a855f7",
  梁箍筋: "#f59e0b",
  板底筋X: "#3b82f6",
  板底筋Y: "#06b6d4",
  板面筋X: "#ef4444",
  板面筋Y: "#f97316",
  板分布筋: "#a3a3a3",
};

/** 角色 → 爆炸方向（单位向量），按构件中心向外 */
function explodeOffset(role: RebarRole, explode: number): [number, number, number] {
  const k = explode * 800; // 最大偏移 800mm
  switch (role) {
    case "柱纵筋":
      return [0, k, 0];
    case "柱箍筋":
      return [0, -k * 0.3, 0];
    case "梁上部通长":
      return [0, k, 0];
    case "梁下部纵筋":
      return [0, -k, 0];
    case "梁腰筋":
      return [0, 0, k];
    case "梁箍筋":
      return [k * 0.3, 0, 0];
    case "板底筋X":
      return [0, -k, 0];
    case "板底筋Y":
      return [0, -k * 1.4, 0];
    case "板面筋X":
      return [0, k, 0];
    case "板面筋Y":
      return [0, k * 1.4, 0];
    default:
      return [0, 0, 0];
  }
}

function polylineLength(rebar: RebarPolyline): number {
  let total = 0;
  for (let i = 1; i < rebar.points.length; i++) {
    const a = rebar.points[i - 1];
    const b = rebar.points[i];
    total += Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
  }
  return total;
}

interface Props {
  rebar: RebarPolyline;
  clippingPlanes: THREE.Plane[];
}

export function RebarTube({ rebar, clippingPlanes }: Props) {
  const explode = useViewStore((s) => s.explode);
  const selectedId = useViewStore((s) => s.selectedRebarId);
  const renderMode = useViewStore((s) => s.renderMode);
  const setSelected = useViewStore((s) => s.setSelected);
  const offset = explodeOffset(rebar.role, explode);
  const isSelected = selectedId === rebar.id;
  const realistic = renderMode === "realistic";
  const color = isSelected ? "#fde047" : ROLE_COLORS[rebar.role];
  const geometry = useMemo(
    () => buildRebarTubeGeometry(rebar, realistic ? { radialSegments: 18, segmentLength: 28 } : undefined),
    [rebar, realistic],
  );
  const ribTexture = useMemo(() => {
    const texture = getRebarRibTexture().clone();
    const repeatY = Math.max(4, Math.min(80, polylineLength(rebar) / Math.max(80, rebar.diameter * 7)));
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1.4, repeatY);
    texture.needsUpdate = true;
    return texture;
  }, [rebar]);
  const realisticColor = useMemo(() => {
    const base = new THREE.Color(color);
    const oxide = rebar.role.includes("箍筋") ? new THREE.Color("#7a3f16") : new THREE.Color("#4f1f18");
    return realistic && !isSelected ? base.lerp(oxide, 0.42) : base;
  }, [color, isSelected, realistic, rebar.role]);

  return (
    <mesh
      geometry={geometry}
      position={offset}
      castShadow
      receiveShadow
      userData={{ rebarId: rebar.id, role: rebar.role, label: rebar.label }}
      onClick={(e) => {
        e.stopPropagation();
        setSelected(rebar.id);
      }}
    >
      <meshPhysicalMaterial
        key={renderMode}
        color={realisticColor}
        bumpMap={realistic ? ribTexture : undefined}
        bumpScale={realistic ? Math.max(0.18, rebar.diameter * 0.055) : 0}
        metalness={realistic ? 0.82 : 0.95}
        roughness={realistic ? 0.32 : 0.35}
        clearcoat={realistic ? 0.18 : 0}
        clearcoatRoughness={realistic ? 0.42 : 0}
        clippingPlanes={clippingPlanes}
        emissive={isSelected ? "#facc15" : "#000000"}
        emissiveIntensity={isSelected ? 0.4 : 0}
      />
    </mesh>
  );
}
