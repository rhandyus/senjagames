// Vercel Serverless Function for Doku Callback API
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const {
  doc,
  updateDoc,
  arrayRemove,
  arrayUnion,
  collection,
  getDocs
} = require('firebase/firestore')
const { db } = require('../src/config/firebase')

// Doku payment notification callback
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

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const path = req.url.split('?')[0].replace('/api/doku/', '')

  try {
    if (path === 'notification') {
      console.log('Doku notification received:', req.body)

      const {
        partnerServiceId,
        customerNo,
        virtualAccountNo,
        trxId,
        paymentRequestId,
        paymentAmount,
        paymentDate,
        paymentStatus,
        additionalInfo
      } = req.body

      // Find user with this transaction by searching ongoingTransactions
      const usersRef = collection(db, 'users')
      const usersSnapshot = await getDocs(usersRef)

      let foundUser = null
      let foundTransaction = null

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data()
        const ongoingTransactions = userData.ongoingTransactions || []

        const transaction = ongoingTransactions.find(t => t.trxId === trxId)
        if (transaction) {
          foundUser = { id: userDoc.id, ...userData }
          foundTransaction = transaction
          break
        }
      }

      if (paymentStatus === '00' || paymentStatus === 'SUCCESS') {
        // Payment successful - move from ongoing to completed
        if (foundUser && foundTransaction) {
          const userRef = doc(db, 'users', foundUser.id)

          // Remove from ongoing transactions
          await updateDoc(userRef, {
            ongoingTransactions: arrayRemove(foundTransaction)
          })

          // Add to payment history
          const completedTransaction = {
            ...foundTransaction,
            status: 'completed',
            completedAt: new Date().toISOString(),
            paymentDate: paymentDate,
            paymentAmount: paymentAmount
          }

          await updateDoc(userRef, {
            paymentHistory: arrayUnion(completedTransaction)
          })

          // If it's an account purchase, add to purchasedAccounts
          if (foundTransaction.item) {
            const purchasedAccount = {
              ...foundTransaction.item,
              purchasedAt: new Date().toISOString(),
              trxId: trxId
            }

            await updateDoc(userRef, {
              purchasedAccounts: arrayUnion(purchasedAccount)
            })
          }

          console.log('Payment successful and transaction updated for trxId:', trxId)
        }

        res.json({
          responseCode: '2002400',
          responseMessage: 'Success'
        })
      } else {
        // Payment failed or pending - update status
        if (foundUser && foundTransaction) {
          const userRef = doc(db, 'users', foundUser.id)

          const updatedTransaction = {
            ...foundTransaction,
            status: paymentStatus === '01' ? 'failed' : 'pending',
            lastUpdated: new Date().toISOString()
          }

          await updateDoc(userRef, {
            ongoingTransactions: arrayRemove(foundTransaction),
            ongoingTransactions: arrayUnion(updatedTransaction)
          })
        }

        console.log('Payment status:', paymentStatus, 'for trxId:', trxId)

        res.json({
          responseCode: '2002400',
          responseMessage: 'Notification received'
        })
      }
    } else if (path === 'inquiry') {
      console.log('Doku inquiry received:', req.body)

      const { partnerServiceId, customerNo, virtualAccountNo, inquiryRequestId, additionalInfo } =
        req.body

      // In a real implementation, you'd look up the transaction details
      // For demo, return mock data

      res.json({
        responseCode: '2002400',
        responseMessage: 'Success',
        virtualAccountData: {
          partnerServiceId: partnerServiceId,
          customerNo: customerNo,
          virtualAccountNo: virtualAccountNo,
          virtualAccountName: 'SENJAGAMES PAYMENT',
          virtualAccountEmail: 'payment@senjagames.id',
          trxId: `TRX${Date.now()}`,
          totalAmount: {
            value: '10000.00',
            currency: 'IDR'
          },
          additionalInfo: {
            channel: 'VIRTUAL_ACCOUNT_BANK_CIMB',
            trxId: `TRX${Date.now()}`,
            virtualAccountConfig: {
              reusableStatus: false,
              maxAmount: '1000000.00',
              minAmount: '1000.00'
            }
          },
          inquiryStatus: '00',
          inquiryReason: {
            english: 'Success',
            indonesia: 'Sukses'
          }
        }
      })
    } else {
      res.status(404).json({ error: 'Endpoint not found' })
    }
  } catch (error) {
    console.error('Callback API error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    })
  }
}
