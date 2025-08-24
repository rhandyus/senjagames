import { Icon } from '@iconify/react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import InfiniteTikTokAccountsContainer from './InfiniteTikTokAccountsContainer'
import TikTokFilters from './TikTokFilters'

const TikTokPage = () => {
  const [filters, setFilters] = useState({})
  const { user } = useAuth()

  return (
    <div className='min-h-screen bg-gray-950'>
      {/* Header */}
      <div className='bg-gradient-to-r from-pink-600 to-purple-700 px-4 py-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='flex items-center space-x-4 mb-4'>
            <Icon icon='logos:tiktok-icon' className='text-4xl' />
            <div>
              <h1 className='text-3xl font-bold text-white'>TikTok Accounts</h1>
              <p className='text-pink-100 mt-1'>
                Premium TikTok accounts with followers, verified status, and more
              </p>
            </div>
          </div>

          <div className='flex items-center space-x-4 text-pink-100 text-sm'>
            <div className='flex items-center space-x-1'>
              <Icon icon='mdi:check-circle' className='text-green-400' />
              <span>Verified accounts available</span>
            </div>
            <div className='flex items-center space-x-1'>
              <Icon icon='mdi:email' className='text-blue-400' />
              <span>Email access included</span>
            </div>
            <div className='flex items-center space-x-1'>
              <Icon icon='mdi:shield-check' className='text-yellow-400' />
              <span>Warranty protection</span>
            </div>
            {user && (
              <div className='flex items-center space-x-1'>
                <Icon icon='mdi:account-check' className='text-purple-400' />
                <span>Instant delivery</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Filters Sidebar */}
          <div className='lg:w-80 flex-shrink-0'>
            <TikTokFilters onFiltersChange={setFilters} className='w-full' />
          </div>

          {/* Accounts Grid */}
          <div className='flex-1 min-w-0'>
            <InfiniteTikTokAccountsContainer filters={filters} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TikTokPage
