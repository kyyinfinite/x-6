import { connectDB, classGroupId } from '../../lib/db.js'
import { applyCors } from '../../lib/cors.js'
import { requireAuth } from '../../lib/auth.js'
import { todayStr } from '../../lib/format.js'
import Attendance from '../../lib/models/Attendance.js'

export default async function handler(req, res) {
  if (applyCors(req, res)) return

  try {
    await connectDB()
    const groupId = classGroupId()

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
