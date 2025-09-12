import { useCallback, useState } from 'react'
import InfiniteMinecraftAccountsContainer from './InfiniteMinecraftAccountsContainer'
import MinecraftFilters from './MinecraftFilters'

const MinecraftPage = () => {
  const [filters, setFilters] = useState({
    pmin: '26', // Default minimum price of 26 RUB (for API)
    pmax: '',
    order_by: 'price_to_up',
    email_type: '',
    change_nickname: '',
    java: '',
    bedrock: '',
    dungeons: '',
    legends: ''
  })

  const handleFiltersChange = useCallback(newFilters => {
    setFilters(prevFilters => {
      // Only update if filters actually changed
      if (JSON.stringify(prevFilters) !== JSON.stringify(newFilters)) {
        return newFilters
      }
      return prevFilters
    })
  }, [])

  return (
    <div className='minecraft-page'>
      <div className='space-y-6'>
        {/* Page Header */}
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-white mb-2'>Minecraft Accounts</h1>
          <p className='text-gray-400'>Premium Minecraft accounts with Java & Bedrock editions</p>
        </div>

        {/* Filters */}
        <MinecraftFilters onFiltersChange={handleFiltersChange} initialFilters={filters} />

        {/* Accounts Container */}
        <InfiniteMinecraftAccountsContainer filters={filters} />
      </div>
    </div>
  )
}

export default MinecraftPage
