// Global API rate limiting and request deduplication utility

class APIRateLimiter {
  constructor() {
    this.pendingRequests = new Map() // Track in-flight requests to prevent duplicates
    this.lastRequestTime = new Map() // Track last request time per endpoint
    this.cache = new Map() // Simple response cache
    this.RATE_LIMIT_DELAY = 3000 // 3 seconds between requests per endpoint
    this.CACHE_TTL = 120 * 1000 // 2 minutes cache (longer cache to reduce requests)
  }

  // Generate a cache key for the request
  getCacheKey(url, options = {}) {
    const urlObj = new URL(url, window.location.origin)
    return `${urlObj.pathname}${urlObj.search}`
  }

  // Check if we should wait before making a request
  shouldWait(endpoint) {
    const now = Date.now()
    const lastRequest = this.lastRequestTime.get(endpoint) || 0
    const timeSinceLastRequest = now - lastRequest

    if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
      return this.RATE_LIMIT_DELAY - timeSinceLastRequest
    }

    return 0
  }

  // Check if we have a cached response
  getCachedResponse(cacheKey) {
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }
    return null
  }

  // Cache a response
  setCachedResponse(cacheKey, data) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    })
  }

  // Make a rate-limited fetch request with deduplication
  async fetch(url, options = {}) {
    const cacheKey = this.getCacheKey(url, options)
    const endpoint = new URL(url, window.location.origin).pathname

    // Check cache first
    const cachedResponse = this.getCachedResponse(cacheKey)
    if (cachedResponse) {
      console.log(`♻️ Returning cached response for ${endpoint}`)
      // Return a mock response that matches fetch API
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map(),
        json: async () => cachedResponse,
        text: async () => JSON.stringify(cachedResponse),
        clone: function() { return this }
      }
    }

    // Check if request is already in flight
    if (this.pendingRequests.has(cacheKey)) {
      console.log(`⏳ Request already in flight for ${endpoint}, waiting...`)
      // Wait for the existing request to complete
      return await this.pendingRequests.get(cacheKey)
    }

    // Check if we need to wait due to rate limiting
    const waitTime = this.shouldWait(endpoint)
    if (waitTime > 0) {
      console.log(`⏳ Rate limiting: waiting ${waitTime}ms before ${endpoint} request`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    // Update last request time
    this.lastRequestTime.set(endpoint, Date.now())

    // Create the actual request promise
    const requestPromise = this._makeRequest(url, options, cacheKey, endpoint)

    // Store in pending requests
    this.pendingRequests.set(cacheKey, requestPromise)

    return requestPromise
  }

  async _makeRequest(url, options, cacheKey, endpoint) {
    try {
      const response = await fetch(url, options)

      if (response.ok) {
        // Parse JSON and cache it
        const data = await response.json()
        this.setCachedResponse(cacheKey, data)

        // Return a mock response with the data
        return {
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: response.headers,
          json: async () => data,
          text: async () => JSON.stringify(data),
          clone: function() { return this }
        }
      }

      // Handle 429 errors specially
      if (response.status === 429) {
        console.warn(`⚠️ 429 rate limit for ${endpoint}`)
        // Add extra delay for this endpoint
        this.lastRequestTime.set(endpoint, Date.now() + 60000) // Add 60s penalty

        // Read error message if available
        let errorMessage = 'Too Many Requests'
        try {
          const responseClone = response.clone()
          const errorText = await responseClone.text()
          if (errorText && !errorText.includes('<html>')) {
            errorMessage = errorText
          }
        } catch (e) {
          // Ignore errors reading response body
        }

        throw new Error(`API rate limited: ${errorMessage}`)
      }

      // For other errors, try to read the response and throw
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)

    } catch (error) {
      console.error(`❌ Request failed for ${endpoint}:`, error)
      throw error
    } finally {
      // Always remove from pending requests
      this.pendingRequests.delete(cacheKey)
    }
  }

  // Clear cache (useful for development/debugging)
  clearCache() {
    this.cache.clear()
    this.pendingRequests.clear()
    console.log('🧹 API cache cleared')
  }

  // Get cache stats
  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      cachedEndpoints: Array.from(this.cache.keys())
    }
  }
}

// Export a singleton instance
export const apiRateLimiter = new APIRateLimiter()

// Helper function for making rate-limited API calls
export async function rateLimitedFetch(url, options = {}) {
  return apiRateLimiter.fetch(url, options)
}

// Export the class for testing or multiple instances
export default APIRateLimiter
