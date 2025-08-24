import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'
import TelegramAccountCard from './TelegramAccountCard'
import TelegramFilters from './TelegramFilters'

const TelegramPage = () => {
  const [accounts, setAccounts] = useState([])
  const [filteredAccounts, setFilteredAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const accountsPerPage = 20

  // Load initial data from server endpoint
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      console.log('📱 Fetching Telegram accounts from server endpoint...')

      // Fetch from server endpoint instead of direct API call
      const response = await fetch('/api/lzt/telegram')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('📊 Telegram accounts response:', data)

      // Extract accounts from API response
      const accountsData = data.items || []
      setAccounts(accountsData)
      setFilteredAccounts(accountsData.slice(0, accountsPerPage))
      setTotalPages(Math.ceil(accountsData.length / accountsPerPage))
    } catch (error) {
      console.error('❌ Error loading Telegram accounts:', error)
      setAccounts([])
      setFilteredAccounts([])
    } finally {
      setLoading(false)
    }
  }

  // Filter accounts based on the applied filters
  const applyFilters = filters => {
    setLoading(true)
    setCurrentPage(1)

    try {
      let filtered = [...accounts]

      // Price filters
      if (filters.pmin) {
        const minPrice = parseFloat(filters.pmin)
        filtered = filtered.filter(account => account.price >= minPrice)
      }
      if (filters.pmax) {
        const maxPrice = parseFloat(filters.pmax)
        filtered = filtered.filter(account => account.price <= maxPrice)
      }

      // Title search
      if (filters.title) {
        const searchTerm = filters.title.toLowerCase()
        filtered = filtered.filter(
          account =>
            (account.title && account.title.toLowerCase().includes(searchTerm)) ||
            (account.title_en && account.title_en.toLowerCase().includes(searchTerm))
        )
      }

      // Telegram specific filters
      if (filters.min_channels) {
        filtered = filtered.filter(
          account => account.telegram_channels_count >= parseInt(filters.min_channels)
        )
      }
      if (filters.max_channels) {
        filtered = filtered.filter(
          account => account.telegram_channels_count <= parseInt(filters.max_channels)
        )
      }
      if (filters.min_chats) {
        filtered = filtered.filter(
          account => account.telegram_chats_count >= parseInt(filters.min_chats)
        )
      }
      if (filters.max_chats) {
        filtered = filtered.filter(
          account => account.telegram_chats_count <= parseInt(filters.max_chats)
        )
      }
      if (filters.min_conversations) {
        filtered = filtered.filter(
          account => account.telegram_conversations_count >= parseInt(filters.min_conversations)
        )
      }
      if (filters.max_conversations) {
        filtered = filtered.filter(
          account => account.telegram_conversations_count <= parseInt(filters.max_conversations)
        )
      }
      if (filters.min_admin) {
        filtered = filtered.filter(
          account => account.telegram_admin_count >= parseInt(filters.min_admin)
        )
      }
      if (filters.max_admin) {
        filtered = filtered.filter(
          account => account.telegram_admin_count <= parseInt(filters.max_admin)
        )
      }
      if (filters.min_contacts) {
        filtered = filtered.filter(
          account => account.telegram_contacts_count >= parseInt(filters.min_contacts)
        )
      }
      if (filters.max_contacts) {
        filtered = filtered.filter(
          account => account.telegram_contacts_count <= parseInt(filters.max_contacts)
        )
      }
      if (filters.min_gifts) {
        filtered = filtered.filter(
          account => account.telegram_gifts_count >= parseInt(filters.min_gifts)
        )
      }
      if (filters.max_gifts) {
        filtered = filtered.filter(
          account => account.telegram_gifts_count <= parseInt(filters.max_gifts)
        )
      }

      // ID digit count
      if (filters.dig_min || filters.dig_max) {
        filtered = filtered.filter(account => {
          const idCount = account.telegram_id_count || 0
          const minValid = !filters.dig_min || idCount >= parseInt(filters.dig_min)
          const maxValid = !filters.dig_max || idCount <= parseInt(filters.dig_max)
          return minValid && maxValid
        })
      }

      // Days inactive
      if (filters.daybreak) {
        const maxInactiveDays = parseInt(filters.daybreak)
        const cutoffTime = Date.now() / 1000 - maxInactiveDays * 24 * 60 * 60
        filtered = filtered.filter(
          account => account.telegram_last_seen && account.telegram_last_seen >= cutoffTime
        )
      }

      // Origin filters
      if (filters.origin && filters.origin.length > 0) {
        filtered = filtered.filter(account => filters.origin.includes(account.item_origin))
      }
      if (filters.not_origin && filters.not_origin.length > 0) {
        filtered = filtered.filter(account => !filters.not_origin.includes(account.item_origin))
      }

      // Country filters
      if (filters.country && filters.country.length > 0) {
        filtered = filtered.filter(account => filters.country.includes(account.telegram_country))
      }
      if (filters.not_country && filters.not_country.length > 0) {
        filtered = filtered.filter(
          account => !filters.not_country.includes(account.telegram_country)
        )
      }

      // DC ID filters
      if (filters.dc_id && filters.dc_id.length > 0) {
        filtered = filtered.filter(account => filters.dc_id.includes(account.telegram_dc_id))
      }
      if (filters.not_dc_id && filters.not_dc_id.length > 0) {
        filtered = filtered.filter(account => !filters.not_dc_id.includes(account.telegram_dc_id))
      }

      // Spam block filter
      if (filters.spam && filters.spam !== 'all') {
        const hasSpamBlock = filters.spam === 'yes'
        filtered = filtered.filter(account => {
          const spamBlock = account.telegram_spam_block
          if (hasSpamBlock) {
            return spamBlock === 1
          } else {
            return spamBlock === 0 || spamBlock === -1
          }
        })
      }

      // Premium filter
      if (filters.premium && filters.premium !== 'all') {
        const hasPremium = filters.premium === 'yes'
        filtered = filtered.filter(account => {
          return hasPremium ? account.telegram_premium === 1 : account.telegram_premium === 0
        })
      }

      // Sorting
      filtered.sort((a, b) => {
        switch (filters.order_by) {
          case 'price_to_up':
            return a.price - b.price
          case 'price_to_down':
            return b.price - a.price
          case 'pdate_to_down_upload':
            return b.published_date - a.published_date
          case 'pdate_to_up_upload':
            return a.published_date - b.published_date
          default:
            return a.price - b.price
        }
      })

      // Pagination
      const startIndex = (currentPage - 1) * accountsPerPage
      const endIndex = startIndex + accountsPerPage
      const paginatedAccounts = filtered.slice(startIndex, endIndex)

      setFilteredAccounts(paginatedAccounts)
      setTotalPages(Math.ceil(filtered.length / accountsPerPage))
    } catch (error) {
      console.error('Error filtering accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle page change
  const handlePageChange = newPage => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      // Re-apply current filters with new page
      // For now, we'll just slice the accounts based on page
      const startIndex = (newPage - 1) * accountsPerPage
      const endIndex = startIndex + accountsPerPage
      setFilteredAccounts(accounts.slice(startIndex, endIndex))
    }
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      {/* Header */}
      <div className='bg-gray-800 border-b border-gray-700 p-6'>
        <div className='container mx-auto'>
          <div className='flex items-center space-x-3'>
            <Icon icon='logos:telegram' className='w-8 h-8' />
            <h1 className='text-2xl font-bold'>Telegram Accounts</h1>
          </div>
          <p className='text-gray-400 mt-2'>
            Browse and purchase Telegram accounts with various features and configurations
          </p>
        </div>
      </div>

      <div className='container mx-auto p-6'>
        {/* Filters */}
        <TelegramFilters onFilterChange={applyFilters} loading={loading} />

        {/* Results Summary */}
        <div className='mb-6 flex justify-between items-center'>
          <div className='text-gray-400'>
            Showing {filteredAccounts.length} accounts
            {totalPages > 1 && (
              <span>
                {' '}
                (Page {currentPage} of {totalPages})
              </span>
            )}
          </div>
          {loading && (
            <div className='flex items-center text-blue-400'>
              <Icon icon='mdi:loading' className='animate-spin mr-2' />
              Loading accounts...
            </div>
          )}
        </div>

        {/* Accounts Grid */}
        {!loading && filteredAccounts.length === 0 ? (
          <div className='text-center py-12'>
            <Icon icon='mdi:telegram' className='w-16 h-16 mx-auto text-gray-600 mb-4' />
            <h3 className='text-xl font-semibold text-gray-400 mb-2'>No accounts found</h3>
            <p className='text-gray-500'>Try adjusting your filters to see more results</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6'>
            {filteredAccounts.map(account => (
              <TelegramAccountCard key={account.item_id} account={account} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='mt-8 flex justify-center'>
            <div className='flex space-x-2'>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className='px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors'
              >
                <Icon icon='mdi:chevron-left' />
              </button>

              {getPageNumbers().map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-4 py-2 border rounded-lg transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className='px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors'
              >
                <Icon icon='mdi:chevron-right' />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TelegramPage
