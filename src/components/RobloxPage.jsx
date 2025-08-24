import InfiniteRobloxAccountsContainer from './InfiniteRobloxAccountsContainer'
import RobloxFilters from './RobloxFilters'

const RobloxPage = ({ filters, onFiltersChange }) => {
  console.log('🎮 RobloxPage rendered with filters:', filters)

  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div className='bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6'>
        <div className='flex items-center space-x-4'>
          <div className='w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center'>
            <svg viewBox='0 0 24 24' className='w-8 h-8 text-white' fill='currentColor'>
              <path d='M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2M12 6.5L11.5 8.5L9.5 9L11.5 9.5L12 11.5L12.5 9.5L14.5 9L12.5 8.5L12 6.5Z' />
            </svg>
          </div>
          <div>
            <h1 className='text-3xl font-bold text-white'>Roblox Accounts</h1>
            <p className='text-gray-400 mt-1'>
              Premium Roblox accounts with Robux, pets, and limited items
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-700'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-red-400'>Premium</div>
            <div className='text-sm text-gray-400'>High-quality accounts</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-green-400'>Robux</div>
            <div className='text-sm text-gray-400'>Loaded with currency</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-purple-400'>Limiteds</div>
            <div className='text-sm text-gray-400'>Rare collectibles</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <RobloxFilters onFiltersChange={onFiltersChange} initialFilters={filters} />

      {/* Accounts Container */}
      <InfiniteRobloxAccountsContainer filters={filters} />
    </div>
  )
}

export default RobloxPage
