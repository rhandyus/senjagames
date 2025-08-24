const express = require('express')
const crypto = require('crypto')
const { doc, updateDoc, getDoc } = require('firebase/firestore')
const { db } = require('../config/firebase-server.js')

const router = express.Router()

// WinPay callback signature verification
const verifyWinPaySignature = (payload, timestamp, partnerId, signature, clientSecret) => {
  // Create string to sign according to WinPay documentation
  const stringToSign = `POST\n/v1.0/transfer-va/payment\n${JSON.stringify(payload)}\n${timestamp}`

  // Generate signature using HMAC-SHA256
  const calculatedSignature = crypto
    .createHmac('sha256', clientSecret)
    .update(stringToSign)
    .digest('hex')

  return signature === calculatedSignature
}

// Handle WinPay Virtual Account payment callback
router.post('/v1.0/transfer-va/payment', async (req, res) => {
  try {
    // Extract headers
    const timestamp = req.headers['x-timestamp']
    const partnerId = req.headers['x-partner-id']
    const signature = req.headers['x-signature']
    const externalId = req.headers['x-external-id']
    const channelId = req.headers['channel-id']

    // Validate required headers
    if (!timestamp || !partnerId || !signature || !externalId) {
      console.error('Missing required headers')
      return res.status(400).json({
        responseCode: '4000000',
        responseMessage: 'Missing required headers'
      })
    }

    // Verify signature (use your WinPay client secret)
    const clientSecret = process.env.WINPAY_CLIENT_SECRET
    if (!verifyWinPaySignature(req.body, timestamp, partnerId, signature, clientSecret)) {
      console.error('Invalid signature')
      return res.status(401).json({
        responseCode: '4010000',
        responseMessage: 'Invalid signature'
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

    // Find transaction in Firestore using trxId
    const transactionRef = doc(db, 'transactions', trxId)
    const transactionDoc = await getDoc(transactionRef)

    if (!transactionDoc.exists()) {
      console.error('Transaction not found:', trxId)
      return res.status(404).json({
        responseCode: '4040000',
        responseMessage: 'Transaction not found'
      })
    }

    const transactionData = transactionDoc.data()

    // Verify payment amount matches expected amount
    const expectedAmount = parseFloat(transactionData.totalAmount?.value || 0)
    const paidAmountValue = parseFloat(paidAmount?.value || 0)

    if (paidAmountValue !== expectedAmount) {
      console.error('Amount mismatch:', {
        expected: expectedAmount,
        paid: paidAmountValue
      })
      return res.status(400).json({
        responseCode: '4000001',
        responseMessage: 'Payment amount mismatch'
      })
    }

    // Update transaction status in Firestore
    await updateDoc(transactionRef, {
      status: 'paid',
      paymentStatus: 'completed',
      paidAt: new Date().toISOString(),
      paymentDetails: {
        paymentRequestId,
        virtualAccountNo,
        trxDateTime,
        referenceNo,
        paidAmount,
        channel: additionalInfo?.channel,
        contractId: additionalInfo?.contractId
      },
      updatedAt: new Date().toISOString()
    })

    // Update user's purchased accounts if this was an account purchase
    if (transactionData.userId && transactionData.items) {
      const userRef = doc(db, 'users', transactionData.userId)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        const userData = userDoc.data()
        const currentPurchased = userData.purchasedAccounts || []
        const newPurchased = [...currentPurchased, ...transactionData.items]

        await updateDoc(userRef, {
          purchasedAccounts: newPurchased,
          'stats.totalPurchases': (userData.stats?.totalPurchases || 0) + 1,
          'stats.totalSpent': (userData.stats?.totalSpent || 0) + paidAmountValue,
          'stats.accountsPurchased':
            (userData.stats?.accountsPurchased || 0) + transactionData.items.length,
          lastTransactionAt: new Date().toISOString()
        })
      }
    }

    // Return expected response according to WinPay documentation
    res.status(200).json({
      responseCode: '2002500',
      responseMessage: 'Successful'
    })
  } catch (error) {
    console.error('Error processing WinPay callback:', error)

    // Return error response
    res.status(500).json({
      responseCode: '5000000',
      responseMessage: 'Internal server error'
    })
  }
})

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'winpay-callback' })
})

module.exports = router
