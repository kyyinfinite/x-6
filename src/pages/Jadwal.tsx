import { useState } from "react";
import { BookOpen, Clock, MapPin, User } from "lucide-react";
import { apiGet } from "../lib/api";
import { usePolling } from "../lib/usePolling";
import { Skeleton, SkeletonBlock } from "../components/Skeleton";

type JadwalItem = { jam: string; mapel: string; guru: string; ruang: string };
type JadwalPelajaran = Record<string, JadwalItem[]>;
type PiketHari = { hari: string; kelompok: number; anggota: string[] };

const HARI_LIST = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"] as const;
type HariType = typeof HARI_LIST[number];

const MAPEL_COLORS: Record<string, string> = {
  Matematika: "border-sage/40 bg-sage/8",
  Fisika: "border-cyan-500/40 bg-cyan-500/8",
  Kimia: "border-purple-500/40 bg-purple-500/8",
  Biologi: "border-green-500/40 bg-green-500/8",
  "Bahasa Indonesia": "border-amber-500/40 bg-amber-500/8",
  "Bahasa Inggris": "border-pink-500/40 bg-pink-500/8",
  Sejarah: "border-orange-500/40 bg-orange-500/8",
  Informatika: "border-indigo-500/40 bg-indigo-500/8",
  PKN: "border-red-500/40 bg-red-500/8",
  PJOK: "border-teal-500/40 bg-teal-500/8",
  "Seni Budaya": "border-rose-500/40 bg-rose-500/8",
  "Agama Islam": "border-emerald-500/40 bg-emerald-500/8",
  Ekonomi: "border-yellow-500/40 bg-yellow-500/8",
  Prakarya: "border-lime-500/40 bg-lime-500/8",
  BK: "border-violet-500/40 bg-violet-500/8",
  Istirahat: "border-ink/10 bg-black/[0.02]",
  Ishoma: "border-ink/10 bg-black/[0.02]",
  "Tadarus / Imtaq": "border-emerald-500/30 bg-emerald-500/5",
  "Upacara / PKN": "border-red-500/30 bg-red-500/5",
};

const MAPEL_TEXT: Record<string, string> = {
  Matematika: "text-sage",
  Fisika: "text-cyan-600",
  Kimia: "text-purple-600",
  Biologi: "text-green-600",
  "Bahasa Indonesia": "text-amber-600",
  "Bahasa Inggris": "text-pink-600",
  Sejarah: "text-orange-600",
  Informatika: "text-indigo-600",
  PKN: "text-red-600",
  PJOK: "text-teal-600",
  "Seni Budaya": "text-rose-600",
  "Agama Islam": "text-emerald-600",
  Ekonomi: "text-yellow-600",
  Prakarya: "text-lime-600",
  BK: "text-violet-600",
  Istirahat: "text-ink-faint",
  Ishoma: "text-ink-faint",
  "Tadarus / Imtaq": "text-emerald-600",
  "Upacara / PKN": "text-red-600",
};

