import * as THREE from 'three';
import type { RebarLine } from '../types';

/**
 * 由折线点生成钢筋 TubeGeometry。
 * 当只有 2 点时退化为直线；多点时使用 CatmullRom 曲线（M5 改为带圆角的 CurvePath）。
 */
export function buildBarTube(line: RebarLine, opts: { radialSegments?: number } = {}): THREE.BufferGeometry {
  const { radialSegments = 12 } = opts;
  const pts = line.points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
  const radius = line.diameter / 2;

  if (pts.length === 2) {
    // 直线段：用 LineCurve3，分段数与长度成比例
    const curve = new THREE.LineCurve3(pts[0], pts[1]);
    const len = pts[0].distanceTo(pts[1]);
    const tubularSegments = Math.max(2, Math.round(len / 200));
    return new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, false);
  }

  const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.0);
  const len = curve.getLength();
  const tubularSegments = Math.max(8, Math.round(len / 100));
  return new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, false);
}
