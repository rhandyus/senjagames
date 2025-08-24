export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('📥 /api/lzt/steam/games endpoint called')

    // Return a simple games list structure that the frontend expects
    const result = {
      578080: { id: 578080, name: 'PUBG' },
      730: { id: 730, name: 'Counter-Strike 2' },
      570: { id: 570, name: 'Dota 2' },
      440: { id: 440, name: 'Team Fortress 2' },
      252490: { id: 252490, name: 'Rust' },
      271590: { id: 271590, name: 'Grand Theft Auto V' },
      218620: { id: 218620, name: 'PAYDAY 2' },
      377160: { id: 377160, name: 'Fallout 4' },
      292030: { id: 292030, name: 'The Witcher 3: Wild Hunt' },
      431960: { id: 431960, name: 'Wallpaper Engine' },
      1085660: { id: 1085660, name: 'Destiny 2' },
      105600: { id: 105600, name: 'Terraria' },
      39140: { id: 39140, name: 'Final Fantasy XIV' },
      72850: { id: 72850, name: 'The Elder Scrolls V: Skyrim' },
      4000: { id: 4000, name: "Garry's Mod" }
    }

    console.log(`✅ Steam games API returned ${Object.keys(result).length} games`)

    return res.status(200).json(result)
  } catch (error) {
    console.error('❌ Error in /api/lzt/steam/games:', error)
    return res.status(500).json({ error: error.message })
  }
}
