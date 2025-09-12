// Debug endpoint to check environment and routing
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      hasLztToken: !!process.env.LZT_TOKEN,
      tokenLength: process.env.LZT_TOKEN ? process.env.LZT_TOKEN.length : 0,
      tokenStart: process.env.LZT_TOKEN ? process.env.LZT_TOKEN.substring(0, 20) + '...' : 'not found',
      vercelRegion: process.env.VERCEL_REGION || 'unknown',
      queryParams: req.query,
      headers: {
        userAgent: req.headers['user-agent'],
        host: req.headers.host,
        origin: req.headers.origin
      }
    }

    // Test LZT API connection if token exists
    if (process.env.LZT_TOKEN) {
      try {
        const testResponse = await fetch('https://prod-api.lzt.market/mihoyo?page=1&per_page=1', {
          headers: {
            'Authorization': `Bearer ${process.env.LZT_TOKEN}`,
            'Content-Type': 'application/json',
            'User-Agent': 'SenjaGames-Debug/1.0'
          }
        })
        
        debugInfo.lztApiTest = {
          status: testResponse.status,
          statusText: testResponse.statusText,
          success: testResponse.ok
        }

        if (testResponse.ok) {
          const data = await testResponse.json()
          debugInfo.lztApiTest.itemsReturned = data.items?.length || 0
        } else {
          debugInfo.lztApiTest.error = await testResponse.text()
        }
      } catch (apiError) {
        debugInfo.lztApiTest = {
          error: apiError.message,
          success: false
        }
      }
    }

    res.status(200).json(debugInfo)
  } catch (error) {
    res.status(500).json({
      error: 'Debug endpoint error',
      message: error.message
    })
  }
}
