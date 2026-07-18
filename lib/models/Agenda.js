import mongoose from 'mongoose'

const agendaSchema = new mongoose.Schema(
  {
    groupId: { type: String, required: true, index: true },
    tanggal: { type: String, required: true },
    judul: { type: String, required: true },
    kategori: { type: String, default: 'Sekolah' },
    warna: { type: String, enum: ['blue', 'red', 'green', 'purple'], default: 'blue' },
  },
  { timestamps: true }
)

export default mongoose.models.Agenda || mongoose.model('Agenda', agendaSchema)
