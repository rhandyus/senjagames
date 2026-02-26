export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' })
  }

  try {
    const { item_id } = req.body

    if (!item_id) {
      return res.status(400).json({ error: 'item_id is required in the JSON body.' })
    }

    // POST /{item_id}/check-account - validates account credentials (part of purchase flow)
    const apiURL = `https://prod-api.lzt.market/${item_id}/check-account`
    const token = process.env.LZT_TOKEN

    if (!token) {
      return res.status(500).json({ error: 'Server configuration error', message: 'Missing API token' })
    }

    console.log(`✅ Checking account validity for LZT item: ${item_id}`)

    // Retry logic: LZT API may return "retry_request" error
    let data = null
    let lastStatus = 500
    const MAX_RETRIES = 10

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const response = await fetch(apiURL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
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
  } catch (error) {
    console.error('❌ Check Account Proxy Error:', error)
    return res.status(500).json({ error: 'Proxy server error', message: error.message })
  }
}
