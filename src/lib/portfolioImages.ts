// src/lib/portfolioImages.ts
//
// Auto-discover semua gambar yang ditaruh di folder `src/assets/portfolio/`.
//
// CARA PAKAI:
// 1. Taruh file gambar (jpg/png/webp/gif/svg) ke folder `src/assets/portfolio/`
//    (buat foldernya kalau belum ada).
// 2. Commit + push -> Vercel redeploy otomatis.
// 3. Buka Admin Panel -> tab "Portofolio 3D" -> field gambar sekarang jadi
//    dropdown "Galeri lokal" yang otomatis menampilkan file itu.
//
// KENAPA INI MENYELESAIKAN MASALAH CORS/imgur/imgbb/catbox:
// Vite akan meng-import gambar ini sebagai bagian dari build, jadi URL
// akhirnya selalu berasal dari domain situs kamu sendiri (same-origin).
// WebGL/Three.js (via useTexture) tidak pernah butuh izin CORS untuk resource
// yang datang dari origin yang sama -> gambar pasti ter-load, 100% gratis,
// tanpa bergantung ke host pihak ketiga sama sekali.

const modules = import.meta.glob<string>(
  "/src/assets/portfolio/**/*.{png,jpg,jpeg,webp,gif,svg}",
  { eager: true, import: "default" }
);

export interface LocalPortfolioImage {
  /** Nama file, ditampilkan di dropdown Admin Panel */
  label: string;
  /** URL final (sudah di-fingerprint Vite) yang aman dipakai sebagai thumbnail */
  url: string;
}

export const localPortfolioImages: LocalPortfolioImage[] = Object.entries(modules)
  .map(([path, url]) => ({
    label: path.split("/").pop() ?? path,
    url,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));
