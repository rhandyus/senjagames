import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import InfiniteInstagramAccountsContainer from './InfiniteInstagramAccountsContainer'
import InstagramFilters from './InstagramFilters'

const InstagramPage = () => {
  const [filters, setFilters] = useState({})
  const { user } = useAuth()

  const handleFiltersChange = newFilters => {
    setFilters(newFilters)
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50'>
      {/* Header */}
      <div className='bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white'>
        <div className='max-w-7xl mx-auto px-4 py-8'>
          <div className='flex items-center space-x-4'>
            <div className='text-4xl'>📷</div>
            <div>
              <h1 className='text-3xl font-bold'>Instagram Accounts</h1>
              <p className='text-purple-100 mt-2'>
                Premium Instagram accounts with followers, posts, and verification features
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
          {/* Filters Sidebar */}
          <div className='lg:col-span-1'>
            <div className='sticky top-4'>
              <InstagramFilters onFiltersChange={handleFiltersChange} initialFilters={filters} />
            </div>
          </div>

          {/* Main Content */}
          <div className='lg:col-span-3'>
            <InfiniteInstagramAccountsContainer filters={filters} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstagramPage
