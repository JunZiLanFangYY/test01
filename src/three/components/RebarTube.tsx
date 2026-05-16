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

interface Props {
  rebar: RebarPolyline;
  clippingPlanes: THREE.Plane[];
}

export function RebarTube({ rebar, clippingPlanes }: Props) {
  const geometry = useMemo(() => buildRebarTubeGeometry(rebar), [rebar]);
  const ribTexture = useMemo(() => getRebarRibTexture(), []);
  const explode = useViewStore((s) => s.explode);
  const selectedId = useViewStore((s) => s.selectedRebarId);
  const renderMode = useViewStore((s) => s.renderMode);
  const setSelected = useViewStore((s) => s.setSelected);
  const offset = explodeOffset(rebar.role, explode);
  const isSelected = selectedId === rebar.id;
  const realistic = renderMode === "realistic";
  const color = isSelected ? "#fde047" : ROLE_COLORS[rebar.role];

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
      <meshStandardMaterial
        key={renderMode}
        color={realistic && !isSelected ? new THREE.Color(color).lerp(new THREE.Color("#5f1f14"), 0.25) : color}
        map={realistic ? ribTexture : undefined}
        bumpMap={realistic ? ribTexture : undefined}
        bumpScale={realistic ? Math.max(0.08, rebar.diameter * 0.035) : 0}
        metalness={realistic ? 0.65 : 0.95}
        roughness={realistic ? 0.5 : 0.35}
        clippingPlanes={clippingPlanes}
        emissive={isSelected ? "#facc15" : "#000000"}
        emissiveIntensity={isSelected ? 0.4 : 0}
      />
    </mesh>
  );
}
