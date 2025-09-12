// Debug endpoint to check API status
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // This is a simple status endpoint - no actual cache/circuit breaker data
  // since those are in different function instances
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'API endpoints are configured with rate limiting and caching',
    config: {
      rateLimit: '5 seconds between requests',
      cacheTimeout: '5 minutes',
      circuitBreakerThreshold: '3 failures',
      circuitBreakerTimeout: '10 minutes'
    }
  })
}
