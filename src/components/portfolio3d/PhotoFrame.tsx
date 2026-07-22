import { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { PortfolioProject } from "./types";

interface PhotoFrameProps {
  project: PortfolioProject;
  position: [number, number, number];
  rotationY: number;
  active: boolean;
}

function PhotoFrameInner({ project, position, rotationY, active }: PhotoFrameProps) {
  const texture = useTexture(project.thumbnail);
  const groupRef = useRef<THREE.Group>(null);

  // Pastikan color space benar agar thumbnail tidak tampak pudar/salah warna
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const target = active ? 1.1 : 1;
    group.scale.lerp(new THREE.Vector3(target, target, target), Math.min(delta * 5, 1));
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]} frustumCulled={false}>
      <mesh position={[0, 0, -0.035]} frustumCulled={false}>
        <boxGeometry args={[1.9, 1.4, 0.07]} />
        <meshStandardMaterial color={active ? "#A6772C" : "#2B2620"} roughness={0.55} metalness={0.1} />
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
    <Suspense fallback={null}>
      <PhotoFrameInner {...props} />
    </Suspense>
  );
}