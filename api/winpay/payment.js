import crypto from 'crypto'

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

  // Only allow POST method for callback
  if (req.method !== 'POST') {
    return res.status(405).json({
      responseCode: '4050000',
      responseMessage: 'Method not allowed'
    })
  }

  try {
    console.log('\n=== WinPay Callback Received ===')
    console.log('Timestamp:', new Date().toISOString())
    console.log('Headers:', req.headers)
    console.log('Body:', req.body)

    // Extract headers
    const timestamp = req.headers['x-timestamp']
    const partnerId = req.headers['x-partner-id']
    const signature = req.headers['x-signature']
    const externalId = req.headers['x-external-id']
    const channelId = req.headers['channel-id']

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

    // Verify signature if client secret is provided
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

    // Verify partner ID
    const expectedPartnerId =
      process.env.WINPAY_PARTNER_ID || 'fe515458-df5e-4ab6-9136-84b18e79f1e8'
    if (partnerId !== expectedPartnerId) {
      console.error('❌ Invalid partner ID')
      return res.status(401).json({
        responseCode: '4010001',
        responseMessage: 'Invalid partner ID'
      })
    }

    // TODO: Here you would normally:
    // 1. Update transaction status in your database
    // 2. Update user's purchased accounts
    // 3. Send confirmation email
    // 4. Update user statistics
    // 5. Log the transaction

    // For now, we'll just log the successful payment
    console.log('✅ Payment callback processed successfully:', {
      trxId,
      amount: paidAmount?.value,
      currency: paidAmount?.currency,
      timestamp: trxDateTime,
      reference: referenceNo,
      channel: additionalInfo?.channel
    })

    // Return expected response according to WinPay documentation
    const response = {
      responseCode: '2002500',
      responseMessage: 'Successful'
    }

    console.log('Sending response:', response)
    return res.status(200).json(response)
  } catch (error) {
    console.error('❌ Error processing WinPay callback:', error)

    // Return error response
    return res.status(500).json({
      responseCode: '5000000',
      responseMessage: 'Internal server error'
    })
  }
}
