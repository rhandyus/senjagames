import { useState } from 'react'
import InfiniteSocialClubAccountsContainer from './InfiniteSocialClubAccountsContainer'
import SocialClubFilters from './SocialClubFilters'

const SocialClubPage = () => {
  const [filters, setFilters] = useState({})

  const handleFiltersChange = newFilters => {
    console.log('🎮 Social Club filters changed:', newFilters)
    setFilters(newFilters)
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-gradient-to-r from-orange-600 to-red-600 text-white py-12'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center'>
            <div className='flex justify-center mb-4'>
              <svg className='w-16 h-16' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' />
              </svg>
            </div>
            <h1 className='text-4xl font-bold mb-4'>Rockstar Social Club Accounts</h1>
            <p className='text-xl opacity-90 max-w-3xl mx-auto'>
              Premium Social Club accounts with GTA V, Red Dead Redemption 2, and more Rockstar
              games. High levels, cash, and verified accounts available.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Filters */}
        <SocialClubFilters onFiltersChange={handleFiltersChange} initialFilters={filters} />

        {/* Accounts Container */}
        <InfiniteSocialClubAccountsContainer filters={filters} />
      </div>

      {/* Footer Info */}
      <div className='bg-gray-800 text-white py-8 mt-12'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div>
              <h3 className='text-lg font-semibold mb-3 flex items-center space-x-2'>
                <svg className='w-5 h-5 text-orange-400' fill='currentColor' viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                    clipRule='evenodd'
                  />
                </svg>
                <span>Account Quality</span>
              </h3>
              <p className='text-gray-300 text-sm'>
                All accounts are verified and checked for functionality. We offer various account
                levels and cash amounts to suit your gaming needs.
              </p>
            </div>
            <div>
              <h3 className='text-lg font-semibold mb-3 flex items-center space-x-2'>
                <svg className='w-5 h-5 text-orange-400' fill='currentColor' viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
                    clipRule='evenodd'
                  />
                </svg>
                <span>Security & Support</span>
              </h3>
              <p className='text-gray-300 text-sm'>
                Secure payment processing and customer support available. All transactions are
                protected with our guarantee system.
              </p>
            </div>
            <div>
              <h3 className='text-lg font-semibold mb-3 flex items-center space-x-2'>
                <svg className='w-5 h-5 text-orange-400' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
                <span>Game Library</span>
              </h3>
              <p className='text-gray-300 text-sm'>
                Access to GTA V, Red Dead Redemption 2, L.A. Noire, Max Payne 3, and other Rockstar
                titles included with many accounts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SocialClubPage
