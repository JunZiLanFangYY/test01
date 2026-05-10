import { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import type { BeamModel } from '../types';
import { RoleColors } from '../colors';
import { buildBarTube } from '../geometry/longitudinalBar';
import { getRibNormalTexture } from '../geometry/ribTexture';

interface Props {
  model: BeamModel;
}

export default function RebarGroup({ model }: Props) {
  // 为每根钢筋生成几何
  const items = useMemo(
    () =>
      model.rebars.map((line) => ({
        line,
        geometry: buildBarTube(line, { radialSegments: 12 }),
      })),
    [model]
  );

  useEffect(() => () => items.forEach((it) => it.geometry.dispose()), [items]);

  // HRB400 螺纹法线贴图（HPB300 不带肋，使用平滑材质）
  const ribNormal = useMemo(() => getRibNormalTexture(), []);

  return (
    <group>
      {items.map(({ line, geometry }) => {
        const color = RoleColors[line.role];
        const isRibbed = line.grade !== 'HPB300';
        // 沿钢筋长度方向（V）的螺纹密度：每 ~6×d 一个完整螺纹间距
        // TubeGeometry 的 V 方向覆盖 [0,1] 一次，故 repeat.y = length / (6d)
        const len =
          line.points.length >= 2
            ? Math.hypot(
                line.points[line.points.length - 1][0] - line.points[0][0],
                line.points[line.points.length - 1][1] - line.points[0][1],
                line.points[line.points.length - 1][2] - line.points[0][2]
              )
            : 1000;
        const repeatY = Math.max(1, len / (6 * line.diameter));
        return (
          <mesh key={line.id} geometry={geometry} castShadow>
            <meshStandardMaterial
              color={color}
              metalness={0.85}
              roughness={0.45}
              normalMap={isRibbed ? ribNormal : null}
              normalScale={new THREE.Vector2(0.6, 0.6)}
              // 通过 onBeforeCompile / 材质 onUpdate 设置贴图重复参数
              onUpdate={(mat) => {
                if (mat.normalMap) {
                  mat.normalMap.wrapS = THREE.RepeatWrapping;
                  mat.normalMap.wrapT = THREE.RepeatWrapping;
                  mat.normalMap.repeat.set(2, repeatY);
                  mat.normalMap.needsUpdate = true;
                }
              }}
            />
          </mesh>
        );
      })}
    </group>
  );
}
