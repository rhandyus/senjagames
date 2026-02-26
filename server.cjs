const cors = require('cors')
require('dotenv/config')
const express = require('express')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
// const lztMarket = require('./.api/apis/lzt-market')
// const winpayCallbackRouter = require('./src/api/winpayCallback.cjs')

const app = express()
const PORT = process.env.PORT || 12345

// Initialize LZT Market SDK with token fallback
// const lztToken =
//   process.env.LZT_TOKEN ||
//   process.env.ZELENKA_TOKEN ||
//   process.env.VITE_ZELENKA_TOKEN ||
//   'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9.eyJzdWIiOjg0NDY3ODIsImlzcyI6Imx6dCIsImlhdCI6MTc1Mzc5NTkyNSwianRpIjoiODIyMDc2Iiwic2NvcGUiOiJiYXNpYyByZWFkIHBvc3QgY29udmVyc2F0ZSBwYXltZW50IGludm9pY2UgY2hhdGJveCBtYXJrZXQifQ.ChwPNVckvm1n1nw7tgaNLPVtuwCJiSRimrVmM7HFqOi3h7_sbUN9tM_MGz4KYFY9K52cUN68tGYXNnZMby6qlE6H_bNqkiol1zCM4_AEPEKkHIa0ljBe4VdG_Wz1PnRqfykmYu43Rf2oDpiC4uMAgtC5CvGJpSR8RIl8n7Pq42c'

// if (!lztToken) {
//   console.error('❌ No LZT Market token found. Set LZT_TOKEN, ZELENKA_TOKEN, or VITE_ZELENKA_TOKEN')
//   process.exit(1)
// } else {
//   lztMarket.auth(lztToken)
//   console.log('✅ LZT Market SDK initialized successfully')
// }

// Security middleware
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
})
app.use('/api/', limiter)

// CORS configuration
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    methods: ['GET', 'POST'],
    allowedHeaders: [
      'Content-Type',
      'X-Timestamp',
      'X-Partner-ID',
      'X-Signature',
      'X-External-ID',
      'Channel-ID'
    ]
  })
)

// Body parser middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`, {
    headers: req.headers,
    query: req.query,
    body: req.method === 'POST' ? req.body : undefined
  })
  next()
})

// Routes
// app.use('/api/winpay', winpayCallbackRouter)

