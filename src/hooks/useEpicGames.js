import { useEffect, useState } from 'react'

export const useEpicGames = () => {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchEpicGames = async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)

      if (forceRefresh) {
        console.log('🔄 Force refreshing Epic Games list...')
      } else {
        console.log('🎮 Fetching Epic Games list...')
      }
      
      // Add cache busting parameter when force refreshing
      const apiUrl = forceRefresh 
        ? `/api/unify?name=epicgamesgames&_t=${Date.now()}`
        : '/api/unify?name=epicgamesgames'
        
      const response = await fetch(apiUrl)

      if (!response.ok) {
        if (response.status === 429) {
          console.warn('⚠️ Rate limited, but continuing...')
          // Continue execution to see if we can get cached data
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      }

      const data = await response.json()
      console.log('✅ Epic Games data received:', data?.games?.length || data?.length || 0, 'games')
      console.log('🔍 First few games:', data?.games?.slice(0, 5) || data?.slice(0, 5))

      // Handle the response structure from LZT Market API
      const gamesList = data?.games || data || []

      // Check if we got valid data
      if (!Array.isArray(gamesList) || gamesList.length === 0) {
        throw new Error('No games data received from API')
      }

      // Transform the data to the expected format for dropdowns
      const transformedGames = Array.isArray(gamesList)
        ? gamesList.map((game, index) => {
            // Handle if game is a string or object
            if (typeof game === 'string') {
              return {
                value: index.toString(),
                label: game,
                abbr: '',
                url: ''
              }
            } else if (typeof game === 'object' && game !== null) {
              return {
                value: game.app_id || index.toString(),
                label: game.title || game.name || `Game ${index}`,
                abbr: game.abbr || '',
                url: game.url || ''
              }
            } else {
              return {
                value: index.toString(),
                label: `Game ${index}`,
                abbr: '',
                url: ''
              }
            }
          }).filter(game => game.label && game.label.trim() !== '') // Filter out empty labels
        : []

      console.log('🎯 Transformed games sample:', transformedGames.slice(0, 3))
      setGames(transformedGames)
    } catch (err) {
      console.error('❌ Failed to fetch Epic Games:', err)
      
      // Set user-friendly error messages
      let errorMessage = err.message
      if (err.message.includes('429') || err.message.includes('Too Many Requests')) {
        errorMessage = 'Rate limited. Please try again in a moment.'
      } else if (err.message.includes('No games data')) {
        errorMessage = 'No games available. Try refreshing.'
      }
      
      setError(errorMessage)
      setGames([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEpicGames()
  }, [])

  return {
    games,
    loading,
    error,
    refetch: () => fetchEpicGames(true) // Add refetch function with force refresh
  }
}
