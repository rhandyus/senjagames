export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed'
    })
  }

  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'senjagames-winpay-callback',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      callback: '/api/winpay/payment',
      health: '/api/winpay/health'
    },
    config: {
      partnerId: process.env.WINPAY_PARTNER_ID ? 'Set' : 'Not set',
      clientSecret: process.env.WINPAY_CLIENT_SECRET ? 'Set' : 'Not set'
    }
  })
}
