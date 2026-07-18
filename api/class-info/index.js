import { connectDB, classGroupId } from '../../lib/db.js'
import { applyCors } from '../../lib/cors.js'
import { requireAuth } from '../../lib/auth.js'
import ClassInfo from '../../lib/models/ClassInfo.js'

export default async function handler(req, res) {
  if (applyCors(req, res)) return

  try {
    await connectDB()
    const groupId = classGroupId()

    if (req.method === 'GET') {
      let doc = await ClassInfo.findOne({ groupId })
      if (!doc) doc = await ClassInfo.create({ groupId })
      return res.status(200).json({ data: doc })
    }

    if (req.method === 'PUT') {
      if (!requireAuth(req, res)) return
      const updates = req.body || {}
      const doc = await ClassInfo.findOneAndUpdate({ groupId }, updates, { upsert: true, new: true })
      return res.status(200).json({ data: doc })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
