import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import InfiniteUplayAccountsContainer from './InfiniteUplayAccountsContainer'
import UplayFilters from './UplayFilters'

const UplayPage = () => {
  const { user } = useAuth()
  const [filters, setFilters] = useState({})

  const handleFiltersChange = newFilters => {
    setFilters(newFilters)
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-white mb-2'>Uplay Accounts</h1>
          <p className='text-gray-300'>Premium Ubisoft gaming accounts with verified access</p>
        </div>

        {/* Main Content */}
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
          {/* Filters Sidebar */}
          <div className='lg:col-span-1'>
            <div className='sticky top-4'>
              <UplayFilters onFiltersChange={handleFiltersChange} initialFilters={filters} />
            </div>
          </div>

          {/* Accounts Grid */}
          <div className='lg:col-span-3'>
            <InfiniteUplayAccountsContainer filters={filters} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default UplayPage
