import { Star, Shield, PenLine, Wallet, Network } from "lucide-react";
import { apiGet } from "../lib/api";
import { usePolling } from "../lib/usePolling";
import {
  SkeletonOrgStructure,
  SkeletonOrgCard,
  SkeletonMemberGrid,
} from "../components/Skeleton";

// ── Types ────────────────────────────────────────────────────
type StrukturOrg = {
  waliKelas: { nama: string; foto: string; jabatan: string };
  pengurusInti: {
    nama: string;
    jabatan: string;
    foto: string;
    nis: string;
  }[];
};

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

// ── Icon & color mappings ────────────────────────────────────
const jabatanIcons: Record<string, React.ReactNode> = {
  "Ketua Kelas": <Shield size={14} />,
  "Wakil Ketua": <Star size={14} />,
  "Sekretaris I": <PenLine size={14} />,
  "Sekretaris II": <PenLine size={14} />,
  "Bendahara I": <Wallet size={14} />,
  "Bendahara II": <Wallet size={14} />,
};

const jabatanColors: Record<string, string> = {
  "Ketua Kelas":
    "border-blue-500/40 from-blue-500/10 text-blue-400 bg-blue-500/10",
  "Wakil Ketua":
    "border-purple-500/40 from-purple-500/10 text-purple-400 bg-purple-500/10",
  "Sekretaris I":
    "border-green-500/40 from-green-500/10 text-green-400 bg-green-500/10",
  "Sekretaris II":
    "border-green-500/40 from-green-500/10 text-green-400 bg-green-500/10",
  "Bendahara I":
    "border-amber-500/40 from-amber-500/10 text-amber-400 bg-amber-500/10",
  "Bendahara II":
    "border-amber-500/40 from-amber-500/10 text-amber-400 bg-amber-500/10",
};

