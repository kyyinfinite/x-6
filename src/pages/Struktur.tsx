import { Star, Shield, PenLine, Wallet, Users } from "lucide-react";
import { apiGet } from "../lib/api";
import { usePolling } from "../lib/usePolling";
import { Skeleton, SkeletonBlock } from "../components/Skeleton";

type Siswa = { id: string; nis: string; nama: string; jenisKelamin: string; jabatan: string; foto: string; nilaiRata: number; status: string };
type Pengurus = { nama: string; jabatan: string; foto: string; nis: string };
type StrukturData = { waliKelas: { nama: string; foto: string; jabatan: string }; pengurusInti: Pengurus[] };

const emptyStruktur: StrukturData = { waliKelas: { nama: "", foto: "", jabatan: "Wali Kelas" }, pengurusInti: [] };

const jabatanIcons: Record<string, React.ReactNode> = {
  "Ketua Kelas": <Shield size={14} />,
  "Wakil Ketua": <Star size={14} />,
  "Sekretaris I": <PenLine size={14} />,
  "Sekretaris II": <PenLine size={14} />,
  "Bendahara I": <Wallet size={14} />,
  "Bendahara II": <Wallet size={14} />,
};

const jabatanColors: Record<string, string> = {
  "Ketua Kelas": "border-sage/40 from-sage/10 text-sage bg-sage/10",
  "Wakil Ketua": "border-purple-500/40 from-purple-500/10 text-purple-600 bg-purple-500/10",
  "Sekretaris I": "border-green-500/40 from-green-500/10 text-green-600 bg-green-500/10",
  "Sekretaris II": "border-green-500/40 from-green-500/10 text-green-600 bg-green-500/10",
  "Bendahara I": "border-amber-500/40 from-amber-500/10 text-amber-600 bg-amber-500/10",
  "Bendahara II": "border-amber-500/40 from-amber-500/10 text-amber-600 bg-amber-500/10",
};

