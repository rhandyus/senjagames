import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import { convertToIDR, formatCurrency, formatUSD } from '../utils/currency'

const OriginAccountCard = ({ account }) => {
  // Extract EA games data
  const eaGames = account.ea_games || {}
  const gamesArray = Object.values(eaGames)
  const totalGames = gamesArray.length

  // Calculate total played hours across all games
  const totalPlayedHours = gamesArray.reduce((total, game) => {
    const played = parseFloat(game.total_played) || 0
    return total + played
  }, 0)

  // Get last activity (most recent among all games)
  const getLastActivity = () => {
    const activities = gamesArray
      .map(game => parseInt(game.last_activity))
      .filter(activity => !isNaN(activity))

    if (activities.length === 0) return null
    return Math.min(...activities) // Lowest number = most recent
  }

  const lastActivity = getLastActivity()

  // Get display games (top 3 most played or with images)
  const getDisplayGames = () => {
    return gamesArray
      .filter(game => game.img || game.total_played > 0)
      .sort((a, b) => (parseFloat(b.total_played) || 0) - (parseFloat(a.total_played) || 0))
      .slice(0, 3)
  }

  const displayGames = getDisplayGames()

  // Status indicators
  const getCountryColor = country => {
    const highRiskCountries = ['RU', 'CN', 'TR', 'BR']
    const mediumRiskCountries = ['PL', 'DE', 'FR', 'IT']

    if (highRiskCountries.includes(country)) return 'text-red-400'
    if (mediumRiskCountries.includes(country)) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getActivityStatus = days => {
    if (!days && days !== 0) return { color: 'text-gray-400', text: 'Unknown' }
    if (days <= 7) return { color: 'text-red-400', text: 'Very Recent' }
    if (days <= 30) return { color: 'text-yellow-400', text: 'Recent' }
    if (days <= 90) return { color: 'text-green-400', text: 'Good' }
    return { color: 'text-blue-400', text: 'Old' }
  }

  const activityStatus = getActivityStatus(lastActivity)

  const getOriginColor = origin => {
    const colors = {
      personal: 'text-green-400',
      resale: 'text-yellow-400',
      stealer: 'text-red-400',
      phishing: 'text-red-400',
      brute: 'text-orange-400',
      autoreg: 'text-blue-400',
      dummy: 'text-purple-400'
    }
    return colors[origin?.toLowerCase()] || 'text-gray-400'
  }

  return (
    <div className='bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 hover:border-orange-500 transition-all duration-300 shadow-lg hover:shadow-xl group'>
      {/* Header */}
      <div className='p-4 border-b border-gray-700'>
        <div className='flex items-center justify-between mb-2'>
          <div className='flex items-center space-x-2'>
            <Icon icon='simple-icons:ea' className='text-orange-400 text-xl' />
            <span className='font-semibold text-gray-200'>Origin Account</span>
          </div>
          <div className='flex items-center space-x-2'>
            {account.country && (
              <span className={`text-sm font-medium ${getCountryColor(account.country)}`}>
                {account.country}
              </span>
            )}
            <Icon icon='mdi:flag' className={getCountryColor(account.country)} />
          </div>
        </div>

        {/* Price Display */}
        <div className='flex items-center justify-between'>
          <div className='space-y-1'>
            <div className='text-2xl font-bold text-orange-400'>
              {formatCurrency(convertToIDR(account.price))}
            </div>
            <div className='text-sm text-gray-400'>{formatUSD(account.price)}</div>
          </div>

          {/* Mail Status */}
          <div className='text-right'>
            <div className='flex items-center space-x-1'>
              <Icon
                icon={account.mail ? 'mdi:email' : 'mdi:email-off'}
                className={account.mail ? 'text-green-400' : 'text-red-400'}
              />
              <span className={`text-sm ${account.mail ? 'text-green-400' : 'text-red-400'}`}>
                {account.mail ? 'Mail Access' : 'No Mail'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* EA Games Section */}
      <div className='p-4 border-b border-gray-700'>
        <div className='flex items-center justify-between mb-3'>
          <h4 className='text-sm font-medium text-gray-300 flex items-center space-x-1'>
            <Icon icon='mdi:gamepad-variant' className='text-orange-400' />
            <span>EA Games ({totalGames})</span>
          </h4>
          <span className='text-xs text-gray-400'>{totalPlayedHours.toFixed(1)}h total</span>
        </div>

        {displayGames.length > 0 ? (
          <div className='space-y-2'>
            {displayGames.map((game, index) => (
              <div key={index} className='flex items-center space-x-3 p-2 bg-gray-800 rounded-lg'>
                {game.img ? (
                  <img
                    src={game.img}
                    alt={game.title}
                    className='w-8 h-8 object-cover rounded'
                    onError={e => {
                      e.target.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className='w-8 h-8 bg-gray-700 rounded flex items-center justify-center'>
                    <Icon icon='mdi:gamepad' className='text-gray-400 text-sm' />
                  </div>
                )}
                <div className='flex-1 min-w-0'>
                  <div className='text-sm font-medium text-gray-200 truncate'>{game.title}</div>
                  <div className='text-xs text-gray-400'>
                    {parseFloat(game.total_played) > 0
                      ? `${parseFloat(game.total_played).toFixed(1)}h played`
                      : 'Not played'}
                  </div>
                </div>
              </div>
            ))}

            {totalGames > 3 && (
              <div className='text-center py-2'>
                <span className='text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full'>
                  +{totalGames - 3} more games
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className='text-center py-4'>
            <Icon icon='mdi:gamepad-off' className='text-gray-600 text-2xl mb-2 mx-auto' />
            <p className='text-gray-500 text-sm'>No games available</p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className='p-4'>
        <div className='grid grid-cols-2 gap-4 mb-4'>
          {/* Origin */}
          <div className='bg-gray-800 rounded-lg p-3'>
            <div className='flex items-center space-x-2 mb-1'>
              <Icon icon='mdi:source-branch' className='text-gray-400 text-sm' />
              <span className='text-xs text-gray-400'>Origin</span>
            </div>
            <div className={`text-sm font-medium capitalize ${getOriginColor(account.origin)}`}>
              {account.origin || 'Unknown'}
            </div>
          </div>

          {/* Last Activity */}
          <div className='bg-gray-800 rounded-lg p-3'>
            <div className='flex items-center space-x-2 mb-1'>
              <Icon icon='mdi:clock-outline' className='text-gray-400 text-sm' />
              <span className='text-xs text-gray-400'>Activity</span>
            </div>
            <div className={`text-sm font-medium ${activityStatus.color}`}>
              {lastActivity !== null ? `${lastActivity}d ago` : activityStatus.text}
            </div>
          </div>

          {/* Total Games */}
          <div className='bg-gray-800 rounded-lg p-3'>
            <div className='flex items-center space-x-2 mb-1'>
              <Icon icon='mdi:gamepad-variant' className='text-gray-400 text-sm' />
              <span className='text-xs text-gray-400'>Games</span>
            </div>
            <div className='text-sm font-medium text-orange-400'>{totalGames} games</div>
          </div>

          {/* Total Played */}
          <div className='bg-gray-800 rounded-lg p-3'>
            <div className='flex items-center space-x-2 mb-1'>
              <Icon icon='mdi:timer' className='text-gray-400 text-sm' />
              <span className='text-xs text-gray-400'>Played</span>
            </div>
            <div className='text-sm font-medium text-blue-400'>{totalPlayedHours.toFixed(1)}h</div>
          </div>
        </div>

        {/* Action Button */}
        <Link
          to={`/account-detail/${account.id}`}
          state={{ account, type: 'origin' }}
          className='w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 group-hover:shadow-lg'
        >
          <Icon icon='mdi:eye' />
          <span>View Details</span>
        </Link>
      </div>
    </div>
  )
}

export default OriginAccountCard
