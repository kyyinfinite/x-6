import { connectDB, classGroupId } from '../../lib/db.js'
import { applyCors } from '../../lib/cors.js'
import { todayStr, humanDate } from '../../lib/format.js'
import Attendance from '../../lib/models/Attendance.js'
import Student from '../../lib/models/Student.js'

export default async function handler(req, res) {
  if (applyCors(req, res)) return
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    await connectDB()
    const groupId = classGroupId()
    const date = req.query.date || todayStr()

    const totalSiswa = await Student.countDocuments({ groupId, active: true })
    const records = await Attendance.find({ groupId, date })

    const counts = { hadir: 0, izin: 0, sakit: 0, alpha: 0 }
    const detail = []

    for (const r of records) {
      counts[r.status] = (counts[r.status] || 0) + 1
      if (r.status !== 'hadir') {
        detail.push({
          nis: '',
          nama: r.studentName,
          status: r.status.charAt(0).toUpperCase() + r.status.slice(1),
          keterangan: r.reason || '-',
        })
      }
    }

    const total = totalSiswa || records.length
    const persentase = total ? Number(((counts.hadir / total) * 100).toFixed(1)) : 0

    res.status(200).json({
      data: {
        tanggal: humanDate(date),
        hadir: counts.hadir,
        sakit: counts.sakit,
        izin: counts.izin,
        alpha: counts.alpha,
        total,
        persentase,
        detail,
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
