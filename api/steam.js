// Vercel Serverless Function for Steam accounts

// Simple rate limiting and request deduplication
const lastRequestTime = { value: 0 }
const pendingRequests = new Map()

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

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Create a request key for deduplication
  const requestKey = `${req.url}?${JSON.stringify(req.query)}`

  // If there's already a pending request with the same parameters, wait for it
  if (pendingRequests.has(requestKey)) {
    console.log('⏳ Waiting for duplicate request to complete...')
    try {
      const result = await pendingRequests.get(requestKey)
      return res.status(200).json(result)
    } catch (error) {
      return res.status(429).json({ error: 'Request failed', message: error.message })
    }
  }

  // Simple rate limiting - wait 3 seconds between API calls
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime.value
  if (timeSinceLastRequest < 3000) {
    const waitTime = 3000 - timeSinceLastRequest
    console.log(`⏳ Rate limiting: waiting ${waitTime}ms`)
    await new Promise(resolve => setTimeout(resolve, waitTime))
  }
  lastRequestTime.value = Date.now()

  try {
    const {
      page = 1,
      pmin,
      pmax,
      game,
      order_by = 'pdate_to_up_upload',
      country,
      not_country,
      eg,
      daybreak,
      mafile,
      limit,
      title,
      ...otherParams
    } = req.query

    // Build LZT Market API URL for Steam category
    const baseURL = 'https://prod-api.lzt.market'
    const apiURL = new URL('steam', baseURL)

    // Add pagination
    apiURL.searchParams.append('page', page)

    // Add price filters
    if (pmin) apiURL.searchParams.append('pmin', pmin)
    if (pmax) apiURL.searchParams.append('pmax', pmax)

    // Add game filters
    if (game && Array.isArray(game)) {
      game.forEach((gameId, index) => {
        apiURL.searchParams.append(`game[${index}]`, gameId)
      })
    } else if (game) {
      apiURL.searchParams.append('game[0]', game)
    }

    // Add location filters
    if (country && Array.isArray(country)) {
      country.forEach((c, index) => {
        apiURL.searchParams.append(`country[${index}]`, c)
      })
    } else if (country) {
      apiURL.searchParams.append('country[0]', country)
    }

    if (not_country && Array.isArray(not_country)) {
      not_country.forEach((c, index) => {
        apiURL.searchParams.append(`not_country[${index}]`, c)
      })
    } else if (not_country) {
      apiURL.searchParams.append('not_country[0]', not_country)
    }

    // Add other Steam-specific filters
    if (eg) apiURL.searchParams.append('eg', eg)
    if (daybreak) apiURL.searchParams.append('daybreak', daybreak)
    if (mafile) apiURL.searchParams.append('mafile', mafile)
    if (limit) apiURL.searchParams.append('limit', limit)
    if (title) apiURL.searchParams.append('title', title)
    if (order_by) apiURL.searchParams.append('order_by', order_by)

    // Add any other parameters
    Object.entries(otherParams).forEach(([key, value]) => {
      if (value && value !== '') {
        apiURL.searchParams.append(key, value)
      }
    })

    // Get token from environment
    const token =
      process.env.LZT_TOKEN

    if (!token) {
      console.error('❌ No LZT Market token found')
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'Missing API token'
      })
    }

    console.log('🎮 Steam API Request:', apiURL.toString())

    // Create and store the API request promise for deduplication
    const requestPromise = (async () => {
      // Make request to LZT Market API
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

        throw new Error(`LZT Market API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log(`✅ Steam API Success: ${data.items?.length || 0} accounts returned`)
      return data
    })()

    // Store the promise to prevent duplicate requests
    pendingRequests.set(requestKey, requestPromise)

    try {
      const data = await requestPromise
      // Return the data
      res.status(200).json(data)
    } catch (error) {
      console.error('❌ Steam API Error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      })
    } finally {
      // Clean up the pending request
      pendingRequests.delete(requestKey)
    }
  } catch (outerError) {
    console.error('❌ Steam API Outer Error:', outerError)
    res.status(500).json({
      error: 'Internal server error',
      message: outerError.message
    })
  }
}
