import { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { BeamModel } from '../types';
import { buildStirrupGeometry } from '../geometry/stirrup';
import { RoleColors } from '../colors';
import { getRibNormalTexture } from '../geometry/ribTexture';

interface Props {
  model: BeamModel;
}

/**
 * 用 InstancedMesh 复用一根箍筋几何，平移到所有 X 位置。
 * 箍筋几何在 YZ 平面（X=0）构造，所以仅需沿 X 平移。
 */
export default function StirrupInstances({ model }: Props) {
  const { stirrups } = model;
  const count = stirrups.positions.length;

  const geometry = useMemo(
    () =>
      buildStirrupGeometry(
        {
          width: stirrups.width,
          height: stirrups.height,
          diameter: stirrups.diameter,
          grade: stirrups.grade,
          hookAngleDeg: 135,
        },
        { radialSegments: 8 }
      ),
    [stirrups.width, stirrups.height, stirrups.diameter, stirrups.grade]
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  const ribNormal = useMemo(() => getRibNormalTexture(), []);
  const isRibbed = stirrups.grade !== 'HPB300';

  const meshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!meshRef.current) return;
    const m = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      m.makeTranslation(stirrups.positions[i], 0, 0);
      meshRef.current.setMatrixAt(i, m);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.computeBoundingSphere();
  }, [count, stirrups.positions]);

  // 用 useMemo 创建一个稳定的占位材质，避免 InstancedMesh 构造时 material 为 undefined
  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color: RoleColors.stirrup,
      metalness: 0.85,
      roughness: 0.5,
      normalMap: isRibbed ? ribNormal : null,
    });
    m.normalScale.set(0.4, 0.4);
    return m;
  }, [isRibbed, ribNormal]);

  useEffect(() => () => material.dispose(), [material]);

  if (count === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      castShadow
      frustumCulled={false}
    />
  );
}
