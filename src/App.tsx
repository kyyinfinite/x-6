import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Wallet,
  ClipboardList,
  Calendar,
  Award,
  Network,
  Menu,
  X,
  Bell,
  ChevronRight,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

import Portfolio from "./pages/Portfolio";
import Dashboard from "./pages/Dashboard";
import DataSiswa from "./pages/DataSiswa";
import Keuangan from "./pages/Keuangan";
import Kehadiran from "./pages/Kehadiran";
import Jadwal from "./pages/Jadwal";
import Nilai from "./pages/Nilai";
import Struktur from "./pages/Struktur";
import Admin from "./pages/Admin";

// ── Nav items config ──────────────────────────────────────────
const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} />, end: true },
  { to: "/dashboard/siswa", label: "Data Siswa", icon: <Users size={18} /> },
  { to: "/dashboard/keuangan", label: "Keuangan", icon: <Wallet size={18} /> },
  { to: "/dashboard/kehadiran", label: "Kehadiran", icon: <ClipboardList size={18} /> },
  { to: "/dashboard/jadwal", label: "Jadwal", icon: <Calendar size={18} /> },
  { to: "/dashboard/nilai", label: "Rekap Nilai", icon: <Award size={18} /> },
  { to: "/dashboard/struktur", label: "Struktur Kelas", icon: <Network size={18} /> },
];

// ── Breadcrumb helper ─────────────────────────────────────────
const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/siswa": "Data Siswa",
  "/dashboard/keuangan": "Keuangan",
  "/dashboard/kehadiran": "Kehadiran",
  "/dashboard/jadwal": "Jadwal",
  "/dashboard/nilai": "Rekap Nilai",
  "/dashboard/struktur": "Struktur Kelas",
  "/dashboard/admin": "Admin Panel",
};

function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || "Portal X-6";
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = time.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = time.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16"
      style={{ background: "rgba(250, 246, 238, 0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid #E6DCC6" }}>
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Left: Logo + Hamburger */}
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick}
            className="p-2 rounded-xl glass border border-ink/15 text-ink-soft hover:text-ink transition-colors lg:hidden">
            <Menu size={18} />
          </button>
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sage to-gold flex items-center justify-center glow-blue">
              <GraduationCap size={16} className="text-paper" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-black text-ink leading-none font-display">Portal X-6</p>
              <p className="text-xs text-ink-faint leading-none mt-0.5">Kelas 10-6</p>
            </div>
          </Link>
        </div>

        {/* Center: Breadcrumb */}
        <div className="hidden md:flex items-center gap-1.5 text-sm">
          <Link to="/dashboard" className="text-ink-faint hover:text-ink transition-colors">Portal X-6</Link>
          <ChevronRight size={12} className="text-ink-faint" />
          <span className="text-ink font-semibold">{title}</span>
        </div>

        {/* Right: Time + Notif + Avatar */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:block text-right">
            <p className="text-xs text-ink font-mono font-semibold">{timeStr}</p>
            <p className="text-xs text-ink-faint">{dateStr}</p>
          </div>
          <button className="relative p-2 rounded-xl glass border border-ink/15 text-ink-soft hover:text-ink transition-colors">
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-sage animate-pulse-slow" />
          </button>
          <img
            src="https://ui-avatars.com/api/?name=Admin+X6&background=E3EBDD&color=4F6B52&size=64&bold=true"
            alt="Admin"
            className="w-8 h-8 rounded-xl object-cover ring-1 ring-sage/30"
          />
        </div>
      </div>
    </header>
  );
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:top-16 lg:h-[calc(100vh-4rem)] lg:z-30`}
        style={{
          width: "240px",
          background: "#FBF8F2",
          borderRight: "1px solid #E6DCC6",
        }}>

        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-ink/10 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sage to-gold flex items-center justify-center">
              <GraduationCap size={16} className="text-paper" />
            </div>
            <p className="text-sm font-black text-ink font-display">Portal X-6</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-ink-faint hover:text-ink transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Kelas Info Banner */}
        <div className="m-3 p-3 rounded-xl border border-sage/20 bg-sage-soft">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden">
              <img
                src="https://ui-avatars.com/api/?name=X+6&background=E3EBDD&color=4F6B52&size=64&bold=true&font-size=0.45"
                alt="Kelas X-6"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-black text-ink">Kelas X-6</p>
              <p className="text-xs text-ink-faint">IPA &middot; 32 Siswa</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse-slow" />
            <span className="text-xs text-sage font-medium">Portal Aktif</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          <p className="text-xs text-ink-faint uppercase tracking-wider px-3 py-2 font-semibold">Navigasi</p>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                  ? "active bg-sage-soft text-sage border-l-2 border-sage pl-[21px]"
                  : "text-ink-soft hover:text-ink hover:bg-black/[0.03]"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-ink/10 space-y-2">
          <Link to="/" onClick={onClose}
            className="flex items-center gap-2.5 glass rounded-xl p-3 text-ink-soft hover:text-ink transition-colors">
            <div className="p-1.5 rounded-lg bg-gold-soft text-gold"><ArrowLeft size={14} /></div>
            <p className="text-xs font-semibold">Kembali ke Beranda</p>
          </Link>
          <Link to="/dashboard/admin" onClick={onClose}
            className="flex items-center gap-2.5 glass rounded-xl p-3 text-ink-soft hover:text-ink transition-colors">
            <div className="p-1.5 rounded-lg bg-sage/10 text-sage"><ShieldCheck size={14} /></div>
            <p className="text-xs font-semibold">Admin Panel</p>
          </Link>
          <div className="glass rounded-xl p-3 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sage/10 text-sage">
              <BookOpen size={14} />
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">TA 2024/2025</p>
              <p className="text-xs text-ink-faint">Semester Genap</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: "#FAF6EE" }}>
      <Topbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <main
        className="pt-16 min-h-screen transition-all duration-300"
        style={{ marginLeft: "0px" }}>
        <div className="lg:ml-60">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="siswa" element={<DataSiswa />} />
            <Route path="keuangan" element={<Keuangan />} />
            <Route path="kehadiran" element={<Kehadiran />} />
            <Route path="jadwal" element={<Jadwal />} />
            <Route path="nilai" element={<Nilai />} />
            <Route path="struktur" element={<Struktur />} />
            <Route path="admin" element={<Admin />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/dashboard/*" element={<DashboardLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
