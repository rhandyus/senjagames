/*
// COMMENTED OUT - Vercel 12 serverless function limit
// This function can be re-enabled by uncommenting when needed
// Use /api/lzt/wot as alternative via dynamic routing

// Vercel Serverless Function for World of Tanks accounts
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
    const { page = 1, order_by = 'price_to_up', per_page = 20, ...otherParams } = req.query

    // Get token from environment
    const token =
      process.env.ZELENKA_TOKEN || process.env.VITE_ZELENKA_TOKEN || process.env.LZT_TOKEN

    if (!token) {
      console.error('❌ No LZT Market token found')
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'Missing API token'
      })
    }

    // Build LZT Market API URL for WOT category
    const baseURL = 'https://prod-api.lzt.market'
    const apiURL = new URL('wot', baseURL)

    // Add pagination
    apiURL.searchParams.append('page', page)
    apiURL.searchParams.append('per_page', per_page)

    // Add sorting
    if (order_by) apiURL.searchParams.append('order_by', order_by)

    // Add all other query parameters
    Object.entries(otherParams).forEach(([key, value]) => {
      if (value && value !== '' && value !== 'undefined') {
        apiURL.searchParams.append(key, value)
      }
    })

    console.log(`🎮 WOT API Request:`, apiURL.toString())

    // Make request to LZT Market API
    const response = await fetch(apiURL.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SenjaGames-WOT-API/1.0'
      }
    })

    if (!response.ok) {
      console.error('❌ LZT WOT API Error:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('WOT Error details:', errorText)

      // Check if it's a 404, which might mean the endpoint doesn't exist
      if (response.status === 404) {
        return res.status(404).json({
          error: 'WOT endpoint not found',
          message: 'The World of Tanks endpoint may not be available in the LZT Market API',
          suggestedAction: 'Check if "wot" is a valid category in the LZT Market API'
        })
      }

      return res.status(response.status).json({
        error: 'LZT Market API error',
        status: response.status,
        message: errorText
      })
    }

    const data = await response.json()
    console.log(`✅ WOT API Success: ${data.items?.length || 0} accounts returned`)

    // Return the data
    res.status(200).json(data)
  } catch (error) {
    console.error('❌ WOT API Error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
}
*/

// Placeholder export to prevent import errors
export default function handler(req, res) {
  res.status(503).json({
    error: 'World of Tanks API temporarily disabled',
    message:
      'This endpoint is commented out due to Vercel 12 function limit. Use /api/lzt/wot instead.'
  })
}