export default function Struktur() {
  const { data: strukturData, loading: strukturLoading, error: strukturError } =
    usePolling<StrukturOrg>(
      () => apiGet<StrukturOrg>("/api/org-structure"),
      30000
    );
  const { data: siswaList, loading: siswaLoading, error: siswaError } =
    usePolling<Siswa[]>(() => apiGet<Siswa[]>("/api/students"), 30000);

  const waliKelas = strukturData?.waliKelas ?? null;
  const pengurusInti = strukturData?.pengurusInti ?? [];
  const hasOrgData = Boolean(waliKelas?.nama && pengurusInti.length > 0);
  const hasStudents = Boolean(siswaList && siswaList.length > 0);
  const isLoading = strukturLoading || siswaLoading;
  const error = strukturError || siswaError;

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black gradient-text flex items-center gap-2">
          <Network size={22} />
          Struktur Organisasi
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Pengurus kelas X-6 Tahun Ajaran 2024/2025
        </p>
      </div>

      {/* Error banner */}
      {error && !isLoading && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-300 text-xs px-4 py-2.5">
          ⚠️ Gagal memuat data dari server ({error}).
        </div>
      )}

      {/* ── Wali Kelas ─────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex justify-center">
          <SkeletonOrgStructure />
        </div>
      ) : !hasOrgData ? (
        <div className="flex justify-center">
          <div className="glass rounded-2xl border border-white/5 p-8 text-center">
            <Network className="mx-auto text-slate-600 mb-3" size={32} />
            <p className="text-slate-500 text-sm">
              Belum ada data struktur organisasi
            </p>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl blur-xl opacity-30 bg-blue-500" />
              <img
                src={waliKelas!.foto}
                alt={waliKelas!.nama}
                className="relative w-24 h-24 rounded-3xl object-cover ring-2 ring-blue-500/50 glow-blue"
              />
            </div>
            <div className="text-center">
              <span className="badge bg-blue-500/15 text-blue-400 border border-blue-500/30 mb-1.5 block">
                Wali Kelas
              </span>
              <p className="text-lg font-black text-white">{waliKelas!.nama}</p>
              <p className="text-xs text-slate-500">{waliKelas!.jabatan}</p>
            </div>
          </div>
        </div>
      )}

      {/* Connector */}
      {hasOrgData && (
        <div className="flex justify-center">
          <div className="w-px h-8 bg-gradient-to-b from-blue-500/50 to-transparent" />
        </div>
      )}

      {/* ── Ketua Kelas ────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex justify-center">
          <SkeletonOrgCard />
        </div>
      ) : hasOrgData ? (
        <div className="flex justify-center">
          {pengurusInti
            .filter((p) => p.jabatan === "Ketua Kelas")
            .map((p) => {
              const siswa = siswaList?.find((s) => s.nis === p.nis);
              const cls =
                jabatanColors[p.jabatan] ||
                "border-white/10 from-white/5 text-slate-400 bg-white/5";
              return (
                <div
                  key={p.nis}
                  className={`glass rounded-2xl p-5 border bg-gradient-to-br ${cls.split(" ")[0]} ${cls.split(" ")[1]} flex flex-col items-center gap-3 w-52`}
                >
                  <div className="relative">
                    <img
                      src={p.foto}
                      alt={p.nama}
                      className="w-20 h-20 rounded-2xl object-cover ring-2 ring-blue-500/30"
                    />
                    <div
                      className={`absolute -bottom-2 -right-2 w-7 h-7 rounded-xl flex items-center justify-center ${cls.split(" ")[3]}`}
                    >
                      {jabatanIcons[p.jabatan]}
                    </div>
                  </div>
                  <div className="text-center">
                    <span
                      className={`badge border ${cls.split(" ")[0]} ${cls.split(" ")[2]} ${cls.split(" ")[3]} mb-1 block`}
                    >
                      {p.jabatan}
                    </span>
                    <p className="text-sm font-bold text-white">{p.nama}</p>
                    <p className="text-xs text-slate-500">NIS: {p.nis}</p>
                    {siswa && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        Nilai:{" "}
                        <span className="text-white font-semibold">
                          {siswa.nilaiRata}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      ) : null}

      {/* Connector to row */}
      {hasOrgData && (
        <div className="flex justify-center">
          <div className="w-px h-8 bg-gradient-to-b from-purple-500/30 to-transparent" />
        </div>
      )}

      {/* ── Wakil + Sekretaris + Bendahara ─────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonOrgCard key={i} />
          ))}
        </div>
      ) : hasOrgData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {pengurusInti
            .filter((p) => p.jabatan !== "Ketua Kelas")
            .map((p) => {
              const siswa = siswaList?.find((s) => s.nis === p.nis);
              const cls =
                jabatanColors[p.jabatan] ||
                "border-white/10 from-white/5 text-slate-400 bg-white/5";
              return (
                <div
                  key={p.nis}
                  className={`glass rounded-2xl p-4 border bg-gradient-to-br ${cls.split(" ")[0]} ${cls.split(" ")[1]} flex flex-col items-center gap-3 glass-hover`}
                >
                  <div className="relative">
                    <img
                      src={p.foto}
                      alt={p.nama}
                      className="w-16 h-16 rounded-xl object-cover ring-1 ring-white/10"
                    />
                    <div
                      className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-lg flex items-center justify-center text-xs ${cls.split(" ")[3]}`}
                    >
                      {jabatanIcons[p.jabatan]}
                    </div>
                  </div>
                  <div className="text-center">
                    <span
                      className={`badge border text-xs ${cls.split(" ")[0]} ${cls.split(" ")[2]} ${cls.split(" ")[3]} mb-1 block`}
                    >
                      {p.jabatan}
                    </span>
                    <p className="text-xs font-bold text-white">{p.nama}</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      NIS: {p.nis}
                    </p>
                    {siswa && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        Nilai:{" "}
                        <span className="text-white font-semibold">
                          {siswa.nilaiRata}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      ) : null}

      {/* ── Seluruh Anggota Kelas X-6 ──────────────────────── */}
      {isLoading ? (
        <SkeletonMemberGrid />
      ) : (
        <div className="glass rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h3 className="font-bold text-white text-sm">
              Seluruh Anggota Kelas X-6
            </h3>
          </div>
          {hasStudents ? (
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {siswaList!.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-col items-center gap-2 glass-hover rounded-xl p-3 bg-white/2 border border-white/3 text-center"
                >
                  <img
                    src={s.foto}
                    alt={s.nama}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/10"
                  />
                  <div>
                    <p className="text-xs font-semibold text-white leading-tight">
                      {s.nama.split(" ").slice(0, 2).join(" ")}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">{s.nis}</p>
                    {s.jabatan !== "Anggota" && (
                      <span className="badge bg-blue-500/10 text-blue-400 border border-blue-500/15 mt-1 block">
                        {s.jabatan}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-slate-500 text-sm">
                Belum ada data siswa
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}