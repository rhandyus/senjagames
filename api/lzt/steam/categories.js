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

  try {
    console.log('📥 /api/lzt/steam/categories endpoint called')

    // Return Steam categories structure that the frontend expects
    const categories = {
      1: { id: 1, name: 'Action' },
      2: { id: 2, name: 'Adventure' },
      3: { id: 3, name: 'Casual' },
      4: { id: 4, name: 'Indie' },
      5: { id: 5, name: 'MMO' },
      6: { id: 6, name: 'Racing' },
      7: { id: 7, name: 'RPG' },
      8: { id: 8, name: 'Simulation' },
      9: { id: 9, name: 'Sports' },
      10: { id: 10, name: 'Strategy' }
    }

    return res.status(200).json(categories)
  } catch (error) {
    console.error('Error fetching Steam categories:', error)
    return res.status(500).json({
      error: 'Failed to fetch Steam categories',
      details: error.message
    })
  }
}
