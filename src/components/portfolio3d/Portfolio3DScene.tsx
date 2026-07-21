import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Html, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { PortfolioProject } from "./types";

interface GlassCardProps {
  project: PortfolioProject;
  position: [number, number, number];
  active: boolean;
  onSelect: () => void;
}

function GlassCard({ project, position, active, onSelect }: GlassCardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const highlighted = active || hovered;

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const targetScale = highlighted ? 1.08 : 1;
    mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), Math.min(delta * 6, 1));
    const targetRotY = hovered ? 0.18 : 0;
    mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, targetRotY, Math.min(delta * 5, 1));
  });

  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.7}>
      <group position={position}>
        <RoundedBox
          ref={meshRef}
          args={[2.3, 1.45, 0.12]}
          radius={0.09}
          smoothness={4}
          onClick={onSelect}
          onPointerOver={(event) => {
            event.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
        >
          <meshPhysicalMaterial
            transmission={1}
            roughness={0.2}
            ior={1.5}
            thickness={0.5}
            color={active ? "#A6772C" : "#ffffff"}
            attenuationColor={active ? "#F3E6C4" : "#E3EBDD"}
            attenuationDistance={0.6}
            clearcoat={1}
            clearcoatRoughness={0.15}
            envMapIntensity={1.15}
          />
        </RoundedBox>

        <Html
          transform
          distanceFactor={2.2}
          position={[0, 0, 0.09]}
          occlude
          style={{ pointerEvents: "none", transition: "opacity 0.2s ease" }}
        >
          <div
            className="w-[200px] rounded-xl overflow-hidden border border-white/25 bg-white/10 backdrop-blur-md shadow-2xl"
            style={{ opacity: highlighted ? 1 : 0.88 }}
          >
            <img
              src={project.thumbnail}
              alt={project.title}
              className="w-full h-24 object-cover"
              draggable={false}
            />
            <div className="px-3 py-2">
              <p className="text-[11px] font-semibold text-white leading-snug line-clamp-1">
                {project.title}
              </p>
              <p className="text-[9px] text-white/70 mt-0.5 font-mono">{project.tag}</p>
            </div>
          </div>
        </Html>
      </group>
    </Float>
  );
}

interface Portfolio3DSceneProps {
  projects: PortfolioProject[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export default function Portfolio3DScene({ projects, activeIndex, onSelect }: Portfolio3DSceneProps) {
  const positions = useMemo<[number, number, number][]>(() => {
    const count = projects.length;
    const mid = (count - 1) / 2;
    return projects.map((_, i) => {
      const offset = i - mid;
      return [offset * 0.55, offset * -0.85, -Math.abs(offset) * 0.7];
    });
  }, [projects]);

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      camera={{ position: [0, 0, 6], fov: 42 }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={0.6} />

      <Suspense fallback={null}>
        <Environment preset="city" blur={0.8} />
        {projects.map((project, i) => (
          <GlassCard
            key={project.id}
            project={project}
            position={positions[i]}
            active={i === activeIndex}
            onSelect={() => onSelect(i)}
          />
        ))}
      </Suspense>
    </Canvas>
  );
}
