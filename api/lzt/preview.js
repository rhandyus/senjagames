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

    // GET /{item_id} - safe preview, no purchase
    const apiURL = `https://prod-api.lzt.market/${item_id}`
    const token = process.env.LZT_TOKEN

    if (!token) {
      return res.status(500).json({ error: 'Server configuration error', message: 'Missing API token' })
    }

    console.log(`🔍 Previewing LZT item: ${item_id}`)

    const response = await fetch(apiURL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    })

    const data = await response.json()
    return res.status(response.status).json(data)
  } catch (error) {
    console.error('❌ Preview API Proxy Error:', error)
    return res.status(500).json({ error: 'Proxy server error', message: error.message })
  }
}
