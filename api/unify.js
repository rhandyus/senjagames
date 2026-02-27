// Unified API endpoint for multiple LZT categories + LZT market operations + Doku callbacks
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

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

  try {
    const { name, ...queryParams } = req.query

    // ─── POST-based routes ───────────────────────────────────────────
    if (req.method === 'POST') {
      if (!name) {
        return res.status(400).json({ error: 'Missing name parameter for POST request' })
      }

      const postAction = name.toLowerCase()

      // ── LZT Preview (GET item details, safe) ──
      if (postAction === 'lzt-preview') {
        const { item_id } = req.body
        if (!item_id) return res.status(400).json({ error: 'item_id is required' })

        const token = process.env.LZT_TOKEN
        if (!token) return res.status(500).json({ error: 'Missing API token' })

        console.log(`🔍 [unify] Previewing LZT item: ${item_id}`)

        const response = await fetch(`https://prod-api.lzt.market/${item_id}`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
        })
        const data = await response.json()
        return res.status(response.status).json(data)
      }

      // ── LZT Check Account (POST /check-account) ──
      if (postAction === 'lzt-check') {
        const { item_id } = req.body
        if (!item_id) return res.status(400).json({ error: 'item_id is required' })

        const token = process.env.LZT_TOKEN
        if (!token) return res.status(500).json({ error: 'Missing API token' })

        console.log(`✅ [unify] Checking account validity for LZT item: ${item_id}`)

        let data = null
        let lastStatus = 500
        const MAX_RETRIES = 10

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          const response = await fetch(`https://prod-api.lzt.market/${item_id}/check-account`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
          })
          lastStatus = response.status
          data = await response.json()

          if (data.errors && Array.isArray(data.errors) && data.errors.includes('retry_request')) {
            console.log(`🔄 Retry request received (attempt ${attempt}/${MAX_RETRIES})`)
            await new Promise(resolve => setTimeout(resolve, 500))
            continue
          }
          break
        }
        return res.status(lastStatus).json(data)
      }

      // ── LZT Fast-Buy (POST /fast-buy) ──
      if (postAction === 'lzt-fastbuy') {
        const { item_id, price } = req.body
        if (!item_id) return res.status(400).json({ error: 'item_id is required' })

        const token = process.env.LZT_TOKEN
        if (!token) return res.status(500).json({ error: 'Missing API token' })

        console.log(`🛒 [unify] Initiating Fast-Buy for LZT item: ${item_id}`)

        let data = null
        let lastStatus = 500
        const MAX_RETRIES = 10

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          const bodyPayload = price ? JSON.stringify({ price }) : undefined
          const response = await fetch(`https://prod-api.lzt.market/${item_id}/fast-buy`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
              Accept: 'application/json'
            },
            ...(bodyPayload ? { body: bodyPayload } : {})
          })
          lastStatus = response.status
          data = await response.json()

          if (data.errors && Array.isArray(data.errors) && data.errors.includes('retry_request')) {
            console.log(`🔄 Retry request received (attempt ${attempt}/${MAX_RETRIES})`)
            await new Promise(resolve => setTimeout(resolve, 500))
            continue
          }
          break
        }
        return res.status(lastStatus).json(data)
      }

      // ── Doku Callback (notification / inquiry) ──
      if (postAction === 'doku-notification' || postAction === 'doku-inquiry') {
        return await handleDokuCallback(postAction, req, res)
      }

      return res.status(400).json({ error: `Unsupported POST action: ${name}` })
    }

    // ─── GET-based routes (existing logic) ───────────────────────────
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    console.log(
      `🔍 Unified API Request - name: ${name}, queryParams: ${JSON.stringify(queryParams)}`
    )

    // Validate category name parameter
    if (!name) {
      return res.status(400).json({
        error: 'Missing category name',
        message:
          'Please provide a category name parameter (?name=mihoyo, ?name=riot, ?name=telegram, ?name=ea, ?name=epicgamesgames, ?name=steamgames, or ?name=search with &id=ITEM_ID)',
        supportedCategories: [
          'mihoyo',
          'riot',
          'telegram',
          'ea',
          'origin',
          'epicgamesgames',
          'steamgames',
          'search'
        ]
      })
    }

    const categoryMapping = {
      mihoyo: 'mihoyo',
      riot: 'riot',
      telegram: 'telegram',
      ea: 'ea',
      origin: 'ea', // Origin maps to EA
      epicgamesgames: 'epicgames/games', // Epic Games games list
      steamgames: 'steam/games', // Steam games list
      search: 'search', // Search for account details by item ID
      epic: 'epicgames',
      steam: 'steam',
      battlenet: 'category/11',
      fortnite: 'category/17',
      minecraft: 'category/28',
      roblox: 'roblox',
      socialclub: 'socialclub',
      uplay: 'uplay'
    }

    const category = categoryMapping[name.toLowerCase()]

    if (!category) {
      console.log(`❌ Unsupported category: ${name}`)
      return res.status(400).json({
        error: 'Unsupported category',
        message: `Category '${name}' is not supported`,
        supportedCategories: Object.keys(categoryMapping)
      })
    }

    console.log(`✅ Category mapping: ${name} -> ${category}`)

    // Special handling for search endpoint
    if (name.toLowerCase() === 'search') {
      const { id } = queryParams

      if (!id) {
        return res.status(400).json({
          error: 'Missing item ID',
          message: 'Search requires an item ID parameter (?name=search&id=ITEM_ID)',
          example: '?name=search&id=188770198'
        })
      }

      console.log(`🔍 Searching for account details with ID: ${id}`)

      // Build LZT Market API URL for specific item details
      const baseURL = 'https://prod-api.lzt.market'
      const apiURL = new URL(id, baseURL)

      // Get token from environment
      const token = process.env.LZT_TOKEN

      if (!token) {
        console.error('❌ No LZT Market token found')
        return res.status(500).json({
          error: 'Server configuration error',
          message: 'Missing API token'
        })
      }

      console.log(`🎮 LZT API Request for item details:`, apiURL.toString())

      // Make request to LZT Market API for specific item
      const response = await fetch(apiURL.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'SenjaGames-API/1.0'
        }
      })

      if (!response.ok) {
        console.error('❌ LZT API Error:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('Error details:', errorText)

        return res.status(response.status).json({
          error: 'LZT Market API error',
          status: response.status,
          message: errorText,
          itemId: id,
          requestedName: name
        })
      }

      const data = await response.json()
      console.log(`✅ LZT API Success for item ${id}: Account details retrieved`)

      // Return the account details
      return res.status(200).json(data)
    }

    // Build LZT Market API URL for category listings
    const baseURL = 'https://prod-api.lzt.market'
    const apiURL = new URL(category, baseURL)

    // Add all query parameters (except 'name')
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value && value !== '') {
        apiURL.searchParams.append(key, value)
      }
    })

    // Get token from environment
    const token = process.env.LZT_TOKEN

    if (!token) {
      console.error('❌ No LZT Market token found')
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'Missing API token'
      })
    }

    console.log(`🎮 LZT API Request for ${category}:`, apiURL.toString())

    // Make request to LZT Market API with retry logic for rate limiting
    const makeRequestWithRetry = async (url, headers, maxRetries = 3) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const res = await fetch(url, { method: 'GET', headers })

          if (res.status === 429) {
            const waitTime = Math.pow(2, attempt) * 1000 // Exponential backoff
            console.log(`⏳ Rate limited (429), waiting ${waitTime}ms before retry ${attempt}/${maxRetries}`)

            if (attempt < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, waitTime))
              continue
            } else {
              console.log('⚠️ All retries exhausted, returning mock data')
              return {
                ok: true,
                json: async () => ({ items: [], totalItems: 0, message: 'Rate limit exceeded' })
              }
            }
          }
          return res
        } catch (error) {
          if (attempt === maxRetries) throw error
          console.log(`🔄 Attempt ${attempt} failed, retrying...`)
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    }

    const response = await makeRequestWithRetry(apiURL.toString(), {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'SenjaGames-API/1.0'
    })

    if (!response.ok) {
      console.error('❌ LZT API Error:', response.status, response.statusText)
      const errorText = await response.text()
      try {
          // If the error response itself is JSON, try to parse its errors array:
          const errObj = JSON.parse(errorText)
          if (errObj.errors && Array.isArray(errObj.errors) && errObj.errors.includes('retry_request')) {
               console.log('🔄 Automatic retry_request detected on GET payload, but retries exhausted.')
          }
      } catch (e) { /* non-json error */ }

      return res.status(response.status).json({
        error: 'LZT Market API error',
        status: response.status,
        message: errorText,
        category: category,
        requestedName: name
      })
    }

    const data = await response.json()

    // Special handling for Steam games endpoint
    if (name.toLowerCase() === 'steamgames' && data.games && Array.isArray(data.games)) {
      console.log(`✅ LZT API Success for ${category}: ${data.games.length} games returned`)

      // Transform games array to object with app_id as key
      const gamesObject = {}
      data.games.forEach(game => {
        if (game.app_id) {
          gamesObject[game.app_id] = {
            name: game.title || game.abbr || `Game ${game.app_id}`,
            title: game.title,
            abbr: game.abbr,
            app_id: game.app_id,
            category_id: game.category_id,
            img: game.img,
            url: game.url
          }
        }
      })

      return res.status(200).json(gamesObject)
    }

    console.log(`✅ LZT API Success for ${category}: ${data.items?.length || 0} items returned`)

    // Return the data
    res.status(200).json(data)
  } catch (error) {
    console.error(`❌ Unified API Error for ${req.query.name}:`, error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      requestedName: req.query.name
    })
  }
}

