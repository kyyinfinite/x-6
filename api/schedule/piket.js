import { connectDB, classGroupId } from '../../lib/db.js'
import { applyCors } from '../../lib/cors.js'
import { requireAuth } from '../../lib/auth.js'
import Piket from '../../lib/models/Piket.js'

export default async function handler(req, res) {
  if (applyCors(req, res)) return

  try {
    await connectDB()
    const groupId = classGroupId()

    if (req.method === 'GET') {
      const docs = await Piket.find({ groupId }).sort({ kelompok: 1 })
      const jadwalPiket = docs.map(d => ({ hari: d.day, kelompok: d.kelompok, anggota: d.anggota }))
      return res.status(200).json({ data: jadwalPiket })
    }

    if (req.method === 'PUT') {
      if (!requireAuth(req, res)) return
      const { day, kelompok, anggota } = req.body || {}
      if (!day || !Array.isArray(anggota)) return res.status(400).json({ error: 'day dan anggota wajib diisi' })

      const doc = await Piket.findOneAndUpdate(
        { groupId, day },
        { kelompok: kelompok || 1, anggota },
        { upsert: true, new: true }
      )
      return res.status(200).json({ data: doc })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
