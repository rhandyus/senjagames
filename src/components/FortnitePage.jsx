import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import FortniteFilters from './FortniteFilters'

const FortnitePage = ({ onBack }) => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Mock Fortnite account data
  const mockAccounts = [
    {
      id: 1,
      title: 'Fortnite Account - Raven + Skull Trooper',
      platform: 'Epic',
      level: 156,
      skins: ['Raven', 'Skull Trooper', 'Black Knight'],
      vbucks: 2500,
      price: 75.0,
      battlePass: true,
      stw: true,
      email_changeable: true,
      warranty: '24 hours',
      seller: 'FortniteKing',
      views: 234,
      image: '/api/placeholder/300/200'
    },
    {
      id: 2,
      title: 'Epic Account - Galaxy Skin + iKONIK',
      platform: 'Epic',
      level: 89,
      skins: ['Galaxy', 'iKONIK', 'Ghoul Trooper'],
      vbucks: 1200,
      price: 120.0,
      battlePass: false,
      stw: false,
      email_changeable: false,
      warranty: '12 hours',
      seller: 'SkinMaster',
      views: 456,
      image: '/api/placeholder/300/200'
    },
    {
      id: 3,
      title: 'Rare Fortnite Account - OG Collection',
      platform: 'EpicPC',
      level: 267,
      skins: ['Recon Expert', 'Aerial Assault Trooper', 'Renegade Raider'],
      vbucks: 850,
      price: 350.0,
      battlePass: true,
      stw: true,
      email_changeable: true,
      warranty: '3 days',
      seller: 'OGCollector',
      views: 1234,
      image: '/api/placeholder/300/200'
    },
    {
      id: 4,
      title: 'Fortnite Account - Fresh Collection',
      platform: 'Epic',
      level: 45,
      skins: ['Default', 'Commando', 'Ramirez'],
      vbucks: 500,
      price: 25.0,
      battlePass: false,
      stw: false,
      email_changeable: true,
      warranty: '24 hours',
      seller: 'FreshStart',
      views: 67,
      image: '/api/placeholder/300/200'
    },
    {
      id: 5,
      title: 'High Level Fortnite - Battle Pass Owner',
      platform: 'EpicAndroid',
      level: 312,
      skins: ['Ice King', 'Omega', 'Carbide', 'The Visitor'],
      vbucks: 3200,
      price: 180.0,
      battlePass: true,
      stw: true,
      email_changeable: false,
      warranty: '12 hours',
      seller: 'BattlePassPro',
      views: 789,
      image: '/api/placeholder/300/200'
    },
    {
      id: 6,
      title: 'Fortnite Account - Save the World Ready',
      platform: 'Epic',
      level: 134,
      skins: ['Lynx', 'Calamity', 'Drift', 'Ragnarok'],
      vbucks: 1800,
      price: 95.0,
      battlePass: true,
      stw: true,
      email_changeable: true,
      warranty: '24 hours',
      seller: 'STWMaster',
      views: 345,
      image: '/api/placeholder/300/200'
    }
  ]

  // Simulate API call
  const fetchFortniteAccounts = async (newFilters = filters) => {
    setLoading(true)
    setError(null)

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Filter accounts based on filters
      let filteredAccounts = [...mockAccounts]

      if (newFilters.platform) {
        filteredAccounts = filteredAccounts.filter(
          account => account.platform === newFilters.platform
        )
      }

      if (newFilters.lmin) {
        filteredAccounts = filteredAccounts.filter(
          account => account.level >= parseInt(newFilters.lmin)
        )
      }

      if (newFilters.lmax) {
        filteredAccounts = filteredAccounts.filter(
          account => account.level <= parseInt(newFilters.lmax)
        )
      }

      if (newFilters.vbmin) {
        filteredAccounts = filteredAccounts.filter(
          account => account.vbucks >= parseInt(newFilters.vbmin)
        )
      }

      if (newFilters.vbmax) {
        filteredAccounts = filteredAccounts.filter(
          account => account.vbucks <= parseInt(newFilters.vbmax)
        )
      }

      if (newFilters.bp === 'yes') {
        filteredAccounts = filteredAccounts.filter(account => account.battlePass)
      } else if (newFilters.bp === 'no') {
        filteredAccounts = filteredAccounts.filter(account => !account.battlePass)
      }

      if (newFilters.stw === 'yes') {
        filteredAccounts = filteredAccounts.filter(account => account.stw)
      } else if (newFilters.stw === 'no') {
        filteredAccounts = filteredAccounts.filter(account => !account.stw)
      }

      if (newFilters.change_email === 'yes') {
        filteredAccounts = filteredAccounts.filter(account => account.email_changeable)
      } else if (newFilters.change_email === 'no') {
        filteredAccounts = filteredAccounts.filter(account => !account.email_changeable)
      }

      // Sort accounts
      if (newFilters.order_by === 'price_to_up') {
        filteredAccounts.sort((a, b) => a.price - b.price)
      } else if (newFilters.order_by === 'price_to_down') {
        filteredAccounts.sort((a, b) => b.price - a.price)
      } else if (newFilters.order_by === 'pdate_to_down_upload') {
        filteredAccounts.sort((a, b) => b.id - a.id)
      } else if (newFilters.order_by === 'pdate_to_up_upload') {
        filteredAccounts.sort((a, b) => a.id - b.id)
      }

      setAccounts(filteredAccounts)
      setTotalPages(Math.ceil(filteredAccounts.length / 10))
    } catch (err) {
      setError('Failed to fetch Fortnite accounts')
      console.error('Error fetching Fortnite accounts:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle filter changes
  const handleFiltersChange = newFilters => {
    setFilters(newFilters)
    setCurrentPage(1)
    fetchFortniteAccounts(newFilters)
  }

  // Load initial data
  useEffect(() => {
    fetchFortniteAccounts()
  }, [])

  const formatPrice = price => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price * 15000) // Convert USD to IDR
  }

  const getPlatformIcon = platform => {
    switch (platform) {
      case 'Epic':
      case 'EpicPC':
      case 'EpicAndroid':
      case 'EpicIOS':
      case 'EpicPCKorea':
        return 'simple-icons:epicgames'
      case 'GooglePlay':
        return 'mdi:google-play'
      case 'IOSAppStore':
        return 'mdi:apple-ios'
      case 'PSN':
        return 'mdi:sony-playstation'
      case 'Nintendo':
        return 'mdi:nintendo-switch'
      case 'xbl':
        return 'mdi:xbox'
      default:
        return 'mdi:gamepad-variant'
    }
  }

  return (
    <div className='min-h-screen bg-gray-950 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center mb-4'>
            <button
              onClick={onBack}
              className='mr-4 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors'
            >
              <Icon icon='mdi:arrow-left' className='text-xl text-gray-300' />
            </button>
            <Icon icon='simple-icons:epicgames' className='text-4xl text-purple-500 mr-3' />
            <div>
              <h1 className='text-3xl font-bold text-white'>Fortnite Accounts</h1>
              <p className='text-gray-400'>Find premium Fortnite accounts with rare skins</p>
            </div>
          </div>

          <div className='flex items-center text-sm text-gray-400'>
            <Icon icon='mdi:account-group' className='mr-2' />
            <span>{accounts.length} accounts available</span>
            {loading && (
              <>
                <Icon icon='mdi:loading' className='ml-4 mr-2 animate-spin' />
                <span>Loading...</span>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className='mb-8'>
          <FortniteFilters onFiltersChange={handleFiltersChange} initialFilters={filters} />
        </div>

        {/* Error Message */}
        {error && (
          <div className='mb-6 bg-red-900/50 border border-red-600 rounded-lg p-4'>
            <div className='flex items-center'>
              <Icon icon='mdi:alert-circle' className='text-red-500 mr-2' />
              <span className='text-red-200'>{error}</span>
            </div>
          </div>
        )}

        {/* Results */}
        <div className='space-y-6'>
          {loading ? (
            <div className='flex justify-center items-center py-12'>
              <Icon icon='mdi:loading' className='text-4xl text-purple-500 animate-spin mr-3' />
              <span className='text-gray-300'>Loading Fortnite accounts...</span>
            </div>
          ) : accounts.length === 0 ? (
            <div className='text-center py-12'>
              <Icon icon='mdi:account-search' className='text-6xl text-gray-600 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-gray-300 mb-2'>No accounts found</h3>
              <p className='text-gray-500'>Try adjusting your filters to find more accounts</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {accounts.map(account => (
                <div
                  key={account.id}
                  className='bg-gray-900 rounded-lg border border-gray-700 overflow-hidden hover:border-purple-500 transition-colors'
                >
                  {/* Account Image */}
                  <div className='relative h-48 bg-gradient-to-br from-purple-900 to-blue-900'>
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <Icon icon='simple-icons:epicgames' className='text-6xl text-white/20' />
                    </div>
                    <div className='absolute top-3 left-3'>
                      <Icon
                        icon={getPlatformIcon(account.platform)}
                        className='text-2xl text-white bg-black/50 rounded p-1'
                      />
                    </div>
                    <div className='absolute top-3 right-3 bg-green-600 text-white text-xs px-2 py-1 rounded-full'>
                      {account.warranty}
                    </div>
                  </div>

                  {/* Account Info */}
                  <div className='p-4'>
                    <h3 className='text-lg font-semibold text-white mb-2 line-clamp-2'>
                      {account.title}
                    </h3>

                    {/* Stats */}
                    <div className='grid grid-cols-2 gap-4 mb-4 text-sm'>
                      <div className='text-gray-400'>
                        <Icon icon='mdi:trophy' className='inline mr-1' />
                        Level {account.level}
                      </div>
                      <div className='text-gray-400'>
                        <Icon icon='mdi:tshirt-crew' className='inline mr-1' />
                        {account.skins.length} skins
                      </div>
                      <div className='text-yellow-400'>
                        <Icon icon='mdi:coin' className='inline mr-1' />
                        {account.vbucks.toLocaleString()} V-Bucks
                      </div>
                      <div className='text-gray-400'>
                        <Icon icon='mdi:eye' className='inline mr-1' />
                        {account.views} views
                      </div>
                    </div>

                    {/* Features */}
                    <div className='flex flex-wrap gap-1 mb-4'>
                      {account.battlePass && (
                        <span className='bg-purple-600 text-white text-xs px-2 py-1 rounded-full'>
                          Battle Pass
                        </span>
                      )}
                      {account.stw && (
                        <span className='bg-orange-600 text-white text-xs px-2 py-1 rounded-full'>
                          STW
                        </span>
                      )}
                      {account.email_changeable && (
                        <span className='bg-green-600 text-white text-xs px-2 py-1 rounded-full'>
                          Email Change
                        </span>
                      )}
                    </div>

                    {/* Skins Preview */}
                    <div className='mb-4'>
                      <div className='text-sm text-gray-400 mb-1'>Featured Skins:</div>
                      <div className='text-sm text-gray-300'>
                        {account.skins.slice(0, 3).join(', ')}
                        {account.skins.length > 3 && ` +${account.skins.length - 3} more`}
                      </div>
                    </div>

                    {/* Seller & Price */}
                    <div className='flex items-center justify-between'>
                      <div className='text-sm text-gray-400'>by {account.seller}</div>
                      <div className='text-right'>
                        <div className='text-sm text-gray-400'>${account.price.toFixed(2)}</div>
                        <div className='text-lg font-bold text-purple-400'>
                          {formatPrice(account.price)}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button className='w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center'>
                      <Icon icon='mdi:cart-plus' className='mr-2' />
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {accounts.length > 0 && totalPages > 1 && (
            <div className='flex justify-center items-center space-x-2 mt-8'>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className='px-3 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <Icon icon='mdi:chevron-left' />
              </button>

              <span className='text-gray-300'>
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className='px-3 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <Icon icon='mdi:chevron-right' />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FortnitePage
