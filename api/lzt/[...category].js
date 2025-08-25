// Dynamic Vercel Serverless Function for all LZT Market categories
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
    // Extract category from Vercel's dynamic routing
    // For /api/lzt/mihoyo -> req.query.category = ['mihoyo']
    // For /api/lzt/steam/games -> req.query.category = ['steam', 'games']
    const { category: categoryArray, ...queryParams } = req.query

    console.log(
      `🔍 LZT Dynamic Route - categoryArray: ${JSON.stringify(categoryArray)}, queryParams: ${JSON.stringify(queryParams)}`
    )

    if (!categoryArray || categoryArray.length === 0) {
      return res.status(400).json({
        error: 'Missing category parameter',
        message: 'Please provide a category parameter'
      })
    }

    // Category mapping for LZT Market API endpoints
    // Note: Some categories use dynamic routing due to Vercel 12 function limit
    const categoryMapping = {
      // Core 12 functions (direct API endpoints):
      // steam, epic, socialclub (rockstar), roblox, minecraft, uplay (ubisoft), battlenet, fortnite
      // mihoyo, ea, riot, telegram (via dynamic routing)

      mihoyo: 'mihoyo',
      riot: 'riot',
      steam: 'steam',
      fortnite: 'fortnite',
      ea: 'ea',
      origin: 'ea', // Origin is part of EA
      telegram: 'telegram',
      supercell: 'supercell',
      wot: 'world-of-tanks', // Map wot to world-of-tanks
      worldoftanks: 'world-of-tanks',
      'world-of-tanks': 'world-of-tanks',

      // Commented out functions (available via dynamic routing):
      discord: 'discord',
      chatgpt: 'chatgpt',
      tiktok: 'tiktok',
      instagram: 'instagram',
      uplay: 'uplay',
      socialclub: 'socialclub',
      escapefromtarkov: 'escape-from-tarkov', // Map escapefromtarkov to escape-from-tarkov
      minecraft: 'minecraft',
      gifts: 'gifts',
      battlenet: 'battlenet',
      vpn: 'vpn',
      roblox: 'roblox',
      epic: 'epic'
    }

    // Handle nested paths like steam/games, fortnite/cosmetics
    const pathSegments = Array.isArray(categoryArray) ? categoryArray : [categoryArray]
    const mainCategory = pathSegments[0].toLowerCase()
    const subPath = pathSegments.slice(1).join('/')

    console.log(
      `🔍 LZT Route Processing - mainCategory: ${mainCategory}, pathSegments: ${JSON.stringify(pathSegments)}`
    )

    // Map the main category
    const mappedCategory = categoryMapping[mainCategory]
    console.log(`🔍 LZT Category Mapping - ${mainCategory} -> ${mappedCategory}`)

    if (!mappedCategory) {
      console.log(`❌ LZT Unsupported category: ${mainCategory}`)
      return res.status(400).json({
        error: 'Unsupported category',
        message: `Category '${mainCategory}' is not supported`,
        supportedCategories: Object.keys(categoryMapping)
      })
    }

    // Build the full API path
    const category = subPath ? `${mappedCategory}/${subPath}` : mappedCategory
    console.log(`✅ LZT Final API category: ${category}`)

    // Special handling for steam/games endpoint to transform the API response
    if (mainCategory === 'steam' && subPath === 'games') {
      console.log('📥 /api/lzt/steam/games endpoint called via dynamic route')

      try {
        // Build LZT Market API URL
        const baseURL = 'https://prod-api.lzt.market'
        const apiURL = new URL('steam/games', baseURL)

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

        console.log(`🎮 LZT API Request for steam/games:`, apiURL.toString())

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
          throw new Error(`LZT API Error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log(`🎮 Raw steam/games API response structure:`, Object.keys(data))
        console.log(
          `🔍 First few games in response:`,
          JSON.stringify(data.games ? Object.keys(data.games).slice(0, 5) : 'No games key', null, 2)
        )

        // Transform the LZT API response to the format expected by the frontend
        // The steam/games API actually returns: { games: {...}, system_info: {...} }
        // Frontend expects: { "game_id": { "name": "Game Name" }, ... }
        const transformedData = {}

        if (data.games && typeof data.games === 'object') {
          // Handle games as object where keys are game IDs
          Object.entries(data.games).forEach(([gameId, game]) => {
            if (game && (game.title || game.name)) {
              transformedData[gameId] = {
                id: parseInt(gameId),
                name: game.title || game.name || `Game ${gameId}`,
                title: game.title || game.name || `Game ${gameId}`,
                abbr: game.abbr || game.title || game.name,
                category_id: game.category_id || 1,
                img: game.img || '',
                url: game.url || ''
              }
            }
          })
        } else if (data.items && Array.isArray(data.items)) {
          // Fallback: Handle items as array (in case structure changes)
          data.items.forEach(game => {
            if (game.app_id && (game.title || game.name)) {
              transformedData[game.app_id] = {
                id: parseInt(game.app_id),
                name: game.title || game.name || `Game ${game.app_id}`,
                title: game.title || game.name || `Game ${game.app_id}`,
                abbr: game.abbr || game.title || game.name,
                category_id: game.category_id || 1,
                img: game.img || '',
                url: game.url || ''
              }
            }
          })
        }

        const gameCount = Object.keys(transformedData).length
        if (gameCount > 0) {
          console.log(`✅ Steam games API transformed ${gameCount} games to expected format`)
          return res.status(200).json(transformedData)
        } else {
          throw new Error('No games found in API response')
        }
      } catch (error) {
        // Silent fallback to local JSON data - no error alerts shown to user
        console.log('🔄 Using local steam-game.json data (API unavailable)')

        try {
          // Import the local JSON file
          const fs = await import('fs')
          const path = await import('path')
          const { fileURLToPath } = await import('url')

          const __filename = fileURLToPath(import.meta.url)
          const __dirname = path.dirname(__filename)
          const jsonPath = path.join(__dirname, '../src/assets/steam-game.json')

          const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
          const transformedData = {}

          if (jsonData.games && Array.isArray(jsonData.games)) {
            jsonData.games.forEach(game => {
              if (game.app_id && game.title) {
                transformedData[game.app_id] = {
                  id: parseInt(game.app_id),
                  name: game.title,
                  title: game.title,
                  abbr: game.abbr || game.title,
                  category_id: game.category_id || 1,
                  img: game.img || '',
                  url: game.url || ''
                }
              }
            })
          }

          const gameCount = Object.keys(transformedData).length
          console.log(`✅ Steam games loaded from local JSON: ${gameCount} games`)
          return res.status(200).json(transformedData)
        } catch (jsonError) {
          console.error('❌ Failed to load fallback JSON data:', jsonError)
          return res.status(500).json({
            error: 'Steam games unavailable',
            message: 'Unable to load game data'
          })
        }
      }
    }

    // No special handling needed for other endpoints - let the API call proceed normally
    console.log(`📥 /api/lzt/${category} endpoint called via dynamic route`)

    // Build LZT Market API URL
    const baseURL = 'https://prod-api.lzt.market'
    const apiURL = new URL(category, baseURL)

    // Add all query parameters
    Object.entries(queryParams).forEach(([key, value]) => {
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
        category: category
      })
    }

    const data = await response.json()
    console.log(`✅ LZT API Success for ${category}: ${data.items?.length || 0} items returned`)

    // Return the data
    res.status(200).json(data)
  } catch (error) {
    console.error(`❌ LZT API Error for ${req.query.category}:`, error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      category: req.query.category
    })
  }
}
