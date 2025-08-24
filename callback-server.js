import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import crypto from 'crypto'

const app = express()
const PORT = process.env.PORT || 3002

// Security middleware
app.use(helmet())

// CORS configuration
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://docs.winpay.id'],
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
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  if (req.method === 'POST') {
    console.log('Headers:', req.headers)
    console.log('Body:', req.body)
  }
  next()
})

// WinPay signature verification
const verifyWinPaySignature = (payload, timestamp, partnerId, signature, clientSecret) => {
  try {
    // Create string to sign according to WinPay documentation
    const stringToSign = `POST\n/v1.0/transfer-va/payment\n${JSON.stringify(payload)}\n${timestamp}`

    console.log('String to sign:', stringToSign)

    // Generate signature using HMAC-SHA256
    const calculatedSignature = crypto
      .createHmac('sha256', clientSecret)
      .update(stringToSign)
      .digest('hex')

    console.log('Calculated signature:', calculatedSignature)
    console.log('Received signature:', signature)

    return signature === calculatedSignature
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

// WinPay Virtual Account Payment Callback
app.post('/api/winpay/v1.0/transfer-va/payment', async (req, res) => {
  try {
    console.log('\n=== WinPay Callback Received ===')

    // Extract headers
    const timestamp = req.headers['x-timestamp']
    const partnerId = req.headers['x-partner-id']
    const signature = req.headers['x-signature']
    const externalId = req.headers['x-external-id']
    const channelId = req.headers['channel-id']

    console.log('Headers:', {
      timestamp,
      partnerId,
      signature,
      externalId,
      channelId
    })

    // Validate required headers
    if (!timestamp || !partnerId || !signature || !externalId) {
      console.error('❌ Missing required headers')
      return res.status(400).json({
        responseCode: '4000000',
        responseMessage: 'Missing required headers'
      })
    }

    // Extract payment data from callback payload
    const {
      partnerServiceId,
      customerNo,
      virtualAccountNo,
      virtualAccountName,
      trxId,
      paymentRequestId,
      paidAmount,
      trxDateTime,
      referenceNo,
      additionalInfo
    } = req.body

    console.log('Payment Data:', {
      trxId,
      virtualAccountNo,
      paidAmount: paidAmount?.value,
      contractId: additionalInfo?.contractId,
      channel: additionalInfo?.channel
    })

    // For demo/testing purposes, verify signature if client secret is provided
    const clientSecret = process.env.WINPAY_CLIENT_SECRET
    if (clientSecret && clientSecret !== 'your_secret_here') {
      const isValidSignature = verifyWinPaySignature(
        req.body,
        timestamp,
        partnerId,
        signature,
        clientSecret
      )
      if (!isValidSignature) {
        console.error('❌ Invalid signature')
        return res.status(401).json({
          responseCode: '4010000',
          responseMessage: 'Invalid signature'
        })
      }
      console.log('✅ Signature verified')
    } else {
      console.log('⚠️  Signature verification skipped (no client secret configured)')
    }

    // Log the successful payment
    console.log('✅ Payment callback processed successfully:', {
      trxId,
      amount: paidAmount?.value,
      currency: paidAmount?.currency,
      timestamp: trxDateTime,
      reference: referenceNo
    })

    // TODO: Here you would normally update your database
    // - Update transaction status to 'paid'
    // - Update user's purchased accounts
    // - Send confirmation email
    // - etc.

    // Return expected response according to WinPay documentation
    const response = {
      responseCode: '2002500',
      responseMessage: 'Successful'
    }

    console.log('Sending response:', response)
    res.status(200).json(response)
  } catch (error) {
    console.error('❌ Error processing WinPay callback:', error)

    // Return error response
    res.status(500).json({
      responseCode: '5000000',
      responseMessage: 'Internal server error'
    })
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'senjagames-winpay-callback',
    version: '1.0.0'
  })
})

// Test endpoint for manual testing
app.post('/api/winpay/test', (req, res) => {
  console.log('Test endpoint called:', req.body)
  res.json({
    message: 'Test endpoint working',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  })
})

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ 404 - ${req.method} ${req.originalUrl}`)
  res.status(404).json({
    responseCode: '4040000',
    responseMessage: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'POST /api/winpay/v1.0/transfer-va/payment',
      'POST /api/winpay/test'
    ]
  })
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
