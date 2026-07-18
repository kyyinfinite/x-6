import { connectDB, classGroupId } from '../../lib/db.js'
import { applyCors } from '../../lib/cors.js'
import { requireAuth } from '../../lib/auth.js'
import Announcement from '../../lib/models/Announcement.js'

export default async function handler(req, res) {
  if (applyCors(req, res)) return

  try {
    await connectDB()
    const groupId = classGroupId()

    if (req.method === 'GET') {
      const docs = await Announcement.find({ groupId }).sort({ createdAt: -1 }).limit(20)
      const pengumumanList = docs.map(d => ({
        id: d._id.toString(),
        judul: d.judul,
        isi: d.isi,
        tanggal: new Date(d.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        prioritas: d.prioritas,
        oleh: d.oleh,
      }))
      return res.status(200).json({ data: pengumumanList })
    }

    if (req.method === 'POST') {
      if (!requireAuth(req, res)) return
      const { judul, isi, prioritas, oleh } = req.body || {}
      if (!judul || !isi) return res.status(400).json({ error: 'judul dan isi wajib diisi' })

      const doc = await Announcement.create({ groupId, judul, isi, prioritas: prioritas || 'Normal', oleh: oleh || '' })
      return res.status(201).json({ data: doc })
    }

    if (req.method === 'DELETE') {
      if (!requireAuth(req, res)) return
      const { id } = req.query
      if (!id) return res.status(400).json({ error: 'id wajib diisi' })
      await Announcement.findByIdAndDelete(id)
      return res.status(200).json({ data: true })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
