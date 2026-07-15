import React from 'react';
import { useFrame, useThree } from '@react-three/fiber';

interface CameraRigProps {
  pointer: { x: number; y: number };
  zoomIn: boolean;
}

export const CameraRig: React.FC<CameraRigProps> = ({ pointer, zoomIn }) => {
  const { camera } = useThree();

  useFrame(() => {
    // 1. Slow breathing effect (simulating hand-held slow sway)
    const time = Date.now() * 0.00065;
    const breatheY = Math.sin(time) * 0.08;
    const breatheZ = Math.cos(time) * 0.08;

    // 2. Parallax targets based on pointer movement and zoom state
    const targetX = pointer.x * 0.8;
    const targetY = 1.35 + pointer.y * 0.5 + breatheY;
    const targetZ = zoomIn ? 2.5 : 4.4 + breatheZ;

    // 3. Linearly interpolate (lerp) camera positions for ultra-smooth updates
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.position.z += (targetZ - camera.position.z) * 0.05;

    // Look at center cavity of the oven
    camera.lookAt(0, 0.45, 0);
  });

  return null;
};

export default CameraRig;
