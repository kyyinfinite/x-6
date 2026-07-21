import { lazy, Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ReactLenis } from "lenis/react";
import { ArrowUpRight, FolderOpen } from "lucide-react";
import "lenis/dist/lenis.css";
import { apiGet } from "../../lib/api";
import { usePolling } from "../../lib/usePolling";
import { Skeleton, SkeletonRow } from "../Skeleton";
import type { PortfolioProject } from "./types";

const Portfolio3DScene = lazy(() => import("./Portfolio3DScene"));

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
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeIndex > projects.length - 1) setActiveIndex(0);
  }, [projects.length, activeIndex]);

  const activeProject = projects[activeIndex];
  const isLoading = !overrideProjects && loading;

  return (
    <ReactLenis root={false} options={{ lerp: 0.08, wheelMultiplier: 1, syncTouch: false }}>
      <section className="relative min-h-screen w-full bg-paper text-ink overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 flex flex-col md:grid md:grid-cols-2 gap-12 md:gap-10 items-center">
          <div className="order-2 md:order-1 w-full">
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5 }}
              className="text-xs uppercase tracking-widest text-gold font-semibold font-mono"
            >
              Portofolio
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="font-display text-3xl md:text-4xl mt-3"
            >
              {title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="text-ink-soft text-sm mt-3 max-w-md"
            >
              {subtitle}
            </motion.p>

            {!overrideProjects && error && (
              <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-700 text-xs px-4 py-2.5">
                ⚠️ Gagal memuat data proyek dari server ({error}).
              </div>
            )}

            {isLoading && (
              <div className="mt-8 space-y-3">
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </div>
            )}

            {!isLoading && projects.length === 0 && !error && (
              <div className="mt-8 flex items-start gap-3 rounded-xl border border-border bg-surface p-4 text-ink-soft">
                <FolderOpen size={18} className="mt-0.5 shrink-0" />
                <p className="text-sm">Belum ada proyek yang ditambahkan lewat panel admin.</p>
              </div>
            )}

            {!isLoading && projects.length > 0 && (
              <>
                <div className="mt-8 space-y-2">
                  {projects.map((project, i) => (
                    <motion.button
                      key={project.id}
                      type="button"
                      onClick={() => setActiveIndex(i)}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.4, delay: 0.05 * i }}
                      className={`w-full text-left flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5 transition-colors ${
                        i === activeIndex ? "border-gold/40 bg-gold-soft" : "border-border hover:border-ink/20"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-ink">{project.title}</p>
                        <p className="text-xs text-ink-faint mt-0.5 font-mono">{project.tag}</p>
                      </div>
                      <ArrowUpRight
                        size={16}
                        className={i === activeIndex ? "text-gold" : "text-ink-faint"}
                      />
                    </motion.button>
                  ))}
                </div>

                {activeProject && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeProject.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 rounded-xl border border-border bg-surface p-4"
                    >
                      <p className="text-sm text-ink-soft leading-relaxed">{activeProject.description}</p>
                      {activeProject.link && (
                        <a
                          href={activeProject.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-sage hover:text-sage/80 transition-colors"
                        >
                          Lihat proyek
                          <ArrowUpRight size={13} />
                        </a>
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="order-1 md:order-2 w-full h-[360px] md:h-[520px] rounded-2xl overflow-hidden"
          >
            {isLoading && <Skeleton className="w-full h-full" />}
            {!isLoading && projects.length > 0 && (
              <Suspense fallback={<Skeleton className="w-full h-full" />}>
                <Portfolio3DScene projects={projects} activeIndex={activeIndex} onSelect={setActiveIndex} />
              </Suspense>
            )}
          </motion.div>
        </div>
      </section>
    </ReactLenis>
  );
}
