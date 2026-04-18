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
const PORT = 3010

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
    // Check if file exists first
    const fullPath = path.join(__dirname, functionPath)

    // Check if file exists and is not disabled
    const fs = await import('fs')
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Function file not found (may be disabled): ${functionPath}`)
      return null
    }

    // Delete from require cache to allow hot reloading
    delete require.cache[require.resolve(fullPath)]

    const { default: handler } = await import(`file://${fullPath}?update=${Date.now()}`)
    return handler
  } catch (error) {
    console.error(
      `❌ Failed to load function: ${functionPath}`,
      error.code === 'MODULE_NOT_FOUND' ? 'File not found' : error.message
    )
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

  // Map API paths to serverless function files (only active functions)
  // Map API paths to the unified serverless function
  const routeMappings = {
    steam: 'api/unify.js',
    epic: 'api/unify.js',
    fortnite: 'api/unify.js',
    roblox: 'api/unify.js',
    minecraft: 'api/unify.js',
    socialclub: 'api/unify.js',
    uplay: 'api/unify.js',
    battlenet: 'api/unify.js',
    unify: 'api/unify.js',
    payment: 'api/unify.js'
  }

  // Handle nested LZT routes
  if (apiPath.startsWith('lzt/')) {
    const lztPath = apiPath.replace('lzt/', '')

    // Special handling for specific nested routes
    if (lztPath === 'steam/games') {
      functionPath = 'api/lzt/steam/games.js'
      // If the specific function doesn't exist, fall back to dynamic route
      const fs = await import('fs')
      if (!fs.existsSync(path.join(__dirname, functionPath))) {
        console.log(`⚠️  ${functionPath} not found, using dynamic route fallback`)
        functionPath = 'api/lzt/[...category].js'
      }
    } else if (lztPath === 'steam/categories') {
      functionPath = 'api/lzt/steam/categories.js'
      // If the specific function doesn't exist, fall back to dynamic route
      const fs = await import('fs')
      if (!fs.existsSync(path.join(__dirname, functionPath))) {
        console.log(`⚠️  ${functionPath} not found, using dynamic route fallback`)
        functionPath = 'api/lzt/[...category].js'
      }
    } else if (lztPath.includes('/')) {
      // Handle other nested paths like lzt/steam/something
      functionPath = 'api/lzt/[...category].js'
    } else {
      // Single level LZT paths
      const exactFile = `api/lzt/${lztPath}.js`
      const fs = await import('fs')
      if (fs.existsSync(path.join(__dirname, exactFile))) {
        functionPath = exactFile
      } else {
        functionPath = routeMappings[lztPath] || 'api/lzt/[...category].js'
      }
    }
  } else {
    // Direct API routes
    const mainPath = apiPath.split('?')[0].split('/')[0]
    functionPath = routeMappings[mainPath]

    // If calling via /api/steam, /api/epic, etc., set the 'name' query param
    // to match what api/unify.js expects
    if (functionPath === 'api/unify.js' && mainPath !== 'unify') {
      if (mainPath === 'payment') {
        const action = apiPath.split('/')[1]
        req.query.name = `payment-${action}`
      } else {
        req.query.name = mainPath
      }
    }
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