export default function Jadwal() {
  const [selectedHari, setSelectedHari] = useState<HariType>("Senin");
  const [activeTab, setActiveTab] = useState<"pelajaran" | "piket">("pelajaran");

  const { data: jadwalPelajaran, error: jadwalError, loading: jadwalLoading } = usePolling(
    () => apiGet<JadwalPelajaran>("/api/schedule"),
    30000
  );
  const { data: jadwalPiket, error: piketError, loading: piketLoading } = usePolling(
    () => apiGet<PiketHari[]>("/api/schedule?type=piket"),
    30000
  );

  const error = jadwalError || piketError;
  const jadwal = jadwalPelajaran?.[selectedHari] ?? [];
  const piketList = jadwalPiket ?? [];

  if (jadwalLoading || piketLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="w-40 h-7" />
        <SkeletonBlock />
        <SkeletonBlock />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {error && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-700 text-xs px-4 py-2.5">
          ⚠️ Gagal memuat jadwal dari server ({error}).
        </div>
      )}
      <div>
        <h1 className="text-2xl font-black gradient-text">Jadwal Kelas</h1>
        <p className="text-ink-soft text-sm mt-1">Jadwal pelajaran dan piket harian kelas X-6</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[["pelajaran", "Jadwal Pelajaran"], ["piket", "Jadwal Piket"]].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key as any)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${activeTab === key ? "bg-sage border-sage text-ink" : "glass border-ink/15 text-ink-soft hover:text-ink"}`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === "pelajaran" && (
        <>
          {/* Hari Selector */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {HARI_LIST.map((h) => (
              <button key={h} onClick={() => setSelectedHari(h)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap border transition-all flex-shrink-0 ${selectedHari === h ? "bg-sage border-sage text-ink" : "glass border-ink/15 text-ink-soft hover:text-ink"}`}>
                {h}
              </button>
            ))}
          </div>

          {/* Timeline */}
          <div className="glass rounded-2xl border border-ink/10 overflow-hidden">
            <div className="p-4 border-b border-ink/10">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sage/10 text-sage"><BookOpen size={16} /></div>
                <h3 className="font-bold text-ink text-sm">Jadwal {selectedHari} - Kelas X-6</h3>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {jadwal.length === 0 && (
                <p className="text-xs text-ink-faint text-center py-6">Belum ada jadwal untuk hari {selectedHari}.</p>
              )}
              {jadwal.map((j, i) => {
                const isBreak = j.mapel === "Istirahat" || j.mapel === "Ishoma";
                return (
                  <div key={i}
                    className={`flex items-stretch gap-3 rounded-xl border px-4 py-3 transition-all ${isBreak ? "opacity-50" : "hover:bg-black/[0.03]"} ${MAPEL_COLORS[j.mapel] || "border-ink/10 bg-black/[0.03]"}`}>
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: isBreak ? "#A69C89" : "#4F6B52" }} />
                      {i < jadwal.length - 1 && <div className="w-px flex-1 mt-1" style={{ background: "rgba(43,38,32,0.12)" }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <p className={`text-sm font-bold ${MAPEL_TEXT[j.mapel] || "text-ink"}`}>{j.mapel}</p>
                        <div className="flex items-center gap-1 text-xs text-ink-faint">
                          <Clock size={10} />
                          <span>{j.jam}</span>
                        </div>
                      </div>
                      {!isBreak && (
                        <div className="flex items-center gap-3 mt-1">
                          {j.guru !== "-" && (
                            <div className="flex items-center gap-1 text-xs text-ink-faint">
                              <User size={10} />
                              <span>{j.guru}</span>
                            </div>
                          )}
                          {j.ruang !== "-" && (
                            <div className="flex items-center gap-1 text-xs text-ink-faint">
                              <MapPin size={10} />
                              <span>{j.ruang}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* All Day Summary */}
          <div className="glass rounded-2xl p-5 border border-ink/10">
            <h3 className="font-bold text-ink text-sm mb-3">Ringkasan Mapel Hari Ini</h3>
            <div className="flex flex-wrap gap-2">
              {jadwal.filter(j => j.guru !== "-" && j.mapel !== "Istirahat" && j.mapel !== "Ishoma").map((j, i) => (
                <span key={i} className={`badge border ${MAPEL_COLORS[j.mapel] || "border-ink/15 bg-black/[0.05]"} ${MAPEL_TEXT[j.mapel] || "text-ink-soft"}`}>
                  {j.mapel}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === "piket" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {piketList.length === 0 && (
            <p className="text-xs text-ink-faint col-span-full text-center py-6">Belum ada jadwal piket.</p>
          )}
          {piketList.map((p, pi) => {
            const colors = ["blue", "purple", "green", "amber", "pink", "cyan"];
            const color = colors[pi % colors.length];
            const colorMap: Record<string, string> = {
              blue: "border-sage/20 from-sage/8 text-sage bg-sage/10",
              purple: "border-purple-500/20 from-purple-500/8 text-purple-600 bg-purple-500/10",
              green: "border-green-500/20 from-green-500/8 text-green-600 bg-green-500/10",
              amber: "border-amber-500/20 from-amber-500/8 text-amber-600 bg-amber-500/10",
              pink: "border-pink-500/20 from-pink-500/8 text-pink-600 bg-pink-500/10",
              cyan: "border-cyan-500/20 from-cyan-500/8 text-cyan-600 bg-cyan-500/10",
            };
            const cls = colorMap[color];
            return (
              <div key={pi} className={`glass rounded-2xl p-5 border bg-gradient-to-br ${cls.split(" ")[0]} ${cls.split(" ")[1]}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-ink">{p.hari}</h3>
                  <span className={`badge ${cls.split(" ")[2]} ${cls.split(" ")[3]}`}>
                    Kelompok {p.kelompok}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {p.anggota.map((nama, j) => (
                    <div key={j} className="flex items-center gap-3 bg-black/[0.03] rounded-xl p-2.5">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(nama)}&background=${["E3EBDD", "F3E6C4", "F0DBCC", "F1E9D8"][j % 4]}&color=${["4F6B52", "A6772C", "A65A38", "6E6558"][j % 4]}&size=64&bold=true`}
                        alt={nama}
                        className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                      />
                      <p className="text-sm text-ink font-medium">{nama}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
