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

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const target = active ? 1.1 : 1;
    group.scale.lerp(new THREE.Vector3(target, target, target), Math.min(delta * 5, 1));
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0, -0.035]}>
        <boxGeometry args={[1.9, 1.4, 0.07]} />
        <meshStandardMaterial color={active ? "#caa353" : "#2b2620"} roughness={0.55} metalness={0.15} />
      </mesh>
      <mesh>
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
