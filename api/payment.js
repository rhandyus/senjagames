// Vercel Serverless Function for Bank Transfer Payment
const admin = require('firebase-admin')

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  })
}

const db = admin.firestore()
const bucket = admin.storage().bucket()

// Bank Transfer Configuration
const BANK_DETAILS = {
  bank: 'BCA',
  accountNumber: '7410468225',
  accountName: 'Rhandy'
}

// Create bank transfer order
const createBankTransferOrder = async (orderData) => {
  try {
    const { customerName, customerEmail, amount, items, trxId } = orderData

    // Create order document
    const orderRef = db.collection('orders').doc(trxId)
    const order = {
      id: trxId,
      customerName,
      customerEmail,
      amount,
      items,
      paymentMethod: 'bank_transfer',
      bankDetails: BANK_DETAILS,
      status: 'waiting_for_confirmation',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }

    await orderRef.set(order)

    return {
      orderId: trxId,
      bankDetails: BANK_DETAILS,
      amount,
      status: 'waiting_for_confirmation'
    }
  } catch (error) {
    console.error('Bank transfer order creation error:', error)
    throw error
  }
}

// Upload transfer proof image
const uploadTransferProof = async (orderId, imageBuffer, imageName) => {
  try {
    const fileName = `transfer-proofs/${orderId}/${Date.now()}-${imageName}`
    const file = bucket.file(fileName)

    // Upload image
    await file.save(imageBuffer, {
      metadata: {
        contentType: 'image/jpeg' // or detect from imageName
      },
      public: true
    })

    // Get public URL
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-09-2491' // Far future date for permanent access
    })

    // Update order with transfer proof
    const orderRef = db.collection('orders').doc(orderId)
    await orderRef.update({
      transferProofUrl: url,
      transferProofUploadedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'waiting_for_confirmation',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })

    return { success: true, imageUrl: url }
  } catch (error) {
    console.error('Transfer proof upload error:', error)
    throw error
  }
}

// Get order status
const getOrderStatus = async (orderId) => {
  try {
    const orderRef = db.collection('orders').doc(orderId)
    const orderDoc = await orderRef.get()

    if (!orderDoc.exists) {
      throw new Error('Order not found')
    }

    return orderDoc.data()
  } catch (error) {
    console.error('Get order status error:', error)
    throw error
  }
}

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

  const path = req.url.split('?')[0].replace('/api/payment/', '')

  try {
    if (req.method === 'POST' && path === 'create-order') {
      const { customerName, customerEmail, amount, items, trxId } = req.body

      if (!customerName || !amount || !trxId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: customerName, amount, trxId'
        })
      }

      const orderResult = await createBankTransferOrder({
        customerName,
        customerEmail,
        amount,
        items,
        trxId
      })

      res.json({
        success: true,
        data: {
          orderId: orderResult.orderId,
          bankDetails: orderResult.bankDetails,
          amount: orderResult.amount,
          status: orderResult.status,
          instructions: [
            `Transfer ke rekening ${BANK_DETAILS.bank}`,
            `Nomor rekening: ${BANK_DETAILS.accountNumber}`,
            `Atas nama: ${BANK_DETAILS.accountName}`,
            `Jumlah: Rp ${amount.toLocaleString('id-ID')}`,
            'Upload bukti transfer setelah melakukan pembayaran',
            'Admin akan memverifikasi pembayaran dalam 1-2 jam'
          ]
        }
      })
    } else if (req.method === 'POST' && path === 'upload-proof') {
      const { orderId } = req.body

      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: 'Missing orderId'
        })
      }

      // Handle multipart form data for image upload
      const formidable = require('formidable')
      const form = formidable({ multiples: false })

      form.parse(req, async (err, fields, files) => {
        if (err) {
          return res.status(500).json({ success: false, error: 'File upload failed' })
        }

        try {
          const imageFile = files.image || files.transferProof
          if (!imageFile) {
            return res.status(400).json({ success: false, error: 'No image file provided' })
          }

          const fs = require('fs')
          const imageBuffer = fs.readFileSync(imageFile.filepath)
          const imageName = imageFile.originalFilename || 'transfer-proof.jpg'

          const uploadResult = await uploadTransferProof(orderId, imageBuffer, imageName)

          res.json({
            success: true,
            data: {
              imageUrl: uploadResult.imageUrl,
              message: 'Bukti transfer berhasil diupload. Menunggu konfirmasi admin.'
            }
          })
        } catch (error) {
          res.status(500).json({ success: false, error: error.message })
        }
      })
    } else if (req.method === 'GET' && path === 'status') {
      const { orderId } = req.query

      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: 'Missing orderId parameter'
        })
      }

      const orderData = await getOrderStatus(orderId)

      res.json({
        success: true,
        data: orderData
      })
    } else {
      res.status(404).json({ error: 'Endpoint not found' })
    }
  } catch (error) {
    console.error('Payment API error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    })
  }
}
