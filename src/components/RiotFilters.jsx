import { Icon } from '@iconify/react'
import { useEffect, useMemo, useState } from 'react'
import useRiotCategoryData from '../hooks/useRiotCategoryData'
import zelenkaAPI from '../services/zelenkaAPI'
import MultiSelectDropdown from './ui/MultiSelectDropdown'

// Popular Riot game searches
const popularSearches = [
  { value: 'valorant', label: 'Valorant' },
  { value: 'lol', label: 'League of Legends' },
  { value: 'lor', label: 'Legends of Runeterra' },
  { value: 'tft', label: 'Teamfight Tactics' }
]

// Valorant ranks - matching example.html values
const valorantRanks = [
  { value: '3', label: 'Iron 1' },
  { value: '4', label: 'Iron 2' },
  { value: '5', label: 'Iron 3' },
  { value: '6', label: 'Bronze 1' },
  { value: '7', label: 'Bronze 2' },
  { value: '8', label: 'Bronze 3' },
  { value: '9', label: 'Silver 1' },
  { value: '10', label: 'Silver 2' },
  { value: '11', label: 'Silver 3' },
  { value: '12', label: 'Gold 1' },
  { value: '13', label: 'Gold 2' },
  { value: '14', label: 'Gold 3' },
  { value: '15', label: 'Platinum 1' },
  { value: '16', label: 'Platinum 2' },
  { value: '17', label: 'Platinum 3' },
  { value: '18', label: 'Diamond 1' },
  { value: '19', label: 'Diamond 2' },
  { value: '20', label: 'Diamond 3' },
  { value: '21', label: 'Ascendant 1' },
  { value: '22', label: 'Ascendant 2' },
  { value: '23', label: 'Ascendant 3' },
  { value: '24', label: 'Immortal 1' },
  { value: '25', label: 'Immortal 2' },
  { value: '26', label: 'Immortal 3' },
  { value: '27', label: 'Radiant' }
]

// Account origin options
const originOptions = [
  { value: 'brute', label: 'Brute' },
  { value: 'phishing', label: 'Phishing' },
  { value: 'stealer', label: 'Stealer' },
  { value: 'personal', label: 'Personal' },
  { value: 'resale', label: 'Resale' },
  { value: 'autoreg', label: 'Autoreg' },
  { value: 'dummy', label: 'Dummy' }
]

// Valorant regions - matching example.html
const valorantRegions = [
  { value: 'NA', label: 'North America' },
  { value: 'LA', label: 'Latin America' },
  { value: 'BR', label: 'Brazil' },
  { value: 'EU', label: 'Europe' },
  { value: 'KR', label: 'Korea' },
  { value: 'AP', label: 'Asia Pacific' }
]

// LoL regions - matching example.html
const lolRegions = [
  { value: 'la1', label: 'Latin America North' },
  { value: 'eun1', label: 'Europe Nordic & East' },
  { value: 'euw1', label: 'Europe West' },
  { value: 'tr1', label: 'Turkey' },
  { value: 'na1', label: 'North America' },
  { value: 'ru', label: 'Russia' },
  { value: 'vn2', label: 'Vietnam' },
  { value: 'jp1', label: 'Japan' },
  { value: 'br1', label: 'Brazil' },
  { value: 'la2', label: 'Latin America South' },
  { value: 'sg2', label: 'Singapore, Malaysia & Indonesia' },
  { value: 'th2', label: 'Thailand' },
  { value: 'oc1', label: 'Oceania' },
  { value: 'ph2', label: 'Philippines' }
]

// LoL ranks - matching example.html values
const lolRanks = [
  { value: 'IRON', label: 'Iron' },
  { value: 'BRONZE', label: 'Bronze' },
  { value: 'SILVER', label: 'Silver' },
  { value: 'GOLD', label: 'Gold' },
  { value: 'PLATINUM', label: 'Platinum' },
  { value: 'EMERALD', label: 'Emerald' },
  { value: 'DIAMOND', label: 'Diamond' },
  { value: 'MASTER', label: 'Master' },
  { value: 'GRANDMASTER', label: 'Grandmaster' },
  { value: 'CHALLENGER', label: 'Challenger' }
]

