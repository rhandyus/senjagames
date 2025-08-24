import dotenv from 'dotenv'
import express from 'express'
import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'

// Load environment variables from .env files
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3002

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  )

  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

// Function to load and execute serverless functions
const loadServerlessFunction = async functionPath => {
  try {
    // Delete from require cache to allow hot reloading
    const fullPath = path.join(__dirname, functionPath)
    delete require.cache[require.resolve(fullPath)]

    const { default: handler } = await import(`file://${fullPath}`)
    return handler
  } catch (error) {
    console.error(`Error loading function ${functionPath}:`, error)
    return null
  }
}

// Create mock req/res objects for serverless functions
const createMockResponse = expressRes => {
  const mockRes = {
    status: code => {
      expressRes.status(code)
      return mockRes
    },
    json: data => {
      expressRes.json(data)
      return mockRes
    },
    send: data => {
      expressRes.send(data)
      return mockRes
    },
    setHeader: (name, value) => {
      expressRes.setHeader(name, value)
      return mockRes
    }
  }
  return mockRes
}

// Dynamic route handler for API functions
app.all('/api/*', async (req, res) => {
  const apiPath = req.path.replace('/api/', '')
  let functionPath = null

  console.log(`Incoming request: ${req.method} ${req.path}`)

  // Map API paths to serverless function files
  const routeMappings = {
    steam: 'api/steam.js',
    epic: 'api/epic.js',
    fortnite: 'api/fortnite.js',
    roblox: 'api/roblox.js',
    discord: 'api/discord.js',
    gifts: 'api/gifts.js',
    minecraft: 'api/minecraft.js',
    escapefromtarkov: 'api/escapefromtarkov.js',
    socialclub: 'api/socialclub.js',
    uplay: 'api/uplay.js',
    tiktok: 'api/tiktok.js',
    instagram: 'api/instagram.js',
    chatgpt: 'api/chatgpt.js',
    battlenet: 'api/battlenet.js',
    vpn: 'api/vpn.js',
    'lzt-proxy': 'api/lzt-proxy.js'
  }

  // Handle nested LZT routes
  if (apiPath.startsWith('lzt/')) {
    const lztPath = apiPath.replace('lzt/', '')

    // Special handling for specific nested routes
    if (lztPath === 'steam/games') {
      functionPath = 'api/lzt/steam/games.js'
    } else if (lztPath === 'steam/categories') {
      functionPath = 'api/lzt/steam/categories.js'
    } else if (lztPath.includes('/')) {
      // Handle other nested paths like lzt/steam/something
      functionPath = 'api/lzt/[...category].js'
    } else {
      // Single level LZT paths
      functionPath = routeMappings[lztPath] || 'api/lzt/[...category].js'
    }
  } else {
    // Direct API routes
    const mainPath = apiPath.split('?')[0].split('/')[0]
    functionPath = routeMappings[mainPath]
  }

  if (!functionPath) {
    console.log(`❌ No route mapping found for: ${apiPath}`)
    return res.status(404).json({ error: 'API endpoint not found' })
  }

  console.log(`📍 ${req.method} ${req.path} -> ${functionPath}`)

  const handler = await loadServerlessFunction(functionPath)
  if (!handler) {
    console.log(`❌ Failed to load function: ${functionPath}`)
    return res.status(500).json({ error: 'Failed to load API function' })
  }

  try {
    // Create mock request/response objects
    const mockReq = {
      ...req,
      query: req.query,
      body: req.body,
      method: req.method,
      url: req.url,
      headers: req.headers
    }

    // Special handling for dynamic routes like [...category].js
    if (functionPath === 'api/lzt/[...category].js') {
      const lztPath = apiPath.replace('lzt/', '')
      const pathSegments = lztPath.split('/')

      // Set up the category parameter as Vercel would
      mockReq.query = {
        ...req.query,
        category: pathSegments
      }
    }

    const mockRes = createMockResponse(res)

    // Execute the serverless function
    await handler(mockReq, mockRes)
  } catch (error) {
    console.error('❌ Error executing API function:', error)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error', details: error.message })
    }
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Development server running' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Development server running on http://localhost:${PORT}`)
  console.log(`📝 API endpoints available at http://localhost:${PORT}/api/*`)
  console.log(`🔍 Health check: http://localhost:${PORT}/health`)
})

export default app