export default function Struktur() {
  const { data: strukturData, error: strukturError, loading: strukturLoading } = usePolling(
    () => apiGet<StrukturData>("/api/org-structure"), 30000
  );
  const { data: siswaListData, error: siswaError, loading: siswaLoading } = usePolling(
    () => apiGet<Siswa[]>("/api/students"), 30000
  );

  const { waliKelas, pengurusInti } = strukturData ?? emptyStruktur;
  const siswaList = siswaListData ?? [];
  const error = strukturError || siswaError;
  const loading = strukturLoading || siswaLoading;

  const ketua = pengurusInti.filter(p => p.jabatan === "Ketua Kelas");
  const lainnya = pengurusInti.filter(p => p.jabatan !== "Ketua Kelas");

  if (loading) {
    return (
      <div className="space-y-8 p-6">
        <Skeleton className="w-56 h-7" />
        <div className="flex justify-center"><Skeleton className="w-24 h-24 rounded-3xl" /></div>
        <SkeletonBlock />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {error && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-700 text-xs px-4 py-2.5">
          ⚠️ Gagal memuat struktur organisasi dari server ({error}).
        </div>
      )}
      <div>
        <h1 className="text-2xl font-black gradient-text">Struktur Organisasi</h1>
        <p className="text-ink-soft text-sm mt-1">Pengurus kelas X-6</p>
      </div>

      {/* Wali Kelas */}
      {waliKelas.nama ? (
        <>
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl blur-xl opacity-30 bg-sage" />
                <img src={waliKelas.foto} alt={waliKelas.nama} className="relative w-24 h-24 rounded-3xl object-cover ring-2 ring-sage/50 glow-blue" />
              </div>
              <div className="text-center">
                <span className="badge bg-sage/15 text-sage border border-sage/30 mb-1.5 block">Wali Kelas</span>
                <p className="text-lg font-black text-ink">{waliKelas.nama}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-px h-8 bg-gradient-to-b from-sage/50 to-transparent" />
          </div>
        </>
      ) : (
        <div className="glass rounded-2xl p-6 border border-ink/10 text-center">
          <Users size={28} className="mx-auto mb-2 text-ink-faint" />
          <p className="text-sm text-ink-faint">Data wali kelas belum diisi.</p>
        </div>
      )}

      {/* Ketua */}
      {ketua.length > 0 && (
        <div className="flex justify-center">
          {ketua.map((p) => {
            const siswa = siswaList.find(s => s.nis === p.nis);
            const cls = jabatanColors[p.jabatan];
            return (
              <div key={p.nis || p.nama} className={`glass rounded-2xl p-5 border bg-gradient-to-br ${cls.split(" ")[0]} ${cls.split(" ")[1]} flex flex-col items-center gap-3 w-52`}>
                <div className="relative">
                  <img src={p.foto} alt={p.nama} className="w-20 h-20 rounded-2xl object-cover ring-2 ring-sage/30" />
                  <div className={`absolute -bottom-2 -right-2 w-7 h-7 rounded-xl flex items-center justify-center ${cls.split(" ")[3]}`}>
                    {jabatanIcons[p.jabatan]}
                  </div>
                </div>
                <div className="text-center">
                  <span className={`badge border ${cls.split(" ")[0]} ${cls.split(" ")[2]} ${cls.split(" ")[3]} mb-1 block`}>{p.jabatan}</span>
                  <p className="text-sm font-bold text-ink">{p.nama}</p>
                  {p.nis && <p className="text-xs text-ink-faint">NIS: {p.nis}</p>}
                  {siswa && <p className="text-xs text-ink-faint mt-0.5">Nilai: <span className="text-ink font-semibold">{siswa.nilaiRata}</span></p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Wakil + Sekretaris + Bendahara */}
      {lainnya.length > 0 && (
        <>
          <div className="flex justify-center">
            <div className="w-px h-8 bg-gradient-to-b from-purple-500/30 to-transparent" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {lainnya.map((p) => {
              const siswa = siswaList.find(s => s.nis === p.nis);
              const cls = jabatanColors[p.jabatan] || "border-ink/15 from-white/5 text-ink-soft bg-black/[0.05]";
              return (
                <div key={p.nis || p.nama} className={`glass rounded-2xl p-4 border bg-gradient-to-br ${cls.split(" ")[0]} ${cls.split(" ")[1]} flex flex-col items-center gap-3 glass-hover`}>
                  <div className="relative">
                    <img src={p.foto} alt={p.nama} className="w-16 h-16 rounded-xl object-cover ring-1 ring-ink/10" />
                    <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-lg flex items-center justify-center text-xs ${cls.split(" ")[3]}`}>
                      {jabatanIcons[p.jabatan]}
                    </div>
                  </div>
                  <div className="text-center">
                    <span className={`badge border text-xs ${cls.split(" ")[0]} ${cls.split(" ")[2]} ${cls.split(" ")[3]} mb-1 block`}>{p.jabatan}</span>
                    <p className="text-xs font-bold text-ink">{p.nama}</p>
                    {p.nis && <p className="text-xs text-ink-faint mt-0.5">NIS: {p.nis}</p>}
                    {siswa && <p className="text-xs text-ink-faint mt-0.5">Nilai: <span className="text-ink font-semibold">{siswa.nilaiRata}</span></p>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Anggota Grid */}
      <div className="glass rounded-2xl border border-ink/10 overflow-hidden">
        <div className="p-4 border-b border-ink/10">
          <h3 className="font-bold text-ink text-sm">Seluruh Anggota Kelas X-6</h3>
        </div>
        {siswaList.length === 0 ? (
          <p className="text-xs text-ink-faint text-center py-10">Belum ada data siswa.</p>
        ) : (
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {siswaList.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-2 glass-hover rounded-xl p-3 bg-black/[0.02] border border-ink/10 text-center">
                <img src={s.foto} alt={s.nama} className="w-12 h-12 rounded-xl object-cover ring-1 ring-ink/10" />
                <div>
                  <p className="text-xs font-semibold text-ink leading-tight">{s.nama.split(" ").slice(0, 2).join(" ")}</p>
                  <p className="text-xs text-ink-faint mt-0.5">{s.nis}</p>
                  {s.jabatan !== "Anggota" && (
                    <span className="badge bg-sage/10 text-sage border border-sage/15 mt-1 block">{s.jabatan}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
