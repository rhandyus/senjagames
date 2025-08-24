import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'
import OriginAccountCard from './OriginAccountCard'
import OriginFilters from './OriginFilters'

const OriginPage = () => {
  const [accounts, setAccounts] = useState([])
  const [filteredAccounts, setFilteredAccounts] = useState([])
  const [filters, setFilters] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [error, setError] = useState(null)

  const itemsPerPage = 12

  // Load accounts data
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch EA/Origin accounts using the server endpoint
        console.log('🎮 Fetching EA/Origin accounts from server endpoint...')

        const params = new URLSearchParams({
          page: 1,
          pmin: 0,
          pmax: 1000000,
          sb: 'price_asc'
        })

        const response = await fetch(`/api/lzt/ea?${params}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('📊 EA/Origin accounts response:', data)

        // Extract items array from API response format
        const accountsData = data.items || data.accounts || []

        // Process the data to ensure consistent structure
        const processedAccounts = accountsData.map((account, index) => ({
          ...account,
          id: account.ea_item_id || account.origin_item_id || account.item_id || `origin-${index}`,
          price: parseFloat(account.price) || 0,
          country: account.ea_country || account.origin_country || account.country,
          origin: account.item_origin || account.origin,
          mail: account.email_type !== 'autoreg' && account.email_type !== 'none'
        }))

        setAccounts(processedAccounts)
        setFilteredAccounts(processedAccounts)
      } catch (error) {
        console.error('❌ Error loading EA/Origin accounts:', error)
        setError(`Failed to load EA/Origin accounts: ${error.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadAccounts()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...accounts]

    // Game filter
    if (filters.game && filters.game.length > 0) {
      filtered = filtered.filter(account => {
        const eaGames = account.ea_games || {}
        const gamesList = Object.values(eaGames)
        return filters.game.some(selectedGame =>
          gamesList.some(
            game =>
              game.title?.toLowerCase().includes(selectedGame.toLowerCase()) ||
              game.game_id?.toLowerCase().includes(selectedGame.toLowerCase())
          )
        )
      })
    }

    // Games count filter
    if (filters.gamesCount && (filters.gamesCount.min || filters.gamesCount.max)) {
      filtered = filtered.filter(account => {
        const gamesCount = Object.keys(account.ea_games || {}).length
        const min = parseInt(filters.gamesCount.min) || 0
        const max = parseInt(filters.gamesCount.max) || Infinity
        return gamesCount >= min && gamesCount <= max
      })
    }

    // Origin filter
    if (filters.origin && filters.origin.length > 0) {
      filtered = filtered.filter(account => filters.origin.includes(account.origin?.toLowerCase()))
    }

    // Exclude origin filter
    if (filters.notOrigin && filters.notOrigin.length > 0) {
      filtered = filtered.filter(
        account => !filters.notOrigin.includes(account.origin?.toLowerCase())
      )
    }

    // Price range filter
    if (filters.priceMin || filters.priceMax) {
      filtered = filtered.filter(account => {
        const price = parseFloat(account.price) || 0
        const min = parseFloat(filters.priceMin) || 0
        const max = parseFloat(filters.priceMax) || Infinity
        return price >= min && price <= max
      })
    }

    // Country filter
    if (filters.country) {
      filtered = filtered.filter(account =>
        account.country?.toLowerCase().includes(filters.country.toLowerCase())
      )
    }

    // Last activity filter
    if (filters.lastActivity) {
      const maxDays = parseInt(filters.lastActivity)
      filtered = filtered.filter(account => {
        const eaGames = account.ea_games || {}
        const activities = Object.values(eaGames)
          .map(game => parseInt(game.last_activity))
          .filter(activity => !isNaN(activity))

        if (activities.length === 0) return false
        const lastActivity = Math.min(...activities)
        return lastActivity <= maxDays
      })
    }

    // Total played hours filter
    if (filters.totalPlayed && (filters.totalPlayed.min || filters.totalPlayed.max)) {
      filtered = filtered.filter(account => {
        const eaGames = account.ea_games || {}
        const totalHours = Object.values(eaGames).reduce((total, game) => {
          return total + (parseFloat(game.total_played) || 0)
        }, 0)

        const min = parseFloat(filters.totalPlayed.min) || 0
        const max = parseFloat(filters.totalPlayed.max) || Infinity
        return totalHours >= min && totalHours <= max
      })
    }

    setFilteredAccounts(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [filters, accounts])

  // Pagination
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedAccounts = filteredAccounts.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = page => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getVisiblePageNumbers = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-900 p-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center py-12'>
            <Icon icon='mdi:alert-circle' className='text-red-400 text-6xl mb-4 mx-auto' />
            <h2 className='text-2xl font-bold text-red-400 mb-2'>Error Loading Origin Accounts</h2>
            <p className='text-gray-400'>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className='mt-4 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors'
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-900'>
      <div className='max-w-7xl mx-auto p-6'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center space-x-3 mb-2'>
            <Icon icon='simple-icons:ea' className='text-orange-400 text-3xl' />
            <h1 className='text-3xl font-bold text-gray-100'>Origin / EA Accounts</h1>
          </div>
          <p className='text-gray-400'>Premium EA Origin accounts with verified games and stats</p>
        </div>

        {/* Filters */}
        <div className='mb-8'>
          <OriginFilters onFiltersChange={setFilters} />
        </div>

        {/* Results Summary */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center space-x-4'>
            <span className='text-gray-300'>
              Showing{' '}
              <span className='font-semibold text-orange-400'>{filteredAccounts.length}</span>{' '}
              accounts
            </span>
            {filteredAccounts.length !== accounts.length && (
              <span className='text-sm text-gray-500'>(filtered from {accounts.length} total)</span>
            )}
          </div>

          {isLoading && (
            <div className='flex items-center space-x-2 text-gray-400'>
              <Icon icon='mdi:loading' className='animate-spin' />
              <span>Loading accounts...</span>
            </div>
          )}
        </div>

        {/* Accounts Grid - 3 COLUMNS */}
        {isLoading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {[...Array(12)].map((_, index) => (
              <div key={index} className='bg-gray-800 rounded-xl border border-gray-700 p-6'>
                <div className='animate-pulse'>
                  <div className='h-6 bg-gray-700 rounded mb-4'></div>
                  <div className='h-4 bg-gray-700 rounded mb-2'></div>
                  <div className='h-4 bg-gray-700 rounded mb-4'></div>
                  <div className='space-y-2'>
                    <div className='h-3 bg-gray-700 rounded'></div>
                    <div className='h-3 bg-gray-700 rounded'></div>
                    <div className='h-3 bg-gray-700 rounded'></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : paginatedAccounts.length > 0 ? (
          <>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
              {paginatedAccounts.map(account => (
                <OriginAccountCard key={account.id} account={account} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='flex items-center justify-center space-x-2'>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className='p-2 rounded-lg bg-gray-800 border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors'
                >
                  <Icon icon='mdi:chevron-left' className='text-gray-400' />
                </button>

                {getVisiblePageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                    disabled={page === '...'}
                    className={`px-3 py-2 rounded-lg border transition-colors ${
                      page === currentPage
                        ? 'bg-orange-600 border-orange-600 text-white'
                        : page === '...'
                          ? 'bg-transparent border-transparent text-gray-500 cursor-default'
                          : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className='p-2 rounded-lg bg-gray-800 border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors'
                >
                  <Icon icon='mdi:chevron-right' className='text-gray-400' />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className='text-center py-12'>
            <Icon icon='mdi:gamepad-off' className='text-gray-600 text-6xl mb-4 mx-auto' />
            <h3 className='text-xl font-semibold text-gray-400 mb-2'>No Origin Accounts Found</h3>
            <p className='text-gray-500'>Try adjusting your filters to see more results</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default OriginPage
