import lztMarket from '../utils/lztClient.js'

class ZelenkaAPI {
  constructor() {
    this.client = lztMarket
    this.initialized = false
  }

  async init() {
    if (this.initialized) return

    // Initialize with auth token
    const token =
      import.meta.env.VITE_ZELENKA_TOKEN ||
      import.meta.env.VITE_LZT_TOKEN ||
      process.env.ZELENKA_TOKEN ||
      process.env.LZT_TOKEN
    if (!token) {
      console.error('LZT Market token not found in environment variables')
      throw new Error('Authentication token required')
    }

    this.client.auth(token)
    this.initialized = true
  }

  async ensureInit() {
    if (!this.initialized) {
      await this.init()
    }
  }

  // Steam category
  async getSteamAccounts(params = {}) {
    await this.ensureInit()
    return await this.client.categorySteam(params)
  }

  // Fortnite category
  async getFortniteAccounts(params = {}) {
    await this.ensureInit()
    return await this.client.categoryFortnite(params)
  }

  // MiHoYo category
  async getMiHoyoAccounts(params = {}) {
    await this.ensureInit()
    return await this.client.categoryMihoyo(params)
  }

  // Riot category
  async getRiotAccounts(params = {}) {
    await this.ensureInit()
    return await this.client.categoryRiot(params)
  }

  // Telegram category
  async getTelegramAccounts(params = {}) {
    await this.ensureInit()
    return await this.client.categoryTelegram(params)
  }

  // Supercell category
  async getSupercellAccounts(params = {}) {
    await this.ensureInit()
    return await this.client.categorySupercell(params)
  }

  // EA/Origin category
  async getOriginAccounts(params = {}) {
    await this.ensureInit()
    return await this.client.categoryEA(params)
  }

  // All accounts
  async getAllAccounts(params = {}) {
    await this.ensureInit()
    return await this.client.categoryAll(params)
  }

  // Generic category method for flexibility
  async getCategory(category, params = {}) {
    await this.ensureInit()

    switch (category.toLowerCase()) {
      case 'steam':
        return await this.client.categorySteam(params)
      case 'fortnite':
        return await this.client.categoryFortnite(params)
      case 'mihoyo':
        return await this.client.categoryMihoyo(params)
      case 'riot':
        return await this.client.categoryRiot(params)
      case 'telegram':
        return await this.client.categoryTelegram(params)
      case 'supercell':
        return await this.client.categorySupercell(params)
      case 'origin':
      case 'ea':
        return await this.client.categoryEA(params)
      default:
        return await this.client.categoryAll(params)
    }
  }

  // Account details (placeholder - needs implementation if used)
  async getAccountDetails(accountId) {
    await this.ensureInit()
    // This would need to be implemented based on LZT Market API
    console.warn('getAccountDetails not yet implemented')
    return null
  }

  // Get categories (real implementation)
  async getCategories() {
    await this.ensureInit()
    return await this.client.getCategories()
  }

  // Get Steam games list
  async getSteamGamesList() {
    await this.ensureInit()
    return await this.client.request('steam/games')
  }

  // Generic make request method for compatibility
  async makeRequest(endpoint, options = {}) {
    await this.ensureInit()
    return await this.client.request(endpoint.replace(/^\//, ''), options)
  }
}

// Export both named and default exports to support different import styles
const zelenkaAPIInstance = new ZelenkaAPI()
export default ZelenkaAPI
export { ZelenkaAPI, zelenkaAPIInstance }
