import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'
import lztMarket from '../utils/lztClient'
import SupercellAccountCard from './SupercellAccountCard'
import SupercellFilters from './SupercellFilters'

const SupercellPage = () => {
  const [accounts, setAccounts] = useState([])
  const [filteredAccounts, setFilteredAccounts] = useState([])
  const [filters, setFilters] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState('newest')
  const accountsPerPage = 24

  useEffect(() => {
    // Load accounts from LZT Market API
    loadSupercellAccounts()
  }, [])

  const loadSupercellAccounts = async () => {
    setIsLoading(true)
    try {
      // Authenticate with LZT Market SDK
      lztMarket.auth(
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9.eyJzdWIiOjg0NDY3ODIsImlzcyI6Imx6dCIsImlhdCI6MTc1Mzc5NTkyNSwianRpIjoiODIyMDc2Iiwic2NvcGUiOiJiYXNpYyByZWFkIHBvc3QgY29udmVyc2F0ZSBwYXltZW50IGludm9pY2UgY2hhdGJveCBtYXJrZXQifQ.ChwPNVckvm1n1nw7tgaNLPVtuwCJiSRimrVmM7HFqOi3h7_sbUN9tM_MGz4KYFY9K52cUN68tGYXNnZMby6qlE6H_bNqkiol1zCM4_AEPEKkHIa0ljBe4VdG_Wz1PnRqfykmYu43Rf2oDpiC4uMAgtC5CvGJpSR8RIl8n7Pq42c'
      )

      // Fetch from LZT Market API using SDK
      const { data } = await lztMarket.categorySupercell()

      // Extract accounts from API response
      const loadedAccounts = data.items || []
      setAccounts(loadedAccounts)
      setFilteredAccounts(loadedAccounts)
    } catch (error) {
      console.error('Error loading Supercell accounts:', error)
      setAccounts([])
      setFilteredAccounts([])
    } finally {
      setIsLoading(false)
    }
  }

  // Apply filters whenever filters change
  useEffect(() => {
    let filtered = [...accounts]

    // Phone filter
    if (filters.tel === 'yes') {
      filtered = filtered.filter(account => account.supercell_phone === 1)
    } else if (filters.tel === 'no') {
      filtered = filtered.filter(account => account.supercell_phone === 0)
    }

    // Days inactive filter
    if (filters.daybreak) {
      const daysInactive = parseInt(filters.daybreak)
      const cutoffDate = Date.now() / 1000 - daysInactive * 24 * 60 * 60
      filtered = filtered.filter(
        account => !account.supercell_last_activity || account.supercell_last_activity < cutoffDate
      )
    }

    // Origin filters
    if (filters.origin && filters.origin.length > 0) {
      filtered = filtered.filter(account => filters.origin.includes(account.item_origin))
    }

    if (filters.notOrigin && filters.notOrigin.length > 0) {
      filtered = filtered.filter(account => !filters.notOrigin.includes(account.item_origin))
    }

    // Price filters
    if (filters.priceMin) {
      filtered = filtered.filter(account => account.price >= parseFloat(filters.priceMin))
    }
    if (filters.priceMax) {
      filtered = filtered.filter(account => account.price <= parseFloat(filters.priceMax))
    }

    // Clash Royale filters
    if (filters.royaleLevel?.min) {
      filtered = filtered.filter(
        account => account.supercell_scroll_level >= parseInt(filters.royaleLevel.min)
      )
    }
    if (filters.royaleLevel?.max) {
      filtered = filtered.filter(
        account => account.supercell_scroll_level <= parseInt(filters.royaleLevel.max)
      )
    }

    if (filters.royaleCup?.min) {
      filtered = filtered.filter(
        account => account.supercell_scroll_trophies >= parseInt(filters.royaleCup.min)
      )
    }
    if (filters.royaleCup?.max) {
      filtered = filtered.filter(
        account => account.supercell_scroll_trophies <= parseInt(filters.royaleCup.max)
      )
    }

    if (filters.royaleWins?.min) {
      filtered = filtered.filter(
        account => account.supercell_scroll_victories >= parseInt(filters.royaleWins.min)
      )
    }
    if (filters.royaleWins?.max) {
      filtered = filtered.filter(
        account => account.supercell_scroll_victories <= parseInt(filters.royaleWins.max)
      )
    }

    // Clash of Clans filters
    if (filters.cocLevel?.min) {
      filtered = filtered.filter(
        account => account.supercell_level >= parseInt(filters.cocLevel.min)
      )
    }
    if (filters.cocLevel?.max) {
      filtered = filtered.filter(
        account => account.supercell_level <= parseInt(filters.cocLevel.max)
      )
    }

    if (filters.cocTownHall?.min) {
      filtered = filtered.filter(
        account => account.supercell_town_hall_level >= parseInt(filters.cocTownHall.min)
      )
    }
    if (filters.cocTownHall?.max) {
      filtered = filtered.filter(
        account => account.supercell_town_hall_level <= parseInt(filters.cocTownHall.max)
      )
    }

    if (filters.cocHeroLevel?.min) {
      filtered = filtered.filter(
        account => account.supercell_hero_level >= parseInt(filters.cocHeroLevel.min)
      )
    }
    if (filters.cocHeroLevel?.max) {
      filtered = filtered.filter(
        account => account.supercell_hero_level <= parseInt(filters.cocHeroLevel.max)
      )
    }

    // Brawl Stars filters
    if (filters.brawlLevel?.min) {
      filtered = filtered.filter(
        account => account.supercell_laser_level >= parseInt(filters.brawlLevel.min)
      )
    }
    if (filters.brawlLevel?.max) {
      filtered = filtered.filter(
        account => account.supercell_laser_level <= parseInt(filters.brawlLevel.max)
      )
    }

    if (filters.brawlCup?.min) {
      filtered = filtered.filter(
        account => account.supercell_laser_trophies >= parseInt(filters.brawlCup.min)
      )
    }
    if (filters.brawlCup?.max) {
      filtered = filtered.filter(
        account => account.supercell_laser_trophies <= parseInt(filters.brawlCup.max)
      )
    }

    if (filters.brawlBrawlers?.min) {
      filtered = filtered.filter(
        account => account.supercell_brawler_count >= parseInt(filters.brawlBrawlers.min)
      )
    }
    if (filters.brawlBrawlers?.max) {
      filtered = filtered.filter(
        account => account.supercell_brawler_count <= parseInt(filters.brawlBrawlers.max)
      )
    }

    // Sort accounts
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'oldest':
        filtered.sort((a, b) => a.published_date - b.published_date)
        break
      case 'newest':
      default:
        filtered.sort((a, b) => b.published_date - a.published_date)
        break
    }

    setFilteredAccounts(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [accounts, filters, sortBy])

  const handleFiltersChange = newFilters => {
    setFilters(newFilters)
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredAccounts.length / accountsPerPage)
  const startIndex = (currentPage - 1) * accountsPerPage
  const endIndex = startIndex + accountsPerPage
  const currentAccounts = filteredAccounts.slice(startIndex, endIndex)

  const goToPage = page => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pages = []
    const maxVisiblePages = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <button
          key='prev'
          onClick={() => goToPage(currentPage - 1)}
          className='px-3 py-2 text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg transition-colors'
        >
          <Icon icon='mdi:chevron-left' />
        </button>
      )
    }

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => goToPage(1)}
          className='px-3 py-2 text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg transition-colors'
        >
          1
        </button>
      )
      if (startPage > 2) {
        pages.push(
          <span key='dots1' className='text-gray-400'>
            ...
          </span>
        )
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-2 text-sm rounded-lg transition-colors ${
            currentPage === i
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {i}
        </button>
      )
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key='dots2' className='text-gray-400'>
            ...
          </span>
        )
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => goToPage(totalPages)}
          className='px-3 py-2 text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg transition-colors'
        >
          {totalPages}
        </button>
      )
    }

    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <button
          key='next'
          onClick={() => goToPage(currentPage + 1)}
          className='px-3 py-2 text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg transition-colors'
        >
          <Icon icon='mdi:chevron-right' />
        </button>
      )
    }

    return <div className='flex items-center justify-center space-x-2 mt-8'>{pages}</div>
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-950 p-4'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <Icon
              icon='mdi:loading'
              className='text-4xl text-purple-400 animate-spin mx-auto mb-4'
            />
            <div className='text-gray-400'>Loading Supercell accounts...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-950 p-4'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header */}
        <div className='text-center space-y-2'>
          <h1 className='text-3xl font-bold text-white flex items-center justify-center space-x-3'>
            <Icon icon='simple-icons:supercell' className='text-orange-400' />
            <span>Supercell Accounts</span>
          </h1>
          <p className='text-gray-400'>Clash Royale, Clash of Clans, Brawl Stars & More</p>
        </div>

        {/* Filters */}
        <SupercellFilters onFiltersChange={handleFiltersChange} />

        {/* Results Header */}
        <div className='flex items-center justify-between bg-gray-900 border border-gray-700 rounded-lg p-4'>
          <div className='flex items-center space-x-4'>
            <span className='text-gray-300'>
              Showing {currentAccounts.length} of {filteredAccounts.length} accounts
            </span>
            {filteredAccounts.length !== accounts.length && (
              <span className='text-sm text-purple-400'>
                (filtered from {accounts.length} total)
              </span>
            )}
          </div>

          <div className='flex items-center space-x-3'>
            <span className='text-sm text-gray-400'>Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className='bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500'
            >
              <option value='newest'>Newest First</option>
              <option value='oldest'>Oldest First</option>
              <option value='price-low'>Price: Low to High</option>
              <option value='price-high'>Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* No Results */}
        {filteredAccounts.length === 0 && !isLoading && (
          <div className='text-center py-12'>
            <Icon icon='mdi:account-off' className='text-6xl text-gray-600 mx-auto mb-4' />
            <h3 className='text-xl font-semibold text-gray-400 mb-2'>No accounts found</h3>
            <p className='text-gray-500'>Try adjusting your filters to see more results.</p>
          </div>
        )}

        {/* Accounts Grid - 3 columns layout */}
        {currentAccounts.length > 0 && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {currentAccounts.map(account => (
              <SupercellAccountCard key={account.item_id} account={account} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {renderPagination()}
      </div>
    </div>
  )
}

export default SupercellPage
