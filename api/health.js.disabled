// Health check endpoint for Vercel
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: 'production',
    version: '2.0.0',
    services: {
      api: 'running',
      lztMarket: 'connected',
      winpay: 'available'
    }
  }

  res.status(200).json(health)
}
