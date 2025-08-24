import { Icon } from '@iconify/react'
import { useAuth } from '../context/AuthContext'
import DiscordFilters from './DiscordFilters'
import InfiniteDiscordAccountsContainer from './InfiniteDiscordAccountsContainer'

const DiscordPage = () => {
  const { user } = useAuth()

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center space-x-4'>
            <div className='bg-purple-600 p-3 rounded-xl'>
              <Icon icon='logos:discord-icon' className='text-3xl text-white' />
            </div>
            <div>
              <h1 className='text-3xl font-bold text-white'>Discord Accounts</h1>
              <p className='text-gray-300 mt-1'>Premium Discord accounts with verified features</p>
            </div>
          </div>

          {user && (
            <div className='bg-gray-800 border border-gray-700 rounded-lg px-4 py-2'>
              <div className='text-gray-300 text-sm'>Welcome back,</div>
              <div className='text-white font-semibold'>{user.displayName || user.email}</div>
            </div>
          )}
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
          {/* Filters Sidebar */}
          <div className='lg:col-span-1'>
            <DiscordFilters
              onFiltersChange={filters => {
                console.log('Discord filters changed:', filters)
              }}
              initialFilters={{}}
            />
          </div>

          {/* Accounts Grid */}
          <div className='lg:col-span-3'>
            <InfiniteDiscordAccountsContainer filters={{}} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DiscordPage
