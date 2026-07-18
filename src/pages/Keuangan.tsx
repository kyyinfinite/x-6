import { useState } from "react";
import { Wallet, ArrowUpRight, ArrowDownRight, TrendingUp, Users, Inbox } from "lucide-react";
import { apiGet } from "../lib/api";
import { usePolling } from "../lib/usePolling";
import {
  SkeletonBalanceCard,
  SkeletonCircleChart,
  SkeletonChart,
  SkeletonTable,
} from "../components/Skeleton";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

type KasSummary = {
  saldo: number;
  target: number;
  siswaLunas: number;
  siswaBelumLunas: number;
  iuranPerSiswa: number;
  frekuensiIuran: string;
  bulanIni: { pemasukan: number; pengeluaran: number; saldo_awal: number };
  arusBulanan: { bulan: string; masuk: number; keluar: number }[];
  riwayat: { id: string; tanggal: string; keterangan: string; jenis: string; jumlah: number; saldo: number }[];
};

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function Keuangan() {
  const [activeTab, setActiveTab] = useState<"riwayat" | "iuran">("riwayat");
  const { data, error, loading } = usePolling(() => apiGet<KasSummary>("/api/kas?view=summary"), 8000);

  const kasData = data;
  const kasProgress = kasData?.target ? (kasData.saldo / kasData.target) * 100 : 0;

  return (
    <div className="space-y-6 p-6">
      {error && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-300 text-xs px-4 py-2.5">
          ⚠️ Gagal memuat data kas dari server ({error}).
        </div>
      )}
      <div>
        <h1 className="text-2xl font-black gradient-text">Keuangan Kelas</h1>
        <p className="text-slate-400 text-sm mt-1">Manajemen kas dan iuran kelas X-6</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading || !kasData ? (
          <>
            <SkeletonBalanceCard />
            <SkeletonCircleChart />
          </>
        ) : (
          <>
            {/* Main Balance */}
            <div
              className="md:col-span-2 relative rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #0d1b3e 0%, #0a1628 60%, #0d0f1a 100%)",
                border: "1px solid rgba(37,99,235,0.2)",
              }}
            >
              <div
                className="absolute -top-10 -right-10 w-48 h-48 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)" }}
              />
              <div className="relative z-10 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-widest">Saldo Kas Kelas X-6</p>
                    <p className="text-5xl font-black text-white mt-2">{formatRupiah(kasData.saldo)}</p>
                    <p className="text-xs text-slate-500 mt-2">Data realtime dari database</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-blue-500/15 text-blue-400">
                    <Wallet size={28} />
                  </div>
                </div>
                <div className="mt-5">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-400">Progress menuju target</span>
                    <span className="text-blue-400 font-bold">
                      {kasProgress.toFixed(1)}% dari {formatRupiah(kasData.target)}
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div
                      className="progress-bar h-2"
                      style={{ width: `${Math.min(kasProgress, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-5">
                  {[
                    {
                      label: "Pemasukan Bulan Ini",
                      value: formatRupiah(kasData.bulanIni.pemasukan),
                      color: "text-green-400",
                      icon: <ArrowUpRight size={14} />,
                    },
                    {
                      label: "Pengeluaran Bulan Ini",
                      value: formatRupiah(kasData.bulanIni.pengeluaran),
                      color: "text-red-400",
                      icon: <ArrowDownRight size={14} />,
                    },
                    {
                      label: "Saldo Awal Bulan",
                      value: formatRupiah(kasData.bulanIni.saldo_awal),
                      color: "text-slate-300",
                      icon: <TrendingUp size={14} />,
                    },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-3">
                      <div className={`flex items-center gap-1 ${s.color} mb-1`}>
                        {s.icon}
                        <span className="text-xs">{s.label}</span>
                      </div>
                      <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Iuran Status */}
            <div className="glass rounded-2xl p-5 border border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <Users size={16} />
                </div>
                <h3 className="font-bold text-white text-sm">Status Iuran</h3>
              </div>
              <div className="flex justify-center items-center h-28">
                <div className="relative w-28 h-28">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle
                      cx="50" cy="50" r="40"
                      fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12"
                    />
                    <circle
                      cx="50" cy="50" r="40"
                      fill="none" stroke="#22c55e" strokeWidth="12"
                      strokeDasharray={`${
                        (kasData.siswaLunas / Math.max(kasData.siswaLunas + kasData.siswaBelumLunas, 1)) * 251
                      } 251`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-2xl font-black text-white">{kasData.siswaLunas}</p>
                    <p className="text-xs text-slate-500">Lunas</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mt-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-xs text-slate-400">Lunas</span>
                  </div>
                  <span className="text-sm font-bold text-green-400">{kasData.siswaLunas} siswa</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-xs text-slate-400">Belum Lunas</span>
                  </div>
                  <span className="text-sm font-bold text-red-400">{kasData.siswaBelumLunas} siswa</span>
                </div>
                <div className="border-t border-white/5 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Iuran per siswa</span>
                    <span className="text-xs font-bold text-white">
                      {formatRupiah(kasData.iuranPerSiswa)}/{kasData.frekuensiIuran.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Chart */}
      {loading || !kasData ? (
        <SkeletonChart height={200} />
      ) : kasData.arusBulanan.length === 0 ? (
        <div className="glass rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <TrendingUp size={16} />
              </div>
              <h3 className="font-bold text-white text-sm">Arus Kas per Bulan</h3>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Inbox size={40} className="text-slate-600 mb-3" />
            <p className="text-sm text-slate-500">Belum ada data arus kas bulanan</p>
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <TrendingUp size={16} />
              </div>
              <h3 className="font-bold text-white text-sm">Arus Kas per Bulan</h3>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-blue-500" />
                <span className="text-slate-400">Pemasukan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span className="text-slate-400">Pengeluaran</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={kasData.arusBulanan} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="bulan" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v / 1000}k`}
              />
              <Tooltip
                contentStyle={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                formatter={(v: any) => [formatRupiah(Number(v)), ""]}
              />
              <Bar dataKey="masuk" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="keluar" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabs */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="flex border-b border-white/5">
          {[["riwayat", "Riwayat Transaksi"], ["iuran", "Tunggakan Iuran"]].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as "riwayat" | "iuran")}
              className={`flex-1 py-3.5 text-sm font-semibold transition-all ${
                activeTab === key
                  ? "text-blue-400 border-b-2 border-blue-500 bg-blue-500/5"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === "riwayat" &&
          (loading || !kasData ? (
            <SkeletonTable rows={8} cols={5} />
          ) : kasData.riwayat.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <Inbox size={40} className="text-slate-600 mb-3" />
              <p className="text-sm text-slate-500">Belum ada riwayat transaksi</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Tanggal", "Keterangan", "Jenis", "Jumlah", "Saldo"].map((h) => (
                      <th
                        key={h}
                        className="text-left p-4 text-xs text-slate-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {kasData.riwayat.map((r) => (
                    <tr key={r.id} className="border-b border-white/3 table-row-hover">
                      <td className="p-4 text-xs text-slate-400 whitespace-nowrap">{r.tanggal}</td>
                      <td className="p-4 text-sm text-white font-medium">{r.keterangan}</td>
                      <td className="p-4">
                        <span
                          className={`badge ${
                            r.jenis === "Masuk"
                              ? "bg-green-500/15 text-green-400 border border-green-500/20"
                              : "bg-red-500/15 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {r.jenis === "Masuk" ? (
                            <ArrowUpRight size={10} className="inline mr-1" />
                          ) : (
                            <ArrowDownRight size={10} className="inline mr-1" />
                          )}
                          {r.jenis}
                        </span>
                      </td>
                      <td
                        className={`p-4 text-sm font-bold ${
                          r.jenis === "Masuk" ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {r.jenis === "Masuk" ? "+" : "-"}
                        {formatRupiah(r.jumlah)}
                      </td>
                      <td className="p-4 text-sm font-semibold text-white">{formatRupiah(r.saldo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

        {activeTab === "iuran" && (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <Inbox size={40} className="text-slate-600 mb-3" />
            <p className="text-sm text-slate-500">Data tunggakan iuran belum tersedia</p>
          </div>
        )}
      </div>
    </div>
  );
}