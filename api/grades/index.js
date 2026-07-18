import { connectDB, classGroupId } from '../../lib/db.js'
import { applyCors } from '../../lib/cors.js'
import { requireAuth } from '../../lib/auth.js'
import Grade from '../../lib/models/Grade.js'

export default async function handler(req, res) {
  if (applyCors(req, res)) return

  try {
    await connectDB()
    const groupId = classGroupId()

    if (req.method === 'GET') {
      const docs = await Grade.find({ groupId }).sort({ mapel: 1 })
      const nilaiMapel = docs.map(d => ({
        mapel: d.mapel,
        uh1: d.uh1,
        uh2: d.uh2,
        uts: d.uts,
        uas: d.uas,
        rataRata: d.rataRata,
        guru: d.guru,
      }))
      return res.status(200).json({ data: nilaiMapel })
    }

    if (req.method === 'PUT') {
      if (!requireAuth(req, res)) return
      const { mapel, uh1, uh2, uts, uas, guru } = req.body || {}
      if (!mapel) return res.status(400).json({ error: 'mapel wajib diisi' })

      let doc = await Grade.findOne({ groupId, mapel })
      if (!doc) doc = new Grade({ groupId, mapel })

      if (uh1 !== undefined) doc.uh1 = Number(uh1)
      if (uh2 !== undefined) doc.uh2 = Number(uh2)
      if (uts !== undefined) doc.uts = Number(uts)
      if (uas !== undefined) doc.uas = Number(uas)
      if (guru !== undefined) doc.guru = guru

      await doc.save()
      return res.status(200).json({ data: doc })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
