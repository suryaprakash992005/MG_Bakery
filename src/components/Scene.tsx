import React, { Component, ErrorInfo, ReactNode, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from './Loader';
import { Lights } from './Lights';
import { CameraRig } from './CameraRig';
import { SmokeParticles } from './SmokeParticles';
import { BakeryOven } from './BakeryOven';
import { CakeCarousel } from './CakeCarousel';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: (error: Error) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class SceneErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('3D Model Loading Error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error);
    }
    return this.props.children;
  }
}

interface SceneProps {
  pointer: { x: number; y: number };
  zoomIn: boolean;
  doorAngle: number;
  trayPositionZ: number;
  glowIntensity: number;
  cakeRotationY: number;
  activeCake: any;
  onDoorClick: () => void;
  onCakeClick: () => void;
  doorOpen: boolean;
}

export const Scene: React.FC<SceneProps> = ({
  pointer,
  zoomIn,
  doorAngle,
  trayPositionZ,
  glowIntensity,
  cakeRotationY,
  activeCake,
  onDoorClick,
  onCakeClick,
  doorOpen,
}) => {
  return (
    <div className="w-full h-full relative">
      <Suspense fallback={<Loader />}>
        {/* Error Boundary catches GLTF loading failures and falls back to placeholder rendering */}
        <SceneErrorBoundary
          fallback={(err) => {
            console.warn('Falling back to 3D procedural meshes due to GLB error:', err.message);
            return (
              <Canvas shadows gl={{ antialias: true }}>
                <CameraRig pointer={pointer} zoomIn={zoomIn} />
                <Lights glowIntensity={glowIntensity} doorOpen={doorOpen} />
                <SmokeParticles count={35} />
                
                {/* Fallback Bakery Oven */}
                <BakeryOven
                  doorAngle={doorAngle}
                  trayPositionZ={trayPositionZ}
                  glowIntensity={glowIntensity}
                  onDoorClick={onDoorClick}
                  hasGltfFailed={true}
                />
                
                {/* Fallback Cake sitting on tray */}
                <group position={[0, 0.42, trayPositionZ]}>
                  <group position={[0, 0.38, 0]}>
                    <CakeCarousel
                      activeCake={activeCake}
                      cakeRotationY={cakeRotationY}
                      hasGltfFailed={true}
                      onCakeClick={onCakeClick}
                    />
                  </group>
                </group>

                <mesh rotation={[-1.57, 0, 0]} position={[0, -0.6, 0]} receiveShadow>
                  <planeGeometry args={[15, 15]} />
                  <shadowMaterial opacity={0.4} />
                </mesh>
              </Canvas>
            );
          }}
        >
          {/* Main 3D Canvas attempting GLTF load */}
          <Canvas shadows gl={{ antialias: true }}>
            <CameraRig pointer={pointer} zoomIn={zoomIn} />
            <Lights glowIntensity={glowIntensity} doorOpen={doorOpen} />
            <SmokeParticles count={35} />
            
            {/* Try rendering GLB Oven */}
            <BakeryOven
              doorAngle={doorAngle}
              trayPositionZ={trayPositionZ}
              glowIntensity={glowIntensity}
              onDoorClick={onDoorClick}
              hasGltfFailed={false}
            />
            
            {/* Try rendering GLB Cake */}
            <group position={[0, 0.42, trayPositionZ]}>
              <group position={[0, 0.38, 0]}>
                <CakeCarousel
                  activeCake={activeCake}
                  cakeRotationY={cakeRotationY}
                  hasGltfFailed={false}
                  onCakeClick={onCakeClick}
                />
              </group>
            </group>

            <mesh rotation={[-1.57, 0, 0]} position={[0, -0.6, 0]} receiveShadow>
              <planeGeometry args={[15, 15]} />
              <shadowMaterial opacity={0.4} />
            </mesh>
          </Canvas>
        </SceneErrorBoundary>
      </Suspense>
    </div>
  );
};

export default Scene;
