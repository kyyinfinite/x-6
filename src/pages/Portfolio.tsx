import { useEffect, useRef } from "react";
import { ReactLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "../components/Navbar";
import PortfolioIntro from "../components/portfolio3d/PortfolioIntro";
import PortfolioSection from "../components/portfolio3d/PortfolioSection";

gsap.registerPlugin(ScrollTrigger);

// Bentuk minimal instance Lenis yang kita butuh dari ref -> hindari
// ketergantungan ketat ke tipe internal package (bisa beda antar versi).
interface LenisLike {
  raf: (time: number) => void;
  on: (event: "scroll", cb: () => void) => void;
  off: (event: "scroll", cb: () => void) => void;
}

export default function Portfolio() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    // WAJIB: tanpa jembatan ini, GSAP ScrollTrigger (dipakai untuk pin+scrub
    // di PortfolioIntro) akan out-of-sync dengan smooth-scroll Lenis --
    // pin akan terasa "nyendat"/telat mengikuti posisi scroll asli.
    const lenis: LenisLike | undefined = lenisRef.current?.lenis;
    if (!lenis) return;

    function onTick(time: number) {
      lenis?.raf(time * 1000);
    }
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.off("scroll", onScroll);
    };
  }, []);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{ lerp: 0.1, wheelMultiplier: 1, syncTouch: false, autoRaf: false }}
    >
      <Navbar />
      <PortfolioIntro />
      <PortfolioSection
        title="Sorotan Kelas"
        subtitle="Beberapa hal yang kami bangun dan kelola bersama sepanjang tahun ajaran ini."
      />
    </ReactLenis>
  );
}
