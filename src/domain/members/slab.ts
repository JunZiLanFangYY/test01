// 双层双向板（LB）参数化几何生成

import { bendDiameterFactor, slabBottomAnchor } from "../codes/22G101";
import type {
  ConcreteGrade,
  MemberGeometry,
  RebarGrade,
  RebarPolyline,
  SeismicLevel,
  Vec3,
} from "../types";

export interface SlabParams {
  /** X 方向跨长 mm */
  Lx: number;
  /** Z 方向跨长 mm */
  Lz: number;
  /** 板厚 mm（Y 方向） */
  thickness: number;
  cover: number;
  /** 支座宽（梁宽） */
  supportWidth: number;
  /** 底筋 X 方向直径 / 间距 */
  bottomXDiameter: number;
  bottomXSpacing: number;
  bottomXGrade: RebarGrade;
  /** 底筋 Z 方向 */
  bottomZDiameter: number;
  bottomZSpacing: number;
  bottomZGrade: RebarGrade;
  /** 是否布置面筋（双层） */
  topLayer: boolean;
  topXDiameter: number;
  topXSpacing: number;
  topXGrade: RebarGrade;
  topZDiameter: number;
  topZSpacing: number;
  topZGrade: RebarGrade;
  concrete: ConcreteGrade;
  seismic: SeismicLevel;
}

const v = (x: number, y: number, z: number): Vec3 => ({ x, y, z });

function range(start: number, end: number, step: number): number[] {
  const out: number[] = [];
  for (let x = start; x <= end + 1e-3; x += step) out.push(x);
  return out;
}

export function buildSlab(p: SlabParams): MemberGeometry {
  const { Lx, Lz, thickness: t, cover } = p;
  const halfLx = Lx / 2;
  const halfLz = Lz / 2;
  const halfT = t / 2;
  const rebars: RebarPolyline[] = [];

  // 底筋 X：方向沿 X，分布在 z 方向。中心 y = -halfT + cover + d/2
  const yBottomX = -halfT + cover + p.bottomXDiameter / 2;
  const yBottomZ = yBottomX + (p.bottomXDiameter + p.bottomZDiameter) / 2; // 底筋 Z 在 X 之上
  const factorBX = bendDiameterFactor(p.bottomXGrade, p.bottomXDiameter);
  const factorBZ = bendDiameterFactor(p.bottomZGrade, p.bottomZDiameter);
  const anchorBX = slabBottomAnchor(p.bottomXDiameter, p.supportWidth);
  const anchorBZ = slabBottomAnchor(p.bottomZDiameter, p.supportWidth);

  range(-halfLz + cover + 50, halfLz - cover - 50, p.bottomXSpacing).forEach(
    (z, idx) => {
      rebars.push({
        id: `slab-botX-${idx}`,
        role: "板底筋X",
        diameter: p.bottomXDiameter,
        grade: p.bottomXGrade,
        bendDiameterFactor: factorBX,
        points: [
          v(-halfLx + (p.supportWidth / 2 - anchorBX), yBottomX, z),
          v(halfLx - (p.supportWidth / 2 - anchorBX), yBottomX, z),
        ],
        label: `底筋X ${p.bottomXDiameter}@${p.bottomXSpacing}`,
      });
    }
  );

  range(-halfLx + cover + 50, halfLx - cover - 50, p.bottomZSpacing).forEach(
    (x, idx) => {
      rebars.push({
        id: `slab-botZ-${idx}`,
        role: "板底筋Y",
        diameter: p.bottomZDiameter,
        grade: p.bottomZGrade,
        bendDiameterFactor: factorBZ,
        points: [
          v(x, yBottomZ, -halfLz + (p.supportWidth / 2 - anchorBZ)),
          v(x, yBottomZ, halfLz - (p.supportWidth / 2 - anchorBZ)),
        ],
        label: `底筋Y ${p.bottomZDiameter}@${p.bottomZSpacing}`,
      });
    }
  );

  if (p.topLayer) {
    const yTopX = halfT - cover - p.topXDiameter / 2;
    const yTopZ = yTopX - (p.topXDiameter + p.topZDiameter) / 2;
    const factorTX = bendDiameterFactor(p.topXGrade, p.topXDiameter);
    const factorTZ = bendDiameterFactor(p.topZGrade, p.topZDiameter);

    range(-halfLz + cover + 50, halfLz - cover - 50, p.topXSpacing).forEach(
      (z, idx) => {
        rebars.push({
          id: `slab-topX-${idx}`,
          role: "板面筋X",
          diameter: p.topXDiameter,
          grade: p.topXGrade,
          bendDiameterFactor: factorTX,
          points: [v(-halfLx + cover, yTopX, z), v(halfLx - cover, yTopX, z)],
          label: `面筋X ${p.topXDiameter}@${p.topXSpacing}`,
        });
      }
    );
    range(-halfLx + cover + 50, halfLx - cover - 50, p.topZSpacing).forEach(
      (x, idx) => {
        rebars.push({
          id: `slab-topZ-${idx}`,
          role: "板面筋Y",
          diameter: p.topZDiameter,
          grade: p.topZGrade,
          bendDiameterFactor: factorTZ,
          points: [v(x, yTopZ, -halfLz + cover), v(x, yTopZ, halfLz - cover)],
          label: `面筋Y ${p.topZDiameter}@${p.topZSpacing}`,
        });
      }
    );
  }

  return {
    concrete: { center: v(0, 0, 0), size: v(Lx, t, Lz) },
    rebars,
    meta: {
      构件: "LB 现浇板",
      混凝土: p.concrete,
      抗震等级: p.seismic,
      板厚: `${t} mm`,
      底筋X: `Φ${p.bottomXDiameter}@${p.bottomXSpacing}`,
      底筋Y: `Φ${p.bottomZDiameter}@${p.bottomZSpacing}`,
      面筋: p.topLayer
        ? `X Φ${p.topXDiameter}@${p.topXSpacing} / Y Φ${p.topZDiameter}@${p.topZSpacing}`
        : "无",
    },
  };
}
