import { useState } from 'react'
import EpicFilters from './EpicFilters'
import InfiniteEpicAccountsContainer from './InfiniteEpicAccountsContainer'

const EpicPage = ({ onBack }) => {
  const [filters, setFilters] = useState({})

  const handleFiltersChange = newFilters => {
    console.log('Epic filters changed:', newFilters)
    setFilters(newFilters)
  }

  return (
    <div className='min-h-screen bg-gray-900'>
      {/* Header */}
      <div className='bg-gray-800 border-b border-gray-700 p-4'>
        <div className='max-w-7xl mx-auto flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <button onClick={onBack} className='text-gray-400 hover:text-white transition-colors'>
              ← Back
            </button>
            <h1 className='text-2xl font-bold text-white'>Epic Games Accounts</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex'>
        {/* Filters Sidebar */}
        <div className='w-80 bg-gray-800 min-h-screen border-r border-gray-700'>
          <EpicFilters onFiltersChange={handleFiltersChange} />
        </div>

        {/* Accounts Container */}
        <div className='flex-1'>
          <InfiniteEpicAccountsContainer filters={filters} />
        </div>
      </div>
    </div>
  )
}

export default EpicPage
