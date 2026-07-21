import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, Users, ChevronDown } from "lucide-react";
import { kelasInfo, galeriKenangan } from "../DataDummy";
import PortfolioSection from "../components/portfolio3d/PortfolioSection";

export default function Portfolio() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* ─── HERO ─── */}
      <section className="relative h-[92vh] min-h-[560px] w-full overflow-hidden">
        <img
          src="https://picsum.photos/seed/x6-hero-kelas/1800/1200"
          alt="Kebersamaan Kelas X-6"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(30,25,18,0.35) 0%, rgba(30,25,18,0.55) 55%, #FAF6EE 100%)" }}
        />

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <div className="flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full bg-black/[0.15] backdrop-blur-sm border border-white/20">
            <GraduationCap size={14} className="text-paper" />
            <span className="text-xs tracking-widest uppercase text-paper font-semibold">{kelasInfo.jurusan} &middot; {kelasInfo.tahunAjaran}</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-medium text-paper leading-[1.05] max-w-3xl">
            {kelasInfo.nama}
          </h1>
          <p className="mt-5 text-paper/90 text-base md:text-lg italic font-display max-w-xl">
            "{kelasInfo.motto}"
          </p>
          <p className="mt-3 text-paper/70 text-sm max-w-md">
            Ruang cerita, kenangan, dan kebersamaan {kelasInfo.totalSiswa} anak yang menghabiskan satu tahun ajaran bersama di {kelasInfo.ruangan}.
          </p>

          <Link
            to="/dashboard"
            className="group mt-9 inline-flex items-center gap-2 bg-paper text-ink font-semibold text-sm px-6 py-3.5 rounded-full shadow-lg hover:bg-gold-soft transition-colors"
          >
            Masuk ke Portal Kelas
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-paper/70 flex flex-col items-center gap-1 animate-pulse-slow">
          <span className="text-xs uppercase tracking-widest">Kenangan Kami</span>
          <ChevronDown size={16} />
        </div>
      </section>

      {/* ─── MEMORY GALLERY ─── */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest text-gold font-semibold font-mono">Galeri Kenangan</span>
          <h2 className="font-display text-3xl md:text-4xl mt-3 text-ink">Satu Tahun, Seribu Cerita</h2>
          <p className="text-ink-soft text-sm mt-3">
            Beberapa potongan momen yang kami rekam sepanjang tahun ajaran — dari kelas, lapangan, sampai jam kosong yang paling berkesan.
          </p>
        </div>

        <div className="columns-2 md:columns-3 gap-5 space-y-5">
          {galeriKenangan.map((foto) => (
            <div
              key={foto.id}
              className="relative break-inside-avoid bg-surface p-3 pb-5 rounded-sm shadow-md border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              style={{ transform: `rotate(${foto.rotate}deg)` }}
            >
              <span
                className="tape w-14 h-5 -top-2.5 left-1/2 -translate-x-1/2 rotate-[-3deg]"
                aria-hidden="true"
              />
              <img
                src={foto.src}
                alt={foto.caption}
                className="w-full h-auto object-cover rounded-[2px]"
                loading="lazy"
              />
              <p className="font-display italic text-sm text-ink mt-3 leading-snug">{foto.caption}</p>
              <p className="text-xs text-ink-faint mt-1 font-mono">{foto.tanggal}</p>
            </div>
          ))}
        </div>
      </section>

      <PortfolioSection
        title="Sorotan Kelas"
        subtitle="Beberapa hal yang kami bangun dan kelola bersama sepanjang tahun ajaran ini."
      />

      {/* ─── CTA PENUTUP ─── */}
      <section className="border-t border-border">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 mb-4 text-sage">
            <Users size={16} />
            <span className="text-xs uppercase tracking-widest font-semibold font-mono">{kelasInfo.totalSiswa} Siswa &middot; 1 Keluarga</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl text-ink max-w-lg mx-auto">
            Semua data kehadiran, kas, jadwal, dan nilai kelas ada di satu tempat.
          </h2>
          <Link
            to="/dashboard"
            className="group mt-7 inline-flex items-center gap-2 bg-sage text-paper font-semibold text-sm px-6 py-3.5 rounded-full shadow-md hover:bg-sage/90 transition-colors"
          >
            Buka Portal Kelas
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="text-xs text-ink-faint mt-6">Portal X-6 &middot; Wali Kelas {kelasInfo.waliKelas}</p>
        </div>
      </section>
    </div>
  );
}
