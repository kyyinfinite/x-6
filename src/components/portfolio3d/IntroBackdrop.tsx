import { Canvas } from "@react-three/fiber";
import Clouds from "./Clouds";
import CinematicSky from "./CinematicSky";

// Kamera di sini SENGAJA tidak pernah digerakkan (tidak ada CameraRig/useFrame
// yang mengubah posisi) -> ini yang membuat "kamera tetap diam" seperti di
// oryzo.ai, sementara teks di atasnya yang berpindah/berganti lewat GSAP.
export default function IntroBackdrop() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
      camera={{ fov: 45, near: 0.1, far: 60, position: [0, 0.6, 6] }}
    >
      <color attach="background" args={["#2B2620"]} />
      <fog attach="fog" args={["#2B2620", 4, 40]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={0.7} />
      <hemisphereLight args={["#8a7a5c", "#2B2620", 0.4]} />
      <Clouds depth={20} count={10} />
      <CinematicSky depth={20} />
    </Canvas>
  );
}
