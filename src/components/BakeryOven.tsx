import React from 'react';
import { useGLTF } from '@react-three/drei';

interface OvenPlaceholderProps {
  doorAngle: number;
  trayPositionZ: number;
  glowIntensity: number;
  onDoorClick?: () => void;
}

// ── Realistic Placeholder Oven (Used when GLB is unavailable) ────────────────
const OvenPlaceholder: React.FC<OvenPlaceholderProps> = ({
  doorAngle,
  trayPositionZ,
  glowIntensity,
  onDoorClick,
}) => {
  return (
    <group>
      {/* ── Bakery Room Wood Wall Backdrop ── */}
      <mesh position={[0, 1.5, -3.2]}>
        <boxGeometry args={[14, 8, 0.2]} />
        <meshStandardMaterial color="#301A10" roughness={0.88} />
      </mesh>

      {/* Decorative Shelves */}
      <mesh position={[-2.4, 2.0, -3.0]} castShadow>
        <boxGeometry args={[2.5, 0.12, 0.45]} />
        <meshStandardMaterial color="#22120B" roughness={0.9} />
      </mesh>
      <mesh position={[2.4, 1.4, -3.0]} castShadow>
        <boxGeometry args={[2.5, 0.12, 0.45]} />
        <meshStandardMaterial color="#22120B" roughness={0.9} />
      </mesh>

      {/* ── Oven Cabinet Body ── */}
      <mesh position={[0, 0.8, -0.55]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 2.4, 2.3]} />
        <meshStandardMaterial color="#1E0D06" roughness={0.7} metalness={0.35} />
      </mesh>

      {/* Brass Hood */}
      <mesh position={[0, 2.06, -0.5]} castShadow>
        <boxGeometry args={[3.3, 0.14, 2.4]} />
        <meshStandardMaterial color="#C59B27" roughness={0.25} metalness={0.8} />
      </mesh>

      {/* Golden Front Arch Frame */}
      <mesh position={[0, 0.8, 0.61]} castShadow>
        <boxGeometry args={[3.22, 2.2, 0.05]} />
        <meshStandardMaterial color="#A57F1E" roughness={0.25} metalness={0.75} />
      </mesh>

      {/* Inner Cavity (Dark stone) */}
      <mesh position={[0, 0.8, -0.4]}>
        <boxGeometry args={[2.4, 1.4, 1.8]} />
        <meshStandardMaterial color="#0A0402" roughness={0.95} />
      </mesh>

      {/* Glowing Heating Element Coil */}
      <mesh position={[0, 1.35, -0.6]} rotation={[1.57, 0, 0]}>
        <cylinderGeometry args={[1.0, 1.0, 0.06, 16]} />
        <meshStandardMaterial
          color="#FF5714"
          emissive="#FF5714"
          emissiveIntensity={glowIntensity * 4.0}
        />
      </mesh>

      {/* ── Sliding Metal Tray ── */}
      <group position={[0, 0.42, trayPositionZ]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.0, 0.06, 1.65]} />
          <meshStandardMaterial color="#353535" roughness={0.45} metalness={0.75} />
        </mesh>
        {/* Tray Handle */}
        <mesh position={[0, 0, 0.835]} castShadow>
          <boxGeometry args={[2.02, 0.08, 0.03]} />
          <meshStandardMaterial color="#C59B27" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>

      {/* ── Oven Door (Hinged at bottom, click opens door) ── */}
      <group
        position={[0, 0.1, 0.625]}
        rotation={[doorAngle, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          if (onDoorClick) onDoorClick();
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Door Frame */}
        <mesh position={[0, 0.65, 0.02]} castShadow>
          <boxGeometry args={[2.6, 1.3, 0.1]} />
          <meshStandardMaterial color="#1C0E07" roughness={0.45} metalness={0.4} />
        </mesh>
        {/* Golden Door Handle */}
        <mesh position={[0, 1.15, 0.12]} rotation={[0, 0, 1.57]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 1.6, 16]} />
          <meshStandardMaterial color="#C59B27" roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh position={[-0.7, 1.1, 0.07]} castShadow>
          <boxGeometry args={[0.08, 0.12, 0.12]} />
          <meshStandardMaterial color="#C59B27" roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh position={[0.7, 1.1, 0.07]} castShadow>
          <boxGeometry args={[0.08, 0.12, 0.12]} />
          <meshStandardMaterial color="#C59B27" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Clear Oven Glass Panel */}
        <mesh position={[0, 0.65, 0.02]}>
          <boxGeometry args={[2.0, 0.8, 0.08]} />
          <meshPhysicalMaterial
            roughness={0.15}
            transmission={0.9}
            thickness={0.2}
            transparent
            opacity={0.35}
            color="#EFEFEF"
          />
        </mesh>
      </group>
    </group>
  );
};

// ── GLB Oven Loader Component ────────────────────────────────────────────────
const OvenGltf: React.FC<OvenPlaceholderProps> = () => {
  // Attempt to load. If it fails, Suspense boundary in Scene.tsx will catch it.
  const gltf = useGLTF('/assets/models/bakery_oven.glb', true);
  return <primitive object={gltf.scene} scale={1.2} position={[0, 0.8, -0.5]} />;
};

interface BakeryOvenProps extends OvenPlaceholderProps {
  hasGltfFailed: boolean;
}

export const BakeryOven: React.FC<BakeryOvenProps> = ({
  doorAngle,
  trayPositionZ,
  glowIntensity,
  onDoorClick,
  hasGltfFailed,
}) => {
  if (hasGltfFailed) {
    return (
      <OvenPlaceholder
        doorAngle={doorAngle}
        trayPositionZ={trayPositionZ}
        glowIntensity={glowIntensity}
        onDoorClick={onDoorClick}
      />
    );
  }

  return (
    <OvenGltf
      doorAngle={doorAngle}
      trayPositionZ={trayPositionZ}
      glowIntensity={glowIntensity}
      onDoorClick={onDoorClick}
    />
  );
};

// Preload the GLB model
try {
  useGLTF.preload('/assets/models/bakery_oven.glb');
} catch (e) {
  console.warn('Oven GLB preload skipped or unavailable');
}

export default BakeryOven;
