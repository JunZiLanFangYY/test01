import type { SteelGrade } from '../../types';

/**
 * 22G101-1 钢筋弯弧内直径 D（用于纵筋/箍筋弯折）。
 * 简化表（取最常用值，覆盖 d≤25 与 d≥28 两档）：
 *  - HPB300 光圆：D = 2.5 d（弯钩 180°）
 *  - HRB400 / HRB335：d ≤ 25 时 D = 4 d；d ≥ 28 时 D = 6 d（受力筋弯折）
 *  - HRB500：d ≤ 25 时 D = 6 d；d ≥ 28 时 D = 7 d
 *  - 箍筋（无论何级）：D = 4 d
 */
export function bendDiameter(grade: SteelGrade, d: number, isStirrup = false): number {
  if (isStirrup) return 4 * d;
  if (grade === 'HPB300') return 2.5 * d;
  if (grade === 'HRB500') return d <= 25 ? 6 * d : 7 * d;
  // HRB400 / 默认
  return d <= 25 ? 4 * d : 6 * d;
}

/**
 * 箍筋 135° 弯钩平直段长度 = max(10d, 75 mm)。
 */
export function stirrupHookStraight(d: number): number {
  return Math.max(10 * d, 75);
}
