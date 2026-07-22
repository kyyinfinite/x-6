import { useLayoutEffect, useMemo, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import gsap from "gsap";

interface PortfolioIntroProps {
  kicker?: string;
  title?: string;
  description?: string;
}

const GLITCH_CHARS = "!<>-_\\/[]{}—=+*^?#________";

// Split title jadi array huruf sekali saja (useMemo), supaya GSAP bisa
// animasikan tiap <span> individual tanpa DOM library tambahan (SplitText).
function useLetterSpans(text: string) {
  return useMemo(
    () =>
      text.split("").map((char, i) => ({
        id: `${char}-${i}`,
        char: char === " " ? "\u00A0" : char,
      })),
    [text]
  );
}

export default function PortfolioIntro({
  kicker = "PORTOFOLIO KELAS X-6",
  title = "KAMI BANGUN. KAMI RAWAT.",
  description = "Setiap kegiatan, proyek, dan aksi kecil yang kami kerjakan sepanjang tahun ajaran ini — dirangkum jadi galeri yang bisa kamu jelajahi sendiri.",
}: PortfolioIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const kickerRef = useRef<HTMLParagraphElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  const letters = useLetterSpans(title);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 1, 0]);
  const blurPx = useTransform(scrollYProgress, [0, 1], [0, 14]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const translateY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const filter = useTransform(blurPx, (v) => `blur(${v}px)`);

  // Koreografi GSAP: staggered decode/glitch reveal per-huruf, jalan sekali
  // saat mount, terpisah total dari React render cycle (tidak memicu re-render).
  useLayoutEffect(() => {
    const letterEls = titleRef.current?.querySelectorAll<HTMLSpanElement>("[data-letter]");
    if (!letterEls) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.set(letterEls, { opacity: 0, yPercent: 120, skewY: 8 })
        .set(kickerRef.current, { opacity: 0, y: -8, clipPath: "inset(0 100% 0 0)" })
        .set(descRef.current, { opacity: 0, y: 12 })
        .set(scrollHintRef.current, { opacity: 0 });

      // 1) Kicker "decode" masuk dengan clip-path mask asimetris (bukan fade biasa)
      tl.to(kickerRef.current, { opacity: 1, y: 0, clipPath: "inset(0 0% 0 0)", duration: 0.5 });

      // 2) Tiap huruf title reveal bertahap + sedikit "glitch" karakter acak sebelum settle
      letterEls.forEach((el, i) => {
        const original = el.textContent ?? "";
        const glitchTl = gsap.timeline();

        glitchTl
          .to(el, { duration: 0.02, onStart: () => (el.textContent = randomGlitchChar()) })
          .to(el, { duration: 0.02, onStart: () => (el.textContent = randomGlitchChar()) })
          .to(el, { duration: 0.02, onStart: () => (el.textContent = original) });

        tl.to(
          el,
          { opacity: 1, yPercent: 0, skewY: 0, duration: 0.45 },
          i * 0.028 + 0.15
        ).add(glitchTl, i * 0.028 + 0.15);
      });

      // 3) Deskripsi masuk setelah huruf selesai
      tl.to(descRef.current, { opacity: 1, y: 0, duration: 0.5 }, "-=0.3");

      // 4) Indikator scroll fade in + bounce loop
      tl.to(scrollHintRef.current, { opacity: 1, duration: 0.4 }, "-=0.2").call(() => {
        gsap.to(scrollHintRef.current?.querySelector("[data-chevron]") ?? null, {
          y: 6,
          duration: 0.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [title]);

  return (
    <div ref={containerRef} className="relative h-[130vh]">
      <motion.section
        style={{ opacity, scale, y: translateY, filter }}
        className="sticky top-0 h-screen w-full overflow-hidden bg-ink flex flex-col items-center justify-center px-6 text-center"
      >
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(250,246,238,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(250,246,238,0.6) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gold/30 blur-3xl animate-pulse-slow" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 w-[28rem] h-[28rem] rounded-full bg-sage/25 blur-3xl animate-pulse-slow" />
        <div className="pointer-events-none absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-clay/20 blur-3xl" />

        <div className="relative z-10 max-w-3xl">
          <p
            ref={kickerRef}
            className="text-[11px] md:text-xs uppercase tracking-[0.35em] text-gold font-mono font-semibold mb-5"
          >
            {kicker}
          </p>

          <h1
            ref={titleRef}
            className="font-sans font-extrabold tracking-tight uppercase text-paper leading-[0.92] text-[15vw] md:text-[8.5vw] lg:text-[7rem] overflow-hidden"
          >
            {letters.map((l) => (
              <span key={l.id} data-letter className="inline-block will-change-transform">
                {l.char}
              </span>
            ))}
          </h1>

          <p ref={descRef} className="mt-6 md:mt-8 text-sm md:text-base text-paper/70 max-w-xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        <div ref={scrollHintRef} className="absolute bottom-8 flex flex-col items-center gap-2 text-paper/60">
          <span className="text-[10px] uppercase tracking-[0.3em] font-mono">Gulir untuk lanjut</span>
          <div data-chevron>
            <ChevronDown size={18} />
          </div>
        </div>
      </motion.section>
    </div>
  );
}

function randomGlitchChar() {
  return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
}
