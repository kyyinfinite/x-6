import { connectDB, classGroupId } from '../lib/db.js'
import { applyCors } from '../lib/cors.js'
import { requireAuth } from '../lib/auth.js'
import Student from '../lib/models/Student.js'

export default async function handler(req, res) {
  if (applyCors(req, res)) return

  const { id } = req.query

  try {
    await connectDB()
    const groupId = classGroupId()

    if (id) {
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

      return res.status(405).json({ error: 'Method not allowed' })
    }

    if (req.method === 'GET') {
      const students = await Student.find({ groupId, active: true }).sort({ name: 1 })
      const siswaList = students.map((s, i) => ({
        id: s._id.toString(),
        nis: s.nis || String(i + 1).padStart(5, '0'),
        nama: s.name,
        jenisKelamin: s.gender || '-',
        jabatan: s.role || 'Anggota',
        foto: s.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=1e3a5f&color=60a5fa&size=128&bold=true`,
        nilaiRata: s.averageGrade || 0,
        status: s.status || 'Aktif',
      }))
      return res.status(200).json({ data: siswaList })
    }

    if (req.method === 'POST') {
      if (!requireAuth(req, res)) return
      const { name, nis, gender, role, photoUrl } = req.body || {}
      if (!name) return res.status(400).json({ error: 'name wajib diisi' })

      const student = await Student.create({
        groupId,
        name,
        nis: nis || '',
        gender: gender || '',
        role: role || 'Anggota',
        photoUrl: photoUrl || '',
      })
      return res.status(201).json({ data: student })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
