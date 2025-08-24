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
