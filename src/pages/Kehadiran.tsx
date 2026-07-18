import { useEffect, useState } from "react";
import { ClipboardList, Check, X, AlertCircle, Clock, BarChart3 } from "lucide-react";
import { apiGet, apiPost, hasAdminKey, setAdminKey } from "../lib/api";
import { usePolling } from "../lib/usePolling";
import {
  SkeletonStatCards,
  SkeletonAttendanceGrid,
  SkeletonChart,
  SkeletonDaySelector,
} from "../components/Skeleton";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const HARI_LIST = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

type StatusType = "Hadir" | "Sakit" | "Izin" | "Alpha";

type Siswa = {
  id: string;
  nis: string;
  nama: string;
  jenisKelamin: string;
  jabatan: string;
  foto: string;
  nilaiRata: number;
  status: string;
};

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

const STATUS_TO_BACKEND: Record<StatusType, string> = {
  Hadir: "hadir",
  Sakit: "sakit",
  Izin: "izin",
  Alpha: "alpha",
};

const STATUS_FROM_BACKEND: Record<string, StatusType> = {
  hadir: "Hadir",
  sakit: "Sakit",
  izin: "Izin",
  alpha: "Alpha",
};

export default function Kehadiran() {
  const [selectedHari, setSelectedHari] = useState("Senin");
  const [statusMap, setStatusMap] = useState<Record<string, StatusType>>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    data: siswaList,
    loading: loadingSiswa,
    error: errorSiswa,
  } = usePolling<Siswa[]>(() => apiGet<Siswa[]>("/api/students"), 15000);

  const {
    data: kehadiranHariIni,
    loading: loadingKehadiran,
    error: errorKehadiran,
  } = usePolling<KehadiranHariIni>(() => apiGet<KehadiranHariIni>("/api/attendance?view=today"), 8000);

  const {
    data: kehadiranBulanan,
    loading: loadingBulanan,
    error: errorBulanan,
  } = usePolling<KehadiranBulananItem[]>(() => apiGet<KehadiranBulananItem[]>("/api/attendance?view=monthly"), 30000);

  const anyLoading = loadingSiswa || loadingKehadiran || loadingBulanan;
  const gridReady = !loadingSiswa && !loadingKehadiran && !!siswaList && !!kehadiranHariIni;

  // Initialize statusMap when both students and today's attendance are loaded
  useEffect(() => {
    if (!siswaList || !kehadiranHariIni) return;

    const initial: Record<string, StatusType> = Object.fromEntries(
      siswaList.map((s) => {
        const detail = kehadiranHariIni.detail.find(
          (d) => d.nis === s.nis || d.nama === s.nama
        );
        // Default to "Hadir", override if the student has a non-hadir record today
        const status = detail && detail.status !== "hadir"
          ? (STATUS_FROM_BACKEND[detail.status] ?? "Hadir")
          : "Hadir";
        return [s.nama, status];
      })
    );
    setStatusMap(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siswaList, kehadiranHariIni?.tanggal]);

  const hadir = Object.values(statusMap).filter((v) => v === "Hadir").length;
  const sakit = Object.values(statusMap).filter((v) => v === "Sakit").length;
  const izin = Object.values(statusMap).filter((v) => v === "Izin").length;
  const alpha = Object.values(statusMap).filter((v) => v === "Alpha").length;

  const setStatus = (nama: string, status: StatusType) => {
    setStatusMap((prev) => ({ ...prev, [nama]: status }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!hasAdminKey()) {
      const key = window.prompt("Masukkan admin API key untuk menyimpan perubahan absensi:");
      if (!key) return;
      setAdminKey(key);
    }

    setSaving(true);
    try {
      await Promise.all(
        Object.entries(statusMap).map(([nama, status]) =>
          apiPost("/api/attendance", { studentName: nama, status: STATUS_TO_BACKEND[status] })
        )
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Gagal menyimpan absensi");
    } finally {
      setSaving(false);
    }
  };

  const statusConfig: Record<StatusType, { label: string; class: string; bg: string }> = {
    Hadir: { label: "Hadir", class: "text-green-400 border-green-500/30 bg-green-500/10", bg: "bg-green-500/10" },
    Sakit: { label: "Sakit", class: "text-amber-400 border-amber-500/30 bg-amber-500/10", bg: "bg-amber-500/10" },
    Izin: { label: "Izin", class: "text-blue-400 border-blue-500/30 bg-blue-500/10", bg: "bg-blue-500/10" },
    Alpha: { label: "Alpha", class: "text-red-400 border-red-500/30 bg-red-500/10", bg: "bg-red-500/10" },
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black gradient-text">Absensi Kehadiran</h1>
          <p className="text-slate-400 text-sm mt-1">Rekap dan input kehadiran siswa kelas X-6</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || anyLoading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 ${
            saved
              ? "bg-green-600 text-white"
              : "bg-blue-600 hover:bg-blue-500 text-white"
          }`}
        >
          {saved ? <Check size={14} /> : <ClipboardList size={14} />}
          {saving ? "Menyimpan..." : saved ? "Tersimpan!" : "Simpan Absensi"}
        </button>
      </div>

      {/* Error banners */}
      {(errorSiswa || errorKehadiran || errorBulanan) && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <div className="flex items-center gap-2 mb-1 font-semibold">
            <AlertCircle size={16} />
            Gagal memuat data
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-xs text-red-400/80">
            {errorSiswa && <li>Data siswa: {errorSiswa}</li>}
            {errorKehadiran && <li>Kehadiran hari ini: {errorKehadiran}</li>}
            {errorBulanan && <li>Rekap bulanan: {errorBulanan}</li>}
          </ul>
        </div>
      )}

      {/* Stats */}
      {anyLoading ? (
        <SkeletonStatCards count={4} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Hadir", value: hadir, icon: <Check size={16} />, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
            { label: "Sakit", value: sakit, icon: <AlertCircle size={16} />, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
            { label: "Izin", value: izin, icon: <Clock size={16} />, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
            { label: "Alpha", value: alpha, icon: <X size={16} />, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
          ].map((s, i) => (
            <div key={i} className={`glass rounded-xl p-4 border ${s.bg}`}>
              <div className={`mb-2 ${s.color}`}>{s.icon}</div>
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Hari Selector */}
      {anyLoading ? (
        <SkeletonDaySelector count={5} />
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {HARI_LIST.map((h) => (
            <button
              key={h}
              onClick={() => setSelectedHari(h)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap border transition-all flex-shrink-0 ${
                selectedHari === h
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "glass border-white/8 text-slate-400 hover:text-white"
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      )}

      {/* Absensi Grid */}
      {anyLoading ? (
        <SkeletonAttendanceGrid count={16} />
      ) : gridReady && siswaList!.length > 0 ? (
        <div className="glass rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <ClipboardList size={16} />
              </div>
              <h3 className="font-bold text-white text-sm">
                Daftar Hadir - {selectedHari}, {kehadiranHariIni!.tanggal}
              </h3>
            </div>
            <span className="text-xs text-slate-500">{siswaList!.length} siswa</span>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {siswaList!.map((s) => {
                const currentStatus = statusMap[s.nama];
                return (
                  <div
                    key={s.nama}
                    className="flex items-center gap-3 bg-white/3 rounded-xl p-3 border border-white/3"
                  >
                    <span className="text-xs text-slate-600 w-5 text-center font-mono">
                      {s.id}
                    </span>
                    <img
                      src={s.foto}
                      alt={s.nama}
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/10 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{s.nama}</p>
                      <p className="text-xs text-slate-500">{s.nis}</p>
                    </div>
                    <div className="flex gap-1">
                      {(["Hadir", "Sakit", "Izin", "Alpha"] as StatusType[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => setStatus(s.nama, st)}
                          className={`text-xs px-2 py-1 rounded-lg border font-semibold transition-all ${
                            currentStatus === st
                              ? statusConfig[st].class
                              : "border-white/5 text-slate-600 hover:text-slate-400 bg-transparent"
                          }`}
                        >
                          {st === "Hadir" ? "H" : st === "Sakit" ? "S" : st === "Izin" ? "I" : "A"}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : gridReady && siswaList!.length === 0 ? (
        <div className="glass rounded-2xl border border-white/5 p-12 text-center">
          <div className="mx-auto mb-3 p-3 rounded-2xl bg-white/5 w-fit">
            <ClipboardList size={28} className="text-slate-500" />
          </div>
          <p className="text-sm font-semibold text-slate-300">Belum ada data siswa</p>
          <p className="text-xs text-slate-500 mt-1">
            Data siswa belum tersedia untuk kelas ini
          </p>
        </div>
      ) : null}

      {/* Chart */}
      {anyLoading ? (
        <SkeletonChart height={200} />
      ) : kehadiranBulanan && kehadiranBulanan.length > 0 ? (
        <div className="glass rounded-2xl p-5 border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-slate-400" />
            <h3 className="font-bold text-white text-sm">Rekap Kehadiran Bulanan (%)</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={kehadiranBulanan}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="bulan"
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                domain={[60, 100]}
              />
              <Tooltip
                contentStyle={{
                  background: "#0d1117",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#e2e8f0",
                }}
              />
              <Bar dataKey="hadir" name="Hadir" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="sakit" name="Sakit" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="izin" name="Izin" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="alpha" name="Alpha" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-white/5 p-12 text-center">
          <div className="mx-auto mb-3 p-3 rounded-2xl bg-white/5 w-fit">
            <BarChart3 size={28} className="text-slate-500" />
          </div>
          <p className="text-sm font-semibold text-slate-300">Belum ada data kehadiran bulanan</p>
          <p className="text-xs text-slate-500 mt-1">
            Data rekap kehadiran bulanan akan muncul setelah ada data absensi
          </p>
        </div>
      )}
    </div>
  );
}