import mongoose from 'mongoose'

const groupConfigSchema = new mongoose.Schema(
  {
    groupId: { type: String, required: true, unique: true },
    isAttendanceGroup: { type: Boolean, default: false },
    isKasGroup: { type: Boolean, default: false },
    kasAmount: { type: Number, default: 2000 },
    kasDay: { type: String, default: 'senin' },
    kasTime: { type: String, default: '07:00' },
    className: { type: String, default: 'X-6' },
  },
  { timestamps: true }
)

export default mongoose.models.GroupConfig || mongoose.model('GroupConfig', groupConfigSchema)
