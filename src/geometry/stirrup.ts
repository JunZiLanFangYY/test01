import * as THREE from 'three';
import { bendDiameter, stirrupHookStraight } from '../codes/22g101/bend';
import type { SteelGrade } from '../types';

export interface StirrupShapeParams {
  /** 箍筋外包矩形宽（沿 Z）= b - 2c */
  width: number;
  /** 箍筋外包矩形高（沿 Y）= h - 2c */
  height: number;
  /** 箍筋直径 d_s */
  diameter: number;
  /** 钢筋等级（用于弯弧直径） */
  grade: SteelGrade;
  /** 弯钩夹角（默认抗震 135°） */
  hookAngleDeg?: number;
}

/**
 * 在 YZ 平面（X=0）上构造一根闭合矩形箍筋的中心线 CurvePath：
 *  - 起点位于左上角附近的 135° 弯钩末端
 *  - 沿矩形顺时针走一圈，最后再叠加另一段 135° 弯钩
 *
 * 简化：用直线段 + 角部圆弧（弯弧内径 D）。两个 135° 弯钩从对角附近伸入矩形内部。
 *
 * 返回的 CurvePath 顶点位于 (x=0, y, z) 平面。
 */
export function buildStirrupCurvePath(p: StirrupShapeParams): THREE.CurvePath<THREE.Vector3> {
  const { width: W, height: H, diameter: d, grade } = p;
  const hookAngle = ((p.hookAngleDeg ?? 135) * Math.PI) / 180;
  const D = bendDiameter(grade, d, true); // 弯弧内径
  const r = D / 2 + d / 2; // 中心线圆角半径
  const hookLen = stirrupHookStraight(d);

  // 矩形中心在 (y=0, z=0)；半宽/半高
  const hw = W / 2;
  const hh = H / 2;

  const path = new THREE.CurvePath<THREE.Vector3>();

  // 简化策略：用四条直线 + 四个 90° 圆弧拼成闭合矩形，再在两个对角上叠加 135° 弯钩。
  // 矩形角点（圆心）：四角圆心位于内缩 r 的位置
  const cTL = new THREE.Vector2(-hw + r, hh - r); // 左上
  const cTR = new THREE.Vector2(hw - r, hh - r); // 右上
  const cBR = new THREE.Vector2(hw - r, -hh + r); // 右下
  const cBL = new THREE.Vector2(-hw + r, -hh + r); // 左下

  // 起点：在左上角圆弧 + 135° 弯钩。让弯钩朝矩形内侧（-y, -z 方向）。
  // 先生成主体矩形（顺时针：左上 → 右上 → 右下 → 左下 → 回到左上）。
  // 圆弧 t=0..1，按 yz 平面：z 横向、y 纵向。
  const arcs = [
    arc(cTL, r, Math.PI, Math.PI * 1.5), // 左上：180→270°（z 减、y 加 → y 加、z 增）
    arc(cTR, r, Math.PI * 1.5, Math.PI * 2.0), // 右上：270→360°
    arc(cBR, r, 0, Math.PI * 0.5), // 右下：0→90°
    arc(cBL, r, Math.PI * 0.5, Math.PI), // 左下：90→180°
  ];

  // 边线起止（圆弧切点之间的直线）
  const lineTop = line(arcs[0].endP, arcs[1].startP);
  const lineRight = line(arcs[1].endP, arcs[2].startP);
  const lineBottom = line(arcs[2].endP, arcs[3].startP);
  const lineLeft = line(arcs[3].endP, arcs[0].startP);

  // 顺序：先在左上引入 135° 弯钩 → 顶边 → 右上弧 → 右边 → 右下弧 → 底边 → 左下弧 → 左边 → 左上弧 → 再叠一段 135° 弯钩
  // 弯钩从矩形外侧切线方向出发，经过 135° 弯弧后切入矩形内侧。
  // 简化：弯钩起点位于左上圆弧的起点切线延长，长度 = hookLen，方向朝内对角。
  const hookStart1 = hookSegment(arcs[0].startP, arcs[0].startTangent, hookAngle, hookLen, d, grade);
  const hookStart2 = hookSegment(arcs[2].endP, arcs[2].endTangent, hookAngle, hookLen, d, grade);

  // 把弯钩 1 加入路径
  hookStart1.curves.forEach((c) => path.add(c));
  path.add(arcs[0].curve);
  path.add(lineTop);
  path.add(arcs[1].curve);
  path.add(lineRight);
  path.add(arcs[2].curve);
  // 弯钩 2 在右下圆弧之后插入：但为闭合性，这里把它与底边相邻处插入会破坏顺序。
  // 实际工程上，两道 135° 弯钩通常位于同一个对角（如左上角的两根纵筋外侧）。
  // 这里让两个弯钩都从左上圆弧附近伸出，分别朝矩形内的两个方向 → 视觉上"双弯钩"。
  // 因此不在这里插入第二个弯钩，改为放在路径末尾 + 微小偏移。
  path.add(lineBottom);
  path.add(arcs[3].curve);
  path.add(lineLeft);
  // 闭合到弯钩 1 起点之前，再追加第二个弯钩
  hookStart2.curves.forEach((c) => path.add(c));

  return path;
}

