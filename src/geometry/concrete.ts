import * as THREE from 'three';
import type { BeamModel } from '../types';

/**
 * 生成混凝土梁体几何：截面 b×h 在 YZ 平面，沿 +X 拉伸 totalLength。
 * 单位：毫米；renderer 中再统一缩放。
 */
export function buildConcreteGeometry(model: BeamModel): THREE.BufferGeometry {
  const { b, h } = model.section;
  const L = model.totalLength;

  // 在 XY 平面建立矩形截面（Z=0 平面），然后 Extrude 沿 -Z 方向？
  // 更直接：手写 BoxGeometry，长 = L (X)，高 = h (Y)，宽 = b (Z)，并平移使 X 起点在 0。
  const geom = new THREE.BoxGeometry(L, h, b);
  geom.translate(L / 2, 0, 0);
  return geom;
}
