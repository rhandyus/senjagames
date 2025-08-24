import { useState } from 'react'
import EscapeFromTarkovFilters from './EscapeFromTarkovFilters'
import InfiniteEscapeFromTarkovAccountsContainer from './InfiniteEscapeFromTarkovAccountsContainer'

const EscapeFromTarkovPage = () => {
  const [filters, setFilters] = useState({
    order_by: 'price_to_up'
  })

  const handleFiltersChange = newFilters => {
    console.log('🎯 Escape From Tarkov filters changed:', newFilters)
    setFilters(newFilters)
  }

  return (
    <div className='container mx-auto px-4 py-6'>
      <div className='text-center mb-6'>
        <h1 className='text-3xl font-bold text-white mb-2'>🔫 Escape From Tarkov Accounts</h1>
        <p className='text-gray-400'>Premium Tarkov accounts with various editions and levels</p>
      </div>

      <EscapeFromTarkovFilters onFiltersChange={handleFiltersChange} initialFilters={filters} />
      <InfiniteEscapeFromTarkovAccountsContainer filters={filters} />
    </div>
  )
}

export default EscapeFromTarkovPage
