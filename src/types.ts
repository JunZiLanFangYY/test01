// ============================================================
// 用户输入参数（结构化字段，全部毫米/角度单位）
// ============================================================

export type ConcreteGrade = 'C25' | 'C30' | 'C35' | 'C40' | 'C45' | 'C50';
export type SteelGrade = 'HPB300' | 'HRB400' | 'HRB500';
export type SeismicLevel = '一级' | '二级' | '三级' | '四级' | '非抗震';

export interface SectionParams {
  /** 截面宽 b (mm) */
  b: number;
  /** 截面高 h (mm) */
  h: number;
}

export interface SpanParams {
  /** 净跨长 Ln (mm) */
  Ln: number;
}

export interface BarSpec {
  /** 根数 */
  count: number;
  /** 直径 d (mm) */
  diameter: number;
  /** 钢筋等级 */
  grade: SteelGrade;
}

export interface StirrupSpec {
  /** 肢数（如 4 表示四肢箍） */
  legs: number;
  diameter: number;
  grade: SteelGrade;
  /** 加密区间距 (mm) */
  sDense: number;
  /** 非加密区间距 (mm) */
  sNormal: number;
}

export interface BeamParams {
  /** 截面 */
  section: SectionParams;
  /** 各跨净跨长 */
  spans: SpanParams[];
  /** 支座宽度 hc (mm)，简化为各支座等宽 */
  supportWidth: number;
  /** 保护层厚度 c (mm) */
  cover: number;
  /** 混凝土强度等级 */
  concreteGrade: ConcreteGrade;
  /** 抗震等级 */
  seismicLevel: SeismicLevel;

  /** 上部通长筋 */
  topThrough: BarSpec;
  /** 下部通长筋 */
  bottomThrough: BarSpec;
  /** 箍筋 */
  stirrup: StirrupSpec;
}

// ============================================================
// 视图设置
// ============================================================
export interface ViewSettings {
  /** 混凝土不透明度 0..1 */
  concreteOpacity: number;
  /** 显示钢筋 */
  showRebar: boolean;
  /** 线框 */
  wireframe: boolean;
}

// ============================================================
// 中性数据模型 BeamModel：参数 + 规范计算的产物，供几何层消费
// ============================================================

import type { RebarRole } from './colors';

/** 单根钢筋折线（含弯钩段）。世界坐标 mm。 */
export interface RebarLine {
  id: string;
  role: RebarRole;
  diameter: number;
  grade: SteelGrade;
  /** 折线点序列（可含弯钩，几何层会做圆角化） */
  points: [number, number, number][];
}

/** 箍筋集合（同一形状沿梁轴重复） */
export interface StirrupSet {
  /** 箍筋外包矩形宽 = b - 2c (mm)，沿 Z 方向 */
  width: number;
  /** 箍筋外包矩形高 = h - 2c (mm)，沿 Y 方向 */
  height: number;
  diameter: number;
  grade: SteelGrade;
  /** 各箍筋中心 X 坐标列表 */
  positions: number[];
  /** 每个位置是否处于加密区（用于可选着色） */
  isDense: boolean[];
}

export interface BeamModel {
  /** 总长度 = Σ Ln + (n+1) * hc */
  totalLength: number;
  section: SectionParams;
  /** 支座中心 X 坐标（用于剖切/标注） */
  supportCenters: number[];
  /** 所有纵筋 */
  rebars: RebarLine[];
  /** 箍筋集合 */
  stirrups: StirrupSet;
  /** 用户参数原样回传，方便表格显示 */
  params: BeamParams;
}
