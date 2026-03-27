import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { TEXTURE_URLS } from '../../data/textures';

export function StarField() {
  const texture = useTexture(TEXTURE_URLS.starfield);

  const geometry = useMemo(() => {
    return new THREE.SphereGeometry(500, 64, 64);
  }, []);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        map={texture}
        side={THREE.BackSide}
      />
    </mesh>
  );
}