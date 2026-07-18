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
} from "lucide-react";

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
  { to: "/", label: "Dashboard", icon: <LayoutDashboard size={18} />, end: true },
  { to: "/siswa", label: "Data Siswa", icon: <Users size={18} /> },
  { to: "/keuangan", label: "Keuangan", icon: <Wallet size={18} /> },
  { to: "/kehadiran", label: "Kehadiran", icon: <ClipboardList size={18} /> },
  { to: "/jadwal", label: "Jadwal", icon: <Calendar size={18} /> },
  { to: "/nilai", label: "Rekap Nilai", icon: <Award size={18} /> },
  { to: "/struktur", label: "Struktur Kelas", icon: <Network size={18} /> },
];

// ── Breadcrumb helper ─────────────────────────────────────────
const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/siswa": "Data Siswa",
  "/keuangan": "Keuangan",
  "/kehadiran": "Kehadiran",
  "/jadwal": "Jadwal",
  "/nilai": "Rekap Nilai",
  "/struktur": "Struktur Kelas",
  "/admin": "Admin Panel",
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
      style={{ background: "rgba(8, 12, 20, 0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Left: Logo + Hamburger */}
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick}
            className="p-2 rounded-xl glass border border-white/8 text-slate-400 hover:text-white transition-colors lg:hidden">
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center glow-blue">
              <GraduationCap size={16} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-black text-white leading-none">Portal X-6</p>
              <p className="text-xs text-slate-500 leading-none mt-0.5">Kelas 10-6</p>
            </div>
          </div>
        </div>

        {/* Center: Breadcrumb */}
        <div className="hidden md:flex items-center gap-1.5 text-sm">
          <span className="text-slate-500">Portal X-6</span>
          <ChevronRight size={12} className="text-slate-600" />
          <span className="text-white font-semibold">{title}</span>
        </div>

        {/* Right: Time + Notif + Avatar */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:block text-right">
            <p className="text-xs text-white font-mono font-semibold">{timeStr}</p>
            <p className="text-xs text-slate-500">{dateStr}</p>
          </div>
          <button className="relative p-2 rounded-xl glass border border-white/8 text-slate-400 hover:text-white transition-colors">
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse-slow" />
          </button>
          <img
            src="https://ui-avatars.com/api/?name=Admin+X6&background=1e3a5f&color=60a5fa&size=64&bold=true"
            alt="Admin"
            className="w-8 h-8 rounded-xl object-cover ring-1 ring-blue-500/30"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:top-16 lg:h-[calc(100vh-4rem)] lg:z-30`}
        style={{
          width: "240px",
          background: "rgba(8, 12, 20, 0.95)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
        }}>

        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <p className="text-sm font-black text-white">Portal X-6</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Kelas Info Banner */}
        <div className="m-3 p-3 rounded-xl border border-blue-500/15 bg-gradient-to-br from-blue-500/8 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden">
              <img
                src="https://ui-avatars.com/api/?name=X+6&background=0d1b3e&color=60a5fa&size=64&bold=true&font-size=0.45"
                alt="Kelas X-6"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-black text-white">Kelas X-6</p>
              <p className="text-xs text-slate-500">IPA &middot; 32 Siswa</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-slow" />
            <span className="text-xs text-green-400 font-medium">Portal Aktif</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          <p className="text-xs text-slate-600 uppercase tracking-wider px-3 py-2 font-semibold">Navigasi</p>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                  ? "active bg-blue-500/15 text-blue-400 border-l-2 border-blue-500 pl-[21px]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/5 space-y-2">
          <Link to="/admin" onClick={onClose}
            className="flex items-center gap-2.5 glass rounded-xl p-3 text-slate-400 hover:text-white transition-colors">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400"><ShieldCheck size={14} /></div>
            <p className="text-xs font-semibold">Admin Panel</p>
          </Link>
          <div className="glass rounded-xl p-3 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <BookOpen size={14} />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">TA 2024/2025</p>
              <p className="text-xs text-slate-500">Semester Genap</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: "#080c14" }}>
      <Topbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <main
        className="pt-16 min-h-screen transition-all duration-300"
        style={{ marginLeft: "0px" }}>
        <div className="lg:ml-60">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/siswa" element={<DataSiswa />} />
            <Route path="/keuangan" element={<Keuangan />} />
            <Route path="/kehadiran" element={<Kehadiran />} />
            <Route path="/jadwal" element={<Jadwal />} />
            <Route path="/nilai" element={<Nilai />} />
            <Route path="/struktur" element={<Struktur />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
