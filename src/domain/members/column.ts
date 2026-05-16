// 矩形柱（KZ）参数化几何生成
// 简化模型：单层独立柱，仅顶/底加密区，不含梁柱节点核心区箍筋特殊处理。

import {
  bendDiameterFactor,
  columnStirrupEncryption,
  hookExtension15d,
  laE,
  stirrupHookLength,
} from "../codes/22G101";
import type {
  ConcreteGrade,
  MemberGeometry,
  RebarGrade,
  RebarPolyline,
  SeismicLevel,
  Vec3,
} from "../types";

export interface ColumnParams {
  /** 截面宽 mm（X 方向） */
  b: number;
  /** 截面高 mm（Z 方向） */
  h: number;
  /** 柱净高 Hn mm（Y 方向） */
  Hn: number;
  /** 保护层厚度 mm（最外层钢筋外缘到混凝土表面） */
  cover: number;
  /** 角筋 + 中部纵筋数量（沿 b 方向每边）。最少 2（含角筋） */
  nx: number;
  /** 沿 h 方向每边纵筋数量。最少 2 */
  nz: number;
  /** 纵筋直径 mm */
  longitudinalDiameter: number;
  longitudinalGrade: RebarGrade;
  /** 箍筋直径 mm */
  stirrupDiameter: number;
  stirrupGrade: RebarGrade;
  /** 箍筋非加密区间距 mm */
  stirrupSpacing: number;
  /** 箍筋加密区间距 mm */
  stirrupSpacingEnc: number;
  concrete: ConcreteGrade;
  seismic: SeismicLevel;
  /** 是否首层（决定底部加密长度） */
  isGroundFloor: boolean;
}

const v = (x: number, y: number, z: number): Vec3 => ({ x, y, z });

