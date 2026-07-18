export function isAuthorized(req) {
  const key = req.headers['x-api-key']
  return Boolean(key) && key === process.env.ADMIN_API_KEY
}

export function requireAuth(req, res) {
  if (!isAuthorized(req)) {
    res.status(401).json({ error: 'Unauthorized, header x-api-key tidak valid' })
    return false
  }
  return true
}
