import mongoose from 'mongoose'

const piketSchema = new mongoose.Schema(
  {
    groupId: { type: String, required: true, index: true },
    day: {
      type: String,
      enum: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
      required: true,
    },
    kelompok: { type: Number, default: 1 },
    anggota: { type: [String], default: [] },
  },
  { timestamps: true }
)

piketSchema.index({ groupId: 1, day: 1 }, { unique: true })

export default mongoose.models.Piket || mongoose.model('Piket', piketSchema)
