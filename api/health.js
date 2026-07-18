import { connectDB } from '../lib/db.js'
import { applyCors } from '../lib/cors.js'
import mongoose from 'mongoose'

export default async function handler(req, res) {
  if (applyCors(req, res)) return

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
