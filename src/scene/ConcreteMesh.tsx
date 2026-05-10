import { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import type { BeamModel } from '../types';
import { buildConcreteGeometry } from '../geometry/concrete';

interface Props {
  model: BeamModel;
  opacity: number;
  wireframe: boolean;
}

export default function ConcreteMesh({ model, opacity, wireframe }: Props) {
  const geometry = useMemo(() => buildConcreteGeometry(model), [model]);

  // 释放
  useEffect(() => () => geometry.dispose(), [geometry]);

  const transparent = opacity < 1;
  const visible = opacity > 0.01;

  return (
    <mesh geometry={geometry} castShadow receiveShadow visible={visible}>
      <meshStandardMaterial
        color={'#9ca3af'}
        roughness={0.92}
        metalness={0.05}
        transparent={transparent}
        opacity={opacity}
        wireframe={wireframe}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
