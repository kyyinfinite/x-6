import { useLayoutEffect, useMemo, useRef } from "react";
import { ChevronDown } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import IntroBackdrop from "./IntroBackdrop";

gsap.registerPlugin(ScrollTrigger);

const GLITCH_CHARS = "!<>-_\\/[]{}—=+*^?#________";

interface IntroPanel {
  kicker: string;
  title: string;
  description: string;
}

const DEFAULT_PANELS: IntroPanel[] = [
  {
    kicker: "PORTOFOLIO KELAS X-6",
    title: "KAMI BANGUN.",
    description:
      "Setiap kegiatan, proyek, dan aksi kecil yang kami kerjakan sepanjang tahun ajaran ini — dirangkum jadi satu galeri.",
  },
  {
    kicker: "DIRAWAT BERSAMA",
    title: "KAMI RAWAT.",
    description: "Bukan cuma dikerjakan sekali lalu dilupakan — tapi dijaga, didokumentasikan, dan terus diperbarui.",
  },
  {
    kicker: "JELAJAHI SENDIRI",
    title: "KAMI PAMERKAN.",
    description: "Gulir terus untuk masuk ke galeri foto 3D dan lihat langsung apa saja yang sudah kami kerjakan.",
  },
];

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

function randomGlitchChar() {
  return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
}

function IntroPanelText({ panel, index }: { panel: IntroPanel; index: number }) {
  const letters = useLetterSpans(panel.title);
  return (
    <div data-panel={index} className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[11px] md:text-xs uppercase tracking-[0.35em] text-gold font-mono font-semibold mb-5">
        {panel.kicker}
      </p>
      <h2 className="font-sans font-extrabold tracking-tight uppercase text-paper leading-[0.92] text-[15vw] md:text-[8.5vw] lg:text-[7rem] overflow-hidden">
        {letters.map((l) => (
          <span key={l.id} data-letter className="inline-block will-change-transform">
            {l.char}
          </span>
        ))}
      </h2>
      <p className="mt-6 md:mt-8 text-sm md:text-base text-paper/70 max-w-xl mx-auto leading-relaxed">
        {panel.description}
      </p>
    </div>
  );
}

interface PortfolioIntroProps {
  panels?: IntroPanel[];
}

// Pola koreografi ala oryzo.ai: kamera/objek 3D di belakang TETAP DIAM,
// section di-pin selama panjang tertentu, dan teks yang berganti/crossfade
// mengikuti posisi scroll (scrubbed timeline), bukan animasi berbasis waktu.
export default function PortfolioIntro({ panels = DEFAULT_PANELS }: PortfolioIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const panelEls = gsap.utils.toArray<HTMLElement>("[data-panel]", containerRef.current!);

      // Set kondisi awal: panel 0 terlihat, sisanya di bawah & transparan.
      panelEls.forEach((el, i) => {
        gsap.set(el, { opacity: i === 0 ? 1 : 0, y: i === 0 ? 0 : 40 });
        const letterEls = el.querySelectorAll<HTMLSpanElement>("[data-letter]");
        gsap.set(letterEls, { opacity: i === 0 ? 0 : 1, yPercent: i === 0 ? 120 : 0, skewY: i === 0 ? 8 : 0 });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${panelEls.length * 100}%`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            gsap.to(scrollHintRef.current, { opacity: self.progress > 0.03 ? 0 : 1, duration: 0.2 });
          },
        },
      });

      // Panel pertama: reveal huruf per-huruf + glitch singkat (dekorasi "edgy/teknikal").
      const firstLetters = panelEls[0].querySelectorAll<HTMLSpanElement>("[data-letter]");
      firstLetters.forEach((el, i) => {
        const original = el.textContent ?? "";
        tl.to(
          el,
          {
            opacity: 1,
            yPercent: 0,
            skewY: 0,
            duration: 0.35,
            onStart: () => {
              gsap.timeline()
                .call(() => (el.textContent = randomGlitchChar()))
                .to({}, { duration: 0.015 })
                .call(() => (el.textContent = randomGlitchChar()))
                .to({}, { duration: 0.015 })
                .call(() => (el.textContent = original));
            },
          },
          i * 0.012
        );
      });

      // Transisi antar-panel: panel lama fade+naik keluar, panel baru fade+naik masuk.
      for (let i = 0; i < panelEls.length - 1; i++) {
        tl.to(panelEls[i], { opacity: 0, y: -40, duration: 0.5 }, `panel${i}`)
          .fromTo(panelEls[i + 1], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5 }, `panel${i}<`)
          .addLabel(`panel${i}`, `+=0.3`);
      }
    }, containerRef);

    return () => ctx.revert();
  }, [panels]);

  return (
    <div id="intro" ref={containerRef} className="relative h-screen w-full overflow-hidden bg-ink">
      <div className="absolute inset-0">
        <IntroBackdrop />
      </div>

      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(250,246,238,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(250,246,238,0.6) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative z-10 h-full w-full">
        {panels.map((panel, i) => (
          <IntroPanelText key={panel.title} panel={panel} index={i} />
        ))}
      </div>

      <div ref={scrollHintRef} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-paper/60 z-20">
        <span className="text-[10px] uppercase tracking-[0.3em] font-mono">Gulir untuk lanjut</span>
        <ChevronDown size={18} className="animate-bounce" />
      </div>
    </div>
  );
}
