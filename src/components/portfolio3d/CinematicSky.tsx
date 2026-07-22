import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────
// CinematicSky: shader awan berbasis FBM noise di satu plane besar di
// belakang scene. Ini BUKAN raymarched volumetric cloud (itu terlalu berat
// untuk mobile 60fps) — ini teknik yang dipakai kebanyakan situs
// Awwwards/FWA untuk "sky" sinematik: murah, tetap terlihat dramatis lewat
// lighting/contrast, dan quality-nya bisa diturunkan on-the-fly.
// ─────────────────────────────────────────────────────────────────────────

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uOctaves;   // diturunkan dinamis saat FPS drop
  uniform vec3 uColorLight;
  uniform vec3 uColorDark;
  uniform float uContrast;  // kontras dramatis ala "flagship phone camera"

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  // FBM dengan jumlah oktaf dinamis -> ini "raymarch quality" versi murah:
  // makin sedikit oktaf, makin murah, makin blur/simple detailnya.
  float fbm(vec2 p, float octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 6; i++) {
      if (float(i) >= octaves) break;
      value += amplitude * noise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 p = vUv * 3.0 + vec2(uTime * 0.015, uTime * 0.008);
    float n = fbm(p, uOctaves);
    n = pow(n, uContrast); // kontras tajam, kesan "sinematik"

    vec3 color = mix(uColorLight, uColorDark, n);
    float alpha = smoothstep(0.15, 0.85, n) * 0.55;

    gl_FragColor = vec4(color, alpha);
  }
`;

interface CinematicSkyProps {
  depth: number;
}

export default function CinematicSky({ depth }: CinematicSkyProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { gl } = useThree();

  // Sampler FPS sederhana: rata-rata delta 30 frame terakhir, tanpa alokasi
  // per-frame, tanpa memicu re-render React (semua di dalam useFrame/ref).
  const fpsSample = useRef({ frames: 0, elapsed: 0, currentOctaves: 5 });

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOctaves: { value: 5 },
      uColorLight: { value: new THREE.Color("#FAF6EE") },
      uColorDark: { value: new THREE.Color("#8a7a5c") },
      uContrast: { value: 1.6 },
    }),
    []
  );

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    uniforms.uTime.value += delta;

    // Deteksi performa: hitung FPS rata-rata tiap ~0.5 detik.
    const sample = fpsSample.current;
    sample.frames += 1;
    sample.elapsed += delta;

    if (sample.elapsed >= 0.5) {
      const fps = sample.frames / sample.elapsed;
      sample.frames = 0;
      sample.elapsed = 0;

      // Turunkan kualitas raymarch/FBM secara bertahap kalau FPS jatuh,
      // naikkan lagi kalau device ternyata kuat -> tetap 60fps stabil di HP.
      let target = sample.currentOctaves;
      if (fps < 40 && target > 2) target -= 1;
      else if (fps > 55 && target < 5) target += 1;

      if (target !== sample.currentOctaves) {
        sample.currentOctaves = target;
        uniforms.uOctaves.value = target;
        // Sekalian turunkan pixel ratio renderer kalau device benar-benar lemah.
        if (fps < 30) gl.setPixelRatio(Math.max(1, gl.getPixelRatio() - 0.25));
      }
    }
  });

  return (
    <mesh position={[0, 3, -depth * 0.4]} rotation={[0, 0, 0]} frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[40, 20, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        fog={false}
      />
    </mesh>
  );
}
