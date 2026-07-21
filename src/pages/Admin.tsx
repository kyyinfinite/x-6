import { useEffect, useState } from "react";
import {
  ShieldCheck, LogOut, School, Calendar, ClipboardList, Award, Bell, CalendarDays, Users, Plus, Trash2, Save,
} from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete, isAdminVerified, verifyAdminKey, clearAdminKey } from "../lib/api";

const inputCls = "w-full bg-black/[0.05] border border-ink/15 rounded-xl px-3 py-2 text-sm text-ink placeholder-ink focus:outline-none focus:border-sage/50 transition-all";
const btnPrimary = "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-sage hover:bg-sage text-ink transition-all disabled:opacity-50";
const btnDanger = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/20 transition-all";

type ClassInfo = { nama: string; tahunAjaran: string; waliKelas: string; waliFoto: string; ruangan: string; jurusan: string; motto: string };
type JadwalItem = { jam: string; mapel: string; guru: string; ruang: string };
type JadwalPelajaran = Record<string, JadwalItem[]>;
type PiketHari = { hari: string; kelompok: number; anggota: string[] };
type Grade = { mapel: string; guru: string; uh1: number; uh2: number; uts: number; uas: number; rataRata: number };
type Pengumuman = { id: string; judul: string; isi: string; tanggal: string; prioritas: string; oleh: string };
type AgendaItem = { id: string; tanggal: string; judul: string; kategori: string; warna: string };
type Siswa = { id: string; nis: string; nama: string; jenisKelamin: string; jabatan: string; foto: string; nilaiRata: number; status: string };

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

// ─────────────────────────── LOGIN ───────────────────────────
function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const ok = await verifyAdminKey(key);
      if (ok) onSuccess();
      else setError("API key salah atau tidak valid.");
    } catch {
      setError("Gagal menghubungi server, coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 border border-ink/10 w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 rounded-2xl bg-sage/10 text-sage mb-3"><ShieldCheck size={28} /></div>
          <h1 className="text-lg font-black text-ink">Admin Portal X-6</h1>
          <p className="text-xs text-ink-faint mt-1 text-center">Masukkan admin API key untuk mengelola data website</p>
        </div>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Admin API key"
          className={inputCls}
          autoFocus
        />
        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        <button type="submit" disabled={loading || !key} className={`${btnPrimary} w-full justify-center mt-4`}>
          {loading ? "Memeriksa..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}

// ─────────────────────────── INFO KELAS ───────────────────────────
function InfoKelasTab() {
  const [form, setForm] = useState<ClassInfo>({ nama: "", tahunAjaran: "", waliKelas: "", waliFoto: "", ruangan: "", jurusan: "", motto: "" });
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    apiGet<ClassInfo>("/api/class-info").then((d) => { setForm(d); setLoaded(true); }).catch(() => setLoaded(true));
  }, []);

  const save = async () => {
    setStatus("Menyimpan...");
    try {
      await apiPut("/api/class-info", form);
      setStatus("Tersimpan ✓");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Gagal menyimpan");
    }
    setTimeout(() => setStatus(""), 2500);
  };

  if (!loaded) return <p className="text-xs text-ink-faint">Memuat...</p>;

  const fields: { key: keyof ClassInfo; label: string }[] = [
    { key: "nama", label: "Nama Kelas" },
    { key: "tahunAjaran", label: "Tahun Ajaran" },
    { key: "waliKelas", label: "Wali Kelas" },
    { key: "waliFoto", label: "URL Foto Wali Kelas" },
    { key: "ruangan", label: "Ruangan" },
    { key: "jurusan", label: "Jurusan" },
    { key: "motto", label: "Motto Kelas" },
  ];

  return (
    <div className="space-y-4">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="text-xs text-ink-soft mb-1 block">{f.label}</label>
          <input className={inputCls} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
        </div>
      ))}
      <div className="flex items-center gap-3">
        <button onClick={save} className={btnPrimary}><Save size={14} />Simpan</button>
        {status && <span className="text-xs text-ink-soft">{status}</span>}
      </div>
    </div>
  );
}

