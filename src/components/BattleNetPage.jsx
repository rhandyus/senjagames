import { useCallback, useState } from 'react'
import BattleNetFilters from './BattleNetFilters'
import InfiniteBattleNetAccountsContainer from './InfiniteBattleNetAccountsContainer'

const BattleNetPage = () => {
  const [filters, setFilters] = useState({})

  // Stable callback to prevent unnecessary re-renders
  const handleFiltersChange = useCallback(newFilters => {
    console.log('🔍 Battle.net Filters changed:', newFilters)
    setFilters(newFilters)
  }, [])

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white'>
      {/* Header */}
      <div className='bg-gray-900/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10'>
        <div className='max-w-7xl mx-auto px-4 py-6'>
          <div className='flex items-center space-x-4'>
            <div className='w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center'>
              <svg viewBox='0 0 24 24' className='w-7 h-7 text-white' fill='currentColor'>
                <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' />
              </svg>
            </div>
            <div>
              <h1 className='text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent'>
                Battle.net Accounts
              </h1>
              <p className='text-gray-400 mt-1'>
                Premium Battle.net accounts for Call of Duty, Overwatch, Diablo and more
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='max-w-7xl mx-auto px-4 py-6'>
        {/* Filters */}
        <div className='mb-8'>
          <BattleNetFilters onFiltersChange={handleFiltersChange} />
        </div>

        {/* Accounts Container */}
        <InfiniteBattleNetAccountsContainer filters={filters} />
      </div>
    </div>
  )
}

export default BattleNetPage
