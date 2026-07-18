import mongoose from 'mongoose'

const studentSchema = new mongoose.Schema(
  {
    groupId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    aliasNames: { type: [String], default: [] },
    className: { type: String, default: 'X-6' },
    jid: { type: String, default: '' },
    active: { type: Boolean, default: true },
    nis: { type: String, default: '' },
    gender: { type: String, enum: ['L', 'P', ''], default: '' },
    role: { type: String, default: 'Anggota' },
    photoUrl: { type: String, default: '' },
    status: { type: String, default: 'Aktif' },
    averageGrade: { type: Number, default: 0 },
  },
  { timestamps: true }
)

studentSchema.index({ groupId: 1, name: 1 }, { unique: true })

export default mongoose.models.Student || mongoose.model('Student', studentSchema)
