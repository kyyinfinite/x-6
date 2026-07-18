// ============================================================
// SKELETON LOADING COMPONENTS - PORTAL X-6
// Digunakan untuk menampilkan placeholder saat data sedang dimuat
// ============================================================

function Pulse({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse bg-white/[0.06] rounded-lg ${className}`}
      style={style}
    />
  );
}

// ── Skeleton untuk kartu stat (stat cards) ──────────────────
export function SkeletonStatCard() {
  return (
    <div className="glass rounded-2xl p-4 border border-white/5">
      <Pulse className="w-8 h-8 mb-3" />
      <Pulse className="h-3 w-20 mb-2" />
      <Pulse className="h-7 w-28 mb-1" />
      <Pulse className="h-3 w-24" />
    </div>
  );
}

export function SkeletonStatCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>
  );
}

// ── Skeleton untuk hero banner di dashboard ─────────────────
export function SkeletonHeroBanner() {
  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0d1b3e 0%, #0a1628 40%, #0d0f1a 100%)",
        border: "1px solid rgba(99,179,237,0.12)",
        minHeight: "160px",
      }}
    >
      <div className="relative z-10 p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-3 flex-1">
          <Pulse className="h-3 w-32" />
          <Pulse className="h-10 w-64" />
          <Pulse className="h-3 w-80" />
          <Pulse className="h-3 w-48" />
        </div>
        <div className="space-y-3">
          <Pulse className="h-16 w-48" />
          <Pulse className="h-16 w-36" />
        </div>
      </div>
    </div>
  );
}

// ── Skeleton untuk tabel ────────────────────────────────────
export function SkeletonTable({ rows = 8, cols = 7 }: { rows?: number; cols?: number }) {
  return (
    <div className="glass rounded-2xl border border-white/5 overflow-hidden">
      <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-3">
        <Pulse className="h-10 flex-1 rounded-xl" />
        <Pulse className="h-10 w-24 rounded-xl" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="p-4">
                  <Pulse className="h-3 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} className="border-b border-white/3">
                {Array.from({ length: cols }).map((_, c) => (
                  <td key={c} className="p-4">
                    {c === 1 ? (
                      <Pulse className="w-9 h-9 rounded-xl" />
                    ) : c === 0 ? (
                      <Pulse className="h-3 w-4" />
                    ) : (
                      <Pulse className="h-3 w-full max-w-24" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Skeleton untuk chart area (recharts) ────────────────────
export function SkeletonChart({ height = 220 }: { height?: number }) {
  return (
    <div className="glass rounded-2xl p-5 border border-white/5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Pulse className="w-8 h-8 rounded-xl" />
          <Pulse className="h-4 w-40" />
        </div>
        <Pulse className="h-3 w-28" />
      </div>
      <div className="w-full flex items-end justify-between gap-2" style={{ height }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <Pulse
              className="w-full rounded-t-md"
              style={{ height: `${30 + Math.random() * 60}%`, minHeight: 30 }}
            />
            <Pulse className="h-3 w-6" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Skeleton untuk pie chart ────────────────────────────────
export function SkeletonPieChart() {
  return (
    <div className="glass rounded-2xl p-5 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Pulse className="w-8 h-8 rounded-xl" />
          <Pulse className="h-4 w-32" />
        </div>
        <Pulse className="h-5 w-28 rounded-full" />
      </div>
      <div className="flex justify-center mb-4">
        <Pulse className="w-40 h-40 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 bg-white/3 rounded-xl p-2">
            <Pulse className="w-2.5 h-2.5 rounded-full flex-shrink-0" />
            <div className="space-y-1">
              <Pulse className="h-3 w-12" />
              <Pulse className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Skeleton untuk list items ───────────────────────────────
export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2 px-1 rounded-lg">
          <div className="flex-1 space-y-1.5">
            <Pulse className="h-3 w-48" />
            <Pulse className="h-2.5 w-28" />
          </div>
          <Pulse className="h-4 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ── Skeleton untuk card pengumuman / announcement ───────────
export function SkeletonAnnouncement({ count = 4 }: { count?: number }) {
  return (
    <div className="glass rounded-2xl p-5 border border-white/5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Pulse className="w-8 h-8 rounded-xl" />
          <Pulse className="h-4 w-28" />
        </div>
        <Pulse className="h-5 w-12 rounded-full" />
      </div>
      <div className="space-y-3 flex-1">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-white/3 rounded-xl p-3.5 border border-transparent"
          >
            <div className="flex items-start justify-between gap-2">
              <Pulse className="h-4 w-full" />
              <Pulse className="w-3.5 h-3.5 rounded flex-shrink-0" />
            </div>
            <div className="space-y-1.5 mt-2">
              <Pulse className="h-2.5 w-full" />
              <Pulse className="h-2.5 w-3/4" />
            </div>
            <div className="flex items-center justify-between mt-2.5">
              <Pulse className="h-2.5 w-28" />
              <Pulse className="h-5 w-12 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Skeleton untuk agenda cards ─────────────────────────────
export function SkeletonAgenda({ count = 6 }: { count?: number }) {
  return (
    <div className="glass rounded-2xl p-5 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Pulse className="w-8 h-8 rounded-xl" />
          <Pulse className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-white/3 rounded-xl p-3.5 border border-white/5"
          >
            <Pulse className="w-8 h-8 rounded-xl flex-shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Pulse className="h-3 w-full" />
              <Pulse className="h-2.5 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Skeleton untuk kartu saldo kas (balance card) ───────────
export function SkeletonBalanceCard() {
  return (
    <div
      className="md:col-span-2 relative rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0d1b3e 0%, #0a1628 60%, #0d0f1a 100%)",
        border: "1px solid rgba(37,99,235,0.2)",
        minHeight: "200px",
      }}
    >
      <div className="relative z-10 p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Pulse className="h-3 w-40" />
            <Pulse className="h-12 w-64" />
            <Pulse className="h-3 w-36" />
          </div>
          <Pulse className="w-12 h-12 rounded-2xl" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Pulse className="h-3 w-32" />
            <Pulse className="h-3 w-40" />
          </div>
          <Pulse className="h-2 w-full rounded-full" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-3 space-y-1">
              <Pulse className="h-2.5 w-20" />
              <Pulse className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Skeleton untuk circle chart (iuran status) ──────────────
export function SkeletonCircleChart() {
  return (
    <div className="glass rounded-2xl p-5 border border-white/5">
      <div className="flex items-center gap-2 mb-4">
        <Pulse className="w-8 h-8 rounded-xl" />
        <Pulse className="h-4 w-24" />
      </div>
      <div className="flex justify-center items-center h-28">
        <Pulse className="w-28 h-28 rounded-full" />
      </div>
      <div className="space-y-2 mt-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Pulse className="w-2 h-2 rounded-full" />
              <Pulse className="h-2.5 w-12" />
            </div>
            <Pulse className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Skeleton untuk piket cards ──────────────────────────────
export function SkeletonPiketCards({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <Pulse className="h-5 w-16" />
            <Pulse className="h-5 w-24 rounded-full" />
          </div>
          <div className="space-y-2.5">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3 bg-white/3 rounded-xl p-2.5">
                <Pulse className="w-8 h-8 rounded-lg flex-shrink-0" />
                <Pulse className="h-3 w-28" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Skeleton untuk jadwal timeline ──────────────────────────
export function SkeletonTimeline({ count = 10 }: { count?: number }) {
  return (
    <div className="glass rounded-2xl border border-white/5 overflow-hidden">
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Pulse className="w-8 h-8 rounded-xl" />
          <Pulse className="h-4 w-48" />
        </div>
      </div>
      <div className="p-4 space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-stretch gap-3 rounded-xl border border-white/5 bg-white/3 px-4 py-3">
            <div className="flex flex-col items-center">
              <Pulse className="w-2 h-2 rounded-full flex-shrink-0" />
              {i < count - 1 && <div className="w-px flex-1 mt-1 bg-white/5" />}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <Pulse className="h-4 w-32" />
                <Pulse className="h-3 w-20" />
              </div>
              <Pulse className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Skeleton untuk struktur organisasi ──────────────────────
export function SkeletonOrgStructure() {
  return (
    <div className="flex flex-col items-center gap-3">
      <Pulse className="w-24 h-24 rounded-3xl" />
      <div className="space-y-1.5 text-center">
        <Pulse className="h-5 w-20 mx-auto" />
        <Pulse className="h-4 w-32 mx-auto" />
        <Pulse className="h-3 w-24 mx-auto" />
      </div>
    </div>
  );
}

export function SkeletonOrgCard() {
  return (
    <div className="glass rounded-2xl p-4 border border-white/5 flex flex-col items-center gap-3 w-52">
      <div className="relative">
        <Pulse className="w-20 h-20 rounded-2xl" />
        <Pulse className="w-7 h-7 rounded-xl absolute -bottom-2 -right-2" />
      </div>
      <div className="space-y-1 text-center">
        <Pulse className="h-5 w-20 mx-auto" />
        <Pulse className="h-3 w-24 mx-auto" />
      </div>
    </div>
  );
}

export function SkeletonMemberGrid({ count = 32 }: { count?: number }) {
  return (
    <div className="glass rounded-2xl border border-white/5 overflow-hidden">
      <div className="p-4 border-b border-white/5">
        <Pulse className="h-4 w-48" />
      </div>
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 rounded-xl p-3">
            <Pulse className="w-12 h-12 rounded-xl" />
            <div className="space-y-1 text-center">
              <Pulse className="h-3 w-16 mx-auto" />
              <Pulse className="h-2.5 w-12 mx-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Skeleton untuk radar chart ──────────────────────────────
export function SkeletonRadar() {
  return (
    <div className="glass rounded-2xl p-5 border border-white/5">
      <div className="flex items-center gap-2 mb-4">
        <Pulse className="w-8 h-8 rounded-xl" />
        <Pulse className="h-4 w-32" />
      </div>
      <div className="flex justify-center">
        <Pulse className="w-64 h-64 rounded-full" />
      </div>
    </div>
  );
}

// ── Skeleton untuk top 5 siswa ──────────────────────────────
export function SkeletonTopStudents() {
  return (
    <div className="glass rounded-2xl p-5 border border-white/5">
      <div className="flex items-center gap-2 mb-4">
        <Pulse className="w-8 h-8 rounded-xl" />
        <Pulse className="h-4 w-40" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 bg-white/3 rounded-xl p-3">
            <Pulse className="w-7 h-7 rounded-full" />
            <Pulse className="w-9 h-9 rounded-xl" />
            <div className="flex-1 space-y-1">
              <Pulse className="h-3 w-28" />
              <Pulse className="h-2.5 w-20" />
            </div>
            <Pulse className="h-5 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Skeleton untuk tab buttons ──────────────────────────────
export function SkeletonTabs({ count = 2 }: { count?: number }) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <Pulse key={i} className="h-10 w-32 rounded-xl" />
      ))}
    </div>
  );
}

// ── Skeleton untuk day selector buttons ─────────────────────
export function SkeletonDaySelector({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {Array.from({ length: count }).map((_, i) => (
        <Pulse key={i} className="h-10 w-20 rounded-xl flex-shrink-0" />
      ))}
    </div>
  );
}

// ── Skeleton untuk jadwal hari ini di dashboard ─────────────
export function SkeletonScheduleMini({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2 bg-white/3">
          <Pulse className="h-3 w-24" />
          <div className="flex-1 space-y-1">
            <Pulse className="h-3 w-28" />
            <Pulse className="h-2.5 w-20" />
          </div>
          <Pulse className="h-3 w-12" />
        </div>
      ))}
    </div>
  );
}

// ── Skeleton untuk kehadiran grid ───────────────────────────
export function SkeletonAttendanceGrid({ count = 16 }: { count?: number }) {
  return (
    <div className="glass rounded-2xl border border-white/5 overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pulse className="w-8 h-8 rounded-xl" />
          <Pulse className="h-4 w-56" />
        </div>
        <Pulse className="h-3 w-16" />
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/3 rounded-xl p-3 border border-white/3">
              <Pulse className="w-3 h-3" />
              <Pulse className="w-9 h-9 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <Pulse className="h-3 w-28" />
                <Pulse className="h-2.5 w-20" />
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Pulse key={j} className="w-7 h-7 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Skeleton untuk kas detail card di dashboard ─────────────
export function SkeletonKasDashboard() {
  return (
    <div className="glass rounded-2xl p-5 border border-white/5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pulse className="w-8 h-8 rounded-xl" />
          <Pulse className="h-4 w-20" />
        </div>
        <Pulse className="h-5 w-20 rounded-full" />
      </div>
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{
          background: "linear-gradient(135deg, #0d1b3e, #0a1628)",
          border: "1px solid rgba(37,99,235,0.2)",
        }}
      >
        <Pulse className="h-3 w-28" />
        <Pulse className="h-8 w-48" />
        <div className="space-y-1.5">
          <Pulse className="h-2.5 w-full rounded-full" />
          <Pulse className="h-3 w-40" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-500/8 border border-green-500/15 rounded-xl p-3 space-y-1">
          <Pulse className="h-3 w-20" />
          <Pulse className="h-4 w-24" />
        </div>
        <div className="bg-red-500/8 border border-red-500/15 rounded-xl p-3 space-y-1">
          <Pulse className="h-3 w-24" />
          <Pulse className="h-4 w-24" />
        </div>
      </div>
      <SkeletonList count={5} />
    </div>
  );
}

// ── Skeleton untuk piket hari ini di dashboard ──────────────
export function SkeletonPiketDashboard() {
  return (
    <div className="glass rounded-2xl p-5 border border-white/5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pulse className="w-8 h-8 rounded-xl" />
          <Pulse className="h-4 w-28" />
        </div>
        <Pulse className="h-5 w-32 rounded-full" />
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 bg-white/3 rounded-xl p-2.5">
            <Pulse className="w-9 h-9 rounded-full flex-shrink-0" />
            <div className="space-y-1">
              <Pulse className="h-3 w-28" />
              <Pulse className="h-2.5 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}