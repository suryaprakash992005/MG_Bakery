import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SmokeParticlesProps {
  count?: number;
  color?: string;
  speed?: number;
}

export const SmokeParticles: React.FC<SmokeParticlesProps> = ({
  count = 35,
  color = '#E8C585',
  speed = 0.8,
}) => {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate initial particle positions and life parameters
  const [positions, data] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const lifeData = [];
    for (let i = 0; i < count; i++) {
      // Position smoke particles randomly above and around the oven vents
      pos[i * 3]     = (Math.random() - 0.5) * 1.5;   // X
      pos[i * 3 + 1] = 1.0 + Math.random() * 1.2;     // Y
      pos[i * 3 + 2] = -0.3 + (Math.random() - 0.5) * 1.2; // Z
      
      lifeData.push({
        speed: 0.12 + Math.random() * 0.15 * speed,
        drift: (Math.random() - 0.5) * 0.05,
        startY: 1.0,
      });
    }
    return [pos, lifeData];
  }, [count, speed]);

  useFrame((_state, delta) => {
    const points = pointsRef.current;
    if (!points) return;

    const geo = points.geometry;
    const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;

    for (let i = 0; i < count; i++) {
      // Rise up
      posAttr.setY(i, posAttr.getY(i) + data[i].speed * delta);
      // Drift sideways
      posAttr.setX(i, posAttr.getX(i) + data[i].drift * delta);

      // Reset when particle goes too high
      if (posAttr.getY(i) > 3.0) {
        posAttr.setY(i, data[i].startY);
        posAttr.setX(i, (Math.random() - 0.5) * 1.5);
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.24}
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default SmokeParticles;
