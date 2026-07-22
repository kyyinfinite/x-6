import { connectDB, classGroupId } from '../lib/db.js'
import { applyCors } from '../lib/cors.js'
import { todayStr, humanDate, monthStr, lastNMonths } from '../lib/format.js'
import Student from '../lib/models/Student.js'
import Attendance from '../lib/models/Attendance.js'
import Transaction from '../lib/models/Transaction.js'
import ClassInfo from '../lib/models/ClassInfo.js'

export default async function handler(req, res) {
  if (applyCors(req, res)) return
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    await connectDB()
    const groupId = classGroupId()

    const students = await Student.find({ groupId, active: true })
    const totalSiswa = students.length
    const siswaLaki = students.filter(s => s.gender === 'L').length
    const siswaPerempuan = students.filter(s => s.gender === 'P').length

    let classInfo = await ClassInfo.findOne({ groupId })
    if (!classInfo) classInfo = await ClassInfo.create({ groupId })

    const date = todayStr()
    const todayRecords = await Attendance.find({ groupId, date })
    const counts = { hadir: 0, izin: 0, sakit: 0, alpha: 0 }
    const detail = []
    for (const r of todayRecords) {
      counts[r.status] = (counts[r.status] || 0) + 1
      if (r.status !== 'hadir') {
        detail.push({ nis: '', nama: r.studentName, status: r.status, keterangan: r.reason || '-' })
      }
    }
    const totalHariIni = totalSiswa || todayRecords.length
    const persentase = totalHariIni ? Number(((counts.hadir / totalHariIni) * 100).toFixed(1)) : 0

    const months = lastNMonths(6)
    const earliestKey = months[0].key
    const historicalRecords = await Attendance.find({ groupId, date: { $gte: `${earliestKey}-01` } })
    const kehadiranBulanan = months.map(({ key, label }) => {
      const inMonth = historicalRecords.filter(r => r.date.startsWith(key))
      const total = inMonth.length || 1
      const c = { hadir: 0, izin: 0, sakit: 0, alpha: 0 }
      for (const r of inMonth) c[r.status] = (c[r.status] || 0) + 1
      return {
        bulan: label,
        hadir: Math.round((c.hadir / total) * 100),
        sakit: Math.round((c.sakit / total) * 100),
        izin: Math.round((c.izin / total) * 100),
        alpha: Math.round((c.alpha / total) * 100),
      }
    })

    const period = monthStr()
    const transactions = await Transaction.find({ groupId }).sort({ createdAt: 1 })
    let saldo = 0
    let pemasukanBulanIni = 0
    let pengeluaranBulanIni = 0
    const payers = new Set()
    for (const t of transactions) {
      const isIncome = t.type !== 'pengeluaran'
      saldo += isIncome ? t.amount : -t.amount
      if (monthStr(t.createdAt) === period) {
        if (isIncome) pemasukanBulanIni += t.amount
        else pengeluaranBulanIni += t.amount
        if (t.type === 'kas_masuk') payers.add(t.studentName)
      }
    }

    const riwayat = transactions
      .slice(-10)
      .reverse()
      .map(t => ({
        id: t._id.toString(),
        tanggal: new Date(t.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        keterangan: t.description || (t.type === 'kas_masuk' ? `Iuran kas — ${t.studentName}` : ''),
        jenis: t.type === 'pengeluaran' ? 'Keluar' : 'Masuk',
        jumlah: t.amount,
      }))

    res.status(200).json({
      data: {
        kelasInfo: {
          nama: classInfo.nama,
          tahunAjaran: classInfo.tahunAjaran,
          waliKelas: classInfo.waliKelas,
          ruangan: classInfo.ruangan,
          jurusan: classInfo.jurusan,
          motto: classInfo.motto,
          totalSiswa,
          siswaLaki,
          siswaPerempuan,
        },
        kehadiranHariIni: {
          tanggal: humanDate(date),
          hadir: counts.hadir,
          sakit: counts.sakit,
          izin: counts.izin,
          alpha: counts.alpha,
          total: totalHariIni,
          persentase,
          detail,
        },
        kehadiranBulanan,
        kasData: {
          saldo,
          target: Number(process.env.KAS_TARGET || 0),
          siswaLunas: payers.size,
          siswaBelumLunas: Math.max(totalSiswa - payers.size, 0),
          bulanIni: {
            pemasukan: pemasukanBulanIni,
            pengeluaran: pengeluaranBulanIni,
            saldo_awal: saldo - pemasukanBulanIni + pengeluaranBulanIni,
          },
          riwayat,
        },
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
