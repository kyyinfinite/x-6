import { Suspense, useMemo, useRef } from "react";
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

// Bounding box maksimum untuk foto (bukan ukuran final -> foto di-"contain"
// di dalamnya seperti object-fit: contain, jadi tidak pernah gepeng/stretch).
const MAX_PHOTO_W = 1.5;
const MAX_PHOTO_H = 1.5;
const MAT_PADDING_X = 0.14;
const MAT_PADDING_TOP = 0.14;
const MAT_PADDING_BOTTOM = 0.34; // margin bawah lebih besar -> gaya polaroid klasik

// Tilt kecil & konsisten per-project (bukan acak tiap render) -> kesan foto
// ditempel miring di scrapbook, tanpa bikin geometri berubah-ubah tiap frame.
function hashTilt(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 1000;
  return (h / 1000 - 0.5) * 0.09; // kira-kira -0.045..0.045 rad
}

function PhotoFrameInner({ project, position, rotationY, active }: PhotoFrameProps) {
  const texture = useTexture(project.thumbnail);
  const groupRef = useRef<THREE.Group>(null);

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;

  // Hitung ukuran foto dari aspect ratio ASLI gambar -> akar perbaikan "gepeng".
  const { photoW, photoH, matW, matH } = useMemo(() => {
    const img = texture.image as { width?: number; height?: number } | undefined;
    const naturalW = img?.width || 1;
    const naturalH = img?.height || 1;
    const aspect = naturalW / naturalH;

    let w = MAX_PHOTO_W;
    let h = MAX_PHOTO_W / aspect;
    if (h > MAX_PHOTO_H) {
      h = MAX_PHOTO_H;
      w = MAX_PHOTO_H * aspect;
    }
    return {
      photoW: w,
      photoH: h,
      matW: w + MAT_PADDING_X * 2,
      matH: h + MAT_PADDING_TOP + MAT_PADDING_BOTTOM,
    };
  }, [texture]);

  const tilt = useMemo(() => hashTilt(project.id), [project.id]);
  const photoOffsetY = (MAT_PADDING_BOTTOM - MAT_PADDING_TOP) / 2;

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const target = active ? 1.08 : 1;
    // damp lebih halus & stabil daripada lerp konstan -> tidak "getar"/blink
    group.scale.x = THREE.MathUtils.damp(group.scale.x, target, 6, delta);
    group.scale.y = THREE.MathUtils.damp(group.scale.y, target, 6, delta);
    group.scale.z = THREE.MathUtils.damp(group.scale.z, target, 6, delta);
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, tilt]} frustumCulled={false}>
      {/* Drop shadow lembut -> kesan foto mengambang/ditempel */}
      <mesh position={[0.03, -0.05, -0.05]} frustumCulled={false}>
        <planeGeometry args={[matW * 1.05, matH * 1.05]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.16} depthWrite={false} />
      </mesh>

      {/* Aksen tepi luar (gaya bingkai kayu/gold saat aktif) -> paling belakang */}
      <mesh position={[0, 0, -0.03]} frustumCulled={false}>
        <boxGeometry args={[matW + 0.05, matH + 0.05, 0.02]} />
        <meshStandardMaterial color={active ? "#A6772C" : "#2B2620"} roughness={0.5} metalness={0.15} />
      </mesh>

      {/* Mat/kartu polaroid krem -> di depan aksen, permukaan depan ada di z=+0.02 */}
      <mesh position={[0, 0, 0]} frustumCulled={false}>
        <boxGeometry args={[matW, matH, 0.04]} />
        <meshStandardMaterial color={active ? "#FFFDF7" : "#F5F0E4"} roughness={0.7} metalness={0.02} envMapIntensity={0.4} />
      </mesh>

      {/* Foto asli -> WAJIB diletakkan di depan permukaan mat (z lebih besar dari 0.02),
          kalau tidak foto akan "terkubur" di dalam box mat dan terlihat seolah tidak ter-load. */}
      <mesh position={[0, photoOffsetY, 0.021]} frustumCulled={false}>
        <planeGeometry args={[photoW, photoH]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

function FallbackFrame({ position, rotationY, project }: Pick<PhotoFrameProps, "position" | "rotationY" | "project">) {
  const tilt = useMemo(() => hashTilt(project.id), [project.id]);
  return (
    <group position={position} rotation={[0, rotationY, tilt]} frustumCulled={false}>
      <mesh position={[0, 0, 0]} frustumCulled={false}>
        <boxGeometry args={[1.78, 2.08, 0.04]} />
        <meshStandardMaterial color="#F5F0E4" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.1, 0.021]} frustumCulled={false}>
        <planeGeometry args={[1.5, 1.5]} />
        <meshStandardMaterial color="#c9bda3" roughness={0.9} />
      </mesh>
    </group>
  );
}

export default function PhotoFrame(props: PhotoFrameProps) {
  return (
    <PhotoErrorBoundary
      fallback={<FallbackFrame position={props.position} rotationY={props.rotationY} project={props.project} />}
    >
      <Suspense fallback={null}>
        <PhotoFrameInner {...props} />
      </Suspense>
    </PhotoErrorBoundary>
  );
}
