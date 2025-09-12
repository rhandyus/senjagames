// Unified API endpoint for multiple LZT categories (mihoyo, riot, telegram, ea)
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
    const { name, ...queryParams } = req.query

    console.log(`🔍 Unified API Request - name: ${name}, queryParams: ${JSON.stringify(queryParams)}`)

    // Validate category name parameter
    if (!name) {
      return res.status(400).json({
        error: 'Missing category name',
        message: 'Please provide a category name parameter (?name=mihoyo, ?name=riot, ?name=telegram, or ?name=ea)',
        supportedCategories: ['mihoyo', 'riot', 'telegram', 'ea', 'origin']
      })
    }

    // Category mapping
    const categoryMapping = {
      mihoyo: 'mihoyo',
      riot: 'riot', 
      telegram: 'telegram',
      ea: 'ea',
      origin: 'ea' // Origin maps to EA
    }

    const category = categoryMapping[name.toLowerCase()]

    if (!category) {
      console.log(`❌ Unsupported category: ${name}`)
      return res.status(400).json({
        error: 'Unsupported category',
        message: `Category '${name}' is not supported`,
        supportedCategories: Object.keys(categoryMapping)
      })
    }

    console.log(`✅ Category mapping: ${name} -> ${category}`)

    // Build LZT Market API URL
    const baseURL = 'https://prod-api.lzt.market'
    const apiURL = new URL(category, baseURL)

    // Add all query parameters (except 'name')
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

    console.log(`🎮 LZT API Request for ${category}:`, apiURL.toString())

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
        category: category,
        requestedName: name
      })
    }

    const data = await response.json()
    console.log(`✅ LZT API Success for ${category}: ${data.items?.length || 0} items returned`)

    // Return the data
    res.status(200).json(data)
  } catch (error) {
    console.error(`❌ Unified API Error for ${req.query.name}:`, error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      requestedName: req.query.name
    })
  }
}
