import { connectDB, classGroupId } from '../../lib/db.js'
import { applyCors } from '../../lib/cors.js'
import { monthStr, lastNMonths } from '../../lib/format.js'
import Transaction from '../../lib/models/Transaction.js'
import GroupConfig from '../../lib/models/GroupConfig.js'
import Student from '../../lib/models/Student.js'

export default async function handler(req, res) {
  if (applyCors(req, res)) return
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    await connectDB()
    const groupId = classGroupId()
    const period = monthStr()
    const target = Number(process.env.KAS_TARGET || 0)

    const groupConfig = await GroupConfig.findOne({ groupId })
    const totalSiswa = await Student.countDocuments({ groupId, active: true })
    const all = await Transaction.find({ groupId }).sort({ createdAt: 1 })

    let running = 0
    let saldoAwalBulan = 0
    let pemasukanBulanIni = 0
    let pengeluaranBulanIni = 0
    const payers = new Set()
    const withRunning = []

    for (const t of all) {
      const inMonth = monthStr(t.createdAt) === period
      const isIncome = t.type !== 'pengeluaran'

      if (!inMonth) saldoAwalBulan += isIncome ? t.amount : -t.amount
      else if (isIncome) pemasukanBulanIni += t.amount
      else pengeluaranBulanIni += t.amount

      running += isIncome ? t.amount : -t.amount
      if (t.type === 'kas_masuk' && inMonth) payers.add(t.studentName)

      withRunning.push({
        id: t._id.toString(),
        tanggal: new Date(t.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        keterangan: t.description || (t.type === 'kas_masuk' ? `Iuran kas — ${t.studentName}` : ''),
        jenis: t.type === 'pengeluaran' ? 'Keluar' : 'Masuk',
        jumlah: t.amount,
        saldo: running,
      })
    }

    const months = lastNMonths(6)
    const arusBulanan = months.map(({ key, label }) => {
      const inMonth = all.filter(t => monthStr(t.createdAt) === key)
      const masuk = inMonth.filter(t => t.type !== 'pengeluaran').reduce((a, t) => a + t.amount, 0)
      const keluar = inMonth.filter(t => t.type === 'pengeluaran').reduce((a, t) => a + t.amount, 0)
      return { bulan: label, masuk, keluar }
    })

    res.status(200).json({
      data: {
        saldo: running,
        target,
        siswaLunas: payers.size,
        siswaBelumLunas: Math.max(totalSiswa - payers.size, 0),
        iuranPerSiswa: groupConfig?.kasAmount || 0,
        frekuensiIuran: 'Mingguan',
        bulanIni: {
          pemasukan: pemasukanBulanIni,
          pengeluaran: pengeluaranBulanIni,
          saldo_awal: saldoAwalBulan,
        },
        arusBulanan,
        riwayat: withRunning.slice(-30).reverse(),
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
