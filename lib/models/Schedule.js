import mongoose from 'mongoose'

const scheduleItemSchema = new mongoose.Schema(
  {
    jam: { type: String, required: true },
    mapel: { type: String, required: true },
    guru: { type: String, default: '-' },
    ruang: { type: String, default: '-' },
  },
  { _id: false }
)

const scheduleSchema = new mongoose.Schema(
  {
    groupId: { type: String, required: true, index: true },
    day: {
      type: String,
      enum: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
      required: true,
    },
    items: { type: [scheduleItemSchema], default: [] },
  },
  { timestamps: true }
)

scheduleSchema.index({ groupId: 1, day: 1 }, { unique: true })

export default mongoose.models.Schedule || mongoose.model('Schedule', scheduleSchema)
