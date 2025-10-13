// Unified API endpoint for multiple LZT categories (mihoyo, riot, telegram, ea, epicgamesgames)
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

    console.log(
      `🔍 Unified API Request - name: ${name}, queryParams: ${JSON.stringify(queryParams)}`
    )

    // Validate category name parameter
    if (!name) {
      return res.status(400).json({
        error: 'Missing category name',
        message:
          'Please provide a category name parameter (?name=mihoyo, ?name=riot, ?name=telegram, ?name=ea, ?name=epicgamesgames, ?name=steamgames, or ?name=search with &id=ITEM_ID)',
        supportedCategories: [
          'mihoyo',
          'riot',
          'telegram',
          'ea',
          'origin',
          'epicgamesgames',
          'steamgames',
          'search'
        ]
      })
    }

    // Category mapping
    const categoryMapping = {
      mihoyo: 'mihoyo',
      riot: 'riot',
      telegram: 'telegram',
      ea: 'ea',
      origin: 'ea', // Origin maps to EA
      epicgamesgames: 'epicgames/games', // Epic Games games list
      steamgames: 'steam/games', // Steam games list
      search: 'search' // Search for account details by item ID
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

    // Special handling for search endpoint
    if (name.toLowerCase() === 'search') {
      const { id } = queryParams

      if (!id) {
        return res.status(400).json({
          error: 'Missing item ID',
          message: 'Search requires an item ID parameter (?name=search&id=ITEM_ID)',
          example: '?name=search&id=188770198'
        })
      }

      console.log(`🔍 Searching for account details with ID: ${id}`)

      // Build LZT Market API URL for specific item details
      const baseURL = 'https://prod-api.lzt.market'
      const apiURL = new URL(id, baseURL)

      // Get token from environment
      const token = process.env.LZT_TOKEN

      if (!token) {
        console.error('❌ No LZT Market token found')
        return res.status(500).json({
          error: 'Server configuration error',
          message: 'Missing API token'
        })
      }

      console.log(`🎮 LZT API Request for item details:`, apiURL.toString())

      // Make request to LZT Market API for specific item
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
          itemId: id,
          requestedName: name
        })
      }

      const data = await response.json()
      console.log(`✅ LZT API Success for item ${id}: Account details retrieved`)

      // Return the account details
      return res.status(200).json(data)
    }

    // Build LZT Market API URL for category listings
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

    // Special handling for Steam games endpoint
    // The steam/games endpoint returns { games: [...], system_info: {...} }
    // but we need to transform it to { "app_id": {...}, ... } format
    if (name.toLowerCase() === 'steamgames' && data.games && Array.isArray(data.games)) {
      console.log(`✅ LZT API Success for ${category}: ${data.games.length} games returned`)

      // Transform games array to object with app_id as key
      const gamesObject = {}
      data.games.forEach(game => {
        if (game.app_id) {
          gamesObject[game.app_id] = {
            name: game.title || game.abbr || `Game ${game.app_id}`,
            title: game.title,
            abbr: game.abbr,
            app_id: game.app_id,
            category_id: game.category_id,
            img: game.img,
            url: game.url
          }
        }
      })

      return res.status(200).json(gamesObject)
    }

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