// ─────────────────────────── JADWAL PELAJARAN ───────────────────────────
function JadwalTab() {
  const [all, setAll] = useState<JadwalPelajaran>({});
  const [day, setDay] = useState("Senin");
  const [items, setItems] = useState<JadwalItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    apiGet<JadwalPelajaran>("/api/schedule").then((d) => { setAll(d); setLoaded(true); }).catch(() => setLoaded(true));
  }, []);

  useEffect(() => { setItems(all[day] ?? []); }, [day, all]);

  const updateItem = (i: number, field: keyof JadwalItem, value: string) => {
    setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, [field]: value } : it));
  };
  const addRow = () => setItems((prev) => [...prev, { jam: "", mapel: "", guru: "-", ruang: "-" }]);
  const removeRow = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    setStatus("Menyimpan...");
    try {
      await apiPut("/api/schedule", { day, items });
      setAll((prev) => ({ ...prev, [day]: items }));
      setStatus("Tersimpan ✓");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Gagal menyimpan");
    }
    setTimeout(() => setStatus(""), 2500);
  };

  if (!loaded) return <p className="text-xs text-ink-faint">Memuat...</p>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {DAYS.map((d) => (
          <button key={d} onClick={() => setDay(d)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${day === d ? "bg-sage border-sage text-ink" : "glass border-ink/15 text-ink-soft"}`}>
            {d}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-center bg-black/[0.03] rounded-xl p-2">
            <input className={`${inputCls} col-span-3`} placeholder="Jam" value={it.jam} onChange={(e) => updateItem(i, "jam", e.target.value)} />
            <input className={`${inputCls} col-span-4`} placeholder="Mata Pelajaran" value={it.mapel} onChange={(e) => updateItem(i, "mapel", e.target.value)} />
            <input className={`${inputCls} col-span-2`} placeholder="Guru" value={it.guru} onChange={(e) => updateItem(i, "guru", e.target.value)} />
            <input className={`${inputCls} col-span-2`} placeholder="Ruang" value={it.ruang} onChange={(e) => updateItem(i, "ruang", e.target.value)} />
            <button onClick={() => removeRow(i)} className="col-span-1 text-red-600 hover:text-red-700 flex justify-center"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={addRow} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold glass border border-ink/15 text-ink-soft hover:text-ink"><Plus size={14} />Tambah Jam</button>
        <button onClick={save} className={btnPrimary}><Save size={14} />Simpan {day}</button>
        {status && <span className="text-xs text-ink-soft">{status}</span>}
      </div>
    </div>
  );
}

// ─────────────────────────── PIKET ───────────────────────────
function PiketTab() {
  const [all, setAll] = useState<PiketHari[]>([]);
  const [day, setDay] = useState("Senin");
  const [kelompok, setKelompok] = useState(1);
  const [anggotaText, setAnggotaText] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    apiGet<PiketHari[]>("/api/schedule?type=piket").then((d) => { setAll(d); setLoaded(true); }).catch(() => setLoaded(true));
  }, []);

  useEffect(() => {
    const found = all.find((p) => p.hari === day);
    setKelompok(found?.kelompok ?? 1);
    setAnggotaText(found?.anggota.join(", ") ?? "");
  }, [day, all]);

  const save = async () => {
    setStatus("Menyimpan...");
    const anggota = anggotaText.split(",").map((s) => s.trim()).filter(Boolean);
    try {
      await apiPut("/api/schedule?type=piket", { day, kelompok, anggota });
      setAll((prev) => {
        const rest = prev.filter((p) => p.hari !== day);
        return [...rest, { hari: day, kelompok, anggota }];
      });
      setStatus("Tersimpan ✓");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Gagal menyimpan");
    }
    setTimeout(() => setStatus(""), 2500);
  };

  if (!loaded) return <p className="text-xs text-ink-faint">Memuat...</p>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {DAYS.map((d) => (
          <button key={d} onClick={() => setDay(d)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${day === d ? "bg-sage border-sage text-ink" : "glass border-ink/15 text-ink-soft"}`}>
            {d}
          </button>
        ))}
      </div>
      <div>
        <label className="text-xs text-ink-soft mb-1 block">Kelompok</label>
        <input type="number" min={1} className={inputCls} value={kelompok} onChange={(e) => setKelompok(Number(e.target.value))} />
      </div>
      <div>
        <label className="text-xs text-ink-soft mb-1 block">Anggota (pisahkan dengan koma)</label>
        <textarea className={`${inputCls} min-h-20`} value={anggotaText} onChange={(e) => setAnggotaText(e.target.value)} placeholder="Nama 1, Nama 2, Nama 3" />
      </div>
      <div className="flex items-center gap-3">
        <button onClick={save} className={btnPrimary}><Save size={14} />Simpan Piket {day}</button>
        {status && <span className="text-xs text-ink-soft">{status}</span>}
      </div>
    </div>
  );
}

