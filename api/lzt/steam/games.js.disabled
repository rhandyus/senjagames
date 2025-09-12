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

    // Return a comprehensive games list with popular titles
    const result = {
      // Most Popular Steam Games
      578080: { id: 578080, name: 'PUBG: BATTLEGROUNDS' },
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
      39140: { id: 39140, name: 'Final Fantasy XIV Online' },
      72850: { id: 72850, name: 'The Elder Scrolls V: Skyrim' },
      4000: { id: 4000, name: "Garry's Mod" },

      // Additional Popular Games
      1172470: { id: 1172470, name: 'Apex Legends' },
      892970: { id: 892970, name: 'Valheim' },
      1245620: { id: 1245620, name: 'ELDEN RING' },
      1091500: { id: 1091500, name: 'Cyberpunk 2077' },
      582010: { id: 582010, name: 'MONSTER HUNTER: WORLD' },
      648800: { id: 648800, name: 'Raft' },
      304930: { id: 304930, name: 'Unturned' },
      413150: { id: 413150, name: 'Stardew Valley' },
      322170: { id: 322170, name: 'Avorion' },
      230410: { id: 230410, name: 'Warframe' },

      // Battle Royale Games
      433850: { id: 433850, name: 'Z1 Battle Royale' },
      1517290: { id: 1517290, name: 'Battlefield 2042' },
      1966720: { id: 1966720, name: 'Apex Legends' },

      // MMO/RPG Games
      306130: { id: 306130, name: 'The Elder Scrolls Online' },
      8930: { id: 8930, name: 'Sid Meier\'s Civilization V' },
      289070: { id: 289070, name: 'Sid Meier\'s Civilization VI' },
      294100: { id: 294100, name: 'RimWorld' },
      383870: { id: 383870, name: 'Firewatch' },

      // Survival Games
      346110: { id: 346110, name: 'ARK: Survival Evolved' },
      294100: { id: 294100, name: 'RimWorld' },
      108600: { id: 108600, name: 'Project Zomboid' },
      739630: { id: 739630, name: 'Phasmophobia' },

      // Strategy Games
      394360: { id: 394360, name: 'Hearts of Iron IV' },
      236850: { id: 236850, name: 'Europa Universalis IV' },
      203770: { id: 203770, name: 'Crusader Kings II' },
      1158310: { id: 1158310, name: 'Crusader Kings III' },

      // Horror Games
      381210: { id: 381210, name: 'Dead by Daylight' },
      252490: { id: 252490, name: 'Rust' },

      // Racing Games
      211820: { id: 211820, name: 'Starbound' },

      // Simulation Games
      255710: { id: 255710, name: 'Cities: Skylines' },
      227300: { id: 227300, name: 'Euro Truck Simulator 2' },
      270880: { id: 270880, name: 'American Truck Simulator' },

      // Action Games
      261550: { id: 261550, name: 'Mount & Blade II: Bannerlord' },
      48700: { id: 48700, name: 'Mount & Blade: Warband' },

      // Fighting Games
      310950: { id: 310950, name: 'Street Fighter V' },
      1384160: { id: 1384160, name: 'Street Fighter 6' },

      // Sports Games
      252950: { id: 252950, name: 'Rocket League' },

      // Indie Games
      435150: { id: 435150, name: 'Divinity: Original Sin 2' },
      588650: { id: 588650, name: 'Dead Cells' },
      367520: { id: 367520, name: 'Hollow Knight' },

      // Co-op Games
      322330: { id: 322330, name: 'Don\'t Starve Together' },
      394690: { id: 394690, name: 'Tower Unite' },

      // VR Games
      546560: { id: 546560, name: 'Half-Life: Alyx' },
      620980: { id: 620980, name: 'Beat Saber' },

      // Popular Indie
      524220: { id: 524220, name: 'NieR: Automata' },
      812140: { id: 812140, name: 'A Hat in Time' },

      // More Popular Titles
      274190: { id: 274190, name: 'GRIS' },
      359550: { id: 359550, name: 'Tom Clancy\'s Rainbow Six Siege' },
      812140: { id: 812140, name: 'A Hat in Time' },
      632360: { id: 632360, name: 'Risk of Rain 2' },
      990080: { id: 990080, name: 'Hogwarts Legacy' },
      1286830: { id: 1286830, name: 'Star Wars Jedi: Fallen Order' },

      // More Games from JSON
      268910: { id: 268910, name: 'Cuphead' },
      233860: { id: 233860, name: 'Castle Crashers' },
      251570: { id: 251570, name: '7 Days to Die' },
      346010: { id: 346010, name: 'Besiege' },
      393380: { id: 393380, name: 'Squad' },
      244850: { id: 244850, name: 'Space Engineers' },
      418370: { id: 418370, name: 'Ori and the Blind Forest' },
      387990: { id: 387990, name: 'Scrap Mechanic' },
      391540: { id: 391540, name: 'Undertale' },
      275850: { id: 275850, name: 'No Man\'s Sky' }
    }

    console.log(`✅ Steam games API returned ${Object.keys(result).length} games`)

    return res.status(200).json(result)
  } catch (error) {
    console.error('❌ Error in /api/lzt/steam/games:', error)
    return res.status(500).json({ error: error.message })
  }
}
