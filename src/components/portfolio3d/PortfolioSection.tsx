import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, FolderOpen } from "lucide-react";
import { apiGet } from "../../lib/api";
import { usePolling } from "../../lib/usePolling";
import { Skeleton } from "../Skeleton";
import type { PortfolioProject } from "./types";

const Portfolio3DScene = lazy(() => import("./Portfolio3DScene"));

const VH_PER_PROJECT = 130;

interface PortfolioSectionProps {
  title?: string;
  subtitle?: string;
  projects?: PortfolioProject[];
}

export default function PortfolioSection({
  title = "Sorotan Kelas",
  subtitle = "Beberapa hal yang kami bangun dan kelola bersama sepanjang tahun ajaran ini.",
  projects: overrideProjects,
}: PortfolioSectionProps) {
  const { data, error, loading } = usePolling(
    () => apiGet<PortfolioProject[]>("/api/class-info?resource=portfolio"),
    30000
  );

  const projects = overrideProjects ?? data ?? [];
  const isLoading = !overrideProjects && loading;

  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (projects.length === 0) return;

    let frame = 0;
    const update = () => {
      const el = trackRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
        progressRef.current = p;
        const idx = Math.min(projects.length - 1, Math.max(0, Math.round(p * (projects.length - 1))));
        setActiveIndex((prev) => (prev === idx ? prev : idx));
      }
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [projects.length]);

  const activeProject = projects[activeIndex];

  return (
    <section
      id="galeri"
      ref={trackRef}
      className="relative w-full bg-paper"
      style={{ height: projects.length > 0 ? `${projects.length * VH_PER_PROJECT}vh` : "auto" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {isLoading && <Skeleton className="w-full h-full" />}

        {!isLoading && !overrideProjects && error && (
          <div className="absolute inset-0 flex items-center justify-center text-amber-700 text-sm px-6 text-center">
            ⚠️ Gagal memuat data proyek dari server ({error}).
          </div>
        )}

        {!isLoading && !error && projects.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-ink-soft px-6 text-center">
            <FolderOpen size={28} />
            <p className="text-sm">Belum ada proyek yang ditambahkan lewat panel admin.</p>
          </div>
        )}

        {!isLoading && projects.length > 0 && (
          <>
            <Suspense fallback={<Skeleton className="w-full h-full" />}>
              <Portfolio3DScene projects={projects} progressRef={progressRef} activeIndex={activeIndex} />
            </Suspense>

            <div className="pointer-events-none absolute inset-0 flex items-end md:items-center px-6 md:px-16 pb-16 md:pb-0">
              <AnimatePresence mode="wait">
                {activeProject && (
                  <motion.div
                    key={activeProject.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -24 }}
                    transition={{ duration: 0.4 }}
                    className="max-w-sm rounded-2xl bg-surface/80 backdrop-blur-md border border-border px-5 py-4 shadow-lg"
                  >
                    <p className="text-[11px] uppercase tracking-widest text-gold font-mono">
                      {activeIndex + 1} / {projects.length}
                    </p>
                    <h3 className="font-display text-2xl text-ink mt-1.5">{activeProject.title}</h3>
                    <p className="text-xs text-ink-faint mt-1 font-mono">{activeProject.tag}</p>
                    <p className="text-sm text-ink-soft leading-relaxed mt-3">{activeProject.description}</p>
                    {activeProject.link && (
                      <a
                        href={activeProject.link}
                        target="_blank"
                        rel="noreferrer"
                        className="pointer-events-auto inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-ink hover:text-gold transition-colors"
                      >
                        Lihat proyek
                        <ArrowUpRight size={13} />
                      </a>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center pointer-events-none px-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-semibold font-mono">{title}</p>
              <p className="text-ink-faint text-[11px] mt-1 max-w-xs mx-auto hidden md:block">{subtitle}</p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
