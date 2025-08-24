import { Icon } from '@iconify/react'
import { useEffect, useMemo, useState } from 'react'
import SearchableGameDropdown from './SearchableGameDropdown'

// Game lists for fallback
const gamesList = [
  { value: '730', label: 'Counter-Strike 2' },
  { value: '570', label: 'Dota 2' },
  { value: '252490', label: 'Rust' },
  { value: '4000', label: "Garry's Mod" },
  { value: '440', label: 'Team Fortress 2' },
  { value: '578080', label: 'PUBG' },
  { value: '271590', label: 'Grand Theft Auto V' },
  { value: '892970', label: 'Valheim' },
  { value: '1172470', label: 'Apex Legends' },
  { value: '105600', label: 'Terraria' }
]

// Inventory games
const inventoryGames = [
  { value: '730', label: 'CS2 Skins' },
  { value: '570', label: 'Dota 2 Items' },
  { value: '440', label: 'TF2 Items' },
  { value: '252490', label: 'Rust Items' }
]

// Quick game filters for UI
const quickGameFilters = [
  { value: '730', label: 'Counter-Strike 2' },
  { value: '570', label: 'Dota 2' },
  { value: '252490', label: 'Rust' },
  { value: '4000', label: "Garry's Mod" },
  { value: '440', label: 'Team Fortress 2' },
  { value: '578080', label: 'PUBG' }
]

// Warranty options
const warrantyOptions = [
  { value: 'yes', label: 'With warranty' },
  { value: 'no', label: 'Without warranty' }
]

