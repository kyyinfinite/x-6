import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema(
  {
    groupId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['kas_masuk', 'pemasukan', 'pengeluaran'],
      required: true,
    },
    studentName: { type: String, default: '' },
    amount: { type: Number, required: true },
    description: { type: String, default: '' },
    period: { type: String, default: '' },
    by: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema)