// ─── Doku Callback Handler ──────────────────────────────────────────
async function handleDokuCallback(action, req, res) {
  const {
    doc,
    updateDoc,
    arrayRemove,
    arrayUnion,
    collection,
    getDocs
  } = require('firebase/firestore')
  const { db } = require('../src/config/firebase')

  if (action === 'doku-notification') {
    console.log('Doku notification received:', req.body)

    const {
      trxId,
      paymentAmount,
      paymentDate,
      paymentStatus
    } = req.body

    // Find user with this transaction
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
      if (foundUser && foundTransaction) {
        const userRef = doc(db, 'users', foundUser.id)
        await updateDoc(userRef, { ongoingTransactions: arrayRemove(foundTransaction) })

        const completedTransaction = {
          ...foundTransaction,
          status: 'completed',
          completedAt: new Date().toISOString(),
          paymentDate: paymentDate,
          paymentAmount: paymentAmount
        }
        await updateDoc(userRef, { paymentHistory: arrayUnion(completedTransaction) })

        if (foundTransaction.item) {
          const purchasedAccount = {
            ...foundTransaction.item,
            purchasedAt: new Date().toISOString(),
            trxId: trxId
          }
          await updateDoc(userRef, { purchasedAccounts: arrayUnion(purchasedAccount) })
        }
        console.log('Payment successful and transaction updated for trxId:', trxId)
      }
      return res.json({ responseCode: '2002400', responseMessage: 'Success' })
    } else {
      if (foundUser && foundTransaction) {
        const userRef = doc(db, 'users', foundUser.id)
        const updatedTransaction = {
          ...foundTransaction,
          status: paymentStatus === '01' ? 'failed' : 'pending',
          lastUpdated: new Date().toISOString()
        }
        await updateDoc(userRef, {
          ongoingTransactions: arrayRemove(foundTransaction)
        })
        await updateDoc(userRef, {
          ongoingTransactions: arrayUnion(updatedTransaction)
        })
      }
      console.log('Payment status:', paymentStatus, 'for trxId:', trxId)
      return res.json({ responseCode: '2002400', responseMessage: 'Notification received' })
    }
  }

  if (action === 'doku-inquiry') {
    console.log('Doku inquiry received:', req.body)
    const { partnerServiceId, customerNo, virtualAccountNo } = req.body

    return res.json({
      responseCode: '2002400',
      responseMessage: 'Success',
      virtualAccountData: {
        partnerServiceId,
        customerNo,
        virtualAccountNo,
        virtualAccountName: 'SENJAGAMES PAYMENT',
        virtualAccountEmail: 'payment@senjagames.id',
        trxId: `TRX${Date.now()}`,
        totalAmount: { value: '10000.00', currency: 'IDR' },
        additionalInfo: {
          channel: 'VIRTUAL_ACCOUNT_BANK_CIMB',
          trxId: `TRX${Date.now()}`,
          virtualAccountConfig: { reusableStatus: false, maxAmount: '1000000.00', minAmount: '1000.00' }
        },
        inquiryStatus: '00',
        inquiryReason: { english: 'Success', indonesia: 'Sukses' }
      }
    })
  }

  return res.status(404).json({ error: 'Unknown doku action' })
}
