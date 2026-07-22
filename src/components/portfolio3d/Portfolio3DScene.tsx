import { Suspense, useMemo, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import * as THREE from "three";
import Clouds from "./Clouds";
import PhotoFrame from "./PhotoFrame";
import type { PortfolioProject } from "./types";

export const SPACING = 4.2;

interface CameraRigProps {
  projects: PortfolioProject[];
  progressRef: MutableRefObject<number>;
}

function CameraRig({ projects, progressRef }: CameraRigProps) {
  const { camera } = useThree();

  const { cameraCurve, lookCurve } = useMemo(() => {
    const camPoints: THREE.Vector3[] = [];
    const lookPoints: THREE.Vector3[] = [];

    projects.forEach((_, i) => {
      const x = i % 2 === 0 ? -1.3 : 1.3;
      const z = -i * SPACING;
      lookPoints.push(new THREE.Vector3(x, 0, z));
      camPoints.push(new THREE.Vector3(x * 0.35, 0.4, z + 3.2));
    });

    if (camPoints.length === 1) {
      camPoints.push(camPoints[0].clone().add(new THREE.Vector3(0, 0, -0.01)));
      lookPoints.push(lookPoints[0].clone());
    }

    return {
      cameraCurve: new THREE.CatmullRomCurve3(camPoints),
      lookCurve: new THREE.CatmullRomCurve3(lookPoints),
    };
  }, [projects]);

  useFrame(() => {
    const t = THREE.MathUtils.clamp(progressRef.current, 0, 1);
    camera.position.copy(cameraCurve.getPointAt(t));
    camera.lookAt(lookCurve.getPointAt(t));
  });

  return null;
}

interface Portfolio3DSceneProps {
  projects: PortfolioProject[];
  progressRef: MutableRefObject<number>;
  activeIndex: number;
}

export default function Portfolio3DScene({ projects, progressRef, activeIndex }: Portfolio3DSceneProps) {
  const depth = SPACING * projects.length + 8;

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
      camera={{ fov: 50, near: 0.1, far: 100 }}
    >
      <color attach="background" args={["#FAF6EE"]} />
      <fog attach="fog" args={["#FAF6EE", 4, depth]} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 4, 5]} intensity={0.7} />

      <Clouds depth={depth} />

      <Suspense fallback={null}>
        {projects.map((project, i) => (
          <PhotoFrame
            key={project.id}
            project={project}
            position={[i % 2 === 0 ? -1.3 : 1.3, 0, -i * SPACING]}
            rotationY={i % 2 === 0 ? 0.22 : -0.22}
            active={i === activeIndex}
          />
        ))}
      </Suspense>

      <CameraRig projects={projects} progressRef={progressRef} />
      <AdaptiveDpr pixelated />
    </Canvas>
  );
}
