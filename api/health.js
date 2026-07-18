import { connectDB } from '../lib/db.js'
import { applyCors } from '../lib/cors.js'
import { isAuthorized } from '../lib/auth.js'
import mongoose from 'mongoose'

export default async function handler(req, res) {
  if (applyCors(req, res)) return

  if (req.method === 'POST') {
    if (!isAuthorized(req)) return res.status(401).json({ valid: false })
    return res.status(200).json({ valid: true })
  }

  try {
    await connectDB()
    res.status(200).json({
      ok: true,
      db: mongoose.connection.readyState === 1 ? 'connected' : 'not-connected',
      time: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}
