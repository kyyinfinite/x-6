import mongoose from 'mongoose'

const gradeSchema = new mongoose.Schema(
  {
    groupId: { type: String, required: true, index: true },
    mapel: { type: String, required: true },
    guru: { type: String, default: '' },
    uh1: { type: Number, default: 0 },
    uh2: { type: Number, default: 0 },
    uts: { type: Number, default: 0 },
    uas: { type: Number, default: 0 },
    rataRata: { type: Number, default: 0 },
  },
  { timestamps: true }
)

gradeSchema.index({ groupId: 1, mapel: 1 }, { unique: true })

gradeSchema.pre('save', function computeAverage(next) {
  const values = [this.uh1, this.uh2, this.uts, this.uas].filter(v => typeof v === 'number')
  this.rataRata = values.length ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)) : 0
  next()
})

export default mongoose.models.Grade || mongoose.model('Grade', gradeSchema)
