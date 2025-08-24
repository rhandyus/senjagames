// Currency conversion utilities

// Get USD to IDR exchange rate from environment
export const getExchangeRate = () => {
  return parseFloat(import.meta.env.VITE_USD_TO_IDR_RATE) || 15500
}

// Helper function to safely parse price from various formats
export const getPriceValue = item => {
  // Check for priceWithSellerFeeLabel first (formatted string like "$15.99")
  if (item.priceWithSellerFeeLabel) {
    const parsed = parseFloat(item.priceWithSellerFeeLabel.replace(/[$,]/g, ''))
    return isNaN(parsed) ? 0 : parsed
  }

  // Check for direct price field
  if (item.price !== undefined && item.price !== null) {
    // If price is already a number, use it directly
    if (typeof item.price === 'number') {
      return item.price
    }
    // If price is a string, parse it
    if (typeof item.price === 'string') {
      const parsed = parseFloat(item.price.replace(/[$,]/g, ''))
      return isNaN(parsed) ? 0 : parsed
    }
  }

  return 0
}

// Convert USD to IDR
export const convertToIDR = usdAmount => {
  const exchangeRate = getExchangeRate()
  const idrAmount = Math.round(usdAmount * exchangeRate)
  return Math.max(idrAmount, 1000) // Minimum payment of 1000 IDR
}

// Format currency in IDR
export const formatCurrency = amount => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Format price for display (IDR with USD equivalent)
export const formatPriceWithUSD = item => {
  const priceUSD = getPriceValue(item)
  const priceIDR = convertToIDR(priceUSD)

  return {
    idr: formatCurrency(priceIDR),
    usd: priceUSD.toFixed(2),
    idrAmount: priceIDR,
    usdAmount: priceUSD
  }
}

// Format USD price with appropriate decimal places
export const formatUSD = usdAmount => {
  if (usdAmount < 0.01) {
    return `$${usdAmount.toFixed(4)}`
  } else if (usdAmount < 1) {
    return `$${usdAmount.toFixed(3)}`
  } else {
    return `$${usdAmount.toFixed(2)}`
  }
}
