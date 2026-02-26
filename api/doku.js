const doku = require('doku-nodejs-library')

// Initialize Doku Snap with environment variables
let snap = null

const initializeDoku = () => {
  if (!snap) {
    const privateKey = process.env.DOKU_PRIVATE_KEY
    const clientId = process.env.DOKU_CLIENT_ID
    const publicKey = process.env.DOKU_PUBLIC_KEY
    const dokuPublicKey = process.env.DOKU_PUBLIC_KEY_SERVER
    const secretKey = process.env.DOKU_SECRET_KEY
    const isProduction = process.env.DOKU_IS_PRODUCTION === 'true'

    if (!privateKey || !clientId || !publicKey || !dokuPublicKey || !secretKey) {
      console.error('❌ Doku credentials not found in environment variables')
      return null
    }

    try {
      snap = new doku.Snap({
        isProduction: isProduction,
        privateKey: privateKey,
        clientID: clientId,
        publicKey: publicKey,
        dokuPublicKey: dokuPublicKey,
        secretKey: secretKey
      })
      console.log('✅ Doku Snap initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Doku Snap:', error)
      return null
    }
  }
  return snap
}

const createVirtualAccount = async requestData => {
  const dokuSnap = initializeDoku()
  if (!dokuSnap) {
    throw new Error('Doku not initialized')
  }

  try {
    const response = await dokuSnap.createVa(requestData)
    return response
  } catch (error) {
    console.error('Doku VA creation error:', error)
    throw error
  }
}

const checkTransactionStatus = async requestData => {
  const dokuSnap = initializeDoku()
  if (!dokuSnap) {
    throw new Error('Doku not initialized')
  }

  try {
    const response = await dokuSnap.checkStatusVa(requestData)
    return response
  } catch (error) {
    console.error('Doku status check error:', error)
    throw error
  }
}

module.exports = {
  initializeDoku,
  createVirtualAccount,
  checkTransactionStatus
}
