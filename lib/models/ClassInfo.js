import mongoose from 'mongoose'

const classInfoSchema = new mongoose.Schema(
  {
    groupId: { type: String, required: true, unique: true },
    nama: { type: String, default: 'Kelas X-6' },
    tahunAjaran: { type: String, default: '' },
    waliKelas: { type: String, default: '' },
    waliFoto: { type: String, default: '' },
    ruangan: { type: String, default: '' },
    jurusan: { type: String, default: '' },
    motto: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.models.ClassInfo || mongoose.model('ClassInfo', classInfoSchema)
