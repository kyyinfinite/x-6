import { connectDB } from '../../lib/db.js'
import { applyCors } from '../../lib/cors.js'
import { requireAuth } from '../../lib/auth.js'
import Student from '../../lib/models/Student.js'

export default async function handler(req, res) {
  if (applyCors(req, res)) return

  const { id } = req.query

  try {
    await connectDB()

    if (req.method === 'GET') {
      const student = await Student.findById(id)
      if (!student) return res.status(404).json({ error: 'Siswa tidak ditemukan' })
      return res.status(200).json({ data: student })
    }

    if (req.method === 'PUT') {
      if (!requireAuth(req, res)) return
      const updates = req.body || {}
      const student = await Student.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
      if (!student) return res.status(404).json({ error: 'Siswa tidak ditemukan' })
      return res.status(200).json({ data: student })
    }

    if (req.method === 'DELETE') {
      if (!requireAuth(req, res)) return
      const student = await Student.findByIdAndDelete(id)
      if (!student) return res.status(404).json({ error: 'Siswa tidak ditemukan' })
      return res.status(200).json({ data: true })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
