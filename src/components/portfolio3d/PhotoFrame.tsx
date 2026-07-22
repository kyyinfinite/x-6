import { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import PhotoErrorBoundary from "./PhotoErrorBoundary";
import type { PortfolioProject } from "./types";

interface PhotoFrameProps {
  project: PortfolioProject;
  position: [number, number, number];
  rotationY: number;
  active: boolean;
}

function FallbackFrame({ position, rotationY }: Pick<PhotoFrameProps, "position" | "rotationY">) {
  // Frame kosong bergaya "placeholder" saat thumbnail gagal dimuat,
  // jauh lebih baik daripada seluruh scene ikut hilang.
  return (
    <group position={position} rotation={[0, rotationY, 0]} frustumCulled={false}>
      <mesh position={[0, 0, -0.035]} frustumCulled={false}>
        <boxGeometry args={[1.9, 1.4, 0.07]} />
        <meshStandardMaterial color="#2B2620" roughness={0.55} metalness={0.1} />
      </mesh>
      <mesh frustumCulled={false}>
        <planeGeometry args={[1.62, 1.12]} />
        <meshStandardMaterial color="#8a7a5c" roughness={0.8} />
      </mesh>
    </group>
  );
}

function PhotoFrameInner({ project, position, rotationY, active }: PhotoFrameProps) {
  const texture = useTexture(project.thumbnail);
  const groupRef = useRef<THREE.Group>(null);

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const target = active ? 1.1 : 1;
    // damp lebih halus daripada lerp konstan -> gerak frame terasa "cinematic"
    group.scale.x = THREE.MathUtils.damp(group.scale.x, target, 6, delta);
    group.scale.y = THREE.MathUtils.damp(group.scale.y, target, 6, delta);
    group.scale.z = THREE.MathUtils.damp(group.scale.z, target, 6, delta);
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]} frustumCulled={false}>
      <mesh position={[0, 0, -0.035]} frustumCulled={false}>
        <boxGeometry args={[1.9, 1.4, 0.07]} />
        <meshStandardMaterial
          color={active ? "#A6772C" : "#2B2620"}
          roughness={0.5}
          metalness={0.15}
          envMapIntensity={active ? 1.4 : 0.8}
        />
      </mesh>
      <mesh frustumCulled={false}>
        <planeGeometry args={[1.62, 1.12]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function PhotoFrame(props: PhotoFrameProps) {
  return (
    <PhotoErrorBoundary fallback={<FallbackFrame position={props.position} rotationY={props.rotationY} />}>
      <Suspense fallback={null}>
        <PhotoFrameInner {...props} />
      </Suspense>
    </PhotoErrorBoundary>
  );
}