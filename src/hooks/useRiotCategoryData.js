import { useEffect, useState } from 'react'
import zelenkaAPI from '../services/zelenkaAPI'

/**
 * Custom hook to fetch Riot/Valorant category parameters from LZT API
 * This includes weapon skins, agents, buddies, etc.
 */
function useRiotCategoryData() {
  const [weaponSkins, setWeaponSkins] = useState([])
  const [agents, setAgents] = useState([])
  const [buddies, setBuddies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchRiotCategoryData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Try to get category parameters from LZT API
        let categoryData = null
        try {
          categoryData = await zelenkaAPI.getRiotCategoryParams()
        } catch (apiError) {
          console.warn(
            'Failed to fetch from getRiotCategoryParams, trying getRiotParams:',
            apiError
          )
          try {
            categoryData = await zelenkaAPI.getRiotParams()
          } catch (fallbackError) {
            console.warn('Failed to fetch from getRiotParams, using fallback data:', fallbackError)
          }
        }

        if (!isMounted) return

        // Parse category data if available
        if (categoryData && categoryData.data) {
          const data = categoryData.data

          // Extract weapon skins
          if (data.weaponSkins || data.weapon_skins || data.valorant_skins) {
            const skinsData = data.weaponSkins || data.weapon_skins || data.valorant_skins
            if (Array.isArray(skinsData)) {
              setWeaponSkins(
                skinsData.map(skin => ({
                  value: skin.id || skin.name || skin,
                  label: skin.name || skin.displayName || skin,
                  count: skin.count || null
                }))
              )
            }
          }

          // Extract agents
          if (data.agents || data.valorant_agents) {
            const agentsData = data.agents || data.valorant_agents
            if (Array.isArray(agentsData)) {
              setAgents(
                agentsData.map(agent => ({
                  value: agent.id || agent.name || agent,
                  label: agent.name || agent.displayName || agent,
                  count: agent.count || null
                }))
              )
            }
          }

          // Extract buddies
          if (data.buddies || data.valorant_buddies || data.gun_buddies) {
            const buddiesData = data.buddies || data.valorant_buddies || data.gun_buddies
            if (Array.isArray(buddiesData)) {
              setBuddies(
                buddiesData.map(buddy => ({
                  value: buddy.id || buddy.name || buddy,
                  label: buddy.name || buddy.displayName || buddy,
                  count: buddy.count || null
                }))
              )
            }
          }
        }

        // No fallback data - show real errors if API doesn't provide category data
        if ((!weaponSkins.length && !agents.length && !buddies.length) || !categoryData) {
          console.warn(
            '⚠️ No Riot category data available and no fallback used - API error will be visible'
          )
          setWeaponSkins([])
          setAgents([])
          setBuddies([])
        }
      } catch (err) {
        console.error('Error fetching Riot category data:', err)
        if (isMounted) {
          setError('Failed to load category data')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchRiotCategoryData()

    return () => {
      isMounted = false
    }
  }, [])

  return {
    weaponSkins,
    agents,
    buddies,
    loading,
    error,
    refresh: () => {
      setLoading(true)
      // Re-trigger the effect by updating a dependency
    }
  }
}

export default useRiotCategoryData
