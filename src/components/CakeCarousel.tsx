import React from 'react';
import { useGLTF } from '@react-three/drei';

interface CakeConfig {
  name: string;
  price: number;
  baseColor: string;
  frostingColor: string;
  pipingColor: string;
  topping: 'chocolate' | 'strawberry' | 'candles' | 'mango' | 'pineapple' | 'cherry' | 'velvet' | 'coconut';
  description: string;
  defaultImage: string;
  glbPath?: string;
}

interface CakeCarouselProps {
  activeCake: CakeConfig;
  cakeRotationY: number;
  hasGltfFailed: boolean;
  onCakeClick?: () => void;
}

// ── Beautiful Custom Procedural 3D Cake (Fallback model) ────────────────────
const CakePlaceholder: React.FC<{ config: CakeConfig; rotationY: number }> = ({ config, rotationY }) => {
  const { baseColor, frostingColor, pipingColor, topping } = config;

  return (
    <group rotation={[0, rotationY, 0]}>
      {/* Base Cake Plate */}
      <mesh position={[0, -0.32, 0]} receiveShadow>
        <cylinderGeometry args={[1.25, 1.25, 0.05, 32]} />
        <meshStandardMaterial color="#C5B390" roughness={0.15} metalness={0.65} />
      </mesh>

      {/* Sponge and Frosting Body */}
      {topping === 'velvet' ? (
        <group>
          {/* Base sponge layer */}
          <mesh position={[0, -0.15, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.0, 1.0, 0.2, 32]} />
            <meshStandardMaterial color={baseColor} roughness={0.6} />
          </mesh>
          {/* Cream Layer 1 */}
          <mesh position={[0, -0.025, 0]}>
            <cylinderGeometry args={[1.005, 1.005, 0.05, 32]} />
            <meshStandardMaterial color={frostingColor} roughness={0.3} />
          </mesh>
          {/* Middle sponge layer */}
          <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.0, 1.0, 0.2, 32]} />
            <meshStandardMaterial color={baseColor} roughness={0.6} />
          </mesh>
          {/* Cream Layer 2 */}
          <mesh position={[0, 0.225, 0]}>
            <cylinderGeometry args={[1.005, 1.005, 0.05, 32]} />
            <meshStandardMaterial color={frostingColor} roughness={0.3} />
          </mesh>
        </group>
      ) : (
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.0, 1.0, 0.6, 32]} />
          <meshStandardMaterial color={frostingColor} roughness={0.4} />
        </mesh>
      )}

      {/* Decorative Star Piping along the top rim */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const x = Math.cos(angle) * 0.92;
        const z = Math.sin(angle) * 0.92;
        return (
          <mesh key={i} position={[x, 0.32, z]} castShadow>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial color={pipingColor} roughness={0.2} />
          </mesh>
        );
      })}

      {/* Toppings Details */}
      {topping === 'chocolate' && (
        <group position={[0, 0.32, 0]}>
          <mesh position={[-0.2, 0.05, -0.1]} rotation={[0.2, 0.4, 0.3]} castShadow>
            <boxGeometry args={[0.3, 0.08, 0.35]} />
            <meshStandardMaterial color="#1E0D06" roughness={0.65} />
          </mesh>
          <mesh position={[0.25, 0.06, 0.2]} rotation={[0.4, -0.6, 0.1]} castShadow>
            <boxGeometry args={[0.25, 0.06, 0.3]} />
            <meshStandardMaterial color="#20110D" roughness={0.6} />
          </mesh>
        </group>
      )}

      {topping === 'strawberry' && (
        <group position={[0, 0.32, 0]}>
          {Array.from({ length: 5 }).map((_, i) => {
            const angle = (i / 5) * Math.PI * 2;
            const x = Math.cos(angle) * 0.5;
            const z = Math.sin(angle) * 0.5;
            return (
              <mesh key={i} position={[x, 0.06, z]} rotation={[0.3, -angle, 0.2]} castShadow>
                <coneGeometry args={[0.12, 0.2, 6]} />
                <meshStandardMaterial color="#D12B43" roughness={0.3} />
              </mesh>
            );
          })}
        </group>
      )}

      {topping === 'candles' && (
        <group position={[0, 0.32, 0]}>
          {[
            { pos: [-0.3, 0.25, -0.1] as [number, number, number], col: '#FF4757' },
            { pos: [0.3, 0.25, 0.2] as [number, number, number], col: '#2ED573' },
          ].map((c, i) => (
            <group key={i} position={c.pos}>
              <mesh castShadow>
                <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
                <meshStandardMaterial color={c.col} roughness={0.3} />
              </mesh>
              <mesh position={[0, 0.3, 0]}>
                <coneGeometry args={[0.04, 0.12, 8]} />
                <meshBasicMaterial color="#FF9F43" />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {topping === 'mango' && (
        <group position={[0, 0.32, 0]}>
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            const x = Math.cos(angle) * 0.55;
            const z = Math.sin(angle) * 0.55;
            return (
              <mesh key={i} position={[x, 0.04, z]} rotation={[0.1, -angle, 0.3]} castShadow>
                <boxGeometry args={[0.15, 0.08, 0.22]} />
                <meshStandardMaterial color="#FFA502" roughness={0.2} />
              </mesh>
            );
          })}
        </group>
      )}

      {topping === 'cherry' && (
        <group position={[0, 0.32, 0]}>
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            const x = Math.cos(angle) * 0.65;
            const z = Math.sin(angle) * 0.65;
            return (
              <mesh key={i} position={[x, 0.08, z]} castShadow>
                <sphereGeometry args={[0.09, 12, 12]} />
                <meshStandardMaterial color="#880E1C" roughness={0.1} />
              </mesh>
            );
          })}
        </group>
      )}

      {topping === 'coconut' && (
        <group position={[0, 0.32, 0]}>
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            const x = Math.cos(angle) * 0.5;
            const z = Math.sin(angle) * 0.5;
            return (
              <mesh key={i} position={[x, 0.04, z]} rotation={[0.4, angle, 0.2]} castShadow>
                <boxGeometry args={[0.12, 0.03, 0.22]} />
                <meshStandardMaterial color="#FFFEEA" roughness={0.5} />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
};

// ── GLB Cake Model Loader Component ──────────────────────────────────────────
const CakeGltf: React.FC<{ glbPath: string; rotationY: number }> = ({ glbPath, rotationY }) => {
  const gltf = useGLTF(glbPath, true);
  return <primitive object={gltf.scene} rotation={[0, rotationY, 0]} scale={0.8} />;
};

export const CakeCarousel: React.FC<CakeCarouselProps> = ({
  activeCake,
  cakeRotationY,
  hasGltfFailed,
  onCakeClick,
}) => {
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        if (onCakeClick) onCakeClick();
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {hasGltfFailed || !activeCake.glbPath ? (
        <CakePlaceholder config={activeCake} rotationY={cakeRotationY} />
      ) : (
        <CakeGltf glbPath={activeCake.glbPath} rotationY={cakeRotationY} />
      )}
    </group>
  );
};

export default CakeCarousel;
