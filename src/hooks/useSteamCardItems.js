import { useEffect, useState } from 'react'

const useSteamCardItems = () => {
  const [cardItems, setCardItems] = useState({
    games: [],
    cards: [],
    backgrounds: [],
    emoticons: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (initialized) return // Prevent multiple API calls

    const fetchSteamCardItems = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch both Steam games and parameters from LZT Market API
        const [gamesResponse, paramsResponse] = await Promise.all([
          fetch('/api/lzt-proxy/steam/games'),
          fetch('/api/lzt-proxy/steam/params')
        ])

        if (!gamesResponse.ok || !paramsResponse.ok) {
          throw new Error(
            `HTTP error! Games: ${gamesResponse.status}, Params: ${paramsResponse.status}`
          )
        }

        const [gamesData, paramsData] = await Promise.all([
          gamesResponse.json(),
          paramsResponse.json()
        ])

        // Transform the API response into our format
        const transformedData = {
          games: [],
          cards: [],
          backgrounds: [],
          emoticons: []
        }

        // Process games data from the Steam games API response
        if (gamesData.games && Array.isArray(gamesData.games)) {
          transformedData.games = gamesData.games.slice(0, 50).map(game => ({
            value: game.app_id,
            label: game.title
          }))
        }

        // Process gift items from params API response
        if (paramsData.category && paramsData.category.params) {
          const giftParam = paramsData.category.params.find(param => param.name === 'gift')
          if (giftParam && giftParam.values && Array.isArray(giftParam.values)) {
            const giftItems = giftParam.values

            // Categorize gift items based on their names
            giftItems.forEach(gift => {
              const itemName = gift.title || ''
              const itemValue = gift.hash_name || gift.id

              if (
                itemName.toLowerCase().includes('trading card') ||
                itemName.toLowerCase().includes(' card ') ||
                itemName.toLowerCase().includes('foil')
              ) {
                transformedData.cards.push({
                  value: itemValue,
                  label: itemName
                })
              } else if (
                itemName.toLowerCase().includes('background') ||
                itemName.toLowerCase().includes('wallpaper')
              ) {
                transformedData.backgrounds.push({
                  value: itemValue,
                  label: itemName
                })
              } else if (
                itemName.toLowerCase().includes('emoticon') ||
                itemName.toLowerCase().includes(':') ||
                itemName.includes('😀') ||
                itemName.includes('😎')
              ) {
                transformedData.emoticons.push({
                  value: itemValue,
                  label: itemName
                })
              }
            })

            // If we don't have enough categorized items, add some as general steam items
            if (transformedData.cards.length < 5) {
              giftItems.slice(0, 10).forEach(gift => {
                if (!transformedData.cards.find(card => card.value === gift.hash_name)) {
                  transformedData.cards.push({
                    value: gift.hash_name,
                    label: `${gift.title} (Trading Card)`
                  })
                }
              })
            }

            if (transformedData.backgrounds.length < 5) {
              giftItems.slice(10, 20).forEach(gift => {
                if (!transformedData.backgrounds.find(bg => bg.value === gift.hash_name)) {
                  transformedData.backgrounds.push({
                    value: gift.hash_name,
                    label: `${gift.title} (Background)`
                  })
                }
              })
            }

            if (transformedData.emoticons.length < 5) {
              giftItems.slice(20, 30).forEach(gift => {
                if (!transformedData.emoticons.find(emote => emote.value === gift.hash_name)) {
                  transformedData.emoticons.push({
                    value: gift.hash_name,
                    label: `${gift.title} (Emoticon)`
                  })
                }
              })
            }
          }
        }

        setCardItems(transformedData)
      } catch (err) {
        console.error('❌ Error fetching Steam card items - no fallback used:', err)
        setError(err.message)

        // No fallback - show the real error
        setCardItems({
          games: [],
          cards: [],
          backgrounds: [],
          emoticons: []
        })
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }

    fetchSteamCardItems()
  }, [initialized]) // Add initialized as dependency

  return { cardItems, loading, error }
}

export default useSteamCardItems
