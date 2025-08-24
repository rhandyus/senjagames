import SteamAccountCard from './SteamAccountCard'

const SteamAccountsContainer = ({ accounts, loading, error }) => {
  // Filter accounts to only show those with games
  const accountsWithGames =
    accounts?.filter(account => {
      const hasGames =
        (account.steam_full_games?.list && Object.keys(account.steam_full_games.list).length > 0) ||
        (account.games && Array.isArray(account.games) && account.games.length > 0) ||
        (account.steam_game_count && account.steam_game_count > 0) ||
        (account.gameCount && account.gameCount > 0)
      return hasGames
    }) || []

  if (loading) {
    return (
      <div className='account-container'>
        {[...Array(12)].map((_, index) => (
          <div
            key={index}
            className='account bg-gray-900 rounded-lg border border-gray-700 p-6 animate-pulse'
          >
            <div className='flex justify-between items-start mb-4'>
              <div className='h-8 bg-gray-700 rounded w-20'></div>
              <div className='h-6 bg-gray-700 rounded w-16'></div>
            </div>
            <div className='space-y-3 mb-4'>
              <div className='h-4 bg-gray-700 rounded w-full'></div>
              <div className='h-4 bg-gray-700 rounded w-3/4'></div>
              <div className='h-4 bg-gray-700 rounded w-1/2'></div>
            </div>
            <div className='h-10 bg-gray-700 rounded w-full'></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className='bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-6'>
        <p className='font-medium'>Error loading Steam accounts:</p>
        <p className='text-sm mt-1'>{error}</p>
      </div>
    )
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-400 text-lg'>No Steam accounts found</p>
        <p className='text-gray-500 text-sm mt-2'>Try adjusting your filters or check back later</p>
      </div>
    )
  }

  if (accountsWithGames.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-400 text-lg'>No Steam accounts with games found</p>
        <p className='text-gray-500 text-sm mt-2'>
          Found {accounts.length} accounts, but none have games data
        </p>
      </div>
    )
  }

  return (
    <div className='account-container grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
      {accountsWithGames.map(account => (
        <SteamAccountCard key={account.item_id || account.id} account={account} />
      ))}
    </div>
  )
}

export default SteamAccountsContainer
