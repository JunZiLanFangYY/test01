// 矩形梁（KL）参数化几何生成
// 简化模型：单跨简支等截面梁，两端柱（外伸 15d 弯锚）。

import {
  beamSideBarAnchorLength,
  beamSideBarMaxSpacing,
  beamSideBarRequired,
  beamStirrupEncryptionLength,
  beamBottomRebarMinClearSpacing,
  beamTieDiameter,
  beamTieSpacing,
  beamTopRebarMinClearSpacing,
  bendDiameterFactor,
  hookExtension15d,
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

export interface BeamParams {
  /** 截面宽 mm（Z 方向） */
  b: number;
  /** 截面高 mm（Y 方向） */
  h: number;
  /** 跨度净长 Ln mm（X 方向） */
  Ln: number;
  cover: number;
  /** 上部通长筋根数 */
  topCount: number;
  topDiameter: number;
  topGrade: RebarGrade;
  /** 下部纵筋根数 */
  bottomCount: number;
  bottomDiameter: number;
  bottomGrade: RebarGrade;
  /** 箍筋 */
  stirrupDiameter: number;
  stirrupGrade: RebarGrade;
  /** 加密区间距 */
  stirrupSpacingEnc: number;
  /** 非加密区间距 */
  stirrupSpacing: number;
  stirrupLegs?: number;
  /** 腰筋（抗扭/构造）每侧根数，0 表示无 */
  sideBarMode: "auto" | "manual" | "none";
  sideBarCountPerSide: number;
  sideBarDiameter: number;
  sideBarGrade: RebarGrade;
  tieEnabled: boolean;
  tieDiameter?: number;
  tieSpacing?: number;
  concrete: ConcreteGrade;
  seismic: SeismicLevel;
}

const v = (x: number, y: number, z: number): Vec3 => ({ x, y, z });

function clearSpacing(width: number, cover: number, stirrupDiameter: number, count: number, diameter: number): number {
  if (count <= 1) return Number.POSITIVE_INFINITY;
  const inner = width - 2 * cover - 2 * stirrupDiameter;
  return (inner - count * diameter) / (count - 1);
}

function spacingStatus(actual: number, required: number): string {
  if (!Number.isFinite(actual)) return "单根";
  return actual >= required
    ? `满足 ${actual.toFixed(0)}≥${required.toFixed(0)}mm`
    : `不足 ${actual.toFixed(0)}<${required.toFixed(0)}mm`;
}

function beamStirrupPoints(x: number, hs: number, bs: number, hookLen: number): Vec3[] {
  const yTop = hs / 2;
  const yBot = -hs / 2;
  const zRight = bs / 2;
  const zLeft = -bs / 2;
  // 两个 135° 弯钩均位于右上角，钩端沿 45° 斜向截面内，两端重叠
  const hookProj = Math.min(hookLen / Math.SQRT2, bs * 0.4, hs * 0.4);
  const hookTip = v(x, yTop - hookProj, zRight - hookProj);
  // 折线：钩端 → 右上角 → 顶边 → 左上角 → 左侧 → 左下角 → 底边 → 右下角 → 右侧 → 右上角 → 钩端
  return [
    hookTip,
    v(x, yTop, zRight),   // 右上角（弯钩根部）
    v(x, yTop, zLeft),    // 左上角（顶边闭合）
    v(x, yBot, zLeft),    // 左下角
    v(x, yBot, zRight),   // 右下角
    v(x, yTop, zRight),   // 右上角（另一端弯钩根部）
    hookTip,              // 钩端（与起点重叠，两钩在角部叠合）
  ];
}

export function buildBeam(p: BeamParams): MemberGeometry {
  const {
    b,
    h,
    Ln,
    cover,
    topDiameter: dt,
    bottomDiameter: db,
    stirrupDiameter: ds,
  } = p;
  const halfL = Ln / 2;

  // 钢筋中心 y（顶/底）：cover + ds + d/2
  const yTop = h / 2 - cover - ds - dt / 2;
  const yBot = -h / 2 + cover + ds + db / 2;
  const halfB = b / 2;

  const rebars: RebarPolyline[] = [];
  const webHeight = Math.max(0, yTop - yBot);
  const topClearSpacing = clearSpacing(b, cover, ds, p.topCount, dt);
  const bottomClearSpacing = clearSpacing(b, cover, ds, p.bottomCount, db);
  const topMinClearSpacing = beamTopRebarMinClearSpacing(dt);
  const bottomMinClearSpacing = beamBottomRebarMinClearSpacing(db);

  // 沿 z 方向均布
  function zPositions(n: number, diameter: number): number[] {
    if (n <= 0) return [];
    if (n === 1) return [0];
    const inner = b - 2 * cover - 2 * ds - diameter;
    const start = -inner / 2;
    return Array.from({ length: n }, (_, i) => start + (i * inner) / (n - 1));
  }

  // ===== 上部通长筋：两端伸至柱外，再弯折 15d 向下 =====
  const hookTop = hookExtension15d(dt);
  const factorTop = bendDiameterFactor(p.topGrade, dt);
  zPositions(p.topCount, dt).forEach((z, idx) => {
    rebars.push({
      id: `beam-top-${idx}`,
      role: "梁上部通长",
      diameter: dt,
      grade: p.topGrade,
      bendDiameterFactor: factorTop,
      points: [
        v(-halfL, yTop - hookTop, z),
        v(-halfL, yTop, z),
        v(halfL, yTop, z),
        v(halfL, yTop - hookTop, z),
      ],
      label: `上部通长 ${dt}`,
    });
  });

  // ===== 下部纵筋：直锚或弯锚 — 简化：水平直段 + 两端 15d 向上弯钩 =====
  const hookBot = hookExtension15d(db);
  const factorBot = bendDiameterFactor(p.bottomGrade, db);
  zPositions(p.bottomCount, db).forEach((z, idx) => {
    rebars.push({
      id: `beam-bot-${idx}`,
      role: "梁下部纵筋",
      diameter: db,
      grade: p.bottomGrade,
      bendDiameterFactor: factorBot,
      points: [
        v(-halfL, yBot + hookBot, z),
        v(-halfL, yBot, z),
        v(halfL, yBot, z),
        v(halfL, yBot + hookBot, z),
      ],
      label: `下部纵筋 ${db}`,
    });
  });

  // ===== 腰筋（每侧 N 根，沿 z=±halfB-cover-ds-d/2 处） =====
  const shouldAutoSideBars = p.sideBarMode === "auto" && beamSideBarRequired(webHeight);
  const sideBarCount =
    p.sideBarMode === "none"
      ? 0
      : shouldAutoSideBars
        ? Math.max(p.sideBarCountPerSide, Math.ceil(webHeight / beamSideBarMaxSpacing()) - 1)
        : p.sideBarMode === "manual"
          ? p.sideBarCountPerSide
          : 0;
  const sideBarYs: number[] = [];

  if (sideBarCount > 0) {
    const dSide = p.sideBarDiameter;
    const factorSide = bendDiameterFactor(p.sideBarGrade, dSide);
    const sideAnchor = beamSideBarAnchorLength(dSide);
    const yRange = yTop - yBot;
    for (let i = 0; i < sideBarCount; i++) {
      const t = (i + 1) / (sideBarCount + 1);
      const y = yBot + t * yRange;
      sideBarYs.push(y);
      [-1, 1].forEach((sgn) => {
        const z = sgn * (halfB - cover - ds - dSide / 2);
        rebars.push({
          id: `beam-side-${i}-${sgn}`,
          role: "梁腰筋",
          diameter: dSide,
          grade: p.sideBarGrade,
          bendDiameterFactor: factorSide,
          points: [v(-halfL - sideAnchor, y, z), v(halfL + sideAnchor, y, z)],
          label: `侧面构造筋 ${dSide}`,
        });
      });
    }
  }

  const tieDiameter = p.tieDiameter ?? beamTieDiameter(b);
  const tieSpacing = p.tieSpacing ?? beamTieSpacing(p.stirrupSpacing);
  if (p.tieEnabled && sideBarYs.length > 0) {
    const factorTie = bendDiameterFactor(p.stirrupGrade, tieDiameter);
    const tieHookLen = stirrupHookLength(tieDiameter, p.seismic);
    const zLeft = -halfB + cover + ds + tieDiameter / 2;
    const zRight = halfB - cover - ds - tieDiameter / 2;
    const hookProjection = tieHookLen / Math.SQRT2;
    const xTieStart = -halfL + 50;
    const xTieEnd = halfL - 50;
    let tieIdx = 0;
    for (let x = xTieStart; x <= xTieEnd + 1e-3; x += tieSpacing) {
      sideBarYs.forEach((y, rowIdx) => {
        rebars.push({
          id: `beam-tie-${tieIdx++}`,
          role: "梁拉筋",
          diameter: tieDiameter,
          grade: p.stirrupGrade,
          bendDiameterFactor: factorTie,
          points: [
            v(x, y + hookProjection, zLeft + hookProjection),
            v(x, y, zLeft),
            v(x, y, zRight),
            v(x, y - hookProjection, zRight - hookProjection),
          ],
          label: `拉筋 ${tieDiameter}@${tieSpacing} ${rowIdx + 1}`,
        });
      });
    }
  }

  // ===== 箍筋 =====
  const factorS = bendDiameterFactor(p.stirrupGrade, ds);
  const hookLen = stirrupHookLength(ds, p.seismic);
  const encLen = beamStirrupEncryptionLength(h, p.seismic);
  // 箍筋中心矩形尺寸
  const bs = b - 2 * cover - ds;
  const hs = h - 2 * cover - ds;
  const xList: number[] = [];
  const xStart = -halfL + 50; // 距支座 50mm 起箍
  const xEnd = halfL - 50;
  const rightEncStart = xEnd - encLen;
  if (rightEncStart <= xStart + encLen) {
    for (let x = xStart; x <= xEnd + 1e-3; x += p.stirrupSpacingEnc) xList.push(x);
  } else {
    // 左加密
    for (let x = xStart; x <= xStart + encLen + 1e-3; x += p.stirrupSpacingEnc) xList.push(x);
    // 右加密
    for (let x = rightEncStart; x <= xEnd + 1e-3; x += p.stirrupSpacingEnc) xList.push(x);
    // 中间非加密
    for (let x = xStart + encLen + p.stirrupSpacing; x < rightEncStart; x += p.stirrupSpacing) xList.push(x);
  }
  xList.sort((a, b2) => a - b2);
  const stirrupXs = xList.filter((x, idx) => idx === 0 || x - xList[idx - 1] > 5);

  stirrupXs.forEach((x, idx) => {
    rebars.push({
      id: `beam-stir-${idx}`,
      role: "梁箍筋",
      diameter: ds,
      grade: p.stirrupGrade,
      bendDiameterFactor: factorS,
      points: beamStirrupPoints(x, hs, bs, hookLen),
      label: `箍筋 ${ds}`,
    });
    const innerLegs = Math.max(0, (p.stirrupLegs ?? 2) - 2);
    for (let leg = 1; leg <= innerLegs; leg++) {
      const z = -bs / 2 + (leg * bs) / (innerLegs + 1);
      rebars.push({
        id: `beam-stir-${idx}-leg-${leg}`,
        role: "梁箍筋",
        diameter: ds,
        grade: p.stirrupGrade,
        bendDiameterFactor: factorS,
        points: [v(x, hs / 2, z), v(x, -hs / 2, z)],
        label: `箍筋内肢 ${ds}`,
      });
    }
  });

  return {
    concrete: { center: v(0, 0, 0), size: v(Ln, h, b) },
    rebars,
    meta: {
      构件: "KL 矩形梁",
      混凝土: p.concrete,
      抗震等级: p.seismic,
      上部通长: `${p.topCount}Φ${dt}`,
      下部纵筋: `${p.bottomCount}Φ${db}`,
      箍筋: `Φ${ds}@${p.stirrupSpacingEnc}/${p.stirrupSpacing}（${p.stirrupLegs ?? 2}肢）`,
      加密区: `${encLen.toFixed(0)} mm`,
      腹板高度: `${webHeight.toFixed(0)} mm`,
      侧面构造筋: sideBarCount > 0 ? `每侧${sideBarCount}Φ${p.sideBarDiameter}` : "无",
      拉筋: p.tieEnabled && sideBarYs.length > 0 ? `Φ${tieDiameter}@${tieSpacing}` : "无",
      上部净距校核: spacingStatus(topClearSpacing, topMinClearSpacing),
      下部净距校核: spacingStatus(bottomClearSpacing, bottomMinClearSpacing),
    },
  };
}