// Country list with proper ISO codes
const countries = [
  { value: 'USA', label: 'United States' },
  { value: 'CAN', label: 'Canada' },
  { value: 'GBR', label: 'United Kingdom' },
  { value: 'DEU', label: 'Germany' },
  { value: 'FRA', label: 'France' },
  { value: 'JPN', label: 'Japan' },
  { value: 'KOR', label: 'Korea, South' },
  { value: 'CHN', label: 'China' },
  { value: 'IDN', label: 'Indonesia' },
  { value: 'THA', label: 'Thailand' },
  { value: 'VNM', label: 'Vietnam' },
  { value: 'PHL', label: 'Philippines' },
  { value: 'SGP', label: 'Singapore' },
  { value: 'MYS', label: 'Malaysia' },
  { value: 'BRA', label: 'Brazil' },
  { value: 'MEX', label: 'Mexico' },
  { value: 'ARG', label: 'Argentina' },
  { value: 'CHL', label: 'Chile' },
  { value: 'AUS', label: 'Australia' },
  { value: 'NZL', label: 'New Zealand' },
  { value: 'RUS', label: 'Russia' },
  { value: 'TUR', label: 'Turkey' },
  { value: 'IND', label: 'India' }
]

function RiotFilters({ filters = {}, setFilters = () => {}, onApplyFilters }) {
  const [apiGames, setApiGames] = useState([])
  const [expandedSections, setExpandedSections] = useState({
    valorant: true,
    lol: true
  })

  // Fetch Riot category data from LZT API
  const {
    weaponSkins,
    agents,
    buddies,
    loading: categoryLoading,
    error: categoryError
  } = useRiotCategoryData()

  // Provide safe defaults for filters
  const safeFilters = {
    email: '',
    tel: '',
    daybreak: '',
    country: [],
    origin: [],
    not_origin: [],
    game: [],
    weaponSkin: [],
    buddy: [],
    agent: [],
    valorant_smin: '',
    valorant_smax: '',
    vp_min: '',
    vp_max: '',
    inv_min: '',
    inv_max: '',
    knife: '',
    valorant_region: [],
    valorant_not_region: [],
    valorant_level_min: '',
    valorant_level_max: '',
    amin: '',
    amax: '',
    rmin: '',
    rmax: '',
    last_rmin: '',
    last_rmax: '',
    previous_rmin: '',
    previous_rmax: '',
    lol_level_min: '',
    lol_level_max: '',
    win_rate_min: '',
    win_rate_max: '',
    lol_smin: '',
    lol_smax: '',
    champion_min: '',
    champion_max: '',
    lol_region: [],
    lol_not_region: [],
    pmin: '',
    pmax: '',
    order_by: 'bump',
    ...filters
  }

  // Initialize filters with exact field names from example.html
  useEffect(() => {
    if (!safeFilters.email && typeof setFilters === 'function') {
      setFilters(prev => ({
        ...prev,
        // General filters
        email: '',
        tel: '',
        daybreak: '',
        country: [],
        origin: [],
        not_origin: [],
        game: [], // Add game filter

        // Valorant filters
        weaponSkin: [],
        buddy: [],
        agent: [],
        valorant_smin: '',
        valorant_smax: '',
        vp_min: '',
        vp_max: '',
        inv_min: '',
        inv_max: '',
        knife: '',
        valorant_region: [],
        valorant_not_region: [],
        valorant_level_min: '',
        valorant_level_max: '',
        amin: '',
        amax: '',
        rmin: '',
        rmax: '',
        last_rmin: '',
        last_rmax: '',
        previous_rmin: '',
        previous_rmax: '',

        // LoL filters
        lol_level_min: '',
        lol_level_max: '',
        win_rate_min: '',
        win_rate_max: '',
        lol_smin: '',
        lol_smax: '',
        champion_min: '',
        champion_max: '',
        lol_region: [],
        lol_not_region: [],

        // Price
        pmin: '',
        pmax: '',

        // Sorting
        order_by: 'bump'
      }))
    }
  }, [safeFilters.email, setFilters])

  // Fetch games from API
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await zelenkaAPI.getGames()
        if (response.data && Array.isArray(response.data)) {
          setApiGames(response.data)
        }
      } catch (error) {
        console.error('Error fetching games:', error)
      }
    }
    fetchGames()
  }, [])

  // Combined games list - NO FALLBACK, show errors if API fails
  const combinedGames = useMemo(() => {
    // Helper function to safely add games with validation
    const addGameSafely = (game, gameMap) => {
      if (game && game.value && game.label) {
        const safeGame = {
          value: game.value.toString(),
          label: game.label.toString(),
          isPopular: game.isPopular || false
        }
        gameMap.set(safeGame.value, safeGame)
      }
    }

    // Only use API games - NO FALLBACK
    if (apiGames.length > 0) {
      const combinedGames = new Map()
      apiGames.forEach(game => addGameSafely(game, combinedGames))
      return Array.from(combinedGames.values())
    } else {
      // No fallback - return empty array to show API error
      console.log('⚠️ No API games available and no fallback used - this will show the API error')
      return []
    }
  }, [apiGames])

  const handleFilterChange = (field, value) => {
    if (typeof setFilters === 'function') {
      const newFilters = { ...safeFilters, [field]: value }
      setFilters(newFilters)
    }
  }

  const handleApplyFilters = () => {
    if (onApplyFilters) {
      onApplyFilters(safeFilters)
    }
  }

  const toggleSection = section => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <div className='bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6'>
      {/* Popular Games Quick Filter */}
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-white mb-3 flex items-center'>
          <Icon icon='material-symbols:filter-list' className='mr-2' />
          Popular Riot Games
        </h3>
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
          {popularSearches.map(game => (
            <button
              key={game.value}
              type='button'
              onClick={() => {
                const currentGames = safeFilters.game || []
                const isSelected = currentGames.includes(game.value)
                const newGames = isSelected
                  ? currentGames.filter(g => g !== game.value)
                  : [...currentGames, game.value]
                handleFilterChange('game', newGames)
              }}
              className={`flex items-center justify-center p-3 rounded-lg border transition-all ${
                safeFilters.game && safeFilters.game.includes(game.value)
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className='text-sm font-medium'>{game.label}</span>
            </button>
          ))}
        </div>
        {safeFilters.game && safeFilters.game.length > 0 && (
          <div className='mt-3 p-3 bg-purple-900 border border-purple-600 rounded-lg'>
            <p className='text-purple-200 text-sm'>
              <Icon icon='material-symbols:filter-alt' className='inline w-4 h-4 mr-1' />
              Filtering accounts with:{' '}
              <strong>
                {safeFilters.game
                  .map(gameId => {
                    const game = popularSearches.find(g => g.value === gameId)
                    return game?.label || gameId
                  })
                  .join(', ')}
              </strong>
            </p>
          </div>
        )}
      </div>

      {/* Main Search Form - Exactly matching example.html structure */}
      <form className='searchBarContainer'>
        <div className='filterContainer'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* COLUMN 1 - GENERAL FILTERS */}
            <div className='filterColumn space-y-4'>
              {/* With mail */}
              <div className='space-y-2'>
                <label className='text-gray-300 text-sm font-medium'>With mail</label>
                <div className='grid grid-cols-3 gap-1'>
                  <label className='flex items-center space-x-1'>
                    <input
                      type='radio'
                      name='email'
                      value=''
                      className='text-purple-600 focus:ring-purple-500'
                      checked={safeFilters.email === ''}
                      onChange={e => handleFilterChange('email', e.target.value)}
                    />
                    <span className='text-xs text-gray-300'>Any</span>
                  </label>
                  <label className='flex items-center space-x-1'>
                    <input
                      type='radio'
                      name='email'
                      value='yes'
                      className='text-purple-600 focus:ring-purple-500'
                      checked={safeFilters.email === 'yes'}
                      onChange={e => handleFilterChange('email', e.target.value)}
                    />
                    <span className='text-xs text-gray-300'>Yes</span>
                  </label>
                  <label className='flex items-center space-x-1'>
                    <input
                      type='radio'
                      name='email'
                      value='no'
                      className='text-purple-600 focus:ring-purple-500'
                      checked={safeFilters.email === 'no'}
                      onChange={e => handleFilterChange('email', e.target.value)}
                    />
                    <span className='text-xs text-gray-300'>No</span>
                  </label>
                </div>
              </div>

              {/* Phone linked */}
              <div className='space-y-2'>
                <label className='text-gray-300 text-sm font-medium'>Phone linked</label>
                <div className='grid grid-cols-3 gap-1'>
                  <label className='flex items-center space-x-1'>
                    <input
                      type='radio'
                      name='tel'
                      value=''
                      className='text-purple-600 focus:ring-purple-500'
                      checked={safeFilters.tel === ''}
                      onChange={e => handleFilterChange('tel', e.target.value)}
                    />
                    <span className='text-xs text-gray-300'>Any</span>
                  </label>
                  <label className='flex items-center space-x-1'>
                    <input
                      type='radio'
                      name='tel'
                      value='yes'
                      className='text-purple-600 focus:ring-purple-500'
                      checked={safeFilters.tel === 'yes'}
                      onChange={e => handleFilterChange('tel', e.target.value)}
                    />
                    <span className='text-xs text-gray-300'>Yes</span>
                  </label>
                  <label className='flex items-center space-x-1'>
                    <input
                      type='radio'
                      name='tel'
                      value='no'
                      className='text-purple-600 focus:ring-purple-500'
                      checked={safeFilters.tel === 'no'}
                      onChange={e => handleFilterChange('tel', e.target.value)}
                    />
                    <span className='text-xs text-gray-300'>No</span>
                  </label>
                </div>
              </div>

              {/* Days Inactive */}
              <div className='space-y-2'>
                <input
                  type='number'
                  name='daybreak'
                  min='50'
                  placeholder='Days Inactive (Min 50)'
                  className='w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  value={safeFilters.daybreak}
                  onChange={e => handleFilterChange('daybreak', e.target.value)}
                />
              </div>

              {/* Country */}
              <div className='space-y-2'>
                <label className='text-gray-300 text-sm font-medium'>Country</label>
                <MultiSelectDropdown
                  options={countries}
                  value={safeFilters.country || []}
                  onChange={value => handleFilterChange('country', value)}
                  placeholder='Select countries...'
                  searchable={true}
                />
              </div>

              {/* Account origin */}
              <div className='space-y-2'>
                <label className='text-gray-300 text-sm font-medium'>Account origin</label>
                <MultiSelectDropdown
                  options={originOptions}
                  value={safeFilters.origin || []}
                  onChange={value => handleFilterChange('origin', value)}
                  placeholder='Select account origins...'
                  searchable={true}
                />
              </div>

              {/* Exclude Account origin */}
              <div className='space-y-2'>
                <label className='text-gray-300 text-sm font-medium'>Exclude Account origin</label>
                <MultiSelectDropdown
                  options={originOptions}
                  value={safeFilters.not_origin || []}
                  onChange={value => handleFilterChange('not_origin', value)}
                  placeholder='Select origins to exclude...'
                  searchable={true}
                />
              </div>
            </div>

            {/* COLUMN 2 - VALORANT */}
            <div className='filterColumn space-y-4'>
              <div className='wrapper'>
                <label className='text-white font-medium text-lg mb-4 block'>Valorant</label>

                {/* Weapon Skins */}
                <div className='mb-4'>
                  <label className='text-gray-300 text-sm font-medium mb-2 block'>
                    Weapon Skins
                  </label>
                  <MultiSelectDropdown
                    options={weaponSkins}
                    value={safeFilters.weaponSkin || []}
                    onChange={values => handleFilterChange('weaponSkin', values)}
                    placeholder='Select weapon skins...'
                    loading={categoryLoading}
                    error={categoryError}
                    searchable={true}
                  />
                </div>

                {/* Buddies */}
                <div className='mb-4'>
                  <label className='text-gray-300 text-sm font-medium mb-2 block'>Buddies</label>
                  <MultiSelectDropdown
                    options={buddies}
                    value={safeFilters.buddy || []}
                    onChange={values => handleFilterChange('buddy', values)}
                    placeholder='Select buddies...'
                    loading={categoryLoading}
                    error={categoryError}
                    searchable={true}
                  />
                </div>

                {/* Agents */}
                <div className='mb-4'>
                  <label className='text-gray-300 text-sm font-medium mb-2 block'>Agents</label>
                  <MultiSelectDropdown
                    options={agents}
                    value={safeFilters.agent || []}
                    onChange={values => handleFilterChange('agent', values)}
                    placeholder='Select agents...'
                    loading={categoryLoading}
                    error={categoryError}
                    searchable={true}
                  />
                </div>

                {/* Min/Max Skins */}
                <div className='grid grid-cols-2 gap-2 mb-4'>
                  <input
                    type='number'
                    name='valorant_smin'
                    placeholder='Min Skins'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={safeFilters.valorant_smin}
                    onChange={e => handleFilterChange('valorant_smin', e.target.value)}
                  />
                  <input
                    type='number'
                    name='valorant_smax'
                    placeholder='up to'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={safeFilters.valorant_smax}
                    onChange={e => handleFilterChange('valorant_smax', e.target.value)}
                  />
                </div>

                {/* VP Range */}
                <div className='grid grid-cols-2 gap-2 mb-4'>
                  <input
                    type='number'
                    name='vp_min'
                    placeholder='VP From'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={safeFilters.vp_min}
                    onChange={e => handleFilterChange('vp_min', e.target.value)}
                  />
                  <input
                    type='number'
                    name='vp_max'
                    placeholder='up to'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={safeFilters.vp_max}
                    onChange={e => handleFilterChange('vp_max', e.target.value)}
                  />
                </div>

                {/* Inventory Value */}
                <div className='grid grid-cols-2 gap-2 mb-4'>
                  <input
                    type='number'
                    name='inv_min'
                    placeholder='Min Inv Value'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={safeFilters.inv_min}
                    onChange={e => handleFilterChange('inv_min', e.target.value)}
                  />
                  <input
                    type='number'
                    name='inv_max'
                    placeholder='up to'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={safeFilters.inv_max}
                    onChange={e => handleFilterChange('inv_max', e.target.value)}
                  />
                </div>

                {/* Has any knife */}
                <label className='flex items-center space-x-2 mb-4'>
                  <input
                    type='checkbox'
                    name='knife'
                    value='true'
                    className='text-purple-600 focus:ring-purple-500'
                    checked={safeFilters.knife === 'true'}
                    onChange={e => handleFilterChange('knife', e.target.checked ? 'true' : '')}
                  />
                  <span className='text-gray-300'>Has any knife</span>
                </label>

                {/* Valorant Region */}
                <div className='space-y-2 mb-4'>
                  <label className='text-gray-300 text-sm font-medium'>Valorant Region</label>
                  <MultiSelectDropdown
                    options={valorantRegions}
                    value={safeFilters.valorant_region || []}
                    onChange={value => handleFilterChange('valorant_region', value)}
                    placeholder='Select valorant regions...'
                    searchable={true}
                  />
                </div>

                {/* Exclude Valorant Region */}
                <div className='space-y-2 mb-4'>
                  <label className='text-gray-300 text-sm font-medium'>
                    Exclude Valorant Region
                  </label>
                  <MultiSelectDropdown
                    options={valorantRegions}
                    value={safeFilters.valorant_not_region || []}
                    onChange={value => handleFilterChange('valorant_not_region', value)}
                    placeholder='Select regions to exclude...'
                    searchable={true}
                  />
                </div>

                {/* Level Range */}
                <div className='grid grid-cols-2 gap-2 mb-4'>
                  <input
                    type='number'
                    name='valorant_level_min'
                    placeholder='Level from'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={safeFilters.valorant_level_min}
                    onChange={e => handleFilterChange('valorant_level_min', e.target.value)}
                  />
                  <input
                    type='number'
                    name='valorant_level_max'
                    placeholder='up to'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={safeFilters.valorant_level_max}
                    onChange={e => handleFilterChange('valorant_level_max', e.target.value)}
                  />
                </div>

                {/* Agents Range */}
                <div className='grid grid-cols-2 gap-2 mb-4'>
                  <input
                    type='number'
                    name='amin'
                    placeholder='Agents from'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={safeFilters.amin}
                    onChange={e => handleFilterChange('amin', e.target.value)}
                  />
                  <input
                    type='number'
                    name='amax'
                    placeholder='up to'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={safeFilters.amax}
                    onChange={e => handleFilterChange('amax', e.target.value)}
                  />
                </div>

                {/* Current Rank */}
                <label className='block text-gray-300 text-sm font-medium mb-2'>Current Rank</label>
                <div className='grid grid-cols-2 gap-2 mb-4'>
                  <select
                    name='rmin'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={safeFilters.rmin || ''}
                    onChange={e => handleFilterChange('rmin', e.target.value)}
                  >
                    <option value=''>From</option>
                    {valorantRanks.map(rank => (
                      <option key={rank.value} value={rank.value}>
                        {rank.label}
                      </option>
                    ))}
                  </select>
                  <select
                    name='rmax'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={safeFilters.rmax || ''}
                    onChange={e => handleFilterChange('rmax', e.target.value)}
                  >
                    <option value=''>Up to</option>
                    {valorantRanks.map(rank => (
                      <option key={rank.value} value={rank.value}>
                        {rank.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Last Rank */}
                <label className='block text-gray-300 text-sm font-medium mb-2'>Last Rank</label>
                <div className='grid grid-cols-2 gap-2 mb-4'>
                  <select
                    name='last_rmin'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={safeFilters.last_rmin || ''}
                    onChange={e => handleFilterChange('last_rmin', e.target.value)}
                  >
                    <option value=''>From</option>
                    {valorantRanks.map(rank => (
                      <option key={rank.value} value={rank.value}>
                        {rank.label}
                      </option>
                    ))}
                  </select>
                  <select
                    name='last_rmax'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={safeFilters.last_rmax || ''}
                    onChange={e => handleFilterChange('last_rmax', e.target.value)}
                  >
                    <option value=''>Up to</option>
                    {valorantRanks.map(rank => (
                      <option key={rank.value} value={rank.value}>
                        {rank.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Last Season Rank */}
                <label className='block text-gray-300 text-sm font-medium mb-2'>
                  Last Season Rank
                </label>
                <div className='grid grid-cols-2 gap-2 mb-4'>
                  <select
                    name='previous_rmin'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={safeFilters.previous_rmin || ''}
                    onChange={e => handleFilterChange('previous_rmin', e.target.value)}
                  >
                    <option value=''>From</option>
                    {valorantRanks.map(rank => (
                      <option key={rank.value} value={rank.value}>
                        {rank.label}
                      </option>
                    ))}
                  </select>
                  <select
                    name='previous_rmax'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={safeFilters.previous_rmax || ''}
                    onChange={e => handleFilterChange('previous_rmax', e.target.value)}
                  >
                    <option value=''>Up to</option>
                    {valorantRanks.map(rank => (
                      <option key={rank.value} value={rank.value}>
                        {rank.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* COLUMN 3 - LEAGUE OF LEGENDS */}
            <div className='filterColumn space-y-4'>
              <div className='wrapper'>
                <label className='text-white font-medium text-lg mb-4 block'>
                  League of Legends
                </label>

                {/* LoL Level */}
                <div className='grid grid-cols-2 gap-2 mb-4'>
                  <input
                    type='number'
                    name='lol_level_min'
                    placeholder='Level from'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={safeFilters.lol_level_min}
                    onChange={e => handleFilterChange('lol_level_min', e.target.value)}
                  />
                  <input
                    type='number'
                    name='lol_level_max'
                    placeholder='up to'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={safeFilters.lol_level_max}
                    onChange={e => handleFilterChange('lol_level_max', e.target.value)}
                  />
                </div>

                {/* Win Rate */}
                <div className='grid grid-cols-2 gap-2 mb-4'>
                  <input
                    type='number'
                    name='win_rate_min'
                    placeholder='WinRate from'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={safeFilters.win_rate_min}
                    onChange={e => handleFilterChange('win_rate_min', e.target.value)}
                  />
                  <input
                    type='number'
                    name='win_rate_max'
                    placeholder='up to'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={safeFilters.win_rate_max}
                    onChange={e => handleFilterChange('win_rate_max', e.target.value)}
                  />
                </div>

                {/* LoL Skins */}
                <div className='grid grid-cols-2 gap-2 mb-4'>
                  <input
                    type='number'
                    name='lol_smin'
                    placeholder='Skins from'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={safeFilters.lol_smin}
                    onChange={e => handleFilterChange('lol_smin', e.target.value)}
                  />
                  <input
                    type='number'
                    name='lol_smax'
                    placeholder='up to'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={safeFilters.lol_smax}
                    onChange={e => handleFilterChange('lol_smax', e.target.value)}
                  />
                </div>

                {/* Champions */}
                <div className='grid grid-cols-2 gap-2 mb-4'>
                  <input
                    type='number'
                    name='champion_min'
                    placeholder='Champions from'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={safeFilters.champion_min}
                    onChange={e => handleFilterChange('champion_min', e.target.value)}
                  />
                  <input
                    type='number'
                    name='champion_max'
                    placeholder='up to'
                    className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    value={safeFilters.champion_max}
                    onChange={e => handleFilterChange('champion_max', e.target.value)}
                  />
                </div>

                {/* LoL Region */}
                <div className='space-y-2 mb-4'>
                  <label className='text-gray-300 text-sm font-medium'>LoL Region</label>
                  <MultiSelectDropdown
                    options={lolRegions}
                    value={safeFilters.lol_region || []}
                    onChange={value => handleFilterChange('lol_region', value)}
                    placeholder='Select LoL regions...'
                    searchable={true}
                  />
                </div>

                {/* Exclude LoL Region */}
                <div className='space-y-2 mb-4'>
                  <label className='text-gray-300 text-sm font-medium'>Exclude LoL Region</label>
                  <MultiSelectDropdown
                    options={lolRegions}
                    value={safeFilters.lol_not_region || []}
                    onChange={value => handleFilterChange('lol_not_region', value)}
                    placeholder='Select LoL regions to exclude...'
                    searchable={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sort Buttons */}
        <div className='sortButtons flex flex-wrap gap-2 mt-6'>
          <input type='hidden' name='order_by' value={safeFilters.order_by} />
          <input type='hidden' name='page' value='1' />

          <button
            type='button'
            onClick={() => handleFilterChange('order_by', 'bump')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              safeFilters.order_by === 'bump'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Date (Newest)
          </button>
          <button
            type='button'
            onClick={() => handleFilterChange('order_by', 'price_asc')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              safeFilters.order_by === 'price_asc'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Price (Low to High)
          </button>
          <button
            type='button'
            onClick={() => handleFilterChange('order_by', 'price_desc')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              safeFilters.order_by === 'price_desc'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Price (High to Low)
          </button>
        </div>

        {/* Apply Button */}
        <div className='mt-6'>
          <button
            type='button'
            onClick={handleApplyFilters}
            className='w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition-colors'
          >
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  )
}

export default RiotFilters
