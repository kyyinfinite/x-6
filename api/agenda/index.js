import { connectDB, classGroupId } from '../../lib/db.js'
import { applyCors } from '../../lib/cors.js'
import { requireAuth } from '../../lib/auth.js'
import Agenda from '../../lib/models/Agenda.js'

export default async function handler(req, res) {
  if (applyCors(req, res)) return

  try {
    await connectDB()
    const groupId = classGroupId()

    if (req.method === 'GET') {
      const docs = await Agenda.find({ groupId }).sort({ tanggal: 1 }).limit(20)
      const agendaList = docs.map(d => ({
        id: d._id.toString(),
        tanggal: d.tanggal,
        judul: d.judul,
        kategori: d.kategori,
        warna: d.warna,
      }))
      return res.status(200).json({ data: agendaList })
    }

    if (req.method === 'POST') {
      if (!requireAuth(req, res)) return
      const { tanggal, judul, kategori, warna } = req.body || {}
      if (!tanggal || !judul) return res.status(400).json({ error: 'tanggal dan judul wajib diisi' })

      const doc = await Agenda.create({ groupId, tanggal, judul, kategori: kategori || 'Sekolah', warna: warna || 'blue' })
      return res.status(201).json({ data: doc })
    }

    if (req.method === 'DELETE') {
      if (!requireAuth(req, res)) return
      const { id } = req.query
      if (!id) return res.status(400).json({ error: 'id wajib diisi' })
      await Agenda.findByIdAndDelete(id)
      return res.status(200).json({ data: true })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
