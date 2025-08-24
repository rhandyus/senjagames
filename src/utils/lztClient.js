// Lightweight LZT Market API client for browser
class LZTMarketClient {
  constructor() {
    // Check if we're in a serverless environment (Node.js) or browser
    const isServerless = typeof window === 'undefined' && typeof process !== 'undefined'

    if (isServerless) {
      // In serverless functions, we don't use proxies - call LZT API directly
      this.baseURL = 'https://prod-api.lzt.market'
      this.isServerless = true
    } else {
      // Use proxy in development, Vercel API routes in production
      const isDevelopment =
        typeof import.meta !== 'undefined' &&
        import.meta.env &&
        import.meta.env.MODE === 'development'

      if (isDevelopment) {
        this.baseURL = '/api/lzt'
      } else {
        // In production, use Vercel API proxy
        this.baseURL = '/api/lzt-proxy'
      }
      this.isServerless = false
    }
    this.token =
      process.env.ZELENKA_TOKEN || process.env.VITE_ZELENKA_TOKEN || process.env.LZT_TOKEN || null
  }

  auth(token) {
    this.token = token
    return this
  }

  async request(endpoint, options = {}) {
    if (!this.token) {
      throw new Error('Authentication token required. Call auth() first.')
    }

    let url
    if (this.isServerless) {
      // In serverless functions, call LZT API directly
      url = `${this.baseURL}/${endpoint}`
    } else {
      // In browser environment
      const isDevelopment =
        typeof import.meta !== 'undefined' &&
        import.meta.env &&
        import.meta.env.MODE === 'development'

      if (isDevelopment) {
        // Development: direct proxy
        url = `${this.baseURL}/${endpoint}`
      } else {
        // Production: Vercel API function expects path as query parameter
        url = `${this.baseURL}?path=${encodeURIComponent(endpoint)}`
      }
    }

    const config = {
      method: options.method || 'GET',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'SenjaGames.id/1.0',
        ...options.headers
      },
      ...options
    }

    if (config.method !== 'GET' && options.body) {
      config.body = JSON.stringify(options.body)
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  }

  // Category methods
  async categoryEA(params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = query ? `ea?${query}` : 'ea'
    const data = await this.request(endpoint)
    return { data }
  }

  async categoryTelegram(params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = query ? `telegram?${query}` : 'telegram'
    const data = await this.request(endpoint)
    return { data }
  }

  async categorySupercell(params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = query ? `supercell?${query}` : 'supercell'
    const data = await this.request(endpoint)
    return { data }
  }

  async categorySteam(params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = query ? `steam?${query}` : 'steam'
    const data = await this.request(endpoint)
    return { data }
  }

  async categoryFortnite(params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = query ? `fortnite?${query}` : 'fortnite'
    const data = await this.request(endpoint)
    return { data }
  }

  async categoryMihoyo(params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = query ? `mihoyo?${query}` : 'mihoyo'
    const data = await this.request(endpoint)
    return { data }
  }

  async categoryRiot(params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = query ? `riot?${query}` : 'riot'
    const data = await this.request(endpoint)
    return { data }
  }

  async categoryAll(params = {}) {
    const query = new URLSearchParams(params).toString()
    const endpoint = query ? `?${query}` : ''
    const data = await this.request(endpoint)
    return { data }
  }

  // Get categories list
  async getCategories() {
    const data = await this.request('categories')
    return data
  }
}

// Export singleton instance
const lztMarket = new LZTMarketClient()
export default lztMarket