// ─────────────────────────── NILAI ───────────────────────────
function NilaiTab() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [newMapel, setNewMapel] = useState("");
  const [newGuru, setNewGuru] = useState("");
  const [status, setStatus] = useState("");

  const load = () => apiGet<Grade[]>("/api/grades").then(setGrades).catch(() => {});

  useEffect(() => { load().finally(() => setLoaded(true)); }, []);

  const updateField = (mapel: string, field: keyof Grade, value: string) => {
    setGrades((prev) => prev.map((g) => g.mapel === mapel ? { ...g, [field]: field === "guru" ? value : Number(value) } : g));
  };

  const saveRow = async (g: Grade) => {
    setStatus(`Menyimpan ${g.mapel}...`);
    try {
      await apiPut("/api/grades", { mapel: g.mapel, uh1: g.uh1, uh2: g.uh2, uts: g.uts, uas: g.uas, guru: g.guru });
      setStatus("Tersimpan ✓");
      load();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Gagal menyimpan");
    }
    setTimeout(() => setStatus(""), 2500);
  };

  const addMapel = async () => {
    if (!newMapel.trim()) return;
    try {
      await apiPut("/api/grades", { mapel: newMapel.trim(), guru: newGuru.trim(), uh1: 0, uh2: 0, uts: 0, uas: 0 });
      setNewMapel(""); setNewGuru("");
      load();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Gagal menambah mapel");
    }
  };

  if (!loaded) return <p className="text-xs text-ink-faint">Memuat...</p>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap items-end">
        <div className="flex-1 min-w-40">
          <label className="text-xs text-ink-soft mb-1 block">Mata Pelajaran Baru</label>
          <input className={inputCls} value={newMapel} onChange={(e) => setNewMapel(e.target.value)} placeholder="Nama mapel" />
        </div>
        <div className="flex-1 min-w-40">
          <label className="text-xs text-ink-soft mb-1 block">Guru</label>
          <input className={inputCls} value={newGuru} onChange={(e) => setNewGuru(e.target.value)} placeholder="Nama guru" />
        </div>
        <button onClick={addMapel} className={btnPrimary}><Plus size={14} />Tambah</button>
      </div>

      {status && <p className="text-xs text-ink-soft">{status}</p>}

      <div className="space-y-2">
        {grades.map((g) => (
          <div key={g.mapel} className="grid grid-cols-12 gap-2 items-center bg-black/[0.03] rounded-xl p-2">
            <span className="col-span-2 text-xs font-semibold text-ink truncate">{g.mapel}</span>
            <input className={`${inputCls} col-span-2`} placeholder="Guru" value={g.guru} onChange={(e) => updateField(g.mapel, "guru", e.target.value)} />
            <input type="number" className={`${inputCls} col-span-1`} value={g.uh1} onChange={(e) => updateField(g.mapel, "uh1", e.target.value)} />
            <input type="number" className={`${inputCls} col-span-1`} value={g.uh2} onChange={(e) => updateField(g.mapel, "uh2", e.target.value)} />
            <input type="number" className={`${inputCls} col-span-1`} value={g.uts} onChange={(e) => updateField(g.mapel, "uts", e.target.value)} />
            <input type="number" className={`${inputCls} col-span-1`} value={g.uas} onChange={(e) => updateField(g.mapel, "uas", e.target.value)} />
            <span className="col-span-2 text-xs text-ink-soft text-center">Rata: {g.rataRata}</span>
            <button onClick={() => saveRow(g)} className="col-span-1 text-sage hover:text-sage flex justify-center"><Save size={14} /></button>
          </div>
        ))}
        {grades.length === 0 && <p className="text-xs text-ink-faint">Belum ada data nilai.</p>}
      </div>
    </div>
  );
}

