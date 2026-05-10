import type { ConcreteGrade, SeismicLevel, SteelGrade } from '../../types';

/**
 * 22G101-1 受拉钢筋抗震基本锚固长度 laE / 基本锚固长度 lab。
 *
 * 数值取自 22G101-1 P57-58 标准表（取最常用三档：HPB300 / HRB400 / HRB500，d≤25）。
 * 表内值为 laE/d 的倍数（直径的倍数），抗震一二级。三四级 = 一二级 × 0.95（22G101-1 注）。
 *
 * 简化口径：
 *   - 抗震 一/二 级取本表
 *   - 抗震 三/四 级 = 本表 × 0.95
 *   - 非抗震 取 lab/d 的较小值（见 lab 表）
 */
type GradeKey = SteelGrade;
type ConcKey = ConcreteGrade;

// laE/d（抗震一、二级；d ≤ 25mm；普通混凝土）
const laE12_d_le_25: Record<GradeKey, Record<ConcKey, number>> = {
  HPB300: { C25: 39, C30: 35, C35: 32, C40: 29, C45: 28, C50: 27 },
  HRB400: { C25: 46, C30: 40, C35: 37, C40: 33, C45: 32, C50: 31 },
  HRB500: { C25: 55, C30: 49, C35: 45, C40: 41, C45: 39, C50: 37 },
};
// laE/d（d ≥ 28mm；普通混凝土）—— 在上表基础上 ×1.10（22G101 注）
function multForLargeD(d: number): number {
  return d >= 28 ? 1.1 : 1.0;
}

// 抗震三四级折减
function seismicFactor(level: SeismicLevel): number {
  if (level === '一级' || level === '二级') return 1.0;
  if (level === '三级' || level === '四级') return 0.95;
  return 1.0; // 非抗震返回 lab 时单独处理
}

// lab/d（非抗震基本锚固，22G101-1 P57 表）
const lab_d_le_25: Record<GradeKey, Record<ConcKey, number>> = {
  HPB300: { C25: 34, C30: 30, C35: 28, C40: 25, C45: 24, C50: 23 },
  HRB400: { C25: 40, C30: 35, C35: 32, C40: 29, C45: 28, C50: 27 },
  HRB500: { C25: 48, C30: 43, C35: 39, C40: 36, C45: 34, C50: 32 },
};

/** 受拉钢筋锚固长度 (mm) — 不区分顶层/普通，未做混凝土保护层等修正系数（M5+ 可扩展）。 */
export function anchorageLength(args: {
  grade: SteelGrade;
  diameter: number;
  concrete: ConcreteGrade;
  seismic: SeismicLevel;
}): number {
  const { grade, diameter: d, concrete, seismic } = args;
  if (seismic === '非抗震') {
    const k = lab_d_le_25[grade][concrete] * multForLargeD(d);
    return Math.round(k * d);
  }
  const k = laE12_d_le_25[grade][concrete] * multForLargeD(d) * seismicFactor(seismic);
  return Math.round(k * d);
}
