import { useEffect, useState } from 'react'

const useFortniteCosmeticItems = () => {
  const [cosmeticItems, setCosmeticItems] = useState({
    skins: [],
    pickaxes: [],
    emotes: [],
    gliders: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (initialized) return // Prevent multiple API calls

    const fetchFortniteCosmeticItems = async () => {
      try {
        setLoading(true)
        setError(null)

        let data
        try {
          // Use server endpoint instead of ZelenkaAPI
          const response = await fetch('/api/lzt/fortnite/cosmetics')

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          data = await response.json()
        } catch (apiError) {
          // Use fallback data if API endpoint doesn't exist
          data = null
        }

        // Transform the API response into our format
        const transformedData = {
          skins: [],
          pickaxes: [],
          emotes: [],
          gliders: []
        }

        // If we have real API data, process it
        if (data) {
          // Process skin values
          if (data.skin && Array.isArray(data.skin)) {
            transformedData.skins = data.skin.map(skinValue => ({
              value: skinValue,
              label: formatCosmeticName(skinValue)
            }))
          }

          // Process pickaxe values
          if (data.pickaxe && Array.isArray(data.pickaxe)) {
            transformedData.pickaxes = data.pickaxe.map(pickaxeValue => ({
              value: pickaxeValue,
              label: formatCosmeticName(pickaxeValue)
            }))
          }

          // Process dance/emote values
          if (data.dance && Array.isArray(data.dance)) {
            transformedData.emotes = data.dance.map(danceValue => ({
              value: danceValue,
              label: formatCosmeticName(danceValue)
            }))
          }

          // Process glider values
          if (data.glider && Array.isArray(data.glider)) {
            transformedData.gliders = data.glider.map(gliderValue => ({
              value: gliderValue,
              label: formatCosmeticName(gliderValue)
            }))
          }
        } else {
          // No API data - don't use fallbacks, let the error show
          console.warn('⚠️ No Fortnite cosmetic API data available and no fallback used')
          transformedData.skins = []
          transformedData.pickaxes = []
          transformedData.emotes = []
          transformedData.gliders = []
        }

        setCosmeticItems(transformedData)
      } catch (err) {
        // Only log error if it's not a 401 (which is expected in development)
        if (!err.message.includes('401')) {
          console.error('Error fetching Fortnite cosmetic items:', err)
        } else {
        }
        setError(err.message)

        // No fallback - show the real error
        console.error('❌ Error fetching Fortnite cosmetic items - no fallback used:', err)
        setCosmeticItems({
          skins: [],
          pickaxes: [],
          emotes: [],
          gliders: []
        })
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }

    fetchFortniteCosmeticItems()
  }, [initialized]) // Add initialized as dependency

  return { cosmeticItems, loading, error }
}

// Helper function to format cosmetic names from API values
const formatCosmeticName = value => {
  if (!value) return value

  // Remove common prefixes and format names
  let formatted = value
    .replace(/^(pickaxe_id_\d+_|glider_id_\d+_|\d+_athena_commando_[mf]_)/g, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())

  return formatted || value
}

export default useFortniteCosmeticItems
