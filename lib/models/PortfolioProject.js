import mongoose from 'mongoose'

const portfolioProjectSchema = new mongoose.Schema(
  {
    groupId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    tag: { type: String, default: '' },
    description: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    link: { type: String, default: '' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

portfolioProjectSchema.index({ groupId: 1, order: 1 })

export default mongoose.models.PortfolioProject || mongoose.model('PortfolioProject', portfolioProjectSchema)
