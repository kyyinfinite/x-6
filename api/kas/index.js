import { connectDB, classGroupId } from '../../lib/db.js'
import { applyCors } from '../../lib/cors.js'
import { requireAuth } from '../../lib/auth.js'
import { monthStr } from '../../lib/format.js'
import Transaction from '../../lib/models/Transaction.js'

export default async function handler(req, res) {
  if (applyCors(req, res)) return

  try {
    await connectDB()
    const groupId = classGroupId()

    if (req.method === 'GET') {
      const records = await Transaction.find({ groupId }).sort({ createdAt: -1 }).limit(200)
      return res.status(200).json({ data: records })
    }

    if (req.method === 'POST') {
      if (!requireAuth(req, res)) return
      const { type, amount, description, studentName } = req.body || {}
      if (!type || !amount) return res.status(400).json({ error: 'type dan amount wajib diisi' })

      const record = await Transaction.create({
        groupId,
        type,
        amount: Number(amount),
        description: description || '',
        studentName: studentName || '',
        period: monthStr(),
        by: 'admin-portal',
      })
      return res.status(201).json({ data: record })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
