import { connectDB, classGroupId } from '../../lib/db.js'
import { applyCors } from '../../lib/cors.js'
import { requireAuth } from '../../lib/auth.js'
import ClassInfo from '../../lib/models/ClassInfo.js'
import PortfolioProject from '../../lib/models/PortfolioProject.js'

function serializePortfolio(doc) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    tag: doc.tag,
    description: doc.description,
    thumbnail: doc.thumbnail,
    link: doc.link,
    order: doc.order,
  }
}

async function handlePortfolio(req, res, groupId) {
  if (req.method === 'GET') {
    const docs = await PortfolioProject.find({ groupId, active: true }).sort({ order: 1, createdAt: 1 })
    return res.status(200).json({ data: docs.map(serializePortfolio) })
  }

  if (req.method === 'POST') {
    if (!requireAuth(req, res)) return
    const { title, tag, description, thumbnail, link, order } = req.body || {}
    if (!title) return res.status(400).json({ error: 'title wajib diisi' })

    const doc = await PortfolioProject.create({
      groupId,
      title,
      tag: tag || '',
      description: description || '',
      thumbnail: thumbnail || '',
      link: link || '',
      order: typeof order === 'number' ? order : 0,
    })
    return res.status(201).json({ data: serializePortfolio(doc) })
  }

  if (req.method === 'PUT') {
    if (!requireAuth(req, res)) return
    const { id, ...updates } = req.body || {}
    if (!id) return res.status(400).json({ error: 'id wajib diisi' })

    const doc = await PortfolioProject.findOneAndUpdate({ _id: id, groupId }, updates, { new: true })
    if (!doc) return res.status(404).json({ error: 'Proyek tidak ditemukan' })
    return res.status(200).json({ data: serializePortfolio(doc) })
  }

  if (req.method === 'DELETE') {
    if (!requireAuth(req, res)) return
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'id wajib diisi' })
    await PortfolioProject.findOneAndDelete({ _id: id, groupId })
    return res.status(200).json({ data: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}

async function handleClassInfo(req, res, groupId) {
  if (req.method === 'GET') {
    let doc = await ClassInfo.findOne({ groupId })
    if (!doc) doc = await ClassInfo.create({ groupId })
    return res.status(200).json({ data: doc })
  }

  if (req.method === 'PUT') {
    if (!requireAuth(req, res)) return
    const updates = req.body || {}
    const doc = await ClassInfo.findOneAndUpdate({ groupId }, updates, { upsert: true, new: true })
    return res.status(200).json({ data: doc })
  }

  res.status(405).json({ error: 'Method not allowed' })
}

export default async function handler(req, res) {
  if (applyCors(req, res)) return

  try {
    await connectDB()
    const groupId = classGroupId()

    if (req.query.resource === 'portfolio') {
      return handlePortfolio(req, res, groupId)
    }

    return handleClassInfo(req, res, groupId)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
