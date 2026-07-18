# Portal X-6 (satu deployment: frontend + backend)

Vite+React di root, plus serverless functions di `api/` — keduanya dideploy sebagai **satu project Vercel**, satu domain, tanpa CORS karena sama-sama same-origin.

## Struktur

```
portal-x6/
  src/            frontend (Vite + React + Tailwind)
  api/            backend — tiap file = satu serverless function
  lib/            kode backend yang dipakai bersama oleh api/ (koneksi Mongo, model, dst)
  vercel.json     build command + routing satu deployment
```

`api/` dan `lib/` di sini **harus identik** dengan model yang dipakai bot WhatsApp (`kelas-x6-bot/src/db/models/`), karena keduanya membaca koleksi MongoDB yang sama.

## Setup lokal

```bash
npm install
cp .env.example .env
npm install -g vercel   # sekali saja
```

Isi `.env`:
- `MONGODB_URI` — sama persis dengan bot WhatsApp
- `CLASS_GROUP_ID` — JID grup kelas, ambil dari command `status database` di bot
- `ADMIN_API_KEY` — bebas, dipakai buat proteksi endpoint tulis
- `VITE_API_URL` — **kosongkan saja**, supaya frontend manggil `/api/...` di domain yang sama

Jalankan dengan:

```bash
npm run dev
```

Ini menjalankan `vercel dev`, yang menyalakan frontend DAN function `/api` sekaligus di satu port lokal (biasanya `http://localhost:3000`) — jadi behaviour-nya sama persis seperti di production.

Kalau cuma mau preview tampilan tanpa backend jalan (data fallback ke contoh), bisa pakai `npm run dev:frontend-only`.

## Deploy ke Vercel

```bash
vercel
```

Ikuti prompt-nya (pilih "Link to existing project?" No kalau ini pertama kali). Vercel otomatis mendeteksi `vercel.json`, menjalankan `vite build`, lalu men-deploy `dist/` sebagai static site plus semua file di `api/` sebagai function.

Masukkan environment variables yang sama seperti `.env` lewat **Project Settings → Environment Variables** di dashboard Vercel (atau `vercel env add` satu per satu), lalu:

```bash
vercel --prod
```

Setelah itu satu URL (misal `https://portal-x6.vercel.app`) sudah melayani frontend sekaligus `/api/*`.

## Endpoint yang tersedia

Beberapa endpoint digabung jadi satu function dengan query param, karena Vercel plan Hobby (gratis) membatasi **maksimal 12 serverless functions per deployment**. Project ini sekarang punya 11 function:

- `/api/health`
- `/api/dashboard`
- `/api/students` — list/create; `?id=` untuk get/update/delete satu siswa
- `/api/attendance` — raw list/manual input; `?view=today` untuk rekap harian, `?view=monthly` untuk tren 6 bulan
- `/api/kas` — raw list/manual input; `?view=summary` untuk saldo+riwayat+arus kas
- `/api/schedule` — jadwal pelajaran; `?type=piket` untuk jadwal piket
- `/api/announcements`
- `/api/agenda`
- `/api/grades`
- `/api/class-info`
- `/api/org-structure`

Endpoint tulis (POST/PUT/DELETE) butuh header `x-api-key: <ADMIN_API_KEY>`.

Kalau nanti nambah endpoint baru dan kena limit 12 lagi, gabungkan dengan pola yang sama (satu file, cabang berdasarkan `req.query` atau `req.method`) daripada bikin file/folder baru di `api/`.

## Kenapa digabung begini

- Satu deployment, satu domain → tidak perlu atur CORS, tidak perlu dua project terpisah di dashboard Vercel
- `vercel dev` mensimulasikan production secara lokal (frontend + function berjalan bareng)
- Kalau nanti mau dipisah lagi (misal frontend di Vercel, backend di server lain), tinggal isi `VITE_API_URL` dengan URL penuh backend-nya — kode frontend tidak perlu diubah
