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
    console.log('📥 /api/lzt/epic/games endpoint called')

    // Return a comprehensive Epic Games list with popular titles
    const result = {
      // Epic Games exclusives and popular games
      10900: { id: 10900, name: 'Fortnite' },
      17540: { id: 17540, name: 'Rocket League' },
      9547: { id: 9547, name: 'Fall Guys: Ultimate Knockout' },
      10308: { id: 10308, name: 'Genshin Impact' },
      21595: { id: 21595, name: 'Among Us' },
      10906: { id: 10906, name: 'Apex Legends' },
      17690: { id: 17690, name: 'Tony Hawk\'s Pro Skater 1 + 2' },
      18310: { id: 18310, name: 'Grand Theft Auto V' },
      17318: { id: 17318, name: 'Borderlands 3' },
      21202: { id: 21202, name: 'Control' },
      
      // Action/Adventure Games
      5026: { id: 5026, name: 'Assassin\'s Creed Valhalla' },
      17540: { id: 17540, name: 'Metro Exodus' },
      21218: { id: 21218, name: 'Hitman 3' },
      20815: { id: 20815, name: 'Watch Dogs: Legion' },
      9919: { id: 9919, name: 'Batman Arkham Collection' },
      
      // RPG Games  
      21595: { id: 21595, name: 'The Witcher 3: Wild Hunt' },
      17679: { id: 17679, name: 'Cyberpunk 2077' },
      21218: { id: 21218, name: 'Mass Effect Legendary Edition' },
      5555: { id: 5555, name: 'Disco Elysium' },
      
      // Strategy Games
      10843: { id: 10843, name: 'Civilization VI' },
      17318: { id: 17318, name: 'Total War: Troy' },
      9436: { id: 9436, name: 'Cities: Skylines' },
      
      // Indie Games
      18317: { id: 18317, name: 'Hades' },
      21218: { id: 21218, name: 'Celeste' },
      17540: { id: 17540, name: 'Hollow Knight' },
      9547: { id: 9547, name: 'Ori and the Will of the Wisps' },
      
      // Survival/Crafting
      10308: { id: 10308, name: 'Subnautica' },
      17679: { id: 17679, name: 'No Man\'s Sky' },
      21202: { id: 21202, name: 'The Forest' },
      
      // Racing Games
      9547: { id: 9547, name: 'Dirt Rally 2.0' },
      21595: { id: 21595, name: 'F1 2021' },
      
      // Horror Games
      17318: { id: 17318, name: 'Dead by Daylight' },
      20815: { id: 20815, name: 'Phasmophobia' },
      
      // Sports Games
      10906: { id: 10906, name: 'FIFA 22' },
      17690: { id: 17690, name: 'NBA 2K22' },
      
      // Simulation Games
      18310: { id: 18310, name: 'Euro Truck Simulator 2' },
      21202: { id: 21202, name: 'Microsoft Flight Simulator' },
      
      // Multiplayer Games
      17540: { id: 17540, name: 'Valorant' },
      10900: { id: 10900, name: 'Overwatch' },
      9547: { id: 9547, name: 'Counter-Strike 2' },
      
      // Free to Play
      10308: { id: 10308, name: 'Warframe' },
      17679: { id: 17679, name: 'Path of Exile' },
      21218: { id: 21218, name: 'Destiny 2' },
      
      // VR Games
      5026: { id: 5026, name: 'Beat Saber' },
      17540: { id: 17540, name: 'Half-Life: Alyx' },
      
      // Co-op Games
      21595: { id: 21595, name: 'It Takes Two' },
      17318: { id: 17318, name: 'A Way Out' },
      20815: { id: 20815, name: 'Portal 2' },
      
      // Fighting Games
      9919: { id: 9919, name: 'Tekken 7' },
      17679: { id: 17679, name: 'Street Fighter 6' },
      
      // Platformers
      21218: { id: 21218, name: 'Super Meat Boy' },
      5555: { id: 5555, name: 'Cuphead' },
      
      // Puzzle Games
      10843: { id: 10843, name: 'Portal' },
      17318: { id: 17318, name: 'The Witness' },
      
      // Open World
      9436: { id: 9436, name: 'Red Dead Redemption 2' },
      18317: { id: 18317, name: 'Skyrim' },
      21218: { id: 21218, name: 'Fallout 4' }
    }

    console.log(`✅ Epic Games API returned ${Object.keys(result).length} games`)

    return res.status(200).json(result)
  } catch (error) {
    console.error('❌ Error in /api/lzt/epic/games:', error)
    return res.status(500).json({ error: error.message })
  }
}
