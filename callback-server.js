import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'

const app = express()
const PORT = process.env.PORT || 3002

// Security middleware
app.use(helmet())

// CORS configuration
app.use(
  cors({
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
  })
)

// Body parser middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'SenjaGames Callback Server',
    timestamp: new Date().toISOString()
  })
})

// Basic test endpoint
app.post('/api/test', (req, res) => {
  console.log('Test endpoint called with body:', req.body)
  res.json({
    success: true,
    message: 'Test endpoint working',
    received: req.body,
    timestamp: new Date().toISOString()
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'Endpoint not found',
    path: req.path,
    method: req.method
  })
})

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error)
  res.status(500).json({
    error: 'Internal Server Error',
    message: error.message
  })
})

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 SenjaGames Callback Server Started!')
  console.log(`📍 Server running on: http://localhost:${PORT}`)
  console.log(`🔍 Health check: http://localhost:${PORT}/health`)
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`)
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error)
  res.status(500).json({
    responseCode: '5000000',
    responseMessage: 'Internal server error'
  })
})

app.listen(PORT, () => {
  console.log('\n🚀 SenjaGames WinPay Callback Server Started!')
  console.log(`📡 Server running on: http://localhost:${PORT}`)
  console.log(
    `🎯 WinPay Callback URL: http://localhost:${PORT}/api/winpay/v1.0/transfer-va/payment`
  )
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`)
  console.log(`🧪 Test Endpoint: http://localhost:${PORT}/api/winpay/test`)
  console.log('\n📋 Available Environment Variables:')
  console.log(`   WINPAY_PARTNER_ID: ${process.env.WINPAY_PARTNER_ID || 'Not set'}`)
  console.log(`   WINPAY_CLIENT_SECRET: ${process.env.WINPAY_CLIENT_SECRET ? 'Set' : 'Not set'}`)
  console.log('\n✅ Ready to receive WinPay callbacks!\n')
})
