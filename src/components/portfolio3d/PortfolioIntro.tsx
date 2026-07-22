import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface PortfolioIntroProps {
  kicker?: string;
  title?: string;
  description?: string;
}

// Intro sinematik ala oryzo.ai: kicker kecil -> judul besar bold -> deskripsi ->
// indikator scroll. Saat user mulai scroll, seluruh section ini fade + blur +
// sedikit mengecil, memberi kesan transisi kamera yang halus ke section foto 3D.
export default function PortfolioIntro({
  kicker = "PORTOFOLIO KELAS X-6",
  title = "KAMI BANGUN. KAMI RAWAT.",
  description = "Setiap kegiatan, proyek, dan aksi kecil yang kami kerjakan sepanjang tahun ajaran ini — dirangkum jadi galeri yang bisa kamu jelajahi sendiri.",
}: PortfolioIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 1, 0]);
  const blurPx = useTransform(scrollYProgress, [0, 1], [0, 14]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const translateY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const filter = useTransform(blurPx, (v) => `blur(${v}px)`);

  return (
    <div ref={containerRef} className="relative h-[130vh]">
      <motion.section
        style={{ opacity, scale, y: translateY, filter }}
        className="sticky top-0 h-screen w-full overflow-hidden bg-ink flex flex-col items-center justify-center px-6 text-center"
      >
        {/* Grid halus ala blueprint/cutting-mat, memberi tekstur tanpa ramai */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(250,246,238,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(250,246,238,0.6) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        {/* Glow orbs blur -> efek cahaya lembut/cinematic di belakang teks */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gold/30 blur-3xl animate-pulse-slow" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 w-[28rem] h-[28rem] rounded-full bg-sage/25 blur-3xl animate-pulse-slow" />
        <div className="pointer-events-none absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-clay/20 blur-3xl" />

        <div className="relative z-10 max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[11px] md:text-xs uppercase tracking-[0.35em] text-gold font-mono font-semibold mb-5"
          >
            {kicker}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-sans font-extrabold tracking-tight uppercase text-paper leading-[0.92] text-[15vw] md:text-[8.5vw] lg:text-[7rem]"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 md:mt-8 text-sm md:text-base text-paper/70 max-w-xl mx-auto leading-relaxed"
          >
            {description}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="absolute bottom-8 flex flex-col items-center gap-2 text-paper/60"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] font-mono">Gulir untuk lanjut</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
            <ChevronDown size={18} />
          </motion.div>
        </motion.div>
      </motion.section>
    </div>
  );
}
