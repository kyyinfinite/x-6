import { Users, TrendingUp, Wallet, Calendar, ClipboardList, Bell, Award, ChevronRight, ArrowUpRight, ArrowDownRight, BookOpen, Clock } from "lucide-react";
import { apiGet } from "../lib/api";
import { usePolling } from "../lib/usePolling";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  SkeletonHeroBanner,
  SkeletonStatCards,
  SkeletonPieChart,
  SkeletonKasDashboard,
  SkeletonPiketDashboard,
  SkeletonChart,
  SkeletonAnnouncement,
  SkeletonAgenda,
  SkeletonScheduleMini,
} from "../components/Skeleton";

// ── Types ────────────────────────────────────────────────────
type KehadiranHariIni = {
  tanggal: string;
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
  total: number;
  persentase: number;
  detail: { nis: string; nama: string; status: string; keterangan: string }[];
};

type KehadiranBulananItem = {
  bulan: string;
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
};

type KasData = {
  saldo: number;
  target: number;
  bulanIni: { pemasukan: number; pengeluaran: number; saldo_awal: number };
  riwayat: { id: string; tanggal: string; keterangan: string; jenis: string; jumlah: number; saldo: number }[];
  siswaLunas: number;
  siswaBelumLunas: number;
  iuranPerSiswa?: number;
  frekuensiIuran?: string;
};

type KelasInfo = {
  nama: string;
  tahunAjaran: string;
  waliKelas: string;
  ruangan: string;
  jurusan: string;
  motto: string;
  totalSiswa: number;
  siswaLaki: number;
  siswaPerempuan: number;
};

type DashboardData = {
  kelasInfo: KelasInfo;
  kehadiranHariIni: KehadiranHariIni;
  kehadiranBulanan: KehadiranBulananItem[];
  kasData: KasData;
};

type Pengumuman = {
  id: string;
  judul: string;
  isi: string;
  tanggal: string;
  prioritas: string;
  oleh: string;
};

type Agenda = {
  id: string;
  tanggal: string;
  judul: string;
  kategori: string;
  warna: string;
};

type JadwalItem = { jam: string; mapel: string; guru: string; ruang: string };
type PiketItem = { hari: string; kelompok: number; anggota: string[] };

// ── Helpers ──────────────────────────────────────────────────
const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const DAY_MAP: Record<string, string> = {
  Sunday: "Minggu",
  Monday: "Senin",
  Tuesday: "Selasa",
  Wednesday: "Rabu",
  Thursday: "Kamis",
  Friday: "Jumat",
  Saturday: "Sabtu",
};

const hariIniId = DAY_MAP[new Date().toLocaleString("en-US", { weekday: "long" })] || "Senin";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl p-3 text-sm border border-white/10">
        <p className="text-blue-300 font-semibold mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name}: {p.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ── Empty State Component ────────────────────────────────────
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-2">
        <span className="text-slate-500 text-lg">📭</span>
      </div>
      <p className="text-xs text-slate-500">{message}</p>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────
