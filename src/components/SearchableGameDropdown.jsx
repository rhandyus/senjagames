import { Icon } from '@iconify/react'
import { useEffect, useRef, useState } from 'react'

const SearchableGameDropdown = ({
  selectedGames = [],
  onGameChange,
  gamesList = [], // Accept gamesList as prop
  placeholder = 'Cari game...',
  label = 'Pilih Game yang ada di Dalam Akun',
  disabled = false,
  enableServerSearch = false, // New prop to enable server-side search
  searchEndpoint = '/api/lzt/steam/games' // New prop for search endpoint
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [allGames, setAllGames] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef(null)

  // Fallback games list if none provided
  const defaultGamesList = [
    // From popularSearches
    { value: '730', label: 'CS2 Prime' },
    { value: '381210', label: 'Dead by Daylight' },
    { value: '2623090', label: 'InZOI' },
    { value: '1142710', label: 'Gorilla Tag' },
    { value: '1245620', label: 'Elden Ring' },
    { value: '1649240', label: 'Schedule I' },
    { value: '2056610', label: 'R.E.P.O.' },
    { value: '1086940', label: 'BG3' },

    // From main gamesList
    { value: '578080', label: 'PUBG: BATTLEGROUNDS' },
    { value: '570', label: 'Dota 2' },
    { value: '433850', label: 'Z1 Battle Royale' },
    { value: '440', label: 'Team Fortress 2' },
    { value: '271590', label: 'GTA V' },
    { value: '359550', label: "Tom Clancy's Rainbow Six Siege" },
    { value: '238960', label: 'Path of Exile' },
    { value: '230410', label: 'Warframe' },
    { value: '4000', label: "Garry's Mod" },
    { value: '346110', label: 'ARK: Survival Evolved' },
    { value: '252950', label: 'Rocket League' },
    { value: '444090', label: 'Paladins' },
    { value: '218620', label: 'PAYDAY 2' },
    { value: '304930', label: 'Unturned' },
    { value: '252490', label: 'Rust' },
    { value: '8930', label: "Sid Meier's Civilization V" },
    { value: '268500', label: 'XCOM 2' },
    { value: '377160', label: 'Fallout 4' },
    { value: '105600', label: 'Terraria' },

    // From inventoryGames
    { value: '753', label: 'Steam' },
    { value: '232090', label: 'Killing Floor 2' },
    { value: '322330', label: 'Dont Starve Together' },

    // Additional popular games
    { value: '72850', label: 'The Elder Scrolls V: Skyrim' },
    { value: '292030', label: 'The Witcher 3: Wild Hunt' },
    { value: '431960', label: 'Wallpaper Engine' },
    { value: '550', label: 'Left 4 Dead 2' },
    { value: '582010', label: 'Monster Hunter: World' },
    { value: '413150', label: 'Stardew Valley' },
    { value: '70', label: 'Half-Life' },
    { value: '220', label: 'Half-Life 2' },
    { value: '400', label: 'Portal' },
    { value: '620', label: 'Portal 2' },
    { value: '108600', label: 'Project Zomboid' },
    { value: '1172470', label: 'Apex Legends' },
    { value: '386140', label: 'SpellForce 3: Soul Harvest' },
    { value: '262060', label: 'Darkest Dungeon' },
    { value: '251570', label: '7 Days to Die' },
    { value: '414700', label: 'Saliens' },
    { value: '383870', label: 'Firewatch' },
    { value: '49520', label: 'Borderlands 2' },
    { value: '397540', label: 'Borderlands 3' },
    { value: '22330', label: 'The Elder Scrolls IV: Oblivion' },
    { value: '1628350', label: 'New World' },
    { value: '1326470', label: 'Dead by Daylight' }
  ]

  // Fetch all games from server once when component mounts (if enableServerSearch is true)
  useEffect(() => {
    if (enableServerSearch && searchEndpoint) {
      const fetchAllGames = async () => {
        setIsLoading(true)
        try {
          const response = await fetch(searchEndpoint)
          if (response.ok) {
            const gamesData = await response.json()

            // Convert object format to array format
            const gamesArray = Object.entries(gamesData)
              .filter(([id, game]) => game && typeof game === 'object')
              .map(([id, game]) => ({
                value: id,
                label: game.name || game.title || `Game ${id}`,
                id: parseInt(id)
              }))

            setAllGames(gamesArray)
          }
        } catch (error) {
          console.error('Error fetching all games:', error)
          // Fall back to provided gamesList or default
          setAllGames(gamesList.length > 0 ? gamesList : defaultGamesList)
        } finally {
          setIsLoading(false)
        }
      }

      fetchAllGames()
    } else {
      // Use provided gamesList or fallback to default
      setAllGames(gamesList.length > 0 ? gamesList : defaultGamesList)
    }
  }, [enableServerSearch, searchEndpoint, gamesList])

  // Use provided gamesList or fallback to default (for backwards compatibility)
  const availableGames =
    allGames.length > 0 ? allGames : gamesList.length > 0 ? gamesList : defaultGamesList

  // Efficient search with smart filtering and limit to 50 results for better UX
  const getFilteredGames = () => {
    if (!searchTerm.trim()) {
      // Show first 50 games when no search term (popular games will be first due to API sorting)
      return availableGames.slice(0, 50)
    }

    const term = searchTerm.toLowerCase().trim()

    // Smart search: prioritize matches with popular games first
    const exactMatches = []
    const startMatches = []
    const containsMatches = []

    availableGames.forEach(game => {
      const gameName = game.label.toLowerCase()

      if (gameName === term) {
        exactMatches.push(game)
      } else if (gameName.startsWith(term)) {
        startMatches.push(game)
      } else if (gameName.includes(term)) {
        containsMatches.push(game)
      }
    })

    // Combine results with priority order and limit to 50 results
    return [...exactMatches, ...startMatches, ...containsMatches].slice(0, 50)
  }

  const filteredGames = getFilteredGames()

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Handle game selection
  const handleGameToggle = gameValue => {
    const currentGames = selectedGames || []
    const isSelected = currentGames.includes(gameValue)

    let newGames
    if (isSelected) {
      newGames = currentGames.filter(id => id !== gameValue)
    } else {
      newGames = [...currentGames, gameValue]
    }

    onGameChange(newGames)
  }

  // Get selected game labels
  const getSelectedGameLabels = () => {
    if (!selectedGames || selectedGames.length === 0) return []
    return selectedGames.map(gameId => {
      const game = availableGames.find(g => g.value === gameId)
      return game ? game.label : gameId
    })
  }

  const selectedGameLabels = getSelectedGameLabels()

  return (
    <div className='space-y-2' ref={dropdownRef}>
      {label && <label className='text-gray-300 text-sm font-medium'>{label}</label>}

      {/* Search Input */}
      <div className='relative'>
        <div
          className={`bg-gray-800 border border-gray-600 rounded-lg p-3 transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-500'
          }`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className='flex items-center justify-between'>
            <div className='flex-1'>
              {selectedGameLabels.length > 0 ? (
                <div className='flex flex-wrap gap-1'>
                  {selectedGameLabels.slice(0, 2).map((label, index) => (
                    <span
                      key={index}
                      className='bg-purple-600 text-white text-xs px-2 py-1 rounded-full'
                    >
                      {label}
                    </span>
                  ))}
                  {selectedGameLabels.length > 2 && (
                    <span className='bg-gray-600 text-white text-xs px-2 py-1 rounded-full'>
                      +{selectedGameLabels.length - 2} lainnya
                    </span>
                  )}
                </div>
              ) : (
                <span className='text-gray-400'>{placeholder}</span>
              )}
            </div>
            <Icon
              icon={disabled ? 'mdi:loading' : isOpen ? 'mdi:chevron-up' : 'mdi:chevron-down'}
              className={`text-gray-400 ml-2 text-xl transition-transform ${disabled ? 'animate-spin' : ''}`}
            />
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && !disabled && (
          <div className='absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 max-h-64 overflow-hidden'>
            {/* Search Box */}
            <div className='p-3 border-b border-gray-600'>
              <div className='relative'>
                {isLoading ? (
                  <Icon
                    icon='mdi:loading'
                    className='absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 text-lg animate-spin'
                  />
                ) : (
                  <Icon
                    icon='mdi:magnify'
                    className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg'
                  />
                )}
                <input
                  type='text'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder={enableServerSearch ? 'Cari dari ribuan game...' : 'Cari game...'}
                  className='w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  autoFocus
                />
              </div>
            </div>

            {/* Games List */}
            <div className='max-h-48 overflow-y-auto'>
              {filteredGames.length > 0 ? (
                <>
                  {/* Results info */}
                  {searchTerm && (
                    <div className='px-3 py-1 text-xs text-gray-400 bg-gray-750 border-b border-gray-600'>
                      {filteredGames.length} hasil{' '}
                      {filteredGames.length >= 30 ? '(maksimal 30 ditampilkan)' : ''}
                    </div>
                  )}
                  {filteredGames.map(game => {
                    const isSelected = selectedGames?.includes(game.value)
                    return (
                      <label
                        key={game.value}
                        className='flex items-center space-x-3 py-2 px-3 hover:bg-gray-700 cursor-pointer transition-colors'
                      >
                        <input
                          type='checkbox'
                          checked={isSelected}
                          onChange={() => handleGameToggle(game.value)}
                          className='rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500 focus:ring-2'
                        />
                        <span className='text-gray-300 text-sm flex-1 flex items-center'>
                          {game.label}
                        </span>
                        {isSelected && (
                          <Icon icon='mdi:check' className='text-purple-500 text-lg' />
                        )}
                      </label>
                    )
                  })}
                </>
              ) : (
                <div className='py-4 px-3 text-center text-gray-400 text-sm'>
                  {searchTerm ? 'Game tidak ditemukan' : 'Tidak ada game tersedia'}
                </div>
              )}
            </div>

            {/* Clear All / Select All */}
            {filteredGames.length > 0 && (
              <div className='border-t border-gray-600 p-2 flex justify-between'>
                <button
                  type='button'
                  onClick={() => onGameChange([])}
                  className='text-red-400 hover:text-red-300 text-xs font-medium'
                >
                  Hapus Semua
                </button>
                <button
                  type='button'
                  onClick={() => onGameChange(filteredGames.map(g => g.value))}
                  className='text-purple-400 hover:text-purple-300 text-xs font-medium'
                >
                  Pilih Semua
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Games Count */}
      {selectedGameLabels.length > 0 && (
        <div className='text-xs text-gray-400'>{selectedGameLabels.length} game dipilih</div>
      )}
    </div>
  )
}

export default SearchableGameDropdown
