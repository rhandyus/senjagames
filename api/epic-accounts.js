/*
// COMMENTED OUT - Vercel 12 serverless function limit
// This function can be re-enabled by uncommenting when needed
// Use /api/epic instead (main Epic Games endpoint)

// Vercel Serverless Function for Epic Games accounts
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

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    // Get query parameters
    const { page = 1, ...filters } = req.query

    // Build LZT Market API URL for Epic Games
    const baseURL = 'https://prod-api.lzt.market'
    const apiURL = new URL('epicgames', baseURL) // This should call lztMarket.categoryEpicGames()

    // Add pagination
    apiURL.searchParams.append('page', page)

    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => apiURL.searchParams.append(key, v))
        } else {
          apiURL.searchParams.append(key, value)
        }
      }
    })

    // Get auth token
    const token = process.env.ZELENKA_TOKEN || process.env.VITE_ZELENKA_TOKEN

    if (!token) {
      throw new Error('ZELENKA_TOKEN not found in environment variables')
    }

    // Make request to LZT Market API
    const response = await fetch(apiURL.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`LZT API responded with status: ${response.status}`)
    }

    const data = await response.json()

    // Transform the response to match our expected format
    const transformedData = {
      success: true,
      data: data.items || [],
      total: data.total_items || 0,
      hasMore: data.hasMore !== false,
      page: parseInt(page),
      message: 'Epic Games accounts fetched successfully'
    }

    res.status(200).json(transformedData)
  } catch (error) {
    console.error('Epic Games API Error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Epic Games accounts',
      details: error.message,
      data: [],
      total: 0
    })
  }
}
*/

// Placeholder export to prevent import errors
export default function handler(req, res) {
  res.status(503).json({
    error: 'Epic Accounts API temporarily disabled',
    message:
      'This endpoint is commented out due to Vercel 12 function limit. Use /api/epic instead.'
  })
}
