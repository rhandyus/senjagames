// Vercel Serverless Function for Steam accounts
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
    const {
      page = 1,
      min_price,
      max_price,
      min_value,
      max_value,
      steam_games,
      level_from,
      level_to,
      order_by = 'price',
      order = 'asc',
      ...otherParams
    } = req.query

    // Build LZT Market API URL for Steam category
    const baseURL = 'https://prod-api.lzt.market'
    const apiURL = new URL('steam', baseURL)

    // Add pagination
    apiURL.searchParams.append('page', page)

    // Add filters
    if (min_price) apiURL.searchParams.append('min_price', min_price)
    if (max_price) apiURL.searchParams.append('max_price', max_price)
    if (min_value) apiURL.searchParams.append('min_value', min_value)
    if (max_value) apiURL.searchParams.append('max_value', max_value)
    if (steam_games) apiURL.searchParams.append('steam_games', steam_games)
    if (level_from) apiURL.searchParams.append('level_from', level_from)
    if (level_to) apiURL.searchParams.append('level_to', level_to)
    if (order_by) apiURL.searchParams.append('order_by', order_by)
    if (order) apiURL.searchParams.append('order', order)

    // Add any other parameters
    Object.entries(otherParams).forEach(([key, value]) => {
      if (value && value !== '') {
        apiURL.searchParams.append(key, value)
      }
    })

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

    console.log('🎮 Steam API Request:', apiURL.toString())

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
        message: errorText
      })
    }

    const data = await response.json()
    console.log(`✅ Steam API Success: ${data.items?.length || 0} accounts returned`)

    // Return the data
    res.status(200).json(data)
  } catch (error) {
    console.error('❌ Steam API Error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
}
