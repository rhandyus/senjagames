// Telegram API endpoint
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { ...queryParams } = req.query
    const baseURL = 'https://prod-api.lzt.market'
    const apiURL = new URL('telegram', baseURL)

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value && value !== '') {
        apiURL.searchParams.append(key, value)
      }
    })

    const token = process.env.LZT_TOKEN
    if (!token) {
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'Missing API token'
      })
    }

    const response = await fetch(apiURL.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SenjaGames-API/1.0'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      return res.status(response.status).json({
        error: 'LZT Market API error',
        status: response.status,
        message: errorText,
        category: 'telegram'
      })
    }

    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      category: 'telegram'
    })
  }
}
