import { LZTMarket } from 'lzt-market-sdk'

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('📥 /api/lzt/categories endpoint called')

    // Initialize LZT Market SDK
    const lztMarket = new LZTMarket('YOUR_TOKEN_HERE', 'market')

    // Call the categories method
    const result = await lztMarket.categories()

    console.log(`✅ Categories API returned data`)

    return res.status(200).json(result)
  } catch (error) {
    console.error('❌ Error in /api/lzt/categories:', error)
    return res.status(500).json({ error: error.message })
  }
}
