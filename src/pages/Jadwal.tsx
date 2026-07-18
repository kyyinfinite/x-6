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
  Matematika: "border-blue-500/40 bg-blue-500/8",
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
  Istirahat: "border-white/5 bg-white/2",
  Ishoma: "border-white/5 bg-white/2",
  "Tadarus / Imtaq": "border-emerald-500/30 bg-emerald-500/5",
  "Upacara / PKN": "border-red-500/30 bg-red-500/5",
};

const MAPEL_TEXT: Record<string, string> = {
  Matematika: "text-blue-400",
  Fisika: "text-cyan-400",
  Kimia: "text-purple-400",
  Biologi: "text-green-400",
  "Bahasa Indonesia": "text-amber-400",
  "Bahasa Inggris": "text-pink-400",
  Sejarah: "text-orange-400",
  Informatika: "text-indigo-400",
  PKN: "text-red-400",
  PJOK: "text-teal-400",
  "Seni Budaya": "text-rose-400",
  "Agama Islam": "text-emerald-400",
  Ekonomi: "text-yellow-400",
  Prakarya: "text-lime-400",
  BK: "text-violet-400",
  Istirahat: "text-slate-500",
  Ishoma: "text-slate-500",
  "Tadarus / Imtaq": "text-emerald-400",
  "Upacara / PKN": "text-red-400",
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
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-300 text-xs px-4 py-2.5">
          ⚠️ Gagal memuat jadwal dari server ({error}).
        </div>
      )}
      <div>
        <h1 className="text-2xl font-black gradient-text">Jadwal Kelas</h1>
        <p className="text-slate-400 text-sm mt-1">Jadwal pelajaran dan piket harian kelas X-6</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[["pelajaran", "Jadwal Pelajaran"], ["piket", "Jadwal Piket"]].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key as any)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${activeTab === key ? "bg-blue-600 border-blue-500 text-white" : "glass border-white/8 text-slate-400 hover:text-white"}`}>
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
                className={`px-5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap border transition-all flex-shrink-0 ${selectedHari === h ? "bg-blue-600 border-blue-500 text-white" : "glass border-white/8 text-slate-400 hover:text-white"}`}>
                {h}
              </button>
            ))}
          </div>

          {/* Timeline */}
          <div className="glass rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400"><BookOpen size={16} /></div>
                <h3 className="font-bold text-white text-sm">Jadwal {selectedHari} - Kelas X-6</h3>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {jadwal.length === 0 && (
                <p className="text-xs text-slate-600 text-center py-6">Belum ada jadwal untuk hari {selectedHari}.</p>
              )}
              {jadwal.map((j, i) => {
                const isBreak = j.mapel === "Istirahat" || j.mapel === "Ishoma";
                return (
                  <div key={i}
                    className={`flex items-stretch gap-3 rounded-xl border px-4 py-3 transition-all ${isBreak ? "opacity-50" : "hover:bg-white/3"} ${MAPEL_COLORS[j.mapel] || "border-white/5 bg-white/3"}`}>
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: isBreak ? "#475569" : "#3b82f6" }} />
                      {i < jadwal.length - 1 && <div className="w-px flex-1 mt-1" style={{ background: "rgba(255,255,255,0.05)" }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <p className={`text-sm font-bold ${MAPEL_TEXT[j.mapel] || "text-white"}`}>{j.mapel}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock size={10} />
                          <span>{j.jam}</span>
                        </div>
                      </div>
                      {!isBreak && (
                        <div className="flex items-center gap-3 mt-1">
                          {j.guru !== "-" && (
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <User size={10} />
                              <span>{j.guru}</span>
                            </div>
                          )}
                          {j.ruang !== "-" && (
                            <div className="flex items-center gap-1 text-xs text-slate-500">
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
          <div className="glass rounded-2xl p-5 border border-white/5">
            <h3 className="font-bold text-white text-sm mb-3">Ringkasan Mapel Hari Ini</h3>
            <div className="flex flex-wrap gap-2">
              {jadwal.filter(j => j.guru !== "-" && j.mapel !== "Istirahat" && j.mapel !== "Ishoma").map((j, i) => (
                <span key={i} className={`badge border ${MAPEL_COLORS[j.mapel] || "border-white/10 bg-white/5"} ${MAPEL_TEXT[j.mapel] || "text-slate-300"}`}>
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
            <p className="text-xs text-slate-600 col-span-full text-center py-6">Belum ada jadwal piket.</p>
          )}
          {piketList.map((p, pi) => {
            const colors = ["blue", "purple", "green", "amber", "pink", "cyan"];
            const color = colors[pi % colors.length];
            const colorMap: Record<string, string> = {
              blue: "border-blue-500/20 from-blue-500/8 text-blue-400 bg-blue-500/10",
              purple: "border-purple-500/20 from-purple-500/8 text-purple-400 bg-purple-500/10",
              green: "border-green-500/20 from-green-500/8 text-green-400 bg-green-500/10",
              amber: "border-amber-500/20 from-amber-500/8 text-amber-400 bg-amber-500/10",
              pink: "border-pink-500/20 from-pink-500/8 text-pink-400 bg-pink-500/10",
              cyan: "border-cyan-500/20 from-cyan-500/8 text-cyan-400 bg-cyan-500/10",
            };
            const cls = colorMap[color];
            return (
              <div key={pi} className={`glass rounded-2xl p-5 border bg-gradient-to-br ${cls.split(" ")[0]} ${cls.split(" ")[1]}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">{p.hari}</h3>
                  <span className={`badge ${cls.split(" ")[2]} ${cls.split(" ")[3]}`}>
                    Kelompok {p.kelompok}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {p.anggota.map((nama, j) => (
                    <div key={j} className="flex items-center gap-3 bg-white/3 rounded-xl p-2.5">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(nama)}&background=${["1e3a5f", "3b1f6b", "0f3a2e", "3b1a1a"][j % 4]}&color=${["60a5fa", "c084fc", "34d399", "f87171"][j % 4]}&size=64&bold=true`}
                        alt={nama}
                        className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                      />
                      <p className="text-sm text-white font-medium">{nama}</p>
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
