import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function useCloudTexture() {
  return useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      gradient.addColorStop(0, "rgba(255,255,255,0.85)");
      gradient.addColorStop(0.45, "rgba(255,255,255,0.4)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);
}

interface CloudsProps {
  depth: number;
  count?: number;
}

export default function Clouds({ depth, count = 16 }: CloudsProps) {
  const texture = useCloudTexture();
  const spritesRef = useRef<(THREE.Sprite | null)[]>([]);

  const data = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 9,
        y: (Math.random() - 0.5) * 4 + 0.6,
        z: -Math.random() * depth,
        scale: 1.1 + Math.random() * 1.7,
        speed: 0.12 + Math.random() * 0.22,
        phase: Math.random() * Math.PI * 2,
      })),
    [count, depth]
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    data.forEach((cloud, i) => {
      const sprite = spritesRef.current[i];
      if (!sprite) return;
      sprite.position.x = cloud.x + Math.sin(t * cloud.speed + cloud.phase) * 0.5;
      sprite.position.y = cloud.y + Math.cos(t * cloud.speed * 0.7 + cloud.phase) * 0.2;
    });
  });

  return (
    <>
      {data.map((cloud, i) => (
        <sprite
          key={i}
          ref={(el) => {
            spritesRef.current[i] = el;
          }}
          position={[cloud.x, cloud.y, cloud.z]}
          scale={[cloud.scale * 2.4, cloud.scale, 1]}
        >
          <spriteMaterial map={texture} transparent opacity={0.45} depthWrite={false} fog={false} />
        </sprite>
      ))}
    </>
  );
}
