import { useEffect, useState } from 'react'

export const useEpicGames = () => {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchEpicGames = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🎮 Fetching Epic Games list...')
      const response = await fetch('/api/lzt/epic/games')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Epic Games data received:', data?.length || 0, 'games')

      // Transform the data to the expected format for dropdowns
      const transformedGames = Array.isArray(data)
        ? data.map(game => ({
            value: game.app_id,
            label: game.title,
            abbr: game.abbr,
            url: game.url
          }))
        : []

      setGames(transformedGames)
    } catch (err) {
      console.error('❌ Failed to fetch Epic Games:', err)
      setError(err.message)
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
    refetch: fetchEpicGames
  }
}
