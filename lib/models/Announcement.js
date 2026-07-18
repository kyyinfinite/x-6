import mongoose from 'mongoose'

const announcementSchema = new mongoose.Schema(
  {
    groupId: { type: String, required: true, index: true },
    judul: { type: String, required: true },
    isi: { type: String, required: true },
    prioritas: { type: String, enum: ['Tinggi', 'Sedang', 'Normal'], default: 'Normal' },
    oleh: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema)
