import { connectDB, classGroupId } from '../lib/db.js'
import { applyCors } from '../lib/cors.js'
import ClassInfo from '../lib/models/ClassInfo.js'
import Student from '../lib/models/Student.js'

export default async function handler(req, res) {
  if (applyCors(req, res)) return
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    await connectDB()
    const groupId = classGroupId()

    let classInfo = await ClassInfo.findOne({ groupId })
    if (!classInfo) classInfo = await ClassInfo.create({ groupId })

    const pengurus = await Student.find({ groupId, active: true, role: { $ne: 'Anggota' } }).sort({ role: 1 })

    res.status(200).json({
      data: {
        waliKelas: {
          nama: classInfo.waliKelas,
          foto: classInfo.waliFoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(classInfo.waliKelas || 'Wali Kelas')}&background=1e3a5f&color=60a5fa&size=128&bold=true`,
          jabatan: 'Wali Kelas',
        },
        pengurusInti: pengurus.map(p => ({
          nama: p.name,
          jabatan: p.role,
          foto: p.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=1e3a5f&color=60a5fa&size=128&bold=true`,
          nis: p.nis,
        })),
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
