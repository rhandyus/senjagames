import crypto from 'crypto'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

// Load jsrsasign for RSA signature generation
const jsrsasign = require('jsrsasign')

// WinPay configuration
const WINPAY_CONFIG = {
  BASE_URL: 'https://snap.winpay.id',
  PARTNER_ID: process.env.VITE_WINPAY_PARTNER_ID || 'fe515458-df5e-4ab6-9136-84b18e79f1e8',
  CHANNEL_ID: process.env.VITE_WINPAY_CHANNEL_ID || 'SenjaGames',
  PRIVATE_KEY: process.env.VITE_WINPAY_PRIVATE_KEY,
  PUBLIC_KEY: process.env.VITE_WINPAY_PUBLIC_KEY
}

// Generate RSA-SHA256 signature for WinPay
const generateWinPaySignature = (method, endpoint, body, timestamp) => {
  try {
    // Minify JSON body
    const minifiedBody = JSON.stringify(body || {})

    // Create string to sign: METHOD:ENDPOINT:HEX(SHA256(body)):TIMESTAMP
    const bodyHash = crypto.createHash('sha256').update(minifiedBody).digest('hex').toLowerCase()
    const stringToSign = `${method}:${endpoint}:${bodyHash}:${timestamp}`

    console.log('String to sign:', stringToSign)

    // Decode private key (handle Base64 encoded keys from environment)
    let privateKey = WINPAY_CONFIG.PRIVATE_KEY
    if (privateKey && !privateKey.includes('-----BEGIN')) {
      try {
        privateKey = Buffer.from(privateKey, 'base64').toString('utf-8')
      } catch (e) {
        console.error('Failed to decode Base64 private key:', e)
      }
    }

    // Generate RSA-SHA256 signature
    const sig = new jsrsasign.KJUR.crypto.Signature({ alg: 'SHA256withRSA' })
    sig.init(privateKey)
    sig.updateString(stringToSign)
    const signature = sig.sign()
    const base64Signature = Buffer.from(signature, 'hex').toString('base64')

    console.log('Generated signature:', base64Signature)
    return base64Signature

  } catch (error) {
    console.error('Signature generation error:', error)
    throw error
  }
}

// Generate timestamp in ISO8601 format
const generateTimestamp = () => {
  return new Date().toISOString().replace('Z', '+07:00')
}

// Generate external ID (unique per request)
const generateExternalId = () => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  return `EXT-${timestamp}-${random}`
}

// Helper function to set CORS headers
const setCorsHeaders = res => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, X-Timestamp, X-Partner-ID, X-Signature, X-External-ID, Channel-ID'
  )
}

export default async function handler(req, res) {
  // Set CORS headers
  setCorsHeaders(res)

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({
      responseCode: '4050000',
      responseMessage: 'Method not allowed'
    })
  }

  try {
    const { customerNo, virtualAccountName, trxId, totalAmount, virtualAccountTrxType, expiredDate, channel } = req.body

    // Validate required fields
    if (!virtualAccountName || !trxId || !totalAmount || !virtualAccountTrxType) {
      return res.status(400).json({
        responseCode: '4000000',
        responseMessage: 'Missing required fields'
      })
    }

    // Prepare request payload
    const payload = {
      customerNo,
      virtualAccountName,
      trxId,
      totalAmount,
      virtualAccountTrxType,
      expiredDate,
      additionalInfo: {
        channel: channel || 'BCA'
      }
    }

    // Generate headers
    const timestamp = generateTimestamp()
    const externalId = generateExternalId()
    const endpoint = '/v1.0/transfer-va/create-va'

    // Generate signature
    const signature = generateWinPaySignature('POST', endpoint, payload, timestamp)

    // Prepare headers for WinPay API
    const headers = {
      'Content-Type': 'application/json',
      'X-Timestamp': timestamp,
      'X-Partner-ID': WINPAY_CONFIG.PARTNER_ID,
      'X-Signature': signature,
      'X-External-ID': externalId,
      'Channel-ID': WINPAY_CONFIG.CHANNEL_ID
    }

    console.log('Making request to WinPay:', {
      url: `${WINPAY_CONFIG.BASE_URL}${endpoint}`,
      headers,
      payload
    })

    // Make request to WinPay API
    const response = await fetch(`${WINPAY_CONFIG.BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })

    const responseData = await response.json()

    console.log('WinPay response:', responseData)

    // Return WinPay response
    return res.status(response.status).json(responseData)

  } catch (error) {
    console.error('WinPay VA creation error:', error)
    return res.status(500).json({
      responseCode: '5000000',
      responseMessage: 'Internal server error',
      error: error.message
    })
  }
}