export function buildColumn(p: ColumnParams): MemberGeometry {
  const { b, h, Hn, cover, longitudinalDiameter: dl, stirrupDiameter: ds } = p;
  // 纵筋中心到混凝土表面距离 = cover + ds + dl/2
  const cx = cover + ds + dl / 2;
  const halfB = b / 2;
  const halfH = h / 2;

  // 顶部 / 底部弯钩平直段（柱顶纵筋伸至顶后弯折 12d 或 15d，简化用 15d）
  const hookTop = hookExtension15d(dl);
  // 柱根插筋（首层）锚固进基础 laE，其他层视为楼层间连接，简化忽略
  const anchorBottom = p.isGroundFloor
    ? laE(p.longitudinalGrade, p.concrete, dl, p.seismic)
    : 0;

  const enc = columnStirrupEncryption(Hn, h, p.isGroundFloor);

  // ===== 纵筋 =====
  const rebars: RebarPolyline[] = [];
  // 沿 b 方向均布 nx 根，沿 h 方向均布 nz 根，去除 4 个角的重复
  const xs: number[] = [];
  const zs: number[] = [];
  for (let i = 0; i < p.nx; i++) {
    const t = p.nx === 1 ? 0.5 : i / (p.nx - 1);
    xs.push(-halfB + cx + t * (b - 2 * cx));
  }
  for (let j = 0; j < p.nz; j++) {
    const t = p.nz === 1 ? 0.5 : j / (p.nz - 1);
    zs.push(-halfH + cx + t * (h - 2 * cx));
  }

  // 仅保留矩形周边的纵筋位置（避免内部布筋）
  const positions: { x: number; z: number }[] = [];
  for (let i = 0; i < p.nx; i++) {
    for (let j = 0; j < p.nz; j++) {
      const onEdge =
        i === 0 || i === p.nx - 1 || j === 0 || j === p.nz - 1;
      if (onEdge) positions.push({ x: xs[i], z: zs[j] });
    }
  }

  const factorL = bendDiameterFactor(p.longitudinalGrade, dl);
  positions.forEach((pos, idx) => {
    const yBottom = -Hn / 2 - anchorBottom; // 首层延伸到基础
    const yTop = Hn / 2;
    // 顶部 90° 弯钩：水平向柱内 15d
    const towardX = pos.x > 0 ? -1 : 1;
    const towardZ = pos.z > 0 ? -1 : 1;
    // 选择沿 X 或 Z 方向弯钩：取靠近的边（绝对距离更近的那条边）
    const dxEdge = halfB - Math.abs(pos.x);
    const dzEdge = halfH - Math.abs(pos.z);
    const bendAlongX = dxEdge >= dzEdge;
    const hookEnd = bendAlongX
      ? v(pos.x + towardX * hookTop, yTop, pos.z)
      : v(pos.x, yTop, pos.z + towardZ * hookTop);

    rebars.push({
      id: `col-long-${idx}`,
      role: "柱纵筋",
      diameter: dl,
      grade: p.longitudinalGrade,
      bendDiameterFactor: factorL,
      points: [
        v(pos.x, yBottom, pos.z),
        v(pos.x, yTop, pos.z),
        hookEnd,
      ],
      label: `角部/边纵筋 ${dl}`,
    });
  });

  // ===== 箍筋（矩形外箍） =====
  // 箍筋中心线尺寸：bs = b - 2*cover - ds, hs = h - 2*cover - ds
  const bs = b - 2 * cover - ds;
  const hs = h - 2 * cover - ds;
  const factorS = bendDiameterFactor(p.stirrupGrade, ds);
  const hookLen = stirrupHookLength(ds, p.seismic);

  // 加密区与非加密区的 y 列表
  const ys: number[] = [];
  const yBot = -Hn / 2 + cover + ds / 2;
  const yTop = Hn / 2 - cover - ds / 2;
  // 底部加密
  for (let y = yBot; y <= yBot + enc.bottom + 1e-3; y += p.stirrupSpacingEnc) ys.push(y);
  // 顶部加密
  const topEncStart = yTop - enc.top;
  for (let y = topEncStart; y <= yTop + 1e-3; y += p.stirrupSpacingEnc) ys.push(y);
  // 中间非加密
  for (let y = yBot + enc.bottom + p.stirrupSpacing; y < topEncStart; y += p.stirrupSpacing) ys.push(y);

  ys.sort((a, b2) => a - b2);

  // 单根矩形外箍：起点在某角，绕一圈回起点稍多一点，再加 135° 弯钩（沿对角线方向 hookLen）
  // 这里用折线近似 135° 弯钩：从角点沿对角线斜向上/向内 hookLen
  ys.forEach((y, idx) => {
    // 顶点（4 角）
    const c1 = v(-bs / 2, y, -hs / 2);
    const c2 = v(bs / 2, y, -hs / 2);
    const c3 = v(bs / 2, y, hs / 2);
    const c4 = v(-bs / 2, y, hs / 2);
    // 135° 弯钩：从起点 c1 沿 (1, 0, 1)/√2 朝柱内方向 hookLen
    const hookDir = { x: 1, z: 1 };
    const norm = Math.SQRT2;
    const hookEnd = v(
      c1.x + (hookDir.x / norm) * hookLen,
      y,
      c1.z + (hookDir.z / norm) * hookLen
    );
    rebars.push({
      id: `col-stir-${idx}`,
      role: "柱箍筋",
      diameter: ds,
      grade: p.stirrupGrade,
      bendDiameterFactor: factorS,
      points: [c1, c2, c3, c4, c1, hookEnd],
      label: `箍筋 ${ds}@${y < yBot + enc.bottom || y > topEncStart ? p.stirrupSpacingEnc : p.stirrupSpacing}`,
    });
  });

  return {
    concrete: { center: v(0, 0, 0), size: v(b, Hn, h) },
    rebars,
    meta: {
      构件: "KZ 矩形柱",
      混凝土: p.concrete,
      抗震等级: p.seismic,
      纵筋: `${positions.length}Φ${dl} ${p.longitudinalGrade}`,
      箍筋: `Φ${ds}@${p.stirrupSpacingEnc}/${p.stirrupSpacing} ${p.stirrupGrade}`,
      底部加密: `${enc.bottom.toFixed(0)} mm`,
      顶部加密: `${enc.top.toFixed(0)} mm`,
    },
  };
}
