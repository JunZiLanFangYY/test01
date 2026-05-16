// 22G101 平法规则（MVP 子集）
// 数据来源：22G101-1 第 57 页 受拉钢筋基本锚固长度 lab、抗震锚固 labE
// 仅覆盖一类环境、常用混凝土等级与钢筋等级；后续可扩展。

import type { ConcreteGrade, RebarGrade, SeismicLevel } from "../types";

/**
 * 受拉钢筋基本锚固长度系数 lab/d。
 * 表中 d ≤ 25 时直接使用；d > 25 时按 22G101 需 ×1.10，本表已在调用处处理。
 */
const LAB_TABLE: Record<RebarGrade, Partial<Record<ConcreteGrade, number>>> = {
  HPB300: { C20: 39, C25: 34, C30: 30, C35: 28, C40: 25, C45: 24, C50: 23, C55: 22, C60: 21 },
  HRB400: { C25: 40, C30: 35, C35: 32, C40: 29, C45: 28, C50: 27, C55: 26, C60: 25 },
  HRBF400: { C25: 40, C30: 35, C35: 32, C40: 29, C45: 28, C50: 27, C55: 26, C60: 25 },
  HRB500: { C25: 48, C30: 43, C35: 39, C40: 36, C45: 34, C50: 32, C55: 31, C60: 30 },
  HRBF500: { C25: 48, C30: 43, C35: 39, C40: 36, C45: 34, C50: 32, C55: 31, C60: 30 },
};

/** 抗震调整系数 ζaE：一、二级=1.15，三级=1.05，四级及非抗震=1.00 */
function seismicFactor(level: SeismicLevel): number {
  if (level === "一级" || level === "二级") return 1.15;
  if (level === "三级") return 1.05;
  return 1.0;
}

/** 基本锚固长度 lab (mm) */
export function lab(grade: RebarGrade, concrete: ConcreteGrade, d: number): number {
  const k = LAB_TABLE[grade]?.[concrete];
  if (!k) throw new Error(`lab 表中无组合 ${grade}/${concrete}`);
  const base = k * d;
  // d > 25 时基本锚固长度 ×1.10
  return d > 25 ? base * 1.1 : base;
}

/** 抗震锚固长度 laE (mm)。简化：la ≈ lab × ψa（保守取 ψa=1.0），laE = ζaE × la */
export function laE(
  grade: RebarGrade,
  concrete: ConcreteGrade,
  d: number,
  level: SeismicLevel
): number {
  const la = lab(grade, concrete, d);
  return seismicFactor(level) * la;
}

/**
 * 弯弧内径系数：返回折点处的弯弧内径 / 钢筋直径。
 * HPB300=2.5；HRB400/HRBF400 d≤25 取 4，d>25 取 6；HRB500 d≤25 取 6，否则 7
 */
export function bendDiameterFactor(grade: RebarGrade, d: number): number {
  if (grade === "HPB300") return 2.5;
  if (grade === "HRB400" || grade === "HRBF400") return d <= 25 ? 4 : 6;
  return d <= 25 ? 6 : 7;
}

/** 末端 90° 弯钩平直段长度（梁/柱纵筋伸至端部弯折段，22G101：15d） */
export function hookExtension15d(d: number): number {
  return 15 * d;
}

/** 箍筋末端 135° 弯钩平直段：抗震 max(10d, 75) */
export function stirrupHookLength(d: number, seismic: SeismicLevel): number {
  if (seismic === "非抗震") return Math.max(5 * d, 50);
  return Math.max(10 * d, 75);
}

/**
 * 柱箍筋加密区长度。
 * 底层柱根：max(Hn/3, 500)（取保守整层值）
 * 其他楼层：max(Hn/6, hc, 500)
 * 节点核心区全高加密
 */
export interface ColumnEncryptionZones {
  /** 柱底加密长度 mm */
  bottom: number;
  /** 柱顶加密长度 mm */
  top: number;
}
export function columnStirrupEncryption(
  Hn: number,
  hc: number,
  isGroundFloor: boolean
): ColumnEncryptionZones {
  const top = Math.max(Hn / 6, hc, 500);
  const bottom = isGroundFloor ? Math.max(Hn / 3, 500) : top;
  return { bottom, top };
}

/**
 * 梁箍筋加密区长度（一、二级抗震）：
 * 一级：max(2hb, 500)；二~四级：max(1.5hb, 500)
 */
export function beamStirrupEncryptionLength(hb: number, level: SeismicLevel): number {
  if (level === "非抗震") return 0;
  if (level === "一级") return Math.max(2 * hb, 500);
  return Math.max(1.5 * hb, 500);
}

export function beamSideBarRequired(hw: number): boolean {
  return hw >= 450;
}

export function beamSideBarMaxSpacing(): number {
  return 200;
}

export function beamTieDiameter(b: number): number {
  return b <= 350 ? 6 : 8;
}

export function beamTieSpacing(nonEncryptedStirrupSpacing: number): number {
  return nonEncryptedStirrupSpacing * 2;
}

export function beamSideBarAnchorLength(d: number): number {
  return 15 * d;
}

export function beamTopRebarMinClearSpacing(d: number): number {
  return Math.max(30, 1.5 * d);
}

export function beamBottomRebarMinClearSpacing(d: number): number {
  return Math.max(25, d);
}

/** 板内底筋伸入支座长度 max(5d, b/2)，b 为支座宽度 */
export function slabBottomAnchor(d: number, supportWidth: number): number {
  return Math.max(5 * d, supportWidth / 2);
}
