import mongoose from 'mongoose'

const globalKey = '__portalX6MongooseCache'

function getCache() {
  if (!global[globalKey]) {
    global[globalKey] = { conn: null, promise: null }
  }
  return global[globalKey]
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI belum diatur')

  const cache = getCache()

  if (cache.conn && mongoose.connection.readyState === 1) {
    return cache.conn
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 10000,
        connectTimeoutMS: 8000,
        maxPoolSize: 5,
        bufferCommands: false,
      })
      .then(m => m)
  }

  try {
    cache.conn = await cache.promise
  } catch (err) {
    cache.promise = null
    throw err
  }

  return cache.conn
}

export function classGroupId() {
  const id = process.env.CLASS_GROUP_ID
  if (!id) throw new Error('CLASS_GROUP_ID belum diatur')
  return id
}
