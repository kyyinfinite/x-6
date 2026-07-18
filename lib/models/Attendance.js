import mongoose from 'mongoose'

const attendanceSchema = new mongoose.Schema(
  {
    groupId: { type: String, required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
    studentName: { type: String, required: true },
    className: { type: String, default: 'X-6' },
    date: { type: String, required: true },
    status: {
      type: String,
      enum: ['hadir', 'izin', 'sakit', 'alpha'],
      default: 'hadir',
    },
    reason: { type: String, default: '' },
    rawMessage: { type: String, default: '' },
    reportedBy: { type: String, default: '' },
    source: { type: String, enum: ['auto', 'laporan', 'manual'], default: 'auto' },
  },
  { timestamps: true }
)

attendanceSchema.index({ groupId: 1, studentName: 1, date: 1 }, { unique: true })

export default mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema)
