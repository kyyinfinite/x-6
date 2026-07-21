import { useState } from "react";
import { Search, Users, Filter, ChevronUp, ChevronDown, Award, User } from "lucide-react";
import { apiGet } from "../lib/api";
import { usePolling } from "../lib/usePolling";
import { Skeleton, SkeletonCard, SkeletonRow } from "../components/Skeleton";

type Siswa = { id: string; nis: string; nama: string; jenisKelamin: string; jabatan: string; foto: string; nilaiRata: number; status: string };

export default function DataSiswa() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"nama" | "nilaiRata">("nama");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filter, setFilter] = useState<"Semua" | "L" | "P">("Semua");

  const { data, error, loading } = usePolling(() => apiGet<Siswa[]>("/api/students"), 10000);
  const siswaList = data ?? [];

  const filtered = siswaList
    .filter((s) => {
      const matchQuery = s.nama.toLowerCase().includes(query.toLowerCase()) || s.nis.includes(query);
      const matchFilter = filter === "Semua" || s.jenisKelamin === filter;
      return matchQuery && matchFilter;
    })
    .sort((a, b) => {
      const valA = sortBy === "nama" ? a.nama : a.nilaiRata;
      const valB = sortBy === "nama" ? b.nama : b.nilaiRata;
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const toggleSort = (key: "nama" | "nilaiRata") => {
    if (sortBy === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortBy(key); setSortDir("asc"); }
  };

  const avgNilai = siswaList.length
    ? (siswaList.reduce((a, s) => a + s.nilaiRata, 0) / siswaList.length).toFixed(1)
    : "0.0";
  const topSiswa = siswaList.length ? [...siswaList].sort((a, b) => b.nilaiRata - a.nilaiRata)[0] : null;

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="w-40 h-7" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
        <div className="glass rounded-2xl border border-ink/10 p-4 space-y-3">
          {[0, 1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {error && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-700 text-xs px-4 py-2.5">
          ⚠️ Gagal memuat data siswa dari server ({error}).
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black gradient-text">Data Siswa</h1>
          <p className="text-ink-soft text-sm mt-1">Total {siswaList.length} siswa terdaftar di kelas X-6</p>
        </div>
        <div className="flex items-center gap-3">
          {["Semua", "L", "P"].map((f) => (
            <button key={f} onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${filter === f ? "bg-sage border-sage text-ink" : "glass border-ink/15 text-ink-soft hover:text-ink"}`}>
              {f === "L" ? "Laki-laki" : f === "P" ? "Perempuan" : "Semua"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Siswa", value: siswaList.length, icon: <Users size={16} />, color: "text-sage" },
          { label: "Laki-laki", value: siswaList.filter(s => s.jenisKelamin === "L").length, icon: <User size={16} />, color: "text-sage" },
          { label: "Perempuan", value: siswaList.filter(s => s.jenisKelamin === "P").length, icon: <User size={16} />, color: "text-pink-600" },
          { label: "Rata-rata Nilai", value: avgNilai, icon: <Award size={16} />, color: "text-amber-600" },
        ].map((s, i) => (
          <div key={i} className="glass rounded-xl p-4 border border-ink/10">
            <div className={`mb-2 ${s.color}`}>{s.icon}</div>
            <p className="text-2xl font-black text-ink">{s.value}</p>
            <p className="text-xs text-ink-soft mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Top Student */}
      {topSiswa && (
        <div className="glass rounded-2xl p-4 border border-amber-500/15 bg-gradient-to-r from-amber-500/8 to-transparent">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={topSiswa.foto} alt={topSiswa.nama} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-500/40" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                <Award size={10} className="text-ink" />
              </div>
            </div>
            <div>
              <p className="text-xs text-amber-600 uppercase tracking-wider font-semibold">Siswa Berprestasi</p>
              <p className="text-lg font-black text-ink">{topSiswa.nama}</p>
              <p className="text-xs text-ink-soft">{topSiswa.jabatan} &middot; NIS: {topSiswa.nis}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-3xl font-black text-amber-600">{topSiswa.nilaiRata}</p>
              <p className="text-xs text-ink-faint">Nilai Rata-rata</p>
            </div>
          </div>
        </div>
      )}

      {/* Search & Table */}
      <div className="glass rounded-2xl border border-ink/10 overflow-hidden">
        <div className="p-4 border-b border-ink/10 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type="text"
              placeholder="Cari nama atau NIS..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-black/[0.05] border border-ink/15 rounded-xl pl-9 pr-4 py-2.5 text-sm text-ink placeholder-ink focus:outline-none focus:border-sage/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-soft">
            <Filter size={12} />
            <span>{filtered.length} hasil</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink/10">
                <th className="text-left p-4 text-xs text-ink-faint uppercase tracking-wider">#</th>
                <th className="text-left p-4 text-xs text-ink-faint uppercase tracking-wider">Foto</th>
                <th className="text-left p-4 text-xs text-ink-faint uppercase tracking-wider">
                  <button className="flex items-center gap-1 hover:text-ink transition-colors" onClick={() => toggleSort("nama")}>
                    Nama {sortBy === "nama" ? (sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}
                  </button>
                </th>
                <th className="text-left p-4 text-xs text-ink-faint uppercase tracking-wider">NIS</th>
                <th className="text-left p-4 text-xs text-ink-faint uppercase tracking-wider">Jabatan</th>
                <th className="text-left p-4 text-xs text-ink-faint uppercase tracking-wider">JK</th>
                <th className="text-left p-4 text-xs text-ink-faint uppercase tracking-wider">
                  <button className="flex items-center gap-1 hover:text-ink transition-colors" onClick={() => toggleSort("nilaiRata")}>
                    Nilai {sortBy === "nilaiRata" ? (sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}
                  </button>
                </th>
                <th className="text-left p-4 text-xs text-ink-faint uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} className="border-b border-ink/10 table-row-hover transition-all">
                  <td className="p-4 text-xs text-ink-faint">{i + 1}</td>
                  <td className="p-4">
                    <img src={s.foto} alt={s.nama} className="w-9 h-9 rounded-xl object-cover ring-1 ring-ink/10" />
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-semibold text-ink">{s.nama}</p>
                  </td>
                  <td className="p-4 text-xs text-ink-soft font-mono">{s.nis}</td>
                  <td className="p-4">
                    <span className={`badge ${s.jabatan !== "Anggota" ? "bg-sage/15 text-sage border border-sage/20" : "bg-black/[0.05] text-ink-soft border border-ink/15"}`}>
                      {s.jabatan}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`badge ${s.jenisKelamin === "L" ? "bg-sage/10 text-sage border border-sage/15" : "bg-pink-500/10 text-pink-600 border border-pink-500/15"}`}>
                      {s.jenisKelamin === "L" ? "L" : "P"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-black/[0.05] rounded-full h-1">
                        <div className="h-1 rounded-full" style={{ width: `${(s.nilaiRata / 100) * 100}%`, background: s.nilaiRata >= 90 ? "#5B8A5E" : s.nilaiRata >= 80 ? "#A6772C" : "#C99A44" }} />
                      </div>
                      <span className={`text-xs font-bold ${s.nilaiRata >= 90 ? "text-green-600" : s.nilaiRata >= 80 ? "text-sage" : "text-amber-600"}`}>{s.nilaiRata}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="badge bg-green-500/10 text-green-600 border border-green-500/15">{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-ink-faint">
              <Users size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">{siswaList.length === 0 ? "Belum ada data siswa" : "Tidak ada siswa ditemukan"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