// Specific LZT endpoints - MUST be before the general proxy
app.get('/api/lzt/steam/games', async (req, res) => {
  try {
    console.log('📥 /api/lzt/steam/games endpoint called')

    // Get ALL Steam games from LZT Market API using categoryGames
    console.log('🎮 Fetching ALL Steam games from LZT Market API...')

    const result = await lztMarket.categoryGames({ categoryName: 'steam' })
    console.log('📊 categoryGames result structure:', Object.keys(result.data || result))

    // Log the raw response to see what we get
    console.log('🔍 Raw response data:', JSON.stringify(result.data, null, 2).substring(0, 1000))

    // Check if games are in the expected structure
    if (result.data?.games && Array.isArray(result.data.games)) {
      console.log('🎮 Found games array:', result.data.games.length)

      // Transform the array response to object format expected by frontend
      const transformedGames = {}
      result.data.games.forEach(game => {
        if (game && game.app_id) {
          transformedGames[game.app_id] = {
            id: parseInt(game.app_id),
            name: game.title || `Game ${game.app_id}`,
            abbr: game.abbr || '',
            url: game.url || '',
            img: game.img || '',
            category_id: game.category_id || 1
          }
        }
      })

      console.log(
        `✅ Steam games API returned ${Object.keys(transformedGames).length} real games from LZT Market`
      )
      return res.json(transformedGames)
    }

    // If games are in a different structure, try to find them
    if (result.data) {
      console.log('� Available data keys:', Object.keys(result.data))

      // Check if it's a direct object of games
      if (typeof result.data === 'object' && !Array.isArray(result.data)) {
        const transformedGames = {}
        Object.entries(result.data).forEach(([key, value]) => {
          if (value && typeof value === 'object' && (value.title || value.name)) {
            transformedGames[key] = {
              id: parseInt(key),
              name: value.title || value.name || `Game ${key}`,
              abbr: value.abbr || '',
              url: value.url || '',
              img: value.img || '',
              category_id: value.category_id || 1
            }
          }
        })

        if (Object.keys(transformedGames).length > 0) {
          console.log(
            `✅ Steam games API returned ${Object.keys(transformedGames).length} games from direct object structure`
          )
          return res.json(transformedGames)
        }
      }
    }

    throw new Error(
      `No valid game data found. Response structure: ${JSON.stringify(Object.keys(result.data || {}), null, 2)}`
    )
  } catch (error) {
    console.error('❌ Error in /api/lzt/steam/games:', error)
    res.status(500).json({
      error: 'Failed to fetch Steam games from LZT Market API',
      message: error.message,
      details: error.stack
    })
  }
}) // Debug endpoint to see raw API response
app.get('/api/lzt/steam/games/debug', async (req, res) => {
  try {
    console.log('🔍 DEBUG: Checking raw API response...')

    const result = await lztMarket.categorySteamParams()

    console.log('🔍 Raw API response:', JSON.stringify(result, null, 2))

    res.json(result)
  } catch (error) {
    console.error('❌ Debug error:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/lzt/fortnite/cosmetics', async (req, res) => {
  try {
    console.log('📥 /api/lzt/fortnite/cosmetics endpoint called')

    // Get Fortnite cosmetics/items using the correct function
    console.log('🎮 Fetching Fortnite cosmetics from LZT Market API...')

    // Try different approaches to get Fortnite cosmetics
    let result

    try {
      // First try categoryFortnite to get Fortnite data
      result = await lztMarket.categoryFortnite(req.query)
      console.log('📊 categoryFortnite result structure:', Object.keys(result.data || result))

      // Log raw response to understand the structure
      console.log(
        '🔍 Raw Fortnite response:',
        JSON.stringify(result.data, null, 2).substring(0, 1000)
      )

      res.json(result.data || result)
    } catch (err) {
      console.error('❌ categoryFortnite failed:', err.message)
      throw err
    }
  } catch (error) {
    console.error('❌ Error in /api/lzt/fortnite/cosmetics:', error)
    res.status(500).json({
      error: 'Failed to fetch Fortnite cosmetics from LZT Market API',
      message: error.message,
      details: error.stack
    })
  }
})

app.get('/api/lzt/fortnite/params', async (req, res) => {
  try {
    console.log('📥 /api/lzt/fortnite/params endpoint called')

    // Get Fortnite parameters using the correct function
    console.log('🎮 Fetching Fortnite parameters from LZT Market API...')

    try {
      // Use categoryFortnite to get parameters/filters
      const result = await lztMarket.categoryFortnite({})
      console.log('📊 categoryFortnite params result:', Object.keys(result.data || result))

      // Log raw response to understand the structure
      console.log(
        '🔍 Raw Fortnite params response:',
        JSON.stringify(result.data, null, 2).substring(0, 1000)
      )

      res.json(result.data || result)
    } catch (err) {
      console.error('❌ categoryFortnite params failed:', err.message)
      throw err
    }
  } catch (error) {
    console.error('❌ Error in /api/lzt/fortnite/params:', error)
    res.status(500).json({
      error: 'Failed to fetch Fortnite params from LZT Market API',
      message: error.message,
      details: error.stack
    })
  }
})

// MiHoYo API endpoint
app.get('/api/lzt/mihoyo', async (req, res) => {
  try {
    console.log('📥 /api/lzt/mihoyo endpoint called with query:', req.query)

    // Get MiHoYo accounts from LZT Market API
    console.log('🎮 Fetching MiHoYo accounts from LZT Market API...')

    const result = await lztMarket.categoryMihoyo(req.query)
    console.log('📊 categoryMihoyo result structure:', Object.keys(result.data || result))

    // Log raw response to understand the structure
    console.log('🔍 Raw MiHoYo response:', JSON.stringify(result.data, null, 2).substring(0, 1000))

    // Check if we have items (accounts)
    if (result.data?.items && Array.isArray(result.data.items)) {
      console.log(`✅ MiHoYo API returned ${result.data.items.length} accounts`)
      res.json(result.data)
    } else {
      console.log('🔍 Available data keys:', Object.keys(result.data || {}))
      res.json(result.data || result)
    }
  } catch (error) {
    console.error('❌ Error in /api/lzt/mihoyo:', error)
    res.status(500).json({
      error: 'Failed to fetch MiHoYo accounts from LZT Market API',
      message: error.message,
      details: error.stack
    })
  }
})

// Riot API endpoint
app.get('/api/lzt/riot', async (req, res) => {
  try {
    console.log('📥 /api/lzt/riot endpoint called with query:', req.query)

    // Get Riot accounts from LZT Market API
    console.log('🎮 Fetching Riot accounts from LZT Market API...')

    const result = await lztMarket.categoryRiot(req.query)
    console.log('📊 categoryRiot result structure:', Object.keys(result.data || result))

    // Log raw response to understand the structure
    console.log('🔍 Raw Riot response:', JSON.stringify(result.data, null, 2).substring(0, 1000))

    // Check if we have items (accounts)
    if (result.data?.items && Array.isArray(result.data.items)) {
      console.log(`✅ Riot API returned ${result.data.items.length} accounts`)
      res.json(result.data)
    } else {
      console.log('🔍 Available data keys:', Object.keys(result.data || {}))
      res.json(result.data || result)
    }
  } catch (error) {
    console.error('❌ Error in /api/lzt/riot:', error)
    res.status(500).json({
      error: 'Failed to fetch Riot accounts from LZT Market API',
      message: error.message,
      details: error.stack
    })
  }
})

// EA/Origin API endpoint
app.get('/api/lzt/ea', async (req, res) => {
  try {
    console.log('📥 /api/lzt/ea endpoint called with query:', req.query)

    // Get EA/Origin accounts from LZT Market API
    console.log('🎮 Fetching EA/Origin accounts from LZT Market API...')

    const result = await lztMarket.categoryEA(req.query)
    console.log('📊 categoryEA result structure:', Object.keys(result.data || result))

    // Log raw response to understand the structure
    console.log(
      '🔍 Raw EA/Origin response:',
      JSON.stringify(result.data, null, 2).substring(0, 1000)
    )

    // Check if we have items (accounts)
    if (result.data?.items && Array.isArray(result.data.items)) {
      console.log(`✅ EA/Origin API returned ${result.data.items.length} accounts`)
      res.json(result.data)
    } else {
      console.log('🔍 Available data keys:', Object.keys(result.data || {}))
      res.json(result.data || result)
    }
  } catch (error) {
    console.error('❌ Error in /api/lzt/ea:', error)
    res.status(500).json({
      error: 'Failed to fetch EA/Origin accounts from LZT Market API',
      message: error.message,
      details: error.stack
    })
  }
})

// Telegram API endpoint
app.get('/api/lzt/telegram', async (req, res) => {
  try {
    console.log('📥 /api/lzt/telegram endpoint called with query:', req.query)

    // Get Telegram accounts from LZT Market API
    console.log('📱 Fetching Telegram accounts from LZT Market API...')

    const result = await lztMarket.categoryTelegram(req.query)
    console.log('📊 categoryTelegram result structure:', Object.keys(result.data || result))

    // Log raw response to understand the structure
    console.log(
      '🔍 Raw Telegram response:',
      JSON.stringify(result.data, null, 2).substring(0, 1000)
    )

    // Check if we have items (accounts)
    if (result.data?.items && Array.isArray(result.data.items)) {
      console.log(`✅ Telegram API returned ${result.data.items.length} accounts`)
      res.json(result.data)
    } else {
      console.log('🔍 Available data keys:', Object.keys(result.data || {}))
      res.json(result.data || result)
    }
  } catch (error) {
    console.error('❌ Error in /api/lzt/telegram:', error)
    res.status(500).json({
      error: 'Failed to fetch Telegram accounts from LZT Market API',
      message: error.message,
      details: error.stack
    })
  }
})

// Supercell API endpoint
app.get('/api/lzt/supercell', async (req, res) => {
  try {
    console.log('📥 /api/lzt/supercell endpoint called with query:', req.query)

    // Get Supercell accounts from LZT Market API
    console.log('📱 Fetching Supercell accounts from LZT Market API...')

    const result = await lztMarket.categorySupercell(req.query)
    console.log('📊 categorySupercell result structure:', Object.keys(result.data || result))

    // Log raw response to understand the structure
    console.log(
      '🔍 Raw Supercell response:',
      JSON.stringify(result.data, null, 2).substring(0, 1000)
    )

    // Check if we have items (accounts)
    if (result.data?.items && Array.isArray(result.data.items)) {
      console.log(`✅ Supercell API returned ${result.data.items.length} accounts`)
      res.json(result.data)
    } else {
      console.log('🔍 Available data keys:', Object.keys(result.data || {}))
      res.json(result.data || result)
    }
  } catch (error) {
    console.error('❌ Error in /api/lzt/supercell:', error)
    res.status(500).json({
      error: 'Failed to fetch Supercell accounts from LZT Market API',
      message: error.message,
      details: error.stack
    })
  }
})

// World of Tanks API endpoint
app.get('/api/lzt/wot', async (req, res) => {
  try {
    console.log('📥 /api/lzt/wot endpoint called with query:', req.query)

    // Get World of Tanks accounts from LZT Market API
    console.log('🎮 Fetching World of Tanks accounts from LZT Market API...')

    const result = await lztMarket.categoryWot(req.query)
    console.log('📊 categoryWot result structure:', Object.keys(result.data || result))

    // Log raw response to understand the structure
    console.log(
      '🔍 Raw World of Tanks response:',
      JSON.stringify(result.data, null, 2).substring(0, 1000)
    )

    // Check if we have items (accounts)
    if (result.data?.items && Array.isArray(result.data.items)) {
      console.log(`✅ World of Tanks API returned ${result.data.items.length} accounts`)
      res.json(result.data)
    } else {
      console.log('🔍 Available data keys:', Object.keys(result.data || {}))
      res.json(result.data || result)
    }
  } catch (error) {
    console.error('❌ Error in /api/lzt/wot:', error)
    res.status(500).json({
      error: 'Failed to fetch World of Tanks accounts from LZT Market API',
      message: error.message,
      details: error.stack
    })
  }
})

// World of Tanks Blitz API endpoint
app.get('/api/lzt/wotblitz', async (req, res) => {
  try {
    console.log('📥 /api/lzt/wotblitz endpoint called with query:', req.query)

    // Get World of Tanks Blitz accounts from LZT Market API
    console.log('🎮 Fetching World of Tanks Blitz accounts from LZT Market API...')

    const result = await lztMarket.categoryWotBlitz(req.query)
    console.log('📊 categoryWotBlitz result structure:', Object.keys(result.data || result))

    // Log raw response to understand the structure
    console.log(
      '🔍 Raw World of Tanks Blitz response:',
      JSON.stringify(result.data, null, 2).substring(0, 1000)
    )

    // Check if we have items (accounts)
    if (result.data?.items && Array.isArray(result.data.items)) {
      console.log(`✅ World of Tanks Blitz API returned ${result.data.items.length} accounts`)
      res.json(result.data)
    } else {
      console.log('🔍 Available data keys:', Object.keys(result.data || {}))
      res.json(result.data || result)
    }
  } catch (error) {
    console.error('❌ Error in /api/lzt/wotblitz:', error)
    res.status(500).json({
      error: 'Failed to fetch World of Tanks Blitz accounts from LZT Market API',
      message: error.message,
      details: error.stack
    })
  }
})

// Epic Games API endpoint
app.get('/api/lzt/epicgames', async (req, res) => {
  try {
    console.log('📥 /api/lzt/epicgames endpoint called with query:', req.query)

    // Get Epic Games accounts from LZT Market API
    console.log('🎮 Fetching Epic Games accounts from LZT Market API...')

    const result = await lztMarket.categoryEpicGames(req.query)
    console.log('📊 categoryEpicGames result structure:', Object.keys(result.data || result))

    // Log raw response to understand the structure
    console.log(
      '🔍 Raw Epic Games response:',
      JSON.stringify(result.data, null, 2).substring(0, 1000)
    )

    // Check if we have items (accounts)
    if (result.data?.items && Array.isArray(result.data.items)) {
      console.log(`✅ Epic Games API returned ${result.data.items.length} accounts`)
      res.json(result.data)
    } else {
      console.log('🔍 Available data keys:', Object.keys(result.data || {}))
      res.json(result.data || result)
    }
  } catch (error) {
    console.error('❌ Error in /api/lzt/epicgames:', error)
    res.status(500).json({
      error: 'Failed to fetch Epic Games accounts from LZT Market API',
      message: error.message,
      details: error.stack
    })
  }
})

// Epic Games list API endpoint
app.get('/api/lzt/epic/games', async (req, res) => {
  try {
    console.log('📥 /api/lzt/epic/games endpoint called')

    // Get Epic Games list from LZT Market API
    console.log('🎮 Fetching Epic Games list from LZT Market API...')

    const result = await lztMarket.categoryGames({ categoryName: 'epicgames' })
    console.log('📊 categoryGames result structure:', Object.keys(result.data || result))

    // Log raw response to understand the structure
    console.log(
      '🔍 Raw Epic Games response:',
      JSON.stringify(result.data, null, 2).substring(0, 1000)
    )

    // Check if we have games array
    if (result.data?.games && Array.isArray(result.data.games)) {
      console.log(`🎮 Found games array: ${result.data.games.length}`)
      console.log(
        `✅ Epic Games list API returned ${result.data.games.length} real games from LZT Market`
      )
      res.json(result.data.games)
    } else {
      console.log('🔍 Available data keys:', Object.keys(result.data || {}))
      res.json(result.data || result)
    }
  } catch (error) {
    console.error('❌ Error in /api/lzt/epic/games:', error)
    res.status(500).json({
      error: 'Failed to fetch Epic Games list from LZT Market API',
      message: error.message,
      details: error.stack
    })
  }
})

// Gifts API endpoint
app.get('/api/lzt/gifts', async (req, res) => {
  try {
    console.log('📥 /api/lzt/gifts endpoint called with query:', req.query)

    // Get Gifts from LZT Market API
    console.log('🎁 Fetching Gifts from LZT Market API...')

    const result = await lztMarket.categoryGifts(req.query)
    console.log('📊 categoryGifts result structure:', Object.keys(result.data || result))

    // Log raw response to understand the structure
    console.log('🔍 Raw Gifts response:', JSON.stringify(result.data, null, 2).substring(0, 1000))

    // Check if we have items
    if (result.data?.items && Array.isArray(result.data.items)) {
      console.log(`✅ Gifts API returned ${result.data.items.length} items`)
      res.json(result.data)
    } else {
      console.log('🔍 Available data keys:', Object.keys(result.data || {}))
      res.json(result.data || result)
    }
  } catch (error) {
    console.error('❌ Error in /api/lzt/gifts:', error)
    res.status(500).json({
      error: 'Failed to fetch Gifts from LZT Market API',
      message: error.message,
      details: error.stack
    })
  }
})

// Minecraft API endpoint
app.get('/api/lzt/minecraft', async (req, res) => {
  try {
    console.log('📥 /api/lzt/minecraft endpoint called with query:', req.query)

    // Get Minecraft accounts from LZT Market API
    console.log('🎮 Fetching Minecraft accounts from LZT Market API...')

    const result = await lztMarket.categoryMinecraft(req.query)
    console.log('📊 categoryMinecraft result structure:', Object.keys(result.data || result))

    // Log raw response to understand the structure
    console.log(
      '🔍 Raw Minecraft response:',
      JSON.stringify(result.data, null, 2).substring(0, 1000)
    )

    // Check if we have items (accounts)
    if (result.data?.items && Array.isArray(result.data.items)) {
      console.log(`✅ Minecraft API returned ${result.data.items.length} accounts`)
      res.json(result.data)
    } else {
      console.log('🔍 Available data keys:', Object.keys(result.data || {}))
      res.json(result.data || result)
    }
  } catch (error) {
    console.error('❌ Error in /api/lzt/minecraft:', error)
    res.status(500).json({
      error: 'Failed to fetch Minecraft accounts from LZT Market API',
      message: error.message,
      details: error.stack
    })
  }
})

// Direct Minecraft API endpoint (for frontend compatibility)
app.get('/api/minecraft', async (req, res) => {
  try {
    console.log('📥 /api/minecraft endpoint called with query:', req.query)

    // Call the exact LZT Market SDK method for Minecraft (category_id: 28)
    const result = await lztMarket.categoryMinecraft(req.query)

    console.log(`✅ Minecraft API returned ${result.totalItems} total items`)

    res.json(result)
  } catch (error) {
    console.error('❌ Error in /api/minecraft:', error)
    res.status(500).json({ error: error.message })
  }
})

// Direct Escape From Tarkov API endpoint (for frontend compatibility)
app.get('/api/escapefromtarkov', async (req, res) => {
  try {
    console.log('📥 /api/escapefromtarkov endpoint called with query:', req.query)

    // Call the exact LZT Market SDK method for Escape From Tarkov (category_id: 18)
    const result = await lztMarket.categoryEscapeFromTarkov(req.query)

    console.log(`✅ Escape From Tarkov API returned ${result.data?.totalItems || 0} total items`)

    res.json(result)
  } catch (error) {
    console.error('❌ Error in /api/escapefromtarkov:', error)
    res.status(500).json({ error: error.message })
  }
})

// Escape From Tarkov API endpoint
app.get('/api/lzt/tarkov', async (req, res) => {
  try {
    console.log('📥 /api/lzt/tarkov endpoint called with query:', req.query)

    // Get Escape From Tarkov accounts from LZT Market API
    console.log('🎮 Fetching Escape From Tarkov accounts from LZT Market API...')

    const result = await lztMarket.categoryEscapeFromTarkov(req.query)
    console.log('📊 categoryEscapeFromTarkov result structure:', Object.keys(result.data || result))

    // Log raw response to understand the structure
    console.log(
      '🔍 Raw Escape From Tarkov response:',
      JSON.stringify(result.data, null, 2).substring(0, 1000)
    )

    // Check if we have items (accounts)
    if (result.data?.items && Array.isArray(result.data.items)) {
      console.log(`✅ Escape From Tarkov API returned ${result.data.items.length} accounts`)
      res.json(result.data)
    } else {
      console.log('🔍 Available data keys:', Object.keys(result.data || {}))
      res.json(result.data || result)
    }
  } catch (error) {
    console.error('❌ Error in /api/lzt/tarkov:', error)
    res.status(500).json({
      error: 'Failed to fetch Escape From Tarkov accounts from LZT Market API',
      message: error.message,
      details: error.stack
    })
  }
})

// Social Club API endpoint
app.get('/api/lzt/socialclub', async (req, res) => {
  try {
    console.log('📥 /api/lzt/socialclub endpoint called with query:', req.query)

    // Get Social Club accounts from LZT Market API
    console.log('🎮 Fetching Social Club accounts from LZT Market API...')

    const result = await lztMarket.categorySocialClub(req.query)
    console.log('📊 categorySocialClub result structure:', Object.keys(result.data || result))

    // Log raw response to understand the structure
    console.log(
      '🔍 Raw Social Club response:',
      JSON.stringify(result.data, null, 2).substring(0, 1000)
    )

    // Check if we have items (accounts)
    if (result.data?.items && Array.isArray(result.data.items)) {
      console.log(`✅ Social Club API returned ${result.data.items.length} accounts`)
      res.json(result.data)
    } else {
      console.log('🔍 Available data keys:', Object.keys(result.data || {}))
      res.json(result.data || result)
    }
  } catch (error) {
    console.error('❌ Error in /api/lzt/socialclub:', error)
    res.status(500).json({
      error: 'Failed to fetch Social Club accounts from LZT Market API',
      message: error.message,
      details: error.stack
    })
  }
})

// Uplay API endpoint
app.get('/api/lzt/uplay', async (req, res) => {
  try {
    console.log('📥 /api/lzt/uplay endpoint called with query:', req.query)

    // Get Uplay accounts from LZT Market API
    console.log('🎮 Fetching Uplay accounts from LZT Market API...')

    const result = await lztMarket.categoryUplay(req.query)
    console.log('📊 categoryUplay result structure:', Object.keys(result.data || result))

    // Log raw response to understand the structure
    console.log('🔍 Raw Uplay response:', JSON.stringify(result.data, null, 2).substring(0, 1000))

    // Check if we have items (accounts)
    if (result.data?.items && Array.isArray(result.data.items)) {
      console.log(`✅ Uplay API returned ${result.data.items.length} accounts`)
      res.json(result.data)
    } else {
      console.log('🔍 Available data keys:', Object.keys(result.data || {}))
      res.json(result.data || result)
    }
  } catch (error) {
    console.error('❌ Error in /api/lzt/uplay:', error)
    res.status(500).json({
      error: 'Failed to fetch Uplay accounts from LZT Market API',
      message: error.message,
      details: error.stack
    })
  }
})

// War Thunder API endpoint
app.get('/api/lzt/warthunder', async (req, res) => {
  try {
    console.log('📥 /api/lzt/warthunder endpoint called with query:', req.query)

    // Get War Thunder accounts from LZT Market API
    console.log('✈️ Fetching War Thunder accounts from LZT Market API...')

    const result = await lztMarket.categoryWarThunder(req.query)
    console.log('📊 categoryWarThunder result structure:', Object.keys(result.data || result))

    // Log raw response to understand the structure
    console.log(
      '🔍 Raw War Thunder response:',
      JSON.stringify(result.data, null, 2).substring(0, 1000)
    )

    // Check if we have items (accounts)
    if (result.data?.items && Array.isArray(result.data.items)) {
      console.log(`✅ War Thunder API returned ${result.data.items.length} accounts`)
      res.json(result.data)
    } else {
      console.log('🔍 Available data keys:', Object.keys(result.data || {}))
      res.json(result.data || result)
    }
  } catch (error) {
    console.error('❌ Error in /api/lzt/warthunder:', error)
    res.status(500).json({
      error: 'Failed to fetch War Thunder accounts from LZT Market API',
      message: error.message,
      details: error.stack
    })
  }
})

// Discord API endpoint
app.get('/api/lzt/discord', async (req, res) => {
  try {
    console.log('📥 /api/lzt/discord endpoint called with query:', req.query)

    // Get Discord accounts from LZT Market API
    console.log('💬 Fetching Discord accounts from LZT Market API...')

    const result = await lztMarket.categoryDiscord(req.query)
    console.log('📊 categoryDiscord result structure:', Object.keys(result.data || result))

    // Log raw response to understand the structure
    console.log('🔍 Raw Discord response:', JSON.stringify(result.data, null, 2).substring(0, 1000))

    // Check if we have items (accounts)
    if (result.data?.items && Array.isArray(result.data.items)) {
      console.log(`✅ Discord API returned ${result.data.items.length} accounts`)
      res.json(result.data)
    } else {
      console.log('🔍 Available data keys:', Object.keys(result.data || {}))
      res.json(result.data || result)
    }
  } catch (error) {
    console.error('❌ Error in /api/lzt/discord:', error)
    res.status(500).json({
      error: 'Failed to fetch Discord accounts from LZT Market API',
      message: error.message,
      details: error.stack
    })
  }
})

// TikTok API endpoint
app.get('/api/lzt/tiktok', async (req, res) => {
  try {
    console.log('📥 /api/lzt/tiktok endpoint called with query:', req.query)

    // Get TikTok accounts from LZT Market API
    console.log('📱 Fetching TikTok accounts from LZT Market API...')

    const result = await lztMarket.categoryTikTok(req.query)
    console.log('📊 categoryTikTok result structure:', Object.keys(result.data || result))

    // Log raw response to understand the structure
    console.log('🔍 Raw TikTok response:', JSON.stringify(result.data, null, 2).substring(0, 1000))

    // Check if we have items (accounts)
    if (result.data?.items && Array.isArray(result.data.items)) {
      console.log(`✅ TikTok API returned ${result.data.items.length} accounts`)
      res.json(result.data)
    } else {
      console.log('🔍 Available data keys:', Object.keys(result.data || {}))
      res.json(result.data || result)
    }
  } catch (error) {
    console.error('❌ Error in /api/lzt/tiktok:', error)
    res.status(500).json({
      error: 'Failed to fetch TikTok accounts from LZT Market API',
      message: error.message,
      details: error.stack
    })
  }
})

// Instagram API endpoint
app.get('/api/lzt/instagram', async (req, res) => {
  try {
    console.log('📥 /api/lzt/instagram endpoint called with query:', req.query)

    // Get Instagram accounts from LZT Market API
    console.log('📷 Fetching Instagram accounts from LZT Market API...')

    const result = await lztMarket.categoryInstagram(req.query)
    console.log('📊 categoryInstagram result structure:', Object.keys(result.data || result))

    // Log raw response to understand the structure
    console.log(
      '🔍 Raw Instagram response:',
      JSON.stringify(result.data, null, 2).substring(0, 1000)
    )

    // Check if we have items (accounts)
    if (result.data?.items && Array.isArray(result.data.items)) {
      console.log(`✅ Instagram API returned ${result.data.items.length} accounts`)
      res.json(result.data)
    } else {
      console.log('🔍 Available data keys:', Object.keys(result.data || {}))
      res.json(result.data || result)
    }
  } catch (error) {
    console.error('❌ Error in /api/lzt/instagram:', error)
    res.status(500).json({
      error: 'Failed to fetch Instagram accounts from LZT Market API',
      message: error.message,
      details: error.stack
    })
  }
})

// Battle.Net API endpoint
app.get('/api/lzt/battlenet', async (req, res) => {
  try {
    console.log('📥 /api/lzt/battlenet endpoint called with query:', req.query)

    // Get Battle.Net accounts from LZT Market API
    console.log('⚔️ Fetching Battle.Net accounts from LZT Market API...')

    const result = await lztMarket.categoryBattleNet(req.query)
    console.log('📊 categoryBattleNet result structure:', Object.keys(result.data || result))

    // Log raw response to understand the structure
    console.log(
      '🔍 Raw Battle.Net response:',
      JSON.stringify(result.data, null, 2).substring(0, 1000)
    )

    // Check if we have items (accounts)
    if (result.data?.items && Array.isArray(result.data.items)) {
      console.log(`✅ Battle.Net API returned ${result.data.items.length} accounts`)
      res.json(result.data)
    } else {
      console.log('🔍 Available data keys:', Object.keys(result.data || {}))
      res.json(result.data || result)
    }
  } catch (error) {
    console.error('❌ Error in /api/lzt/battlenet:', error)
    res.status(500).json({
      error: 'Failed to fetch Battle.Net accounts from LZT Market API',
      message: error.message,
      details: error.stack
    })
  }
})

// ChatGPT API endpoint
app.get('/api/lzt/chatgpt', async (req, res) => {
  try {
    console.log('📥 /api/lzt/chatgpt endpoint called with query:', req.query)

    // Get ChatGPT accounts from LZT Market API
    console.log('🤖 Fetching ChatGPT accounts from LZT Market API...')

    const result = await lztMarket.categoryChatGPT(req.query)
    console.log('📊 categoryChatGPT result structure:', Object.keys(result.data || result))

    // Log raw response to understand the structure
    console.log('🔍 Raw ChatGPT response:', JSON.stringify(result.data, null, 2).substring(0, 1000))

    // Check if we have items (accounts)
    if (result.data?.items && Array.isArray(result.data.items)) {
      console.log(`✅ ChatGPT API returned ${result.data.items.length} accounts`)
      res.json(result.data)
    } else {
      console.log('🔍 Available data keys:', Object.keys(result.data || {}))
      res.json(result.data || result)
    }
  } catch (error) {
    console.error('❌ Error in /api/lzt/chatgpt:', error)
    res.status(500).json({
      error: 'Failed to fetch ChatGPT accounts from LZT Market API',
      message: error.message,
      details: error.stack
    })
  }
})

// VPN API endpoint
app.get('/api/lzt/vpn', async (req, res) => {
  try {
    console.log('📥 /api/lzt/vpn endpoint called with query:', req.query)

    // Get VPN accounts from LZT Market API
    console.log('🔒 Fetching VPN accounts from LZT Market API...')

    const result = await lztMarket.categoryVpn(req.query)
    console.log('📊 categoryVpn result structure:', Object.keys(result.data || result))

    // Log raw response to understand the structure
    console.log('🔍 Raw VPN response:', JSON.stringify(result.data, null, 2).substring(0, 1000))

    // Check if we have items (accounts)
    if (result.data?.items && Array.isArray(result.data.items)) {
      console.log(`✅ VPN API returned ${result.data.items.length} accounts`)
      res.json(result.data)
    } else {
      console.log('🔍 Available data keys:', Object.keys(result.data || {}))
      res.json(result.data || result)
    }
  } catch (error) {
    console.error('❌ Error in /api/lzt/vpn:', error)
    res.status(500).json({
      error: 'Failed to fetch VPN accounts from LZT Market API',
      message: error.message,
      details: error.stack
    })
  }
})

// Roblox API endpoint
app.get('/api/lzt/roblox', async (req, res) => {
  try {
    console.log('📥 /api/lzt/roblox endpoint called with query:', req.query)

    // Get Roblox accounts from LZT Market API
    console.log('🎮 Fetching Roblox accounts from LZT Market API...')

    const result = await lztMarket.categoryRoblox(req.query)
    console.log('📊 categoryRoblox result structure:', Object.keys(result.data || result))

    // Log raw response to understand the structure
    console.log('🔍 Raw Roblox response:', JSON.stringify(result.data, null, 2).substring(0, 1000))

    // Check if we have items (accounts)
    if (result.data?.items && Array.isArray(result.data.items)) {
      console.log(`✅ Roblox API returned ${result.data.items.length} accounts`)
      res.json(result.data)
    } else {
      console.log('🔍 Available data keys:', Object.keys(result.data || {}))
      res.json(result.data || result)
    }
  } catch (error) {
    console.error('❌ Error in /api/lzt/roblox:', error)
    res.status(500).json({
      error: 'Failed to fetch Roblox accounts from LZT Market API',
      message: error.message,
      details: error.stack
    })
  }
})

// Direct Roblox API endpoint (matches frontend call)
app.get('/api/roblox', async (req, res) => {
  try {
    console.log('📥 /api/roblox endpoint called with query:', req.query)

    // Call the exact LZT Market SDK method for Roblox
    const result = await lztMarket.categoryRoblox(req.query)

    console.log(`✅ Roblox API returned ${result.totalItems || 0} total items`)

    res.json(result)
  } catch (error) {
    console.error('❌ Error in /api/roblox:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/lzt/categories', async (req, res) => {
  try {
    console.log('📥 /api/lzt/categories endpoint called')

    // Get real categories from LZT Market API
    console.log('🎮 Fetching categories from LZT Market API...')

    const result = await lztMarket.categoryList(req.query)
    console.log('📊 categoryList result structure:', Object.keys(result.data || result))

    // Log raw response to understand the structure
    console.log(
      '🔍 Raw categories response:',
      JSON.stringify(result.data, null, 2).substring(0, 1000)
    )

    res.json(result.data || result)
  } catch (error) {
    console.error('❌ Error in /api/lzt/categories:', error)
    res.status(500).json({
      error: 'Failed to fetch categories from LZT Market API',
      message: error.message,
      details: error.stack
    })
  }
})

// LZT Market API Proxy with Official SDK
app.use('/api/lzt', async (req, res) => {
  try {
    const { path, method, query, body } = req
    const cleanPath = path.replace('/api/lzt', '')

    console.log(`🎯 LZT SDK Request: ${method} ${cleanPath}`)

    let result

    // Route to appropriate SDK methods based on path
    if (
      cleanPath.includes('/steam') ||
      cleanPath.includes('/category_steam') ||
      cleanPath.includes('/category/6')
    ) {
      result = await lztMarket.categorySteam(query)
    } else if (
      cleanPath.includes('/epic') ||
      cleanPath.includes('/category_epic') ||
      cleanPath.includes('/category/7')
    ) {
      result = await lztMarket.categoryEpicGames(query)
    } else if (
      cleanPath.includes('/origin') ||
      cleanPath.includes('/category_origin') ||
      cleanPath.includes('/category/8')
    ) {
      result = await lztMarket.categoryEA(query)
    } else if (
      cleanPath.includes('/ea') ||
      cleanPath.includes('/category_ea') ||
      cleanPath.includes('/category/9')
    ) {
      result = await lztMarket.categoryEA(query)
    } else if (
      cleanPath.includes('/riot') ||
      cleanPath.includes('/category_riot') ||
      cleanPath.includes('/category/16')
    ) {
      result = await lztMarket.categoryRiot(query)
    } else if (
      cleanPath.includes('/fortnite') ||
      cleanPath.includes('/category_fortnite') ||
      cleanPath.includes('/category/17')
    ) {
      result = await lztMarket.categoryFortnite(query)
    } else if (
      cleanPath.includes('/mihoyo') ||
      cleanPath.includes('/category_mihoyo') ||
      cleanPath.includes('/category/19')
    ) {
      result = await lztMarket.categoryMihoyo(query)
    } else if (cleanPath.includes('/telegram') || cleanPath.includes('/category_telegram')) {
      result = await lztMarket.categoryTelegram(query)
    } else if (cleanPath.includes('/supercell') || cleanPath.includes('/category_supercell')) {
      result = await lztMarket.categorySupercell(query)
    } else if (cleanPath.includes('/categories')) {
      result = await lztMarket.categoryList(query)
    } else if (cleanPath.includes('/games')) {
      result = await lztMarket.categoryGames(query)
    } else if (cleanPath.includes('/category/')) {
      // Generic category endpoint
      const categoryId = cleanPath.match(/\/category\/(\d+)/)?.[1]
      if (categoryId) {
        result = await lztMarket.category({ category_id: categoryId, ...query })
      } else {
        throw new Error('Invalid category endpoint')
      }
    } else {
      throw new Error('Unsupported LZT Market endpoint')
    }

    console.log(`✅ LZT SDK Success:`, {
      endpoint: cleanPath,
      itemsCount: result?.data?.items?.length || 0
    })

    res.json(result.data || result)
  } catch (error) {
    console.error('❌ LZT SDK Error:', error.message)
    res.status(500).json({
      error: 'LZT Market API error',
      message: error.message
    })
  }
})

// Steam API endpoints using LZT Market SDK
app.get('/api/steam', async (req, res) => {
  try {
    console.log('📥 /api/steam endpoint called with query:', req.query)

    // Call your exact working script approach
    const result = await lztMarket.categorySteam(req.query)

    const itemsCount = result?.data?.items?.length || result?.items?.length || 0
    const totalItems = result?.data?.totalItems || result?.totalItems || itemsCount

    console.log(`✅ Steam API returned ${totalItems} total items (${itemsCount} items in response)`)

    res.json(result)
  } catch (error) {
    console.error('❌ Error in /api/steam:', error)
    res.status(500).json({ error: error.message })
  }
})

// ChatGPT API endpoints using LZT Market SDK
app.get('/api/chatgpt', async (req, res) => {
  try {
    console.log('📥 /api/chatgpt endpoint called with query:', req.query)

    // Call LZT Market SDK for ChatGPT
    const result = await lztMarket.categoryChatGPT(req.query)

    const itemsCount = result?.data?.items?.length || result?.items?.length || 0
    const totalItems = result?.data?.totalItems || result?.totalItems || itemsCount

    console.log(
      `✅ ChatGPT API returned ${totalItems} total items (${itemsCount} items in response)`
    )

    res.json(result)
  } catch (error) {
    console.error('❌ Error in /api/chatgpt:', error)
    res.status(500).json({ error: error.message })
  }
})

// Battle.net API endpoints using LZT Market SDK
app.get('/api/battlenet', async (req, res) => {
  try {
    console.log('📥 /api/battlenet endpoint called with query:', req.query)

    // Call LZT Market SDK for Battle.net
    const result = await lztMarket.categoryBattleNet(req.query)

    const itemsCount = result?.data?.items?.length || result?.items?.length || 0
    const totalItems = result?.data?.totalItems || result?.totalItems || itemsCount

    console.log(
      `✅ Battle.net API returned ${totalItems} total items (${itemsCount} items in response)`
    )

    res.json(result)
  } catch (error) {
    console.error('❌ Error in /api/battlenet:', error)
    res.status(500).json({ error: error.message })
  }
})

// VPN API endpoints using LZT Market SDK
app.get('/api/vpn', async (req, res) => {
  try {
    console.log('📥 /api/vpn endpoint called with query:', req.query)

    // Call LZT Market SDK for VPN
    const result = await lztMarket.categoryVpn(req.query)

    const itemsCount = result?.data?.items?.length || result?.items?.length || 0
    const totalItems = result?.data?.totalItems || result?.totalItems || itemsCount

    console.log(`✅ VPN API returned ${totalItems} total items (${itemsCount} items in response)`)

    res.json(result)
  } catch (error) {
    console.error('❌ Error in /api/vpn:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/fortnite', async (req, res) => {
  try {
    console.log('📥 /api/fortnite endpoint called with query:', req.query)

    // Call LZT Market SDK for Fortnite
    const result = await lztMarket.categoryFortnite(req.query)

    const itemsCount = result?.data?.items?.length || result?.items?.length || 0
    const totalItems = result?.data?.totalItems || result?.totalItems || itemsCount

    console.log(
      `✅ Fortnite API returned ${totalItems} total items (${itemsCount} items in response)`
    )

    res.json(result)
  } catch (error) {
    console.error('❌ Error in /api/fortnite:', error)
    res.status(500).json({ error: error.message })
  }
})

// Epic Games API endpoints using LZT Market SDK
app.get('/api/epic', async (req, res) => {
  try {
    // Use simple LZT Market SDK call as suggested by user
    const result = await lztMarket.categoryEpicGames(req.query)

    const itemsCount = result?.data?.items?.length || result?.items?.length || 0
    const totalItems = result?.data?.totalItems || result?.totalItems || itemsCount

    console.log(
      `✅ Epic Games API returned ${totalItems} total items (${itemsCount} items in response)`
    )

    res.json(result)

    // Debug: Check what we're actually getting
    if (result?.data?.items && result.data.items.length > 0) {
      const firstItem = result.data.items[0]
      console.log('🔍 Epic Games API Response Debug:')
      console.log('- First item keys:', Object.keys(firstItem))
      console.log('- Has eg_games:', 'eg_games' in firstItem)
      console.log('- eg_games value:', firstItem.eg_games)
      console.log('- eg_games type:', typeof firstItem.eg_games)

      // If eg_games is missing, let's add some sample data for testing
      if (!firstItem.eg_games) {
        console.log('� Adding sample eg_games data for testing...')

        // Add sample games data to first few items for testing
        result.data.items.forEach((item, index) => {
          if (index < 3) {
            // Only add to first 3 items for testing
            item.eg_games = {
              '909dd1fd19bf41f99b23edf2ce461927': {
                hours_played: 25.5,
                internal_game_id: 10001,
                abbr: 'Fortnite',
                title: 'Fortnite',
                url: 'fortnite',
                img: 'https://cdn1.epicgames.com/item/50118b7f954e450f8823df1614b24e80/EGS_Fortnite_EpicGames_S1_2560x1440-b1bbaed8c5b9e4e29e7e8d1c6b7f5e7c',
                link: 'fortnite',
                app_id: '909dd1fd19bf41f99b23edf2ce461927'
              },
              '38ec4849ea4f4de6aa7b6fb0f2d278e1': {
                hours_played: 12.3,
                internal_game_id: 10352,
                abbr: 'Fall Guys',
                title: 'Fall Guys',
                url: 'fall-guys',
                img: 'https://cdn1.epicgames.com/item/50118b7f954e450f8823df1614b24e80/FGSS04_KeyArt_OfferImageLandscape_2560x1440_2560x1440-89c8edd4ffe307f5d760f286a28c3404',
                link: 'fall-guys',
                app_id: '38ec4849ea4f4de6aa7b6fb0f2d278e1'
              }
            }
          }
        })
      }
    }
  } catch (error) {
    console.error('❌ Error in /api/epic:', error)
    res.status(500).json({ error: error.message })
  }
})

// Epic Games API endpoint for fetching available games list
app.get('/api/lzt/epic/games', async (req, res) => {
  try {
    console.log('📥 /api/lzt/epic/games endpoint called')

    // Get Epic Games list from LZT Market API using categoryGames
    console.log('🎮 Fetching Epic Games list from LZT Market API...')

    const result = await lztMarket.categoryGames({ categoryName: 'epicgames' })
    console.log('📊 categoryGames result structure:', Object.keys(result.data || result))

    // Log raw response to understand the structure
    console.log(
      '🔍 Raw Epic Games list response:',
      JSON.stringify(result.data, null, 2).substring(0, 1000)
    )

    // Check if we have games data
    if (result.data?.games && Array.isArray(result.data.games)) {
      console.log(`🎮 Found ${result.data.games.length} Epic Games`)
      res.json(result.data.games)
    } else {
      console.log('🔍 Available data keys:', Object.keys(result.data || {}))
      res.json(result.data || result)
    }
  } catch (error) {
    console.error('❌ Error in /api/lzt/epic/games:', error)
    res.status(500).json({
      error: 'Failed to fetch Epic Games list from LZT Market API',
      message: error.message,
      details: error.stack
    })
  }
})

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'senjagames-callback-server'
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error)
  res.status(500).json({
    responseCode: '5000000',
    responseMessage: 'Internal server error'
  })
})

// Test endpoint first
app.get('/api/gifts-test', async (req, res) => {
  res.json({ message: 'Gifts test endpoint working', timestamp: new Date().toISOString() })
})

// Gifts API endpoints using LZT Market SDK
app.get('/api/gifts', async (req, res) => {
  try {
    console.log('🎁 Gifts API endpoint called with query:', req.query)

    // Use the same method as the existing /api/lzt/gifts endpoint
    console.log('🔄 Calling lztMarket.categoryGifts')
    const result = await lztMarket.categoryGifts(req.query)

    const itemsCount = result?.data?.items?.length || result?.items?.length || 0
    const totalItems = result?.data?.totalItems || result?.totalItems || itemsCount

    console.log(`✅ Gifts API returned ${totalItems} total items (${itemsCount} items in response)`)

    // Return the same structure as other endpoints
    res.json(result.data || result)
  } catch (error) {
    console.error('❌ Error in /api/gifts:', error)
    res.status(500).json({ error: error.message })
  }
})

// 404 handler - must be last
app.use('*', (req, res) => {
  res.status(404).json({
    responseCode: '4040000',
    responseMessage: 'Endpoint not found'
  })
})

app.listen(PORT, () => {
  console.log(`🚀 SenjaGames Callback Server running on port ${PORT}`)
  console.log(
    `📡 WinPay Callback URL: http://localhost:${PORT}/api/winpay/v1.0/transfer-va/payment`
  )
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`)
})

module.exports = app
