import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import PortfolioIntro from "../components/portfolio3d/PortfolioIntro";
import PortfolioSection from "../components/portfolio3d/PortfolioSection";

export default function Portfolio() {
  return (
    <ReactLenis root options={{ lerp: 0.1, wheelMultiplier: 1, syncTouch: false }}>
      <PortfolioIntro />
      <PortfolioSection
        title="Sorotan Kelas"
        subtitle="Beberapa hal yang kami bangun dan kelola bersama sepanjang tahun ajaran ini."
      />
    </ReactLenis>
  );
}