// ─────────────────────────── PENGUMUMAN ───────────────────────────
function PengumumanTab() {
  const [list, setList] = useState<Pengumuman[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({ judul: "", isi: "", prioritas: "Normal", oleh: "" });
  const [status, setStatus] = useState("");

  const load = () => apiGet<Pengumuman[]>("/api/announcements").then(setList).catch(() => {});
  useEffect(() => { load().finally(() => setLoaded(true)); }, []);

  const submit = async () => {
    if (!form.judul.trim() || !form.isi.trim()) return;
    try {
      await apiPost("/api/announcements", form);
      setForm({ judul: "", isi: "", prioritas: "Normal", oleh: "" });
      load();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Gagal menambah pengumuman");
    }
  };

  const remove = async (id: string) => {
    try { await apiDelete(`/api/announcements?id=${id}`); load(); } catch { /* noop */ }
  };

  if (!loaded) return <p className="text-xs text-ink-faint">Memuat...</p>;

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-4 border border-ink/10 space-y-3">
        <input className={inputCls} placeholder="Judul" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} />
        <textarea className={`${inputCls} min-h-20`} placeholder="Isi pengumuman" value={form.isi} onChange={(e) => setForm({ ...form, isi: e.target.value })} />
        <div className="flex gap-2">
          <select className={inputCls} value={form.prioritas} onChange={(e) => setForm({ ...form, prioritas: e.target.value })}>
            <option value="Normal">Normal</option>
            <option value="Sedang">Sedang</option>
            <option value="Tinggi">Tinggi</option>
          </select>
          <input className={inputCls} placeholder="Dari (nama)" value={form.oleh} onChange={(e) => setForm({ ...form, oleh: e.target.value })} />
        </div>
        <button onClick={submit} className={btnPrimary}><Plus size={14} />Tambah Pengumuman</button>
        {status && <p className="text-xs text-red-600">{status}</p>}
      </div>

      <div className="space-y-2">
        {list.length === 0 && <p className="text-xs text-ink-faint">Belum ada pengumuman.</p>}
        {list.map((p) => (
          <div key={p.id} className="flex items-start justify-between gap-3 bg-black/[0.03] rounded-xl p-3">
            <div>
              <p className="text-sm font-semibold text-ink">{p.judul}</p>
              <p className="text-xs text-ink-faint mt-0.5">{p.isi}</p>
              <p className="text-xs text-ink-faint mt-1">{p.tanggal} &middot; {p.prioritas} &middot; {p.oleh}</p>
            </div>
            <button onClick={() => remove(p.id)} className={btnDanger}><Trash2 size={12} />Hapus</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────── AGENDA ───────────────────────────
function AgendaTab() {
  const [list, setList] = useState<AgendaItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({ tanggal: "", judul: "", kategori: "Sekolah", warna: "blue" });

  const load = () => apiGet<AgendaItem[]>("/api/agenda").then(setList).catch(() => {});
  useEffect(() => { load().finally(() => setLoaded(true)); }, []);

  const submit = async () => {
    if (!form.tanggal || !form.judul.trim()) return;
    await apiPost("/api/agenda", form).catch(() => {});
    setForm({ tanggal: "", judul: "", kategori: "Sekolah", warna: "blue" });
    load();
  };

  const remove = async (id: string) => {
    await apiDelete(`/api/agenda?id=${id}`).catch(() => {});
    load();
  };

  if (!loaded) return <p className="text-xs text-ink-faint">Memuat...</p>;

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-4 border border-ink/10 space-y-3">
        <div className="flex gap-2 flex-wrap">
          <input type="date" className={inputCls} value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} />
          <input className={`${inputCls} flex-1 min-w-40`} placeholder="Judul agenda" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} />
        </div>
        <div className="flex gap-2">
          <input className={inputCls} placeholder="Kategori" value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} />
          <select className={inputCls} value={form.warna} onChange={(e) => setForm({ ...form, warna: e.target.value })}>
            <option value="blue">Biru</option>
            <option value="red">Merah</option>
            <option value="green">Hijau</option>
            <option value="purple">Ungu</option>
          </select>
        </div>
        <button onClick={submit} className={btnPrimary}><Plus size={14} />Tambah Agenda</button>
      </div>

      <div className="space-y-2">
        {list.length === 0 && <p className="text-xs text-ink-faint">Belum ada agenda.</p>}
        {list.map((a) => (
          <div key={a.id} className="flex items-center justify-between gap-3 bg-black/[0.03] rounded-xl p-3">
            <div>
              <p className="text-sm font-semibold text-ink">{a.judul}</p>
              <p className="text-xs text-ink-faint">{a.tanggal} &middot; {a.kategori}</p>
            </div>
            <button onClick={() => remove(a.id)} className={btnDanger}><Trash2 size={12} />Hapus</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────── SISWA ───────────────────────────
function SiswaTab() {
  const [list, setList] = useState<Siswa[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [newName, setNewName] = useState("");
  const [status, setStatus] = useState("");

  const load = () => apiGet<Siswa[]>("/api/students").then(setList).catch(() => {});
  useEffect(() => { load().finally(() => setLoaded(true)); }, []);

  const updateField = (id: string, field: keyof Siswa, value: string) => {
    setList((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
  };

  const saveRow = async (s: Siswa) => {
    setStatus(`Menyimpan ${s.nama}...`);
    try {
      await apiPut(`/api/students?id=${s.id}`, { nis: s.nis, gender: s.jenisKelamin, role: s.jabatan });
      setStatus("Tersimpan ✓");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Gagal menyimpan");
    }
    setTimeout(() => setStatus(""), 2500);
  };

  const addStudent = async () => {
    if (!newName.trim()) return;
    await apiPost("/api/students", { name: newName.trim() }).catch(() => {});
    setNewName("");
    load();
  };

  const remove = async (id: string) => {
    if (!window.confirm("Hapus siswa ini dari data?")) return;
    await apiDelete(`/api/students?id=${id}`).catch(() => {});
    load();
  };

  if (!loaded) return <p className="text-xs text-ink-faint">Memuat...</p>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input className={`${inputCls} flex-1`} placeholder="Nama siswa baru" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <button onClick={addStudent} className={btnPrimary}><Plus size={14} />Tambah</button>
      </div>
      {status && <p className="text-xs text-ink-soft">{status}</p>}
      <div className="space-y-2 max-h-[32rem] overflow-y-auto pr-1">
        {list.map((s) => (
          <div key={s.id} className="grid grid-cols-12 gap-2 items-center bg-black/[0.03] rounded-xl p-2">
            <span className="col-span-3 text-xs font-semibold text-ink truncate">{s.nama}</span>
            <input className={`${inputCls} col-span-2`} placeholder="NIS" value={s.nis} onChange={(e) => updateField(s.id, "nis", e.target.value)} />
            <select className={`${inputCls} col-span-2`} value={s.jenisKelamin} onChange={(e) => updateField(s.id, "jenisKelamin", e.target.value)}>
              <option value="">-</option>
              <option value="L">L</option>
              <option value="P">P</option>
            </select>
            <input className={`${inputCls} col-span-3`} placeholder="Jabatan" value={s.jabatan} onChange={(e) => updateField(s.id, "jabatan", e.target.value)} />
            <button onClick={() => saveRow(s)} className="col-span-1 text-sage hover:text-sage flex justify-center"><Save size={14} /></button>
            <button onClick={() => remove(s.id)} className="col-span-1 text-red-600 hover:text-red-700 flex justify-center"><Trash2 size={14} /></button>
          </div>
        ))}
        {list.length === 0 && <p className="text-xs text-ink-faint">Belum ada data siswa.</p>}
      </div>
    </div>
  );
}

// ─────────────────────────── MAIN ───────────────────────────
const TABS = [
  { key: "info", label: "Info Kelas", icon: <School size={16} />, Component: InfoKelasTab },
  { key: "jadwal", label: "Jadwal Pelajaran", icon: <Calendar size={16} />, Component: JadwalTab },
  { key: "piket", label: "Piket", icon: <ClipboardList size={16} />, Component: PiketTab },
  { key: "nilai", label: "Nilai", icon: <Award size={16} />, Component: NilaiTab },
  { key: "pengumuman", label: "Pengumuman", icon: <Bell size={16} />, Component: PengumumanTab },
  { key: "agenda", label: "Agenda", icon: <CalendarDays size={16} />, Component: AgendaTab },
  { key: "siswa", label: "Siswa & Struktur", icon: <Users size={16} />, Component: SiswaTab },
] as const;

export default function Admin() {
  const [verified, setVerified] = useState(isAdminVerified());
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["key"]>("info");

  if (!verified) return <LoginForm onSuccess={() => setVerified(true)} />;

  const ActiveComponent = TABS.find((t) => t.key === activeTab)!.Component;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black gradient-text">Admin Panel</h1>
          <p className="text-ink-soft text-sm mt-1">Kelola data website Portal X-6</p>
        </div>
        <button
          onClick={() => { clearAdminKey(); setVerified(false); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold glass border border-ink/15 text-ink-soft hover:text-ink transition-all">
          <LogOut size={14} />Keluar
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap border transition-all flex-shrink-0 ${activeTab === t.key ? "bg-sage border-sage text-ink" : "glass border-ink/15 text-ink-soft hover:text-ink"}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl p-5 border border-ink/10">
        <ActiveComponent />
      </div>
    </div>
  );
}
