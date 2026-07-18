import { Award, TrendingUp, BookOpen } from "lucide-react";
import { nilaiMapel as nilaiMapelDummy, siswaList as siswaListDummy } from "../DataDummy";
import { apiGet } from "../lib/api";
import { usePolling } from "../lib/usePolling";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip,
} from "recharts";

export default function Nilai() {
  const { data: liveGrades, error: gradesError } = usePolling(
    () => apiGet<typeof nilaiMapelDummy>("/api/grades"),
    30000
  );
  const { data: liveSiswa, error: siswaError } = usePolling(
    () => apiGet<typeof siswaListDummy>("/api/students"),
    30000
  );

  const nilaiMapel = liveGrades && liveGrades.length > 0 ? liveGrades : nilaiMapelDummy;
  const siswaList = liveSiswa && liveSiswa.length > 0 ? liveSiswa : siswaListDummy;
  const error = gradesError || siswaError;

  const radarData = nilaiMapel.map((n) => ({
    mapel: n.mapel.length > 10 ? n.mapel.substring(0, 10) + "." : n.mapel,
    nilai: n.rataRata,
  }));

  const top5 = [...siswaList].sort((a, b) => b.nilaiRata - a.nilaiRata).slice(0, 5);
  const avgKelas = nilaiMapel.length
    ? (nilaiMapel.reduce((a, n) => a + n.rataRata, 0) / nilaiMapel.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6 p-6">
      {error && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-300 text-xs px-4 py-2.5">
          ⚠️ Gagal memuat data nilai dari server ({error}), menampilkan data contoh sementara.
        </div>
      )}
      <div>
        <h1 className="text-2xl font-black gradient-text">Rekap Nilai</h1>
        <p className="text-slate-400 text-sm mt-1">Nilai rata-rata kelas X-6 per mata pelajaran</p>
      </div>

      {/* Top Stat */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5 border border-blue-500/15 bg-gradient-to-br from-blue-500/8 to-transparent">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Rata-rata Kelas</p>
          <p className="text-5xl font-black gradient-text">{avgKelas}</p>
          <p className="text-xs text-slate-500 mt-2">Dari {nilaiMapel.length} mata pelajaran</p>
        </div>
        <div className="glass rounded-2xl p-5 border border-green-500/15 bg-gradient-to-br from-green-500/8 to-transparent">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Mapel Terbaik</p>
          {(() => {
            const best = nilaiMapel.reduce((a, b) => a.rataRata > b.rataRata ? a : b);
            return (
              <>
                <p className="text-xl font-black text-green-400">{best.mapel}</p>
                <p className="text-3xl font-black text-white mt-1">{best.rataRata}</p>
                <p className="text-xs text-slate-500 mt-1">{best.guru}</p>
              </>
            );
          })()}
        </div>
        <div className="glass rounded-2xl p-5 border border-amber-500/15 bg-gradient-to-br from-amber-500/8 to-transparent">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Perlu Perhatian</p>
          {(() => {
            const worst = nilaiMapel.reduce((a, b) => a.rataRata < b.rataRata ? a : b);
            return (
              <>
                <p className="text-xl font-black text-amber-400">{worst.mapel}</p>
                <p className="text-3xl font-black text-white mt-1">{worst.rataRata}</p>
                <p className="text-xs text-slate-500 mt-1">{worst.guru}</p>
              </>
            );
          })()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar Chart */}
        <div className="glass rounded-2xl p-5 border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400"><TrendingUp size={16} /></div>
            <h3 className="font-bold text-white text-sm">Profil Nilai Kelas</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="mapel" tick={{ fill: "#64748b", fontSize: 10 }} />
              <Radar name="Nilai" dataKey="nilai" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} dot={{ fill: "#3b82f6", r: 3 }} />
              <Tooltip contentStyle={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#e2e8f0" }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 Siswa */}
        <div className="glass rounded-2xl p-5 border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400"><Award size={16} /></div>
            <h3 className="font-bold text-white text-sm">Top 5 Siswa Berprestasi</h3>
          </div>
          <div className="space-y-3">
            {top5.map((s, i) => {
              const medals = ["#FFD700", "#C0C0C0", "#CD7F32", "#64748b", "#64748b"];
              return (
                <div key={s.id} className="flex items-center gap-3 bg-white/3 rounded-xl p-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                    style={{ background: `${medals[i]}22`, color: medals[i], border: `1px solid ${medals[i]}40` }}>
                    {i + 1}
                  </div>
                  <img src={s.foto} alt={s.nama} className="w-9 h-9 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{s.nama}</p>
                    <p className="text-xs text-slate-500">{s.jabatan}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black" style={{ color: medals[i] }}>{s.nilaiRata}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail per Mapel */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400"><BookOpen size={16} /></div>
            <h3 className="font-bold text-white text-sm">Detail Nilai per Mata Pelajaran</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {["Mata Pelajaran", "Guru", "UH 1", "UH 2", "UTS", "UAS", "Rata-rata", "Grade"].map((h) => (
                  <th key={h} className="text-left p-4 text-xs text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nilaiMapel.map((n, i) => {
                const grade = n.rataRata >= 90 ? "A" : n.rataRata >= 80 ? "B" : n.rataRata >= 70 ? "C" : "D";
                const gradeColor = grade === "A" ? "text-green-400 bg-green-500/10 border-green-500/20" : grade === "B" ? "text-blue-400 bg-blue-500/10 border-blue-500/20" : "text-amber-400 bg-amber-500/10 border-amber-500/20";
                return (
                  <tr key={i} className="border-b border-white/3 table-row-hover">
                    <td className="p-4 text-sm font-bold text-white whitespace-nowrap">{n.mapel}</td>
                    <td className="p-4 text-xs text-slate-400 whitespace-nowrap">{n.guru}</td>
                    <td className="p-4 text-sm text-slate-300 font-mono">{n.uh1}</td>
                    <td className="p-4 text-sm text-slate-300 font-mono">{n.uh2}</td>
                    <td className="p-4 text-sm text-slate-300 font-mono">{n.uts}</td>
                    <td className="p-4 text-sm text-slate-300 font-mono">{n.uas}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-white/5 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full" style={{ width: `${n.rataRata}%`, background: n.rataRata >= 90 ? "#22c55e" : n.rataRata >= 80 ? "#3b82f6" : "#f59e0b" }} />
                        </div>
                        <span className="text-sm font-bold text-white font-mono">{n.rataRata}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`badge border ${gradeColor}`}>{grade}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