// Countries list
const countries = [
  { value: 'US', label: 'United States' },
  { value: 'RU', label: 'Russia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'BR', label: 'Brazil' },
  { value: 'CN', label: 'China' },
  { value: 'JP', label: 'Japan' },
  { value: 'KR', label: 'South Korea' },
  { value: 'IN', label: 'India' },
  { value: 'IT', label: 'Italy' },
  { value: 'ES', label: 'Spain' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'SE', label: 'Sweden' },
  { value: 'NO', label: 'Norway' },
  { value: 'PL', label: 'Poland' },
  { value: 'TR', label: 'Turkey' },
  { value: 'UA', label: 'Ukraine' }
]

// Registration periods
const registrationPeriods = [
  { value: '1week', label: 'Last week' },
  { value: '1month', label: 'Last month' },
  { value: '3months', label: 'Last 3 months' },
  { value: '6months', label: 'Last 6 months' },
  { value: '1year', label: 'Last year' },
  { value: '2years', label: 'Last 2 years' },
  { value: '5years', label: 'Last 5 years' }
]

const SteamFilters = ({ onFilterChange, loading }) => {
  const [filters, setFilters] = useState({
    // Pagination
    page: 1,

    // Price filters
    pmin: '',
    pmax: '',

    // General filters
    title: '',
    order_by: 'pdate_to_up_upload',

    // Games selection
    game: [],

    // Warranty
    eg: '',

    // Financial filters
    purchase_min: '',
    purchase_max: '',
    games_purchase_min: '',
    games_purchase_max: '',
    ingame_purchase_min: '',
    ingame_purchase_max: '',

    // Transaction filters
    trans: false,
    no_trans: false,

    // Location
    country: [],
    not_country: [],

    // Account stats
    daybreak: '',
    mafile: '',
    limit: '',
    trade_limit: '',

    // Inventory
    inv_game: '',
    inv_min: '',
    inv_max: '',
    inv_value_min: '',
    inv_value_max: '',

    // Registration age
    reg: '',
    reg_period: '',
    period: '',

    // Account details
    account_years_min: '',
    account_years_max: '',
    inventory_min: '',
    inventory_max: '',
    wallet_min: '',
    wallet_max: '',
    account_level_min: '',
    account_level_max: '',

    // Steam stats
    balance_min: '',
    balance_max: '',
    lmin: '',
    lmax: '',
    points_min: '',
    points_max: '',
    no_vac: false,
    vac: '',
    email_type: [],

    // CS2 specific
    win_count_min: '',
    win_count_max: '',
    medalsmin: '',
    medalsmax: '',
    medal_id: [],
    rmin: '',
    rmax: '',
    elo_min: '',
    elo_max: '',
    has_faceit: '',
    faceit_lvl_min: '',
    faceit_lvl_max: '',

    // Dota 2 specific
    solommr_min: '',
    solommr_max: '',
    d2_game_count_min: '',
    d2_game_count_max: '',
    d2_win_count_min: '',
    d2_win_count_max: '',

    // Rust specific
    rust_deaths_min: '',
    rust_deaths_max: '',
    rust_kills_min: '',
    rust_kills_max: ''
  })

  const [expandedSections, setExpandedSections] = useState({
    cs2: false,
    dota2: false,
    rust: false
  })

  // State for API games
  const [apiGames, setApiGames] = useState([])
  const [gamesLoading, setGamesLoading] = useState(false)
  const [gamesError, setGamesError] = useState(null)

  // Fetch games from server API on component mount
  useEffect(() => {
    const fetchGames = async () => {
      setGamesLoading(true)
      setGamesError(null)

      try {
        // Fetch directly from our server endpoint via Vite proxy
        const response = await fetch('/api/lzt/steam/games')

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const gamesData = await response.json()

        // Convert object to array format that the component expects
        const gamesArray = Object.entries(gamesData)
          .filter(([id, game]) => game && typeof game === 'object') // Filter out null/undefined games
          .map(([id, game]) => ({
            id: parseInt(id),
            name: game.name || game.title || `Game ${id}`
          }))

        if (gamesArray && Array.isArray(gamesArray) && gamesArray.length > 0) {
          setApiGames(gamesArray)
        }
      } catch (error) {
        console.error('Error fetching games:', error)
        setGamesError('Failed to load games from API')
      } finally {
        setGamesLoading(false)
      }
    }

    fetchGames()
  }, [])

  // Memoized combined games list with proper fallback
  const combinedGames = useMemo(() => {
    const combinedGames = new Map()

    // Helper function to safely add games with validation
    const addGameSafely = game => {
      if (game && game.value && game.label) {
        const safeGame = {
          value: game.value.toString(),
          label: game.label.toString(),
          isPopular: game.isPopular || false // Preserve the popularity flag
        }
        combinedGames.set(safeGame.value, safeGame)
      }
    }

    // Priority 1: Use API games if available (already sorted by popularity)
    if (apiGames.length > 0) {
      apiGames.forEach(addGameSafely)

      // Convert Map back to array and preserve the original API order (which has popular games first)
      return Array.from(combinedGames.values())
    } else {
      // Priority 2: Fallback to hardcoded games

      // Add from gamesList
      gamesList.forEach(addGameSafely)

      // Add from inventoryGames
      inventoryGames.forEach(addGameSafely)

      // Convert Map back to array and sort alphabetically for fallback games
      return Array.from(combinedGames.values()).sort((a, b) => {
        const labelA = (a.label || '').toString().toLowerCase()
        const labelB = (b.label || '').toString().toLowerCase()
        return labelA.localeCompare(labelB)
      })
    }
  }, [apiGames])

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value }
    setFilters(newFilters)
  }

  const handleApplyFilters = () => {
    // Map the filter parameters to the proper Steam API parameter names
    const apiParams = {
      // Basic parameters - only include if they have actual values
      ...(filters.pmin && { pmin: filters.pmin }),
      ...(filters.pmax && { pmax: filters.pmax }),
      ...(filters.title && { title: filters.title }),

      // Steam-specific parameters (these need to match the actual API parameter names)
      // Convert game array to indexed format for API
      ...(filters.game && filters.game.length > 0 && { game: filters.game }),
      ...(filters.country && filters.country.length > 0 && { country: filters.country }),
      ...(filters.not_country &&
        filters.not_country.length > 0 && { not_country: filters.not_country }),

      // Other Steam filters - only include if they have actual values
      ...(filters.eg && { eg: filters.eg }),
      ...(filters.daybreak && { daybreak: filters.daybreak }),
      ...(filters.mafile && { mafile: filters.mafile }),
      ...(filters.limit && { limit: filters.limit }),
      ...(filters.sb !== undefined && { sb: filters.sb }),
      ...(filters.nsb !== undefined && { nsb: filters.nsb }),

      // Order
      ...(filters.order_by && { order_by: filters.order_by }),

      // Page
      page: filters.page || 1
    }

    onFilterChange(apiParams)
  }

  const toggleSection = section => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleSortChange = sortValue => {
    handleFilterChange('order_by', sortValue)
    const sortInput = document.getElementById('sortInput')
    if (sortInput) {
      sortInput.value = sortValue
    }

    // Update active sort button
    document.querySelectorAll('.button-sort').forEach(btn => btn.classList.remove('selected'))
    const selectedButton = document.querySelector(`[data-value="${sortValue}"]`)
    if (selectedButton) {
      selectedButton.classList.add('selected')
    }
  }

  const handleQuickGameFilter = (gameId, gameName) => {
    // Toggle the game filter - if already selected, remove it; if not, add it
    const currentGames = filters.game || []
    const newGames = currentGames.includes(gameId)
      ? currentGames.filter(g => g !== gameId) // Remove if already selected
      : [...currentGames, gameId] // Add if not selected

    // Set the game filter
    handleFilterChange('game', newGames)

    // Auto-apply the filter
    setTimeout(() => handleApplyFilters(), 100)
  }

  const clearAllFilters = () => {
    setFilters({
      page: 1,
      pmin: '',
      pmax: '',
      title: '',
      order_by: 'pdate_to_up_upload',
      game: [],
      eg: '',
      purchase_min: '',
      purchase_max: '',
      games_purchase_min: '',
      games_purchase_max: '',
      ingame_purchase_min: '',
      ingame_purchase_max: '',
      trans: false,
      no_trans: false,
      country: [],
      not_country: [],
      daybreak: '',
      mafile: '',
      limit: '',
      sb: undefined,
      nsb: undefined,
      rust: false
    })

    // Auto-apply to show all accounts
    setTimeout(() => handleApplyFilters(), 100)
  }

  return (
    <div className='bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6'>
      {/* Quick Game Filters */}
      <div className='mb-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-green-400'>🎮 Quick Game Filters</h3>
          <button
            onClick={clearAllFilters}
            className='bg-red-700 hover:bg-red-600 text-red-100 hover:text-white px-3 py-1 rounded-lg text-sm transition-colors border border-red-600 hover:border-red-500'
          >
            Clear All Filters
          </button>
        </div>
        <div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2'>
          {quickGameFilters.map(game => (
            <button
              key={game.value}
              onClick={() => handleQuickGameFilter(game.value, game.label)}
              className={`flex items-center justify-center space-x-2 p-3 rounded-lg text-sm transition-all duration-200 border ${
                filters.game && filters.game.includes(game.value)
                  ? 'bg-green-600 hover:bg-green-500 text-white border-green-500'
                  : 'bg-gray-800 hover:bg-green-600 text-gray-300 hover:text-white border-gray-600 hover:border-green-500'
              }`}
              title={`Filter accounts with ${game.label}`}
            >
              <img
                src={`https://nztcdn.com/steam/icon/${game.value}.webp`}
                alt={game.label}
                className='w-5 h-5 rounded flex-shrink-0'
                onError={e => {
                  e.target.src =
                    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzZCNzI4MCIvPgo8cGF0aCBkPSJNMTIgN0M5Ljc5IDcgOCA4Ljc5IDggMTFTOS43OSAxNSAxMiAxNSAxNiAxMy4yMSAxNiAxMSAxNC4yMSA3IDEyIDdaTTEyIDEzQzEwLjkgMTMgMTAgMTIuMSAxMCAxMUMxMCAxMC45IDEwIDEwIDEwIDEwSDE0QzE0IDEwIDEzIDEwIDEzIDEwQzEzIDEyLjEgMTIuMSAxMyAxMiAxM1oiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K'
                }}
              />
              <span className='font-medium text-xs'>{game.label}</span>
            </button>
          ))}
        </div>
        {filters.game && filters.game.length > 0 && (
          <div className='mt-3 p-3 bg-green-900 border border-green-600 rounded-lg'>
            <p className='text-green-200 text-sm'>
              <Icon icon='material-symbols:filter-alt' className='inline w-4 h-4 mr-1' />
              Filtering accounts with:{' '}
              <strong>
                {quickGameFilters.find(g => g.value === filters.game[0])?.label || 'Selected Game'}
              </strong>
            </p>
          </div>
        )}
      </div>

      {/* Search Form */}
      <form className='searchBarContainer'>
        <div className='filterContainer'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* First Column */}
            <div className='filterColumn space-y-4'>
              {/* Games Selection - Dynamic API-powered Searchable Dropdown */}
              <div className='space-y-2'>
                <label className='text-gray-300 text-sm font-medium flex items-center space-x-2'>
                  <span>Pilih Game yang ada di Dalam Akun</span>
                  {gamesLoading && (
                    <Icon
                      icon='eos-icons:loading'
                      className='text-purple-500 text-lg animate-spin'
                    />
                  )}
                  {gamesError && (
                    <Icon
                      icon='mdi:alert-circle'
                      className='text-red-500 text-lg'
                      title={`Error: ${gamesError}`}
                    />
                  )}
                </label>

                <SearchableGameDropdown
                  selectedGames={filters.game}
                  onGameChange={newGames => handleFilterChange('game', newGames)}
                  gamesList={combinedGames}
                  placeholder={gamesLoading ? 'Loading games...' : 'Cari dan pilih games...'}
                  label=''
                  disabled={gamesLoading}
                  enableServerSearch={true}
                  searchEndpoint='/api/lzt/steam/games'
                />

                {gamesError && (
                  <div className='text-xs text-red-400 mt-1'>
                    Failed to load games from API. Using fallback list.
                  </div>
                )}
              </div>

              {/* Warranty Duration */}
              <div className='space-y-2'>
                <label className='text-gray-300 text-sm font-medium'>Durasi Garansi</label>
                <select
                  className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  value={filters.eg}
                  onChange={e => handleFilterChange('eg', e.target.value)}
                >
                  <option value=''>Pilih garansi</option>
                  {warrantyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Financial Filters */}
              <div className='space-y-3'>
                <div className='splitFilter'>
                  <label className='text-gray-300 text-sm font-medium'>
                    Total Yang di Belanjakan di dalam Akun
                  </label>
                  <div className='grid grid-cols-2 gap-2'>
                    <input
                      type='number'
                      min='1'
                      placeholder='Dari'
                      className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                      value={filters.purchase_min}
                      onChange={e => handleFilterChange('purchase_min', e.target.value)}
                    />
                    <input
                      type='number'
                      min='1'
                      placeholder='sampai'
                      className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                      value={filters.purchase_max}
                      onChange={e => handleFilterChange('purchase_max', e.target.value)}
                    />
                  </div>
                </div>

                <div className='splitFilter'>
                  <label className='text-gray-300 text-sm font-medium'>
                    Total $ yang dibelanjakan untuk games
                  </label>
                  <div className='grid grid-cols-2 gap-2'>
                    <input
                      type='number'
                      min='1'
                      placeholder='Dari'
                      className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                      value={filters.games_purchase_min}
                      onChange={e => handleFilterChange('games_purchase_min', e.target.value)}
                    />
                    <input
                      type='number'
                      min='1'
                      placeholder='sampai'
                      className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                      value={filters.games_purchase_max}
                      onChange={e => handleFilterChange('games_purchase_max', e.target.value)}
                    />
                  </div>
                </div>

                <div className='splitFilter'>
                  <label className='text-gray-300 text-sm font-medium'>
                    Total $ pembelian dalam game
                  </label>
                  <div className='grid grid-cols-2 gap-2'>
                    <input
                      type='number'
                      min='1'
                      placeholder='Dari'
                      className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                      value={filters.ingame_purchase_min}
                      onChange={e => handleFilterChange('ingame_purchase_min', e.target.value)}
                    />
                    <input
                      type='number'
                      min='1'
                      placeholder='sampai'
                      className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                      value={filters.ingame_purchase_max}
                      onChange={e => handleFilterChange('ingame_purchase_max', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Transaction Checkboxes */}
              <div className='space-y-2'>
                <label className='flex items-center space-x-2 text-gray-300'>
                  <input
                    type='checkbox'
                    className='rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500'
                    checked={filters.trans}
                    onChange={e => handleFilterChange('trans', e.target.checked)}
                  />
                  <span>Dengan Transaksi</span>
                </label>
                <label className='flex items-center space-x-2 text-gray-300'>
                  <input
                    type='checkbox'
                    className='rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500'
                    checked={filters.no_trans}
                    onChange={e => handleFilterChange('no_trans', e.target.checked)}
                  />
                  <span>Tanpa Transaksi</span>
                </label>
              </div>

              {/* DLC Guide Tooltip */}
              <div className='relative group'>
                <button
                  type='button'
                  className='w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors cursor-help'
                >
                  Bagaimana cara mencari DLC ?
                </button>
                <div className='absolute bottom-full left-0 right-0 mb-2 bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity z-10 invisible group-hover:visible'>
                  <p className='font-medium mb-2'>Tips mencari akun dengan DLC:</p>
                  <ul className='list-disc list-inside space-y-1 text-xs'>
                    <li>Gunakan filter "Game" untuk memilih game yang memiliki DLC</li>
                    <li>Periksa deskripsi akun untuk melihat DLC yang dimiliki</li>
                    <li>
                      Gunakan filter "Total $ yang dibelanjakan untuk games" untuk akun dengan
                      pembelian tinggi
                    </li>
                    <li>Akun dengan level tinggi biasanya memiliki lebih banyak DLC</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Second Column */}
            <div className='filterColumn space-y-4'>
              {/* Country Selection */}
              <div className='space-y-2'>
                <label className='text-gray-300 text-sm font-medium'>Negara</label>
                <select
                  className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  value={filters.country[0] || ''}
                  onChange={e =>
                    handleFilterChange('country', e.target.value ? [e.target.value] : [])
                  }
                >
                  <option value=''>Pilih Negara</option>
                  {countries.map(country => (
                    <option key={country.value} value={country.value} className='py-1'>
                      {country.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Days Inactive */}
              <div className='space-y-2'>
                <label className='text-gray-300 text-sm font-medium'>Days Inactive</label>
                <input
                  type='number'
                  placeholder='Days Inactive'
                  className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  value={filters.daybreak}
                  onChange={e => handleFilterChange('daybreak', e.target.value)}
                />
              </div>

              {/* SDA (.maFile) */}
              <div className='space-y-2'>
                <label className='text-gray-300 text-sm font-medium'>SDA (.maFile)</label>
                <div className='grid grid-cols-3 gap-1'>
                  <label className='flex items-center space-x-1'>
                    <input
                      type='radio'
                      name='mafile'
                      value=''
                      className='text-purple-600 focus:ring-purple-500'
                      checked={filters.mafile === ''}
                      onChange={e => handleFilterChange('mafile', e.target.value)}
                    />
                    <span className='text-xs text-gray-300'>Any</span>
                  </label>
                  <label className='flex items-center space-x-1'>
                    <input
                      type='radio'
                      name='mafile'
                      value='yes'
                      className='text-purple-600 focus:ring-purple-500'
                      checked={filters.mafile === 'yes'}
                      onChange={e => handleFilterChange('mafile', e.target.value)}
                    />
                    <span className='text-xs text-gray-300'>Yes</span>
                  </label>
                  <label className='flex items-center space-x-1'>
                    <input
                      type='radio'
                      name='mafile'
                      value='no'
                      className='text-purple-600 focus:ring-purple-500'
                      checked={filters.mafile === 'no'}
                      onChange={e => handleFilterChange('mafile', e.target.value)}
                    />
                    <span className='text-xs text-gray-300'>No</span>
                  </label>
                </div>
              </div>

              {/* Steam $5 Limit */}
              <div className='space-y-2'>
                <label className='text-gray-300 text-sm font-medium'>Steam $5 Limit</label>
                <div className='grid grid-cols-3 gap-1'>
                  <label className='flex items-center space-x-1'>
                    <input
                      type='radio'
                      name='limit'
                      value=''
                      className='text-purple-600 focus:ring-purple-500'
                      checked={filters.limit === ''}
                      onChange={e => handleFilterChange('limit', e.target.value)}
                    />
                    <span className='text-xs text-gray-300'>Any</span>
                  </label>
                  <label className='flex items-center space-x-1'>
                    <input
                      type='radio'
                      name='limit'
                      value='yes'
                      className='text-purple-600 focus:ring-purple-500'
                      checked={filters.limit === 'yes'}
                      onChange={e => handleFilterChange('limit', e.target.value)}
                    />
                    <span className='text-xs text-gray-300'>Yes</span>
                  </label>
                  <label className='flex items-center space-x-1'>
                    <input
                      type='radio'
                      name='limit'
                      value='no'
                      className='text-purple-600 focus:ring-purple-500'
                      checked={filters.limit === 'no'}
                      onChange={e => handleFilterChange('limit', e.target.value)}
                    />
                    <span className='text-xs text-gray-300'>No</span>
                  </label>
                </div>
              </div>

              {/* Trade Limit (Temporary) */}
              <div className='space-y-2'>
                <label className='text-gray-300 text-sm font-medium'>Trade Limit (Temporary)</label>
                <div className='grid grid-cols-3 gap-1'>
                  <label className='flex items-center space-x-1'>
                    <input
                      type='radio'
                      name='trade_limit'
                      value=''
                      className='text-purple-600 focus:ring-purple-500'
                      checked={filters.trade_limit === ''}
                      onChange={e => handleFilterChange('trade_limit', e.target.value)}
                    />
                    <span className='text-xs text-gray-300'>Any</span>
                  </label>
                  <label className='flex items-center space-x-1'>
                    <input
                      type='radio'
                      name='trade_limit'
                      value='yes'
                      className='text-purple-600 focus:ring-purple-500'
                      checked={filters.trade_limit === 'yes'}
                      onChange={e => handleFilterChange('trade_limit', e.target.value)}
                    />
                    <span className='text-xs text-gray-300'>Yes</span>
                  </label>
                  <label className='flex items-center space-x-1'>
                    <input
                      type='radio'
                      name='trade_limit'
                      value='no'
                      className='text-purple-600 focus:ring-purple-500'
                      checked={filters.trade_limit === 'no'}
                      onChange={e => handleFilterChange('trade_limit', e.target.value)}
                    />
                    <span className='text-xs text-gray-300'>No</span>
                  </label>
                </div>
              </div>

              {/* Inventory Section */}
              <div className='space-y-3'>
                <div className='space-y-2'>
                  <label className='text-gray-300 text-sm font-medium'>Inventory</label>
                  <select
                    className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={filters.inv_game}
                    onChange={e => handleFilterChange('inv_game', e.target.value)}
                  >
                    <option value=''>Select a game</option>
                    {inventoryGames.map(game => (
                      <option key={game.value} value={game.value}>
                        {game.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='grid grid-cols-2 gap-2'>
                  <input
                    type='number'
                    min='1'
                    placeholder='From $'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={filters.inv_min}
                    onChange={e => handleFilterChange('inv_min', e.target.value)}
                  />
                  <input
                    type='number'
                    min='1'
                    placeholder='up to'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={filters.inv_max}
                    onChange={e => handleFilterChange('inv_max', e.target.value)}
                  />
                </div>
              </div>

              {/* Registered ago */}
              <div className='space-y-3'>
                <label className='text-gray-300 text-sm font-medium'>Registered ago</label>
                <div className='grid grid-cols-2 gap-2'>
                  <input
                    type='number'
                    min='1'
                    placeholder='X...'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={filters.reg}
                    onChange={e => handleFilterChange('reg', e.target.value)}
                  />
                  <select
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={filters.reg_period}
                    onChange={e => handleFilterChange('reg_period', e.target.value)}
                  >
                    <option value=''>Select period</option>
                    {registrationPeriods.map(period => (
                      <option key={period.value} value={period.value}>
                        {period.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Third Column */}
            <div className='filterColumn space-y-4'>
              {/* Balance */}
              <div className='space-y-2'>
                <label className='text-gray-300 text-sm font-medium'>Balance</label>
                <div className='grid grid-cols-2 gap-2'>
                  <input
                    type='number'
                    min='1'
                    placeholder='Balance from $'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={filters.balance_min}
                    onChange={e => handleFilterChange('balance_min', e.target.value)}
                  />
                  <input
                    type='number'
                    min='1'
                    placeholder='up to'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={filters.balance_max}
                    onChange={e => handleFilterChange('balance_max', e.target.value)}
                  />
                </div>
              </div>

              {/* Level */}
              <div className='space-y-2'>
                <label className='text-gray-300 text-sm font-medium'>Level</label>
                <div className='grid grid-cols-2 gap-2'>
                  <input
                    type='number'
                    min='1'
                    placeholder='Level from'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={filters.lmin}
                    onChange={e => handleFilterChange('lmin', e.target.value)}
                  />
                  <input
                    type='number'
                    min='1'
                    placeholder='up to'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={filters.lmax}
                    onChange={e => handleFilterChange('lmax', e.target.value)}
                  />
                </div>
              </div>

              {/* Points */}
              <div className='space-y-2'>
                <label className='text-gray-300 text-sm font-medium'>Poin</label>
                <div className='grid grid-cols-2 gap-2'>
                  <input
                    type='number'
                    min='1'
                    placeholder='Dari'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={filters.points_min}
                    onChange={e => handleFilterChange('points_min', e.target.value)}
                  />
                  <input
                    type='number'
                    min='1'
                    placeholder='sampai'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={filters.points_max}
                    onChange={e => handleFilterChange('points_max', e.target.value)}
                  />
                </div>
              </div>

              {/* CS2 Section */}
              <div className='border border-gray-600 rounded-lg'>
                <button
                  type='button'
                  onClick={() => toggleSection('cs2')}
                  className='w-full flex items-center justify-between p-3 text-gray-300 hover:bg-gray-800'
                >
                  <span className='font-medium'>CS2</span>
                  <Icon
                    icon='mdi:chevron-down'
                    className={`transition-transform ${expandedSections.cs2 ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedSections.cs2 && (
                  <div className='p-3 space-y-3 border-t border-gray-600'>
                    {/* CS2 Wins */}
                    <div className='space-y-2'>
                      <label className='text-gray-300 text-sm'>Wins</label>
                      <div className='grid grid-cols-2 gap-2'>
                        <input
                          type='number'
                          min='1'
                          placeholder='Wins from'
                          className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                          value={filters.win_count_min}
                          onChange={e => handleFilterChange('win_count_min', e.target.value)}
                        />
                        <input
                          type='number'
                          min='1'
                          placeholder='up to'
                          className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                          value={filters.win_count_max}
                          onChange={e => handleFilterChange('win_count_max', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* CS2 Medals */}
                    <div className='space-y-2'>
                      <label className='text-gray-300 text-sm'>Medals</label>
                      <div className='grid grid-cols-2 gap-2'>
                        <input
                          type='number'
                          min='1'
                          placeholder='Medals from'
                          className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                          value={filters.medalsmin}
                          onChange={e => handleFilterChange('medalsmin', e.target.value)}
                        />
                        <input
                          type='number'
                          min='1'
                          placeholder='up to'
                          className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                          value={filters.medalsmax}
                          onChange={e => handleFilterChange('medalsmax', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* CS2 Rank */}
                    <div className='space-y-2'>
                      <label className='text-gray-300 text-sm'>Rank</label>
                      <div className='grid grid-cols-2 gap-2'>
                        <input
                          type='number'
                          min='1'
                          placeholder='Rank from 1'
                          className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                          value={filters.rmin}
                          onChange={e => handleFilterChange('rmin', e.target.value)}
                        />
                        <input
                          type='number'
                          min='1'
                          placeholder='up to 40'
                          className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                          value={filters.rmax}
                          onChange={e => handleFilterChange('rmax', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Premier ELO */}
                    <div className='space-y-2'>
                      <label className='text-gray-300 text-sm'>Premier ELO</label>
                      <div className='grid grid-cols-2 gap-2'>
                        <input
                          type='number'
                          min='1'
                          placeholder='From'
                          className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                          value={filters.elo_min}
                          onChange={e => handleFilterChange('elo_min', e.target.value)}
                        />
                        <input
                          type='number'
                          min='1'
                          placeholder='up to 50000'
                          className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                          value={filters.elo_max}
                          onChange={e => handleFilterChange('elo_max', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* FACEIT linked */}
                    <div className='space-y-2'>
                      <label className='text-gray-300 text-sm'>FACEIT linked</label>
                      <div className='grid grid-cols-3 gap-1'>
                        <label className='flex items-center space-x-1'>
                          <input
                            type='radio'
                            name='has_faceit'
                            value=''
                            className='text-purple-600 focus:ring-purple-500'
                            checked={filters.has_faceit === ''}
                            onChange={e => handleFilterChange('has_faceit', e.target.value)}
                          />
                          <span className='text-xs text-gray-300'>Any</span>
                        </label>
                        <label className='flex items-center space-x-1'>
                          <input
                            type='radio'
                            name='has_faceit'
                            value='yes'
                            className='text-purple-600 focus:ring-purple-500'
                            checked={filters.has_faceit === 'yes'}
                            onChange={e => handleFilterChange('has_faceit', e.target.value)}
                          />
                          <span className='text-xs text-gray-300'>Yes</span>
                        </label>
                        <label className='flex items-center space-x-1'>
                          <input
                            type='radio'
                            name='has_faceit'
                            value='no'
                            className='text-purple-600 focus:ring-purple-500'
                            checked={filters.has_faceit === 'no'}
                            onChange={e => handleFilterChange('has_faceit', e.target.value)}
                          />
                          <span className='text-xs text-gray-300'>No</span>
                        </label>
                      </div>
                    </div>

                    {/* FACEIT Level */}
                    <div className='space-y-2'>
                      <label className='text-gray-300 text-sm'>FACEIT Level</label>
                      <div className='grid grid-cols-2 gap-2'>
                        <input
                          type='number'
                          min='1'
                          placeholder='From'
                          className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                          value={filters.faceit_lvl_min}
                          onChange={e => handleFilterChange('faceit_lvl_min', e.target.value)}
                        />
                        <input
                          type='number'
                          min='1'
                          placeholder='up to 10'
                          className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                          value={filters.faceit_lvl_max}
                          onChange={e => handleFilterChange('faceit_lvl_max', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dota 2 Section */}
              <div className='border border-gray-600 rounded-lg'>
                <button
                  type='button'
                  onClick={() => toggleSection('dota2')}
                  className='w-full flex items-center justify-between p-3 text-gray-300 hover:bg-gray-800'
                >
                  <span className='font-medium'>Dota 2</span>
                  <Icon
                    icon='mdi:chevron-down'
                    className={`transition-transform ${expandedSections.dota2 ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedSections.dota2 && (
                  <div className='p-3 space-y-3 border-t border-gray-600'>
                    {/* Solo MMR */}
                    <div className='space-y-2'>
                      <label className='text-gray-300 text-sm'>MMR</label>
                      <div className='grid grid-cols-2 gap-2'>
                        <input
                          type='number'
                          min='1'
                          placeholder='MMR from'
                          className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                          value={filters.solommr_min}
                          onChange={e => handleFilterChange('solommr_min', e.target.value)}
                        />
                        <input
                          type='number'
                          min='1'
                          placeholder='up to'
                          className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                          value={filters.solommr_max}
                          onChange={e => handleFilterChange('solommr_max', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Matches */}
                    <div className='space-y-2'>
                      <label className='text-gray-300 text-sm'>Matches</label>
                      <div className='grid grid-cols-2 gap-2'>
                        <input
                          type='number'
                          min='1'
                          placeholder='Matches from'
                          className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                          value={filters.d2_game_count_min}
                          onChange={e => handleFilterChange('d2_game_count_min', e.target.value)}
                        />
                        <input
                          type='number'
                          min='1'
                          placeholder='up to'
                          className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                          value={filters.d2_game_count_max}
                          onChange={e => handleFilterChange('d2_game_count_max', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Wins */}
                    <div className='space-y-2'>
                      <label className='text-gray-300 text-sm'>Wins</label>
                      <div className='grid grid-cols-2 gap-2'>
                        <input
                          type='number'
                          min='1'
                          placeholder='Wins from'
                          className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                          value={filters.d2_win_count_min}
                          onChange={e => handleFilterChange('d2_win_count_min', e.target.value)}
                        />
                        <input
                          type='number'
                          min='1'
                          placeholder='up to'
                          className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                          value={filters.d2_win_count_max}
                          onChange={e => handleFilterChange('d2_win_count_max', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Rust Section */}
              <div className='border border-gray-600 rounded-lg'>
                <button
                  type='button'
                  onClick={() => toggleSection('rust')}
                  className='w-full flex items-center justify-between p-3 text-gray-300 hover:bg-gray-800'
                >
                  <span className='font-medium'>Rust</span>
                  <Icon
                    icon='mdi:chevron-down'
                    className={`transition-transform ${expandedSections.rust ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedSections.rust && (
                  <div className='p-3 space-y-3 border-t border-gray-600'>
                    {/* Deaths */}
                    <div className='space-y-2'>
                      <label className='text-gray-300 text-sm'>Deaths</label>
                      <div className='grid grid-cols-2 gap-2'>
                        <input
                          type='number'
                          min='1'
                          placeholder='Deaths from'
                          className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                          value={filters.rust_deaths_min}
                          onChange={e => handleFilterChange('rust_deaths_min', e.target.value)}
                        />
                        <input
                          type='number'
                          min='1'
                          placeholder='up to'
                          className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                          value={filters.rust_deaths_max}
                          onChange={e => handleFilterChange('rust_deaths_max', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Kills */}
                    <div className='space-y-2'>
                      <label className='text-gray-300 text-sm'>Kills</label>
                      <div className='grid grid-cols-2 gap-2'>
                        <input
                          type='number'
                          min='1'
                          placeholder='Kills from'
                          className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                          value={filters.rust_kills_min}
                          onChange={e => handleFilterChange('rust_kills_min', e.target.value)}
                        />
                        <input
                          type='number'
                          min='1'
                          placeholder='up to'
                          className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                          value={filters.rust_kills_max}
                          onChange={e => handleFilterChange('rust_kills_max', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Steam Keys & Other Button */}
              <button
                type='button'
                className='w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors'
              >
                Steam Keys & Other ➜
              </button>
            </div>
          </div>
        </div>

        {/* Sort Buttons */}
        <div className='sortButtons flex flex-wrap gap-2 mt-6'>
          <input type='hidden' id='sortInput' name='order_by' value={filters.order_by} />
          <input type='hidden' name='page' value='1' id='pageInput' />

          <button
            type='button'
            className={`px-4 py-2 rounded-lg transition-colors button-sort ${filters.order_by === 'price_to_up' ? 'bg-purple-600 text-white selected' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            data-value='price_to_up'
            onClick={() => handleSortChange('price_to_up')}
          >
            Termurah
          </button>
          <button
            type='button'
            className={`px-4 py-2 rounded-lg transition-colors button-sort ${filters.order_by === 'price_to_down' ? 'bg-purple-600 text-white selected' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            data-value='price_to_down'
            onClick={() => handleSortChange('price_to_down')}
          >
            Termahal
          </button>
          <button
            type='button'
            className={`px-4 py-2 rounded-lg transition-colors button-sort ${filters.order_by === 'pdate_to_down_upload' ? 'bg-purple-600 text-white selected' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            data-value='pdate_to_down_upload'
            onClick={() => handleSortChange('pdate_to_down_upload')}
          >
            Terbaru
          </button>
          <button
            type='button'
            className={`px-4 py-2 rounded-lg transition-colors button-sort ${filters.order_by === 'pdate_to_up_upload' ? 'bg-purple-600 text-white selected' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            data-value='pdate_to_up_upload'
            onClick={() => handleSortChange('pdate_to_up_upload')}
          >
            Paling Lama
          </button>
        </div>

        {/* Apply Filters Button */}
        <div className='mt-6'>
          <button
            type='button'
            onClick={handleApplyFilters}
            className='w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg transition-colors font-medium'
            disabled={loading}
          >
            {loading ? 'Memuat...' : 'Cari Akun'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SteamFilters