export default function Dashboard() {
  // Main dashboard data (kelasInfo, kehadiran, kas)
  const { data: dashboardData, error: dashboardError, loading: dashboardLoading } =
    usePolling<DashboardData>(() => apiGet<DashboardData>("/api/dashboard"), 8000);

  // Announcements
  const { data: announcements, error: announcementsError, loading: announcementsLoading } =
    usePolling<Pengumuman[]>(() => apiGet<Pengumuman[]>("/api/announcements"), 15000);

  // Agenda
  const { data: agenda, error: agendaError, loading: agendaLoading } =
    usePolling<Agenda[]>(() => apiGet<Agenda[]>("/api/agenda"), 15000);

  // Schedule (today's jadwal pelajaran)
  const { data: scheduleMap, error: scheduleError, loading: scheduleLoading } =
    usePolling<Record<string, JadwalItem[]>>(() => apiGet<Record<string, JadwalItem[]>>("/api/schedule"), 30000);

  // Piket
  const { data: piketList, error: piketError, loading: piketLoading } =
    usePolling<PiketItem[]>(() => apiGet<PiketItem[]>("/api/schedule?type=piket"), 30000);

  // Derived data
  const kelasInfo = dashboardData?.kelasInfo ?? null;
  const kehadiranHariIni = dashboardData?.kehadiranHariIni ?? null;
  const kehadiranBulanan = dashboardData?.kehadiranBulanan ?? null;
  const kasData = dashboardData?.kasData ?? null;

  const kasProgress = kasData?.target ? (kasData.saldo / kasData.target) * 100 : 0;

  const pieData = kehadiranHariIni
    ? [
        { name: "Hadir", value: kehadiranHariIni.hadir, color: "#22c55e" },
        { name: "Sakit", value: kehadiranHariIni.sakit, color: "#f59e0b" },
        { name: "Izin", value: kehadiranHariIni.izin, color: "#3b82f6" },
        { name: "Alpha", value: kehadiranHariIni.alpha, color: "#ef4444" },
      ]
    : [];

  const jadwalHariIni = scheduleMap
    ? (scheduleMap[hariIniId] ?? Object.values(scheduleMap)[0] ?? [])
    : [];

  const piketHariIni = piketList
    ? (piketList.find((p) => p.hari === hariIniId) ?? piketList[0] ?? null)
    : null;

  // Aggregate errors
  const errors: string[] = [];
  if (dashboardError) errors.push(`Dashboard: ${dashboardError}`);
  if (announcementsError) errors.push(`Pengumuman: ${announcementsError}`);
  if (agendaError) errors.push(`Agenda: ${agendaError}`);
  if (scheduleError) errors.push(`Jadwal: ${scheduleError}`);
  if (piketError) errors.push(`Piket: ${piketError}`);

  return (
    <div className="space-y-6 p-6">
      {/* ── Error Banners ── */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((err, i) => (
            <div
              key={i}
              className="rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 text-xs px-4 py-2.5 flex items-center justify-between"
            >
              <span>⚠️ Gagal memuat data: {err}</span>
            </div>
          ))}
        </div>
      )}

      {/* ─── HERO BANNER ─── */}
      {dashboardLoading ? (
        <SkeletonHeroBanner />
      ) : kelasInfo ? (
        <div
          className="relative rounded-2xl overflow-hidden fade-in-up"
          style={{
            background: "linear-gradient(135deg, #0d1b3e 0%, #0a1628 40%, #0d0f1a 100%)",
            border: "1px solid rgba(99,179,237,0.12)",
          }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute -top-20 -right-20 w-80 h-80 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)" }}
            />
            <div
              className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)" }}
            />
            <div
              className="absolute top-0 left-0 w-full h-full opacity-5"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255,255,255,0.1) 30px, rgba(255,255,255,0.1) 31px), repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(255,255,255,0.1) 30px, rgba(255,255,255,0.1) 31px)",
              }}
            />
          </div>
          <div className="relative z-10 p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow" />
                <span className="text-xs text-green-400 font-semibold tracking-widest uppercase">Sistem Aktif</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black gradient-text tracking-tight">Portal X-6</h1>
              <p className="text-slate-400 text-sm mt-1">
                {kelasInfo.jurusan} &nbsp;|&nbsp; {kelasInfo.tahunAjaran} &nbsp;|&nbsp; {kelasInfo.ruangan}
              </p>
              <p className="text-slate-500 text-xs mt-2 italic">"{kelasInfo.motto}"</p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="glass rounded-xl px-5 py-3 text-right">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Wali Kelas</p>
                <p className="text-white font-bold">{kelasInfo.waliKelas}</p>
              </div>
              <div className="glass rounded-xl px-5 py-3 text-right">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Total Siswa</p>
                <p className="text-2xl font-black text-blue-400">{kelasInfo.totalSiswa}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="relative rounded-2xl overflow-hidden flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #0d1b3e 0%, #0a1628 40%, #0d0f1a 100%)",
            border: "1px solid rgba(99,179,237,0.12)",
            minHeight: "160px",
          }}
        >
          <EmptyState message="Belum ada data kelas" />
        </div>
      )}

      {/* ─── STAT CARDS ROW ─── */}
      {dashboardLoading ? (
        <SkeletonStatCards />
      ) : dashboardData ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Hadir Hari Ini",
              value: `${kehadiranHariIni?.hadir ?? 0} / ${kehadiranHariIni?.total ?? 0}`,
              sub: `${kehadiranHariIni?.persentase ?? 0}% kehadiran`,
              icon: <Users size={20} />,
              color: "from-green-500/20 to-green-900/10",
              border: "border-green-500/20",
              iconColor: "text-green-400",
              trend: kehadiranHariIni ? "Hari ini" : "",
              trendUp: true,
            },
            {
              label: "Saldo Kas",
              value: kasData ? formatRupiah(kasData.saldo) : "-",
              sub: kasData ? `${kasData.siswaLunas} siswa lunas` : "-",
              icon: <Wallet size={20} />,
              color: "from-blue-500/20 to-blue-900/10",
              border: "border-blue-500/20",
              iconColor: "text-blue-400",
              trend: kasData ? `+${formatRupiah(kasData.bulanIni.pemasukan)} bulan ini` : "",
              trendUp: true,
            },
            {
              label: "Rata-rata Nilai",
              value: "86.4",
              sub: "Dari 8 mata pelajaran",
              icon: <Award size={20} />,
              color: "from-purple-500/20 to-purple-900/10",
              border: "border-purple-500/20",
              iconColor: "text-purple-400",
              trend: "+1.2 dari semester lalu",
              trendUp: true,
            },
            {
              label: "Total Siswa",
              value: `${kelasInfo?.totalSiswa ?? "-"}`,
              sub: kelasInfo ? `${kelasInfo.siswaLaki}L / ${kelasInfo.siswaPerempuan}P` : "-",
              icon: <TrendingUp size={20} />,
              color: "from-amber-500/20 to-amber-900/10",
              border: "border-amber-500/20",
              iconColor: "text-amber-400",
              trend: "Kelas Aktif",
              trendUp: true,
            },
          ].map((card, i) => (
            <div
              key={i}
              className={`glass glass-hover rounded-2xl p-4 bg-gradient-to-br ${card.color} border ${card.border} fade-in-up delay-${(i + 1) * 100}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-xl bg-white/5 ${card.iconColor}`}>{card.icon}</div>
                <div className={`flex items-center gap-1 text-xs ${card.trendUp ? "text-green-400" : "text-red-400"}`}>
                  {card.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  <span className="hidden sm:inline truncate max-w-[80px]">{card.trend}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{card.label}</p>
              <p className="text-xl font-black text-white leading-tight">{card.value}</p>
              <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-2xl p-4 border border-white/5 flex items-center justify-center">
              <EmptyState message="Belum ada data" />
            </div>
          ))}
        </div>
      )}

      {/* ─── BENTO GRID MAIN ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Kehadiran Pie + Detail ── */}
        {dashboardLoading ? (
          <SkeletonPieChart />
        ) : kehadiranHariIni && pieData.length > 0 ? (
          <div className="glass rounded-2xl p-5 border border-white/5 fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-green-500/10 text-green-400">
                  <ClipboardList size={16} />
                </div>
                <h2 className="font-bold text-white text-sm">Kehadiran Hari Ini</h2>
              </div>
              <span className="badge bg-green-500/15 text-green-400 border border-green-500/20">
                {kehadiranHariIni.tanggal}
              </span>
            </div>

            <div className="flex items-center justify-center mb-4">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#0d1117",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#e2e8f0",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/3 rounded-xl p-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <p className="text-xs text-slate-400">{item.name}</p>
                    <p className="text-sm font-bold text-white">{item.value} siswa</p>
                  </div>
                </div>
              ))}
            </div>

            {kehadiranHariIni.detail.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Tidak Hadir</p>
                {kehadiranHariIni.detail.map((d, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/3 rounded-xl p-2.5">
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(d.nama)}&background=1e3a5f&color=60a5fa&size=64&bold=true`}
                        alt={d.nama}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-xs font-semibold text-white">{d.nama}</p>
                        <p className="text-xs text-slate-500">{d.keterangan}</p>
                      </div>
                    </div>
                    <span
                      className={`badge ${
                        d.status === "Alpha"
                          ? "bg-red-500/15 text-red-400 border border-red-500/20"
                          : d.status === "Sakit"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                            : "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="glass rounded-2xl p-5 border border-white/5 flex items-center justify-center" style={{ minHeight: 300 }}>
            <EmptyState message="Belum ada data kehadiran" />
          </div>
        )}

        {/* ── Kas Card ── */}
        {dashboardLoading ? (
          <SkeletonKasDashboard />
        ) : kasData ? (
          <div className="glass rounded-2xl p-5 border border-white/5 flex flex-col gap-4 fade-in-up delay-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Wallet size={16} />
                </div>
                <h2 className="font-bold text-white text-sm">Kas Kelas</h2>
              </div>
              <span className="badge bg-blue-500/15 text-blue-400 border border-blue-500/20">Juni 2025</span>
            </div>

            <div
              className="rounded-2xl p-5"
              style={{
                background: "linear-gradient(135deg, #0d1b3e, #0a1628)",
                border: "1px solid rgba(37,99,235,0.2)",
              }}
            >
              <p className="text-xs text-slate-400 uppercase tracking-wider">Saldo Sekarang</p>
              <p className="text-3xl font-black text-white mt-1">{formatRupiah(kasData.saldo)}</p>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Progress Target</span>
                  <span className="text-blue-400 font-semibold">{kasProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5">
                  <div className="progress-bar" style={{ width: `${kasProgress}%` }} />
                </div>
                <p className="text-xs text-slate-500 mt-1.5">Target: {formatRupiah(kasData.target)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-500/8 border border-green-500/15 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <ArrowUpRight size={14} className="text-green-400" />
                  <p className="text-xs text-slate-400">Pemasukan</p>
                </div>
                <p className="text-base font-bold text-green-400">
                  {formatRupiah(kasData.bulanIni.pemasukan)}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Bulan ini</p>
              </div>
              <div className="bg-red-500/8 border border-red-500/15 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <ArrowDownRight size={14} className="text-red-400" />
                  <p className="text-xs text-slate-400">Pengeluaran</p>
                </div>
                <p className="text-base font-bold text-red-400">
                  {formatRupiah(kasData.bulanIni.pengeluaran)}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Bulan ini</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Status Iuran</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-xs text-slate-300">
                    Lunas: <strong className="text-green-400">{kasData.siswaLunas}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-xs text-slate-300">
                    Belum: <strong className="text-red-400">{kasData.siswaBelumLunas}</strong>
                  </span>
                </div>
              </div>
            </div>

            {kasData.riwayat.length > 0 ? (
              <div className="space-y-2 flex-1 overflow-y-auto max-h-52">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Riwayat Transaksi</p>
                {kasData.riwayat.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between py-2 border-b border-white/5 table-row-hover rounded-lg px-1"
                  >
                    <div>
                      <p className="text-xs font-semibold text-white">{r.keterangan}</p>
                      <p className="text-xs text-slate-500">{r.tanggal}</p>
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        r.jenis === "Masuk" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {r.jenis === "Masuk" ? "+" : "-"}
                      {formatRupiah(r.jumlah)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1">
                <EmptyState message="Belum ada riwayat transaksi" />
              </div>
            )}
          </div>
        ) : (
          <div className="glass rounded-2xl p-5 border border-white/5 flex items-center justify-center" style={{ minHeight: 300 }}>
            <EmptyState message="Belum ada data kas" />
          </div>
        )}

        {/* ── Jadwal Piket Hari Ini ── */}
        {piketLoading && scheduleLoading ? (
          <SkeletonPiketDashboard />
        ) : (
          <div className="glass rounded-2xl p-5 border border-white/5 flex flex-col gap-4 fade-in-up delay-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <Calendar size={16} />
                </div>
                <h2 className="font-bold text-white text-sm">Piket Hari Ini</h2>
              </div>
              <span className="badge bg-purple-500/15 text-purple-400 border border-purple-500/20">
                {piketHariIni
                  ? `${piketHariIni.hari} - Kelompok ${piketHariIni.kelompok}`
                  : hariIniId}
              </span>
            </div>

            {piketHariIni && piketHariIni.anggota.length > 0 ? (
              <div className="space-y-2.5">
                {piketHariIni.anggota.map((nama, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-white/3 hover:bg-white/5 transition-all rounded-xl p-2.5"
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(nama)}&background=${["1e3a5f", "3b1f6b", "0f3a2e", "3b1a1a"][i % 4]}&color=${["60a5fa", "c084fc", "34d399", "f87171"][i % 4]}&size=64&bold=true`}
                      alt={nama}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10"
                    />
                    <div>
                      <p className="text-sm font-semibold text-white">{nama}</p>
                      <p className="text-xs text-slate-500">Piket Kebersihan</p>
                    </div>
                    <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse-slow" />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="Belum ada jadwal piket hari ini" />
            )}

            {/* Mini Jadwal Pelajaran */}
            <div>
              <div className="flex items-center gap-2 mb-3 mt-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <BookOpen size={14} />
                </div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">Jadwal Pelajaran</p>
              </div>
              {scheduleLoading ? (
                <SkeletonScheduleMini />
              ) : jadwalHariIni.length > 0 ? (
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {jadwalHariIni.slice(0, 6).map((j, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                        j.mapel === "Istirahat" || j.mapel === "Ishoma"
                          ? "bg-white/2 opacity-60"
                          : "bg-white/3 hover:bg-white/5 transition-all"
                      }`}
                    >
                      <div className="flex items-center gap-1 text-slate-500">
                        <Clock size={10} />
                        <span className="text-xs w-24 flex-shrink-0">{j.jam}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs font-semibold truncate ${
                            j.mapel === "Istirahat" || j.mapel === "Ishoma"
                              ? "text-slate-500"
                              : "text-white"
                          }`}
                        >
                          {j.mapel}
                        </p>
                        {j.guru !== "-" && <p className="text-xs text-slate-600 truncate">{j.guru}</p>}
                      </div>
                      {j.ruang !== "-" && (
                        <span className="text-xs text-blue-500 flex-shrink-0">{j.ruang}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="Belum ada jadwal pelajaran" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── SECOND ROW: Chart + Pengumuman + Agenda ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart Kehadiran Bulanan */}
        {dashboardLoading ? (
          <SkeletonChart />
        ) : kehadiranBulanan && kehadiranBulanan.length > 0 ? (
          <div className="lg:col-span-2 glass rounded-2xl p-5 border border-white/5 fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <TrendingUp size={16} />
                </div>
                <h2 className="font-bold text-white text-sm">Tren Kehadiran Bulanan</h2>
              </div>
              <span className="text-xs text-slate-500">Semester Genap 2025</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={kehadiranBulanan} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAlpha" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="bulan" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[60, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="hadir"
                  name="Hadir"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#colorHadir)"
                  dot={{ fill: "#22c55e", r: 3, strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="alpha"
                  name="Alpha"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#colorAlpha)"
                  dot={{ fill: "#ef4444", r: 3, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-slate-400">Persentase Hadir (%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs text-slate-400">Persentase Alpha (%)</span>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="lg:col-span-2 glass rounded-2xl p-5 border border-white/5 flex items-center justify-center"
            style={{ minHeight: 300 }}
          >
            <EmptyState message="Belum ada data kehadiran bulanan" />
          </div>
        )}

        {/* Pengumuman */}
        {announcementsLoading ? (
          <SkeletonAnnouncement />
        ) : announcements && announcements.length > 0 ? (
          <div className="glass rounded-2xl p-5 border border-white/5 flex flex-col fade-in-up delay-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Bell size={16} />
                </div>
                <h2 className="font-bold text-white text-sm">Pengumuman</h2>
              </div>
              <span className="badge bg-amber-500/15 text-amber-400 border border-amber-500/20">
                {announcements.length} Baru
              </span>
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto">
              {announcements.map((p) => (
                <div
                  key={p.id}
                  className="bg-white/3 hover:bg-white/5 transition-all rounded-xl p-3.5 cursor-pointer group border border-transparent hover:border-white/8"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-white leading-snug group-hover:text-blue-300 transition-colors">
                      {p.judul}
                    </p>
                    <ChevronRight
                      size={14}
                      className="text-slate-600 group-hover:text-blue-400 flex-shrink-0 mt-0.5 transition-colors"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{p.isi}</p>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-xs text-slate-600">
                      {p.tanggal} &middot; {p.oleh}
                    </span>
                    <span
                      className={`badge ${
                        p.prioritas === "Tinggi"
                          ? "bg-red-500/15 text-red-400 border border-red-500/20"
                          : p.prioritas === "Sedang"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                            : "bg-slate-500/15 text-slate-400 border border-slate-500/20"
                      }`}
                    >
                      {p.prioritas}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className="glass rounded-2xl p-5 border border-white/5 flex items-center justify-center"
            style={{ minHeight: 300 }}
          >
            <EmptyState message="Belum ada pengumuman" />
          </div>
        )}
      </div>

      {/* ─── AGENDA MENDATANG ─── */}
      {agendaLoading ? (
        <SkeletonAgenda />
      ) : agenda && agenda.length > 0 ? (
        <div className="glass rounded-2xl p-5 border border-white/5 fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Calendar size={16} />
              </div>
              <h2 className="font-bold text-white text-sm">Agenda Mendatang</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {agenda.map((a) => {
              const colors: Record<string, string> = {
                blue: "from-blue-500/15 to-transparent border-blue-500/20 text-blue-400",
                red: "from-red-500/15 to-transparent border-red-500/20 text-red-400",
                green: "from-green-500/15 to-transparent border-green-500/20 text-green-400",
                purple: "from-purple-500/15 to-transparent border-purple-500/20 text-purple-400",
              };
              const iconColors: Record<string, string> = {
                blue: "bg-blue-500/15 text-blue-400",
                red: "bg-red-500/15 text-red-400",
                green: "bg-green-500/15 text-green-400",
                purple: "bg-purple-500/15 text-purple-400",
              };
              return (
                <div
                  key={a.id}
                  className={`flex items-center gap-3 bg-gradient-to-r ${colors[a.warna] || colors.blue} rounded-xl p-3.5 border glass-hover`}
                >
                  <div className={`p-2 rounded-xl flex-shrink-0 ${iconColors[a.warna] || iconColors.blue}`}>
                    <Calendar size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{a.judul}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {a.tanggal} &middot;{" "}
                      <span className={(colors[a.warna] || colors.blue).split(" ")[4]}>
                        {a.kategori}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl p-5 border border-white/5 flex items-center justify-center" style={{ minHeight: 120 }}>
          <EmptyState message="Belum ada agenda mendatang" />
        </div>
      )}
    </div>
  );
}