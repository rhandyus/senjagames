const cors = require('cors')
require('dotenv/config')
const express = require('express')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const lztMarket = require('./.api/apis/lzt-market')
const winpayCallbackRouter = require('./src/api/winpayCallback.js')

const app = express()
const PORT = process.env.PORT || 3002

// Initialize LZT Market SDK with token fallback
const lztToken =
  process.env.LZT_TOKEN || process.env.ZELENKA_TOKEN || process.env.VITE_ZELENKA_TOKEN

if (!lztToken) {
  console.error('❌ No LZT Market token found. Set LZT_TOKEN, ZELENKA_TOKEN, or VITE_ZELENKA_TOKEN')
  process.exit(1)
} else {
  lztMarket.auth(lztToken)
  console.log('✅ LZT Market SDK initialized successfully')
}

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
app.use('/api/winpay', winpayCallbackRouter)

// LZT Market API Proxy with Official SDK
app.use('/api/lzt', async (req, res) => {
  try {
    const { path, method, query, body } = req
    const cleanPath = path.replace('/api/lzt', '')

    console.log(`🎯 LZT SDK Request: ${method} ${cleanPath}`)

    let result

    // Route to appropriate SDK methods based on path (support both old and new formats)
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
      result = await lztMarket.categoryEpic(query)
    } else if (
      cleanPath.includes('/origin') ||
      cleanPath.includes('/category_origin') ||
      cleanPath.includes('/category/8')
    ) {
      result = await lztMarket.categoryOrigin(query)
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
    } else if (
      cleanPath.includes('/chatgpt') ||
      cleanPath.includes('/category_chatgpt') ||
      cleanPath.includes('/category/6')
    ) {
      result = await lztMarket.category({ category_id: 6, ...query })
    } else if (
      cleanPath.includes('/battlenet') ||
      cleanPath.includes('/category_battlenet') ||
      cleanPath.includes('/category/11')
    ) {
      result = await lztMarket.categoryBattleNet(query)
    } else if (cleanPath.includes('/roblox') || cleanPath.includes('/category_roblox')) {
      result = await lztMarket.categoryRoblox(query)
    } else if (cleanPath.includes('/supercell') || cleanPath.includes('/category_supercell')) {
      result = await lztMarket.categorySupercell(query)
    } else if (cleanPath.includes('/wot') || cleanPath.includes('/category_wot')) {
      result = await lztMarket.categoryWOT(query)
    } else if (cleanPath.includes('/telegram') || cleanPath.includes('/category_telegram')) {
      result = await lztMarket.categoryTelegram(query)
    } else if (cleanPath.includes('/category/')) {
      // Generic category endpoint
      const categoryId = cleanPath.match(/\/category\/(\d+)/)?.[1]
      if (categoryId) {
        result = await lztMarket.category({ category_id: categoryId, ...query })
      } else {
        throw new Error('Invalid category endpoint')
      }
    } else {
      throw new Error(`Unsupported LZT Market endpoint: ${cleanPath}`)
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

    console.log(`✅ Steam API returned ${result.totalItems} total items`)

    res.json(result)
  } catch (error) {
    console.error('❌ Error in /api/steam:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/lzt/steam', async (req, res) => {
  try {
    console.log('📥 /api/lzt/steam endpoint called with query:', req.query)

    // Call your exact working script approach
    const result = await lztMarket.categorySteam(req.query)

    console.log(`✅ Steam API returned ${result.totalItems} total items`)

    res.json(result)
  } catch (error) {
    console.error('❌ Error in /api/lzt/steam:', error)
    res.status(500).json({ error: error.message })
  }
})

// ChatGPT API endpoints using LZT Market SDK
app.get('/api/chatgpt', async (req, res) => {
  try {
    console.log('📥 /api/chatgpt endpoint called with query:', req.query)

    // Call category 6 (ChatGPT) from LZT Market
    const result = await lztMarket.category({ category_id: 6, ...req.query })

    console.log(`✅ ChatGPT API returned ${result.totalItems || 0} total items`)

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

    // Call the exact LZT Market SDK method for Battle.net (category_id: 11)
    const result = await lztMarket.categoryBattleNet(req.query)

    console.log(`✅ Battle.net API returned ${result.totalItems || 0} total items`)

    res.json(result)
  } catch (error) {
    console.error('❌ Error in /api/battlenet:', error)
    res.status(500).json({ error: error.message })
  }
})

// Roblox API endpoints using LZT Market SDK
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

// Epic Games API endpoints using LZT Market SDK
app.get('/api/epic', async (req, res) => {
  try {
    console.log('📥 /api/epic endpoint called with query:', req.query)

    // Call the exact LZT Market SDK method for Epic Games
    const result = await lztMarket.categoryEpic(req.query)

    console.log(`✅ Epic API returned ${result.totalItems} total items`)

    res.json(result)
  } catch (error) {
    console.error('❌ Error in /api/epic:', error)
    res.status(500).json({ error: error.message })
  }
})

// Minecraft API endpoints using LZT Market SDK
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

app.get('/api/lzt/steam/games', async (req, res) => {
  try {
    console.log('📥 /api/lzt/steam/games endpoint called')

    // Return a simple games list structure that the frontend expects
    const result = {
      578080: { id: 578080, name: 'PUBG' },
      730: { id: 730, name: 'Counter-Strike 2' },
      570: { id: 570, name: 'Dota 2' },
      440: { id: 440, name: 'Team Fortress 2' },
      252490: { id: 252490, name: 'Rust' }
    }

    console.log(`✅ Steam games API returned ${Object.keys(result).length} games`)

    res.json(result)
  } catch (error) {
    console.error('❌ Error in /api/lzt/steam/games:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/lzt/categories', async (req, res) => {
  try {
    console.log('📥 /api/lzt/categories endpoint called')

    // Call your exact working script approach
    const result = await lztMarket.categories()

    console.log(`✅ Categories API returned data`)

    res.json(result)
  } catch (error) {
    console.error('❌ Error in /api/lzt/categories:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/lzt/tiktok', async (req, res) => {
  try {
    console.log('📥 /api/lzt/tiktok endpoint called with query:', req.query)

    // Call your exact working script approach
    const result = await lztMarket.categoryTikTok(req.query)

    console.log(`✅ TikTok API returned ${result.totalItems} total items`)

    res.json(result)
  } catch (error) {
    console.error('❌ Error in /api/lzt/tiktok:', error)
    res.status(500).json({ error: error.message })
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

// 404 handler
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

export default app
