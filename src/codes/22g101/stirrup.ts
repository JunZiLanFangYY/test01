import type { SeismicLevel } from '../../types';

/**
 * 22G101-1 框架梁(KL)箍筋加密区长度（自支座边算起）。
 *  - 一级抗震：max(2hb, 500)
 *  - 二~四级抗震：max(1.5hb, 500)
 *  - 非抗震：仅按设计构造，简化为 0（不加密）
 * hb = 梁截面高度
 */
export function denseZoneLength(seismic: SeismicLevel, h: number): number {
  if (seismic === '非抗震') return 0;
  if (seismic === '一级') return Math.max(2 * h, 500);
  return Math.max(1.5 * h, 500);
}

export interface StirrupRange {
  /** 区间起点 X（沿梁轴 mm） */
  x0: number;
  /** 区间终点 X */
  x1: number;
  /** 该区间间距 */
  spacing: number;
  isDense: boolean;
}

/**
 * 在每跨内根据加密区长度与净跨长，把 [x支座右边, x下个支座左边] 这段
 * 划分为：[加密][非加密][加密]。
 *
 *  - 第一根箍筋距支座边 50 mm（22G101-1 通用做法）
 *  - 加密区长度若 ≥ 半净跨，则全跨加密
 */
export function splitSpanIntoStirrupRanges(opts: {
  spanX0: number; // 该跨净跨的左端（支座右边） X
  spanX1: number; // 该跨净跨的右端（下一支座左边） X
  Ldense: number; // 加密区长度
  sDense: number;
  sNormal: number;
}): StirrupRange[] {
  const { spanX0, spanX1, Ldense, sDense, sNormal } = opts;
  const Ln = spanX1 - spanX0;
  if (Ln <= 0) return [];

  // 全跨加密的特殊情形
  if (Ldense * 2 >= Ln || sNormal <= 0) {
    return [{ x0: spanX0, x1: spanX1, spacing: sDense, isDense: true }];
  }

  return [
    { x0: spanX0, x1: spanX0 + Ldense, spacing: sDense, isDense: true },
    { x0: spanX0 + Ldense, x1: spanX1 - Ldense, spacing: sNormal, isDense: false },
    { x0: spanX1 - Ldense, x1: spanX1, spacing: sDense, isDense: true },
  ];
}

/**
 * 给定一个区间，输出每根箍筋的 X 坐标。
 * 端部锚定：第一根距区间起点 inset (mm)，最后一根 ≤ 区间终点-inset。
 * 当区间被多段拼接调用时，传 inset=0 让相邻区间自然衔接。
 */
export function placeStirrupsInRange(r: StirrupRange, inset: number): number[] {
  const xs: number[] = [];
  const start = r.x0 + inset;
  const end = r.x1 - inset;
  if (end < start) return xs;
  for (let x = start; x <= end + 1e-6; x += r.spacing) xs.push(x);
  return xs;
}

/**
 * 由各跨净跨边界 + 规范规则，输出整根梁所有箍筋 X 坐标。
 * supportEdges：长度 = 跨数+1 的数组，给出每个支座边内边沿的 X（左侧用右边沿，右侧用左边沿）。
 * 简化处理：传入交替的 [supRightEdge0, supLeftEdge1, supRightEdge1, supLeftEdge2, ...]
 */
export function placeAllStirrups(opts: {
  spans: { spanX0: number; spanX1: number }[];
  Ldense: number;
  sDense: number;
  sNormal: number;
  /** 距支座边的第一根距离 (mm)，默认 50 */
  edgeInset?: number;
}): number[] {
  const { spans, Ldense, sDense, sNormal, edgeInset = 50 } = opts;
  const result: number[] = [];
  for (const { spanX0, spanX1 } of spans) {
    const ranges = splitSpanIntoStirrupRanges({ spanX0, spanX1, Ldense, sDense, sNormal });
    ranges.forEach((r, idx) => {
      // 仅每跨第一段起点用 edgeInset，其余衔接处不留缝
      const inset = idx === 0 ? edgeInset : 0;
      const xs = placeStirrupsInRange(r, inset);
      // 避免与上一段末点重复（间距不同处可能很近）
      for (const x of xs) {
        if (result.length === 0 || x - result[result.length - 1] > 5) result.push(x);
      }
    });
    // 跨末端再放一根（≤ 距支座边 edgeInset）
    const lastX = spanX1 - edgeInset;
    if (result.length === 0 || lastX - result[result.length - 1] > 20) result.push(lastX);
  }
  return result;
}
