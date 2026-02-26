export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Only allow POST requests for fast-buy (it mutates state)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' })
  }

  try {
    const { item_id, price } = req.body

    if (!item_id) {
        return res.status(400).json({ error: 'item_id is required in the JSON body.' })
    }

    const apiURL = `https://prod-api.lzt.market/${item_id}/fast-buy`

    // Get token from environment
    const token = process.env.LZT_TOKEN

    if (!token) {
      console.error('❌ No LZT Market token found')
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'Missing API token'
      })
    }

    console.log(`🛒 Initiating Fast-Buy for LZT item: ${item_id}`)

    // Retry logic: LZT API may return "retry_request" error, retry up to 10 times
    let data = null
    let lastStatus = 500
    const MAX_RETRIES = 10

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const bodyPayload = price ? JSON.stringify({ price }) : undefined

      const response = await fetch(apiURL, {
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

      // If we get a retry_request error, wait briefly and try again
      if (data.errors && Array.isArray(data.errors) && data.errors.includes('retry_request')) {
        console.log(`🔄 Retry request received (attempt ${attempt}/${MAX_RETRIES})`)
        await new Promise(resolve => setTimeout(resolve, 500))
        continue
      }

      // Otherwise, break out of the loop (success or real error)
      break
    }

    return res.status(lastStatus).json(data)
  } catch (error) {
    console.error('❌ Fast-Buy Proxy Error:', error)
    return res.status(500).json({
      error: 'Proxy server error',
      message: error.message
    })
  }
}
