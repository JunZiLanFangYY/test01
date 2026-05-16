// 通用领域类型 — 不依赖 three.js，便于单测

export type ConcreteGrade =
  | "C20"
  | "C25"
  | "C30"
  | "C35"
  | "C40"
  | "C45"
  | "C50"
  | "C55"
  | "C60";

export type RebarGrade = "HPB300" | "HRB400" | "HRB500" | "HRBF400" | "HRBF500";

/** 抗震等级。"非抗震" 表示无需 laE 调整。 */
export type SeismicLevel = "非抗震" | "一级" | "二级" | "三级" | "四级";

/** 钢筋角色，用于爆炸图分组与属性显示 */
export type RebarRole =
  | "柱纵筋"
  | "柱箍筋"
  | "梁上部通长"
  | "梁下部纵筋"
  | "梁腰筋"
  | "梁拉筋"
  | "梁箍筋"
  | "板底筋X"
  | "板底筋Y"
  | "板面筋X"
  | "板面筋Y"
  | "板分布筋";

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/**
 * 钢筋折线的一段：直段 + 末尾在与下一段交接处的内圆角半径。
 * 折线由若干顶点构成，顶点处会自动按 bendRadius 倒圆角。
 */
export interface RebarPolyline {
  id: string;
  role: RebarRole;
  /** 钢筋公称直径，单位 mm */
  diameter: number;
  /** 钢筋等级 */
  grade: RebarGrade;
  /** 折线顶点（单位 mm，世界坐标） */
  points: Vec3[];
  /**
   * 折点处的弯弧内径系数（内径 = factor × d）。
   * HPB300 光圆 = 2.5d；HRB400 ≥ 4d（d≤25）/ 6d（d>25）；HRB500 ≥ 6d/7d。
   */
  bendDiameterFactor: number;
  lengthMm?: number;
  massKg?: number;
  /** 调试/属性卡用 */
  label?: string;
}

/** 长方体混凝土构件 */
export interface ConcreteBox {
  /** 中心点 */
  center: Vec3;
  /** 各方向尺寸 mm */
  size: Vec3;
}

export interface MemberGeometry {
  concrete: ConcreteBox;
  rebars: RebarPolyline[];
  /** 元数据，给属性卡使用 */
  meta: Record<string, string | number>;
}
