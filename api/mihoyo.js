// Specific MiHoYo API endpoint
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
    const { ...queryParams } = req.query

    console.log(`🔍 MiHoYo API Request - queryParams: ${JSON.stringify(queryParams)}`)

    // Build LZT Market API URL for MiHoYo
    const baseURL = 'https://prod-api.lzt.market'
    const apiURL = new URL('mihoyo', baseURL)

    // Add all query parameters
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value && value !== '') {
        apiURL.searchParams.append(key, value)
      }
    })

    // Get token from environment
    const token = process.env.LZT_TOKEN

    if (!token) {
      console.error('❌ No LZT Market token found')
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'Missing API token'
      })
    }

    console.log(`🎮 LZT API Request for MiHoYo:`, apiURL.toString())

    // Make request to LZT Market API
    const response = await fetch(apiURL.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SenjaGames-API/1.0'
      }
    })

    if (!response.ok) {
      console.error('❌ LZT API Error:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Error details:', errorText)

      return res.status(response.status).json({
        error: 'LZT Market API error',
        status: response.status,
        message: errorText,
        category: 'mihoyo'
      })
    }

    const data = await response.json()
    console.log(`✅ LZT API Success for MiHoYo: ${data.items?.length || 0} items returned`)

    // Return the data
    res.status(200).json(data)
  } catch (error) {
    console.error(`❌ LZT API Error for MiHoYo:`, error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      category: 'mihoyo'
    })
  }
}
