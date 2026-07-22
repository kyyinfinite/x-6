import { Suspense, useMemo, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import * as THREE from "three";
import Clouds from "./Clouds";
import PhotoFrame from "./PhotoFrame";
import type { PortfolioProject } from "./types";

export const SPACING = 4.2;
// Margin aman supaya objek di ujung scene (terjauh dari kamera) tidak
// pernah menyentuh far-plane -> ini akar penyebab blinking/culling prematur.
const CAMERA_FAR_MARGIN = 20;

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
  // Far-plane kamera kini mengikuti kedalaman scene + margin,
  // bukan angka statis 100 -> mencegah objek jauh terpotong/blink.
  const cameraFar = depth + CAMERA_FAR_MARGIN;
  const fogFar = Math.max(depth, cameraFar - 5); // fog tetap di dalam jangkauan camera far

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
      camera={{ fov: 50, near: 0.1, far: cameraFar, position: [0, 0.4, 3.2] }}
    >
      <color attach="background" args={["#FAF6EE"]} />
      <fog attach="fog" args={["#FAF6EE", 4, fogFar]} />

      {/* Pencahayaan: ambient + directional + hemisphere agar sisi objek
          yang membelakangi directional light tidak gelap total/terlihat hilang */}
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 4, 5]} intensity={0.9} />
      <hemisphereLight args={["#FAF6EE", "#8a7a5c", 0.5]} />

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