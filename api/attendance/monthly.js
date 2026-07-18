import { connectDB, classGroupId } from '../../lib/db.js'
import { applyCors } from '../../lib/cors.js'
import { lastNMonths } from '../../lib/format.js'
import Attendance from '../../lib/models/Attendance.js'

export default async function handler(req, res) {
  if (applyCors(req, res)) return
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    await connectDB()
    const groupId = classGroupId()
    const months = lastNMonths(6)
    const earliestKey = months[0].key

    const records = await Attendance.find({
      groupId,
      date: { $gte: `${earliestKey}-01` },
    })

    const result = months.map(({ key, label }) => {
      const inMonth = records.filter(r => r.date.startsWith(key))
      const total = inMonth.length || 1
      const counts = { hadir: 0, izin: 0, sakit: 0, alpha: 0 }
      for (const r of inMonth) counts[r.status] = (counts[r.status] || 0) + 1

      return {
        bulan: label,
        hadir: Math.round((counts.hadir / total) * 100),
        sakit: Math.round((counts.sakit / total) * 100),
        izin: Math.round((counts.izin / total) * 100),
        alpha: Math.round((counts.alpha / total) * 100),
      }
    })

    res.status(200).json({ data: result })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
