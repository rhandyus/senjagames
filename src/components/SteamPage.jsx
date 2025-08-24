import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'
import SteamFilters from './SteamFilters'

const SteamPage = ({ onBack }) => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    limit: 20,
    page: 1,
    order_by: 'price',
    order_dir: 'asc'
  })
  const [totalPages, setTotalPages] = useState(1)

  // Fetch Steam accounts from server API
  const fetchAccounts = async (page = 1, filterParams = {}) => {
    setLoading(true)
    try {
      // Use the server endpoint
      const params = new URLSearchParams({ page, ...filterParams })
      const response = await fetch(`/api/steam?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      console.log('Raw server response:', data) // Debug log

      // The server returns data in { data: { items: [], totalItems: ... } } format
      const responseData = data.data || data

      // Transform the data for the UI
      const transformedData = {
        accounts: responseData.items || [],
        totalPages: Math.ceil((responseData.totalItems || 0) / (responseData.perPage || 40)),
        totalItems: responseData.totalItems || 0,
        currentPage: responseData.page || page
      }

      console.log('Transformed data:', transformedData) // Debug log

      // Set the data to the appropriate state variables
      setAccounts(transformedData.accounts)
      setTotalPages(transformedData.totalPages)
    } catch (error) {
      console.error('Error fetching accounts:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchAccounts()
  }, [])

  // Handle filter changes
  const handleFiltersChange = newFilters => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 }
    setFilters(updatedFilters)
    fetchAccounts(1, updatedFilters)
  }

  // Handle page changes
  const handlePageChange = newPage => {
    const updatedFilters = { ...filters, page: newPage }
    setFilters(updatedFilters)
    fetchAccounts(newPage, updatedFilters)
  }

  // Transform API data for display
  const transformSteamAccount = apiAccount => {
    // Handle different API response structures
    const accountData = apiAccount.account || apiAccount

    // Extract nested data safely
    const steamData = accountData.steam_data || accountData
    const sellerData = accountData.seller || {}

    // Format last seen date
    const formatLastSeen = timestamp => {
      if (!timestamp) return 'Unknown'
      try {
        const date = new Date(timestamp * 1000) // Convert Unix timestamp
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      } catch {
        return 'Unknown'
      }
    }

    // Format account status
    const getAccountStatus = status => {
      if (!status) return 'Unknown'
      switch (status) {
        case 'online':
          return 'Online'
        case 'offline':
          return 'Offline'
        case 'away':
          return 'Away'
        case 'busy':
          return 'Busy'
        case 'snooze':
          return 'Snooze'
        case 'looking_to_trade':
          return 'Looking to Trade'
        case 'looking_to_play':
          return 'Looking to Play'
        default:
          return status.charAt(0).toUpperCase() + status.slice(1)
      }
    }

    // Extract country information
    const getCountryInfo = data => {
      return (
        data.country ||
        data.location_country ||
        steamData.country ||
        steamData.location_country ||
        'Unknown'
      )
    }

    return {
      id: accountData.item_id || accountData.id || Math.random().toString(36),
      price: `$${accountData.price || '0.00'}`,
      title: accountData.title || accountData.name || 'Steam Account',

      // Steam-specific data
      steamId: steamData.steam_id || steamData.steamid,
      level: steamData.level || steamData.steam_level || 0,

      // Status and activity
      status: getAccountStatus(steamData.status || steamData.account_status),
      lastSeen: formatLastSeen(
        steamData.last_seen || steamData.last_online || steamData.last_logoff
      ),

      // Location
      country: getCountryInfo(accountData),

      // Games information
      games: steamData.games || steamData.owned_games || [],
      gamesCount:
        steamData.games_count || steamData.owned_games_count || (steamData.games || []).length,

      // Financial data
      inventoryValue: steamData.inventory_value || steamData.inventory_worth || 0,
      marketValue: steamData.market_value || steamData.market_worth || 0,

      // Account features
      hasWarranty: (accountData.warranty_days || 0) > 0,
      warranty: accountData.warranty_days ? `${accountData.warranty_days} days` : null,
      hasEmail: accountData.with_email || accountData.email_access || false,
      hasEmailChanges: steamData.email_changes || false,

      // VAC and bans
      vacBanned: steamData.vac_banned || false,
      communityBanned: steamData.community_banned || false,
      tradeBanned: steamData.trade_banned || false,

      // Account age and statistics
      accountAge: steamData.account_age || steamData.created,
      totalHours: steamData.total_hours || steamData.hours_played || 0,

      // Seller information
      seller: sellerData.username || sellerData.name || accountData.seller || 'Unknown',
      sellerRating: sellerData.rating || sellerData.feedback_score,

      // Additional metadata
      description: accountData.description || '',
      views: accountData.views || 0,
      category: accountData.category || 'Steam',

      rawData: apiAccount
    }
  }

  // Handle filter changes
  const handleFilterChange = newFilters => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 } // Reset to page 1 on filter change
    setFilters(updatedFilters)
    fetchAccounts(1, updatedFilters)
  }

  // Handle pagination (remove duplicate)
  // const handlePageChange = newPage => {
  //   const updatedFilters = { ...filters, page: newPage }
  //   setFilters(updatedFilters)
  //   fetchAccounts(newPage, updatedFilters)
  // }

  // Initial load (already handled above)
  // useEffect(() => {
  //   fetchAccounts()
  // }, [])

  return (
    <div className='min-h-screen bg-gradient-to-r from-black via-gray-900 to-black'>
      {/* Header */}
      <header className='shadow-lg'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center'>
              <button
                onClick={onBack}
                className='text-gray-300 hover:text-purple-400 transition-colors mr-4'
              >
                <Icon icon='material-symbols:arrow-back' className='text-2xl' />
              </button>
              <h1 className='text-2xl font-bold text-purple-400 flex items-center'>
                <Icon icon='mdi:steam' className='mr-2' />
                Steam Market
              </h1>
            </div>
            <div className='text-gray-400 text-sm'>Browse and filter Steam accounts</div>
          </div>
        </div>
      </header>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Steam Accounts Section */}
        <div className='mb-8'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-3xl font-bold text-purple-400 flex items-center'>
              <Icon icon='mdi:steam' className='mr-2' />
              Steam Accounts
            </h2>
            <div className='text-gray-400'>{accounts.length} accounts found</div>
          </div>

          {/* Filters directly under Steam Accounts heading */}
          <SteamFilters onFilterChange={handleFilterChange} loading={loading} />
        </div>

        {/* Error State */}
        {error && (
          <div className='bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-6'>
            <p className='font-medium'>Error loading Steam accounts:</p>
            <p className='text-sm mt-1'>{error}</p>
            <button
              onClick={() => fetchAccounts()}
              className='mt-2 bg-red-700 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors'
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className='bg-gray-900 rounded-lg shadow-lg border border-gray-700 p-6 animate-pulse'
              >
                <div className='flex justify-between items-start mb-4'>
                  <div className='h-8 bg-gray-700 rounded w-20'></div>
                  <div className='h-6 bg-gray-700 rounded w-16'></div>
                </div>
                <div className='space-y-3 mb-4'>
                  <div className='h-4 bg-gray-700 rounded w-full'></div>
                  <div className='h-4 bg-gray-700 rounded w-3/4'></div>
                  <div className='h-4 bg-gray-700 rounded w-1/2'></div>
                </div>
                <div className='h-10 bg-gray-700 rounded w-full'></div>
              </div>
            ))}
          </div>
        )}

        {/* Accounts Grid */}
        {!loading && !error && accounts.length > 0 && (
          <>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
              {accounts.map(account => (
                <div
                  key={account.id}
                  className='bg-gray-900 rounded-lg shadow-lg border border-gray-700 hover:border-purple-500 transition-all duration-300 p-6'
                >
                  <div className='flex justify-between items-start mb-4'>
                    <div className='flex items-center space-x-2'>
                      <span className='text-3xl font-bold text-purple-400'>{account.price}</span>
                      {account.hasWarranty && (
                        <span className='bg-green-600 text-white text-xs px-3 py-1 rounded-full'>
                          {account.warranty} warranty
                        </span>
                      )}
                    </div>
                    <span className='bg-blue-600 text-white text-sm px-3 py-1 rounded-lg font-medium'>
                      Steam
                    </span>
                  </div>

                  <div className='mb-4'>
                    <h3 className='text-lg font-semibold text-white mb-2'>{account.title}</h3>
                  </div>

                  <div className='space-y-3 mb-4'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-400'>Status:</span>
                      <span
                        className={`font-medium ${
                          account.status === 'Online'
                            ? 'text-green-400'
                            : account.status === 'Offline'
                              ? 'text-gray-400'
                              : account.status === 'Away'
                                ? 'text-yellow-400'
                                : 'text-gray-200'
                        }`}
                      >
                        {account.status}
                      </span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-400'>Level:</span>
                      <span className='text-gray-200 font-medium'>{account.level}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-400'>Games:</span>
                      <span className='text-gray-200 font-medium'>{account.gamesCount}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-400'>Total Hours:</span>
                      <span className='text-gray-200 font-medium'>{account.totalHours}h</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-400'>Inventory Value:</span>
                      <span className='text-gray-200 font-medium'>${account.inventoryValue}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-400'>Country:</span>
                      <span className='text-gray-200 font-medium'>{account.country}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-400'>Last seen:</span>
                      <span className='text-gray-200 font-medium'>{account.lastSeen}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className='flex flex-wrap gap-2 mb-4'>
                    {account.hasEmail && (
                      <span className='bg-green-700 text-green-100 text-xs px-2 py-1 rounded'>
                        <Icon icon='material-symbols:email' className='inline mr-1' />
                        Email Access
                      </span>
                    )}
                    {account.level >= 10 && (
                      <span className='bg-blue-700 text-blue-100 text-xs px-2 py-1 rounded'>
                        <Icon icon='material-symbols:trending-up' className='inline mr-1' />
                        High Level
                      </span>
                    )}
                    {account.gamesCount > 50 && (
                      <span className='bg-purple-700 text-purple-100 text-xs px-2 py-1 rounded'>
                        <Icon icon='material-symbols:videogame-asset' className='inline mr-1' />
                        Rich Library
                      </span>
                    )}
                    {!account.vacBanned && (
                      <span className='bg-green-700 text-green-100 text-xs px-2 py-1 rounded'>
                        <Icon icon='material-symbols:verified' className='inline mr-1' />
                        VAC Clean
                      </span>
                    )}
                    {account.vacBanned && (
                      <span className='bg-red-700 text-red-100 text-xs px-2 py-1 rounded'>
                        <Icon icon='material-symbols:warning' className='inline mr-1' />
                        VAC Banned
                      </span>
                    )}
                    {account.totalHours > 1000 && (
                      <span className='bg-orange-700 text-orange-100 text-xs px-2 py-1 rounded'>
                        <Icon icon='material-symbols:schedule' className='inline mr-1' />
                        1000+ Hours
                      </span>
                    )}
                    {account.inventoryValue > 100 && (
                      <span className='bg-yellow-700 text-yellow-100 text-xs px-2 py-1 rounded'>
                        <Icon icon='material-symbols:diamond' className='inline mr-1' />
                        Valuable Items
                      </span>
                    )}
                    {account.status === 'Online' && (
                      <span className='bg-green-600 text-green-100 text-xs px-2 py-1 rounded animate-pulse'>
                        <Icon icon='material-symbols:circle' className='inline mr-1' />
                        Online
                      </span>
                    )}
                  </div>

                  {/* Games List (if available) */}
                  {account.games && account.games.length > 0 && (
                    <div className='mb-4'>
                      <p className='text-sm text-gray-400 mb-2'>Featured Games:</p>
                      <div className='flex flex-wrap gap-1'>
                        {account.games.slice(0, 3).map((game, index) => (
                          <span
                            key={index}
                            className='bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded border border-gray-600'
                          >
                            {game}
                          </span>
                        ))}
                        {account.games.length > 3 && (
                          <span className='bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded border border-gray-600'>
                            +{account.games.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <button className='w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium'>
                    View Details
                  </button>

                  {/* Account Info */}
                  <div className='mt-3 flex justify-between text-xs text-gray-500'>
                    <div className='flex items-center space-x-1'>
                      <span>Seller: {account.seller}</span>
                      {account.sellerRating && (
                        <span className='bg-yellow-600 text-yellow-100 px-1 rounded'>
                          ⭐ {account.sellerRating}
                        </span>
                      )}
                    </div>
                    <span>Views: {account.views}</span>
                  </div>

                  {account.steamId && (
                    <div className='mt-1 text-xs text-gray-600'>Steam ID: {account.steamId}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='flex justify-center space-x-2'>
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page <= 1}
                  className='px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Previous
                </button>

                <span className='px-4 py-2 text-gray-300'>
                  Page {filters.page} of {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page >= totalPages}
                  className='px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !error && accounts.length === 0 && (
          <div className='text-center py-12'>
            <Icon icon='mdi:steam' className='text-6xl text-gray-600 mx-auto mb-4' />
            <p className='text-gray-400 text-lg mb-2'>No Steam accounts found</p>
            <p className='text-gray-500 text-sm mb-4'>
              Try adjusting your filters or search criteria
            </p>
            <button
              onClick={() => fetchAccounts()}
              className='bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors'
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SteamPage
