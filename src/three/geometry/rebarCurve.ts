import * as THREE from "three";
import type { RebarPolyline } from "@/domain/types";

/**
 * 把折线 + 折点圆角半径转成一条 three.js CurvePath<Vector3>。
 * 每两段直线之间，以折点为顶点，用圆心法生成一段圆弧（折线段被截短）。
 *
 * 折点 P，前一点 A，后一点 B：
 *   单位向量 u = (A - P).normalize, v = (B - P).normalize
 *   半角 θ/2，其中 cos θ = u·v，θ 为 ∠APB
 *   设圆弧内半径 r，截短距离 t = r / tan(θ/2)
 *   弧的起点 S = P + u·t，终点 E = P + v·t
 *   圆心 C = P + (u+v).normalize · (r / sin(θ/2))
 *
 * 弯弧内径在 22G101 指内径，钢筋中心线半径 = 内径/2 + d/2。
 */
export function buildRebarCurvePath(
  polyline: RebarPolyline
): { path: THREE.CurvePath<THREE.Vector3>; totalLength: number } {
  const pts = polyline.points.map((p) => new THREE.Vector3(p.x, p.y, p.z));
  const path = new THREE.CurvePath<THREE.Vector3>();
  if (pts.length < 2) {
    return { path, totalLength: 0 };
  }

  // 钢筋中心线弯曲半径 = (内径 + d) / 2 = d × (factor + 1) / 2
  const d = polyline.diameter;
  const r = (d * (polyline.bendDiameterFactor + 1)) / 2;

  // 计算每个折点的圆弧切入/切出点
  type Trim = { start: THREE.Vector3; end: THREE.Vector3; arc?: THREE.CatmullRomCurve3 };
  const trims: Trim[] = pts.map((p) => ({ start: p.clone(), end: p.clone() }));

  for (let i = 1; i < pts.length - 1; i++) {
    const A = pts[i - 1];
    const P = pts[i];
    const B = pts[i + 1];
    const u = new THREE.Vector3().subVectors(A, P);
    const v = new THREE.Vector3().subVectors(B, P);
    const lenU = u.length();
    const lenV = v.length();
    if (lenU < 1e-6 || lenV < 1e-6) continue;
    u.divideScalar(lenU);
    v.divideScalar(lenV);

    const cosT = THREE.MathUtils.clamp(u.dot(v), -1, 1);
    const theta = Math.acos(cosT); // ∠APB
    if (theta < 1e-3 || Math.PI - theta < 1e-3) {
      // 共线，无需圆角
      continue;
    }

    const half = theta / 2;
    let t = r / Math.tan(half);
    // 截短距离不能超过相邻段的一半，否则圆弧重叠
    const maxT = Math.min(lenU, lenV) * 0.5;
    if (t > maxT) t = maxT;

    const S = P.clone().add(u.clone().multiplyScalar(t));
    const E = P.clone().add(v.clone().multiplyScalar(t));

    // 用一段三次曲线（CatmullRom 经过 S, mid, E）逼近圆弧；mid 在角平分线上
    const bisector = u.clone().add(v).normalize();
    const cDist = t / Math.cos(half); // 圆心到 P 的距离
    const center = P.clone().add(bisector.clone().multiplyScalar(cDist));
    // 实际半径
    const actualR = center.distanceTo(S);
    const midOnArc = center.clone().add(P.clone().sub(center).normalize().multiplyScalar(actualR));

    const arc = new THREE.CatmullRomCurve3([S.clone(), midOnArc, E.clone()], false, "catmullrom", 0.5);
    trims[i].start = S;
    trims[i].end = E;
    trims[i].arc = arc;
  }

  // 拼接：直段(trims[i-1].end -> trims[i].start) + 折点圆弧
  for (let i = 0; i < pts.length - 1; i++) {
    const segStart = trims[i].end;
    const segEnd = trims[i + 1].start;
    if (segStart.distanceTo(segEnd) > 1e-4) {
      path.add(new THREE.LineCurve3(segStart.clone(), segEnd.clone()));
    }
    if (i + 1 < pts.length - 1 && trims[i + 1].arc) {
      path.add(trims[i + 1].arc!);
    }
  }

  // 计算近似总长（直段精确，弧段用 catmullrom 取样）
  let totalLength = 0;
  path.curves.forEach((c: THREE.Curve<THREE.Vector3>) => {
    totalLength += c.getLength();
  });
  return { path, totalLength };
}

/**
 * 由 RebarPolyline 直接构造 TubeGeometry。
 * tubularSegments 按总长动态决定，约每 50mm 一个采样点，最少 16，最多 1024。
 */
export function buildRebarTubeGeometry(polyline: RebarPolyline, opts: { radialSegments?: number; segmentLength?: number } = {}): THREE.TubeGeometry {
  const { path, totalLength } = buildRebarCurvePath(polyline);
  const { radialSegments = 12, segmentLength = 50 } = opts;
  const tubularSegments = Math.min(
    1024,
    Math.max(16, Math.ceil(totalLength / segmentLength))
  );
  // CurvePath 实现了 Curve 接口，可直接传入 TubeGeometry
  const geom = new THREE.TubeGeometry(
    path as unknown as THREE.Curve<THREE.Vector3>,
    tubularSegments,
    polyline.diameter / 2,
    radialSegments,
    false
  );
  return geom;
}
