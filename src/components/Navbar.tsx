import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import gsap from "gsap";

const LINKS = [
  { href: "#intro", label: "Beranda" },
  { href: "#galeri", label: "Portofolio" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);

  useLayoutEffect(() => {
    if (!overlayRef.current) return;

    const ctx = gsap.context(() => {
      if (open) {
        gsap.set(overlayRef.current, { display: "flex" });
        gsap.fromTo(
          overlayRef.current,
          { clipPath: "circle(0% at calc(100% - 48px) 40px)" },
          { clipPath: "circle(150% at calc(100% - 48px) 40px)", duration: 0.7, ease: "power3.inOut" }
        );
        gsap.fromTo(
          linksRef.current,
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.08, delay: 0.25, ease: "power3.out" }
        );
      } else if (overlayRef.current.style.display !== "none") {
        gsap.to(overlayRef.current, {
          clipPath: "circle(0% at calc(100% - 48px) 40px)",
          duration: 0.5,
          ease: "power3.inOut",
          onComplete: () => gsap.set(overlayRef.current, { display: "none" }),
        });
      }
    });

    return () => ctx.revert();
  }, [open]);

  return (
    <>
      {/* mix-blend-difference -> otomatis kontras baik di atas background gelap
          (Intro) maupun terang (galeri foto), tanpa perlu tracking scroll manual. */}
      <div className="fixed top-0 left-0 right-0 z-[70] pointer-events-none mix-blend-difference">
        <div className="flex items-center justify-between px-5 md:px-10 py-5 md:py-6">
          <Link
            to="/"
            className="pointer-events-auto text-paper text-xs md:text-sm font-black uppercase tracking-[0.2em]"
          >
            Portal X-6
          </Link>

          <button
            onClick={() => setOpen((v) => !v)}
            className="pointer-events-auto flex items-center gap-2 rounded-full border border-paper/60 px-4 py-2 md:px-5 md:py-2.5 text-paper text-[11px] md:text-xs uppercase tracking-[0.25em] font-semibold transition-transform active:scale-95"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-paper" />
            {open ? "Tutup" : "Menu"}
          </button>
        </div>
      </div>

      {/* Overlay full-screen, dibuka lewat clip-path circle reveal dari posisi tombol */}
      <div
        ref={overlayRef}
        style={{ display: "none", clipPath: "circle(0% at calc(100% - 48px) 40px)" }}
        className="fixed inset-0 z-[65] bg-ink flex-col items-center justify-center gap-5 md:gap-7"
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-5 right-5 md:top-8 md:right-10 text-paper/70 hover:text-paper transition-colors"
          aria-label="Tutup menu"
        >
          <X size={22} />
        </button>

        {LINKS.map((link, i) => (
          <a
            key={link.href}
            ref={(el) => {
              linksRef.current[i] = el;
            }}
            href={link.href}
            onClick={() => setOpen(false)}
            className="text-paper font-sans font-extrabold uppercase tracking-tight text-4xl md:text-6xl hover:text-gold transition-colors"
          >
            {link.label}
          </a>
        ))}
      </div>
    </>
  );
}
