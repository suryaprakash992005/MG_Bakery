import React from 'react';

interface LightsProps {
  glowIntensity: number;
  doorOpen: boolean;
}

export const Lights: React.FC<LightsProps> = ({ glowIntensity, doorOpen }) => {
  return (
    <>
      {/* Soft Ambient lighting representing the bakery room atmosphere */}
      <ambientLight intensity={0.35} color="#FFE8D6" />

      {/* Primary Directional Light (Simulates key window light / sun rays) */}
      <directionalLight
        position={[4, 8, 3]}
        intensity={0.8}
        color="#FFA502"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />

      {/* Front Accent Spot Light */}
      <spotLight
        position={[-2, 6, 5]}
        angle={0.5}
        penumbra={0.6}
        intensity={1.0}
        color="#FFE6B0"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Oven Fire/Coil Light inside the cabinet */}
      <pointLight
        position={[0, 0.6, -0.4]}
        color="#FF5A00"
        intensity={glowIntensity * 6.5}
        distance={4.0}
        castShadow
      />

      {/* Escaping Glow Spotlight when oven door is open */}
      <spotLight
        position={[0, 0.6, 0.4]}
        angle={1.1}
        penumbra={0.8}
        intensity={doorOpen ? glowIntensity * 4.0 : 0}
        color="#FF6A00"
        distance={6.0}
        castShadow
      />
    </>
  );
};

export default Lights;