// ============ 辅助：把 2D (z, y) 升维成 (x=0, y, z) =============
function v3(z: number, y: number): THREE.Vector3 {
  return new THREE.Vector3(0, y, z);
}

function line(a: { z: number; y: number }, b: { z: number; y: number }) {
  return new THREE.LineCurve3(v3(a.z, a.y), v3(b.z, b.y));
}

interface ArcInfo {
  curve: THREE.CurvePath<THREE.Vector3>;
  startP: { z: number; y: number };
  endP: { z: number; y: number };
  startTangent: { z: number; y: number };
  endTangent: { z: number; y: number };
}

/** 在 YZ 平面绘制以 (cZ,cY) 为圆心、半径 r、参数角 a0..a1 的圆弧（弧度）。
 *  约定：角 0° 指向 +Z，90° 指向 +Y，逆时针。
 *  内部用多段 LineCurve3 离散化（足够圆滑，TubeGeometry 再细分）。 */
function arc(c: THREE.Vector2, r: number, a0: number, a1: number, steps = 12): ArcInfo {
  const path = new THREE.CurvePath<THREE.Vector3>();
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = a0 + ((a1 - a0) * i) / steps;
    pts.push(v3(c.x + r * Math.cos(t), c.y + r * Math.sin(t)));
  }
  for (let i = 0; i < pts.length - 1; i++) {
    path.add(new THREE.LineCurve3(pts[i], pts[i + 1]));
  }
  const t0 = { z: c.x + r * Math.cos(a0), y: c.y + r * Math.sin(a0) };
  const t1 = { z: c.x + r * Math.cos(a1), y: c.y + r * Math.sin(a1) };
  // 切线方向（逆时针）：(-sin, cos)
  const tan0 = { z: -Math.sin(a0), y: Math.cos(a0) };
  const tan1 = { z: -Math.sin(a1), y: Math.cos(a1) };
  return { curve: path, startP: t0, endP: t1, startTangent: tan0, endTangent: tan1 };
}

/**
 * 生成一段 135° 弯钩（一个圆弧 + 一段平直段）从给定起点出发，沿给定切线方向。
 * 弯钩朝矩形内侧（与切线呈 hookAngle 旋转，向内）。
 */
function hookSegment(
  origin: { z: number; y: number },
  tangent: { z: number; y: number },
  hookAngle: number,
  hookLen: number,
  d: number,
  grade: SteelGrade
): { curves: THREE.Curve<THREE.Vector3>[] } {
  const D = bendDiameter(grade, d, true);
  const r = D / 2 + d / 2;
  const curves: THREE.Curve<THREE.Vector3>[] = [];

  // 弯钩弧线：从切线方向旋转 hookAngle（向矩形内侧 = 切线左侧）的半圆弧
  // 圆心 = origin + 法向量 * r（法向量为切线左转 90°：n = (-tan.y, tan.z)）
  const n = { z: -tangent.y, y: tangent.z };
  const cz = origin.z + n.z * r;
  const cy = origin.y + n.y * r;
  // 起点角：由 (origin - center) 决定
  const a0 = Math.atan2(origin.y - cy, origin.z - cz);
  const a1 = a0 - hookAngle; // 顺向内卷
  const arcInfo = arc({ x: cz, y: cy } as THREE.Vector2, r, a0, a1, 10);
  curves.push(arcInfo.curve);

  // 平直段
  const endZ = arcInfo.endP.z;
  const endY = arcInfo.endP.y;
  const tEnd = arcInfo.endTangent;
  const sx = endZ + tEnd.z * hookLen;
  const sy = endY + tEnd.y * hookLen;
  curves.push(new THREE.LineCurve3(v3(endZ, endY), v3(sx, sy)));

  return { curves };
}

/**
 * 由 CurvePath 生成 TubeGeometry。CurvePath 不是单一 Curve，
 * 这里用 getPoints 离散化后再喂 CatmullRom（光滑圆角处过渡）。
 */
export function buildStirrupGeometry(
  shape: StirrupShapeParams,
  opts: { radialSegments?: number } = {}
): THREE.BufferGeometry {
  const { radialSegments = 8 } = opts;
  const path = buildStirrupCurvePath(shape);
  // 离散点
  const samples = path.getPoints(200);
  // 去重相邻重复点
  const dedup: THREE.Vector3[] = [];
  for (const p of samples) {
    if (dedup.length === 0 || dedup[dedup.length - 1].distanceTo(p) > 1e-3) dedup.push(p);
  }
  if (dedup.length < 2) return new THREE.BufferGeometry();
  const curve = new THREE.CatmullRomCurve3(dedup, false, 'catmullrom', 0.0);
  const segs = Math.max(64, dedup.length);
  return new THREE.TubeGeometry(curve, segs, shape.diameter / 2, radialSegments, false);
}
