import { connectDB, classGroupId } from '../lib/db.js'
import { applyCors } from '../lib/cors.js'
import { requireAuth } from '../lib/auth.js'
import { todayStr, humanDate, lastNMonths } from '../lib/format.js'
import Attendance from '../lib/models/Attendance.js'
import Student from '../lib/models/Student.js'

async function handleToday(req, res, groupId) {
  const date = req.query.date || todayStr()
  const totalSiswa = await Student.countDocuments({ groupId, active: true })
  const records = await Attendance.find({ groupId, date })

  const counts = { hadir: 0, izin: 0, sakit: 0, alpha: 0 }
  const detail = []
  for (const r of records) {
    counts[r.status] = (counts[r.status] || 0) + 1
    if (r.status !== 'hadir') {
      detail.push({ nis: '', nama: r.studentName, status: r.status, keterangan: r.reason || '-' })
    }
  }

  const total = totalSiswa || records.length
  const persentase = total ? Number(((counts.hadir / total) * 100).toFixed(1)) : 0

  return res.status(200).json({
    data: { tanggal: humanDate(date), hadir: counts.hadir, sakit: counts.sakit, izin: counts.izin, alpha: counts.alpha, total, persentase, detail },
  })
}

async function handleMonthly(req, res, groupId) {
  const months = lastNMonths(6)
  const earliestKey = months[0].key
  const records = await Attendance.find({ groupId, date: { $gte: `${earliestKey}-01` } })

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

  return res.status(200).json({ data: result })
}

export default async function handler(req, res) {
  if (applyCors(req, res)) return

  try {
    await connectDB()
    const groupId = classGroupId()
    const view = req.query.view

    if (req.method === 'GET' && view === 'today') return handleToday(req, res, groupId)
    if (req.method === 'GET' && view === 'monthly') return handleMonthly(req, res, groupId)

    if (req.method === 'GET') {
      const date = req.query.date
      const query = date ? { groupId, date } : { groupId }
      const records = await Attendance.find(query).sort({ date: -1, studentName: 1 }).limit(500)
      return res.status(200).json({ data: records })
    }

    if (req.method === 'POST') {
      if (!requireAuth(req, res)) return
      const { studentName, status, reason, date } = req.body || {}
      if (!studentName || !status) {
        return res.status(400).json({ error: 'studentName dan status wajib diisi' })
      }

      const record = await Attendance.findOneAndUpdate(
        { groupId, studentName, date: date || todayStr() },
        { status, reason: reason || '', source: 'manual' },
        { upsert: true, new: true }
      )
      return res.status(201).json({ data: record })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
