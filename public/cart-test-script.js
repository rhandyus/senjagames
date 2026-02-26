// Cart Testing Script for SenjaGames
// Run this in the browser console to randomly add items to cart for payment testing

// Sample items for different game types
const SAMPLE_ITEMS = [
  // Battle.net Accounts
  {
    id: 'battlenet-1',
    title: 'Battle.net Account - World of Warcraft',
    price: 15.99,
    type: 'Battle.net Account',
    details: {
      game_type: 'World of Warcraft',
      email: 'Premium Email',
      region: 'US',
      warranty: '30 days'
    }
  },
  {
    id: 'battlenet-2',
    title: 'Battle.net Account - Diablo IV',
    price: 25.99,
    type: 'Battle.net Account',
    details: {
      game_type: 'Diablo IV',
      email: 'Premium Email',
      region: 'EU',
      warranty: '60 days'
    }
  },
  {
    id: 'battlenet-3',
    title: 'Battle.net Account - Overwatch 2',
    price: 12.99,
    type: 'Battle.net Account',
    details: {
      game_type: 'Overwatch 2',
      email: 'Basic Email',
      region: 'ASIA',
      warranty: '30 days'
    }
  },

  // Steam Accounts
  {
    id: 'steam-1',
    title: 'Steam Account - CS2 Prime',
    price: 8.99,
    type: 'Steam Account',
    details: {
      game_type: 'Counter-Strike 2',
      email: 'Premium Email',
      region: 'Global',
      warranty: '30 days',
      hasVAC: false
    }
  },
  {
    id: 'steam-2',
    title: 'Steam Account - Dota 2',
    price: 5.99,
    type: 'Steam Account',
    details: {
      game_type: 'Dota 2',
      email: 'Basic Email',
      region: 'Global',
      warranty: '14 days',
      hasVAC: false
    }
  },
  {
    id: 'steam-3',
    title: 'Steam Account - PUBG',
    price: 7.99,
    type: 'Steam Account',
    details: {
      game_type: 'PUBG',
      email: 'Premium Email',
      region: 'Global',
      warranty: '30 days',
      hasVAC: false
    }
  },

  // Epic Games Accounts
  {
    id: 'epic-1',
    title: 'Epic Games Account - Fortnite',
    price: 18.99,
    type: 'Epic Games Account',
    details: {
      game_type: 'Fortnite',
      email: 'Premium Email',
      region: 'Global',
      warranty: '45 days'
    }
  },
  {
    id: 'epic-2',
    title: 'Epic Games Account - Rocket League',
    price: 14.99,
    type: 'Epic Games Account',
    details: {
      game_type: 'Rocket League',
      email: 'Basic Email',
      region: 'Global',
      warranty: '30 days'
    }
  },

  // Minecraft Accounts
  {
    id: 'minecraft-1',
    title: 'Minecraft Java Edition',
    price: 9.99,
    type: 'Minecraft Account',
    details: {
      game_type: 'Java Edition',
      email: 'Premium Email',
      region: 'Global',
      warranty: '30 days'
    }
  },
  {
    id: 'minecraft-2',
    title: 'Minecraft Bedrock Edition',
    price: 7.99,
    type: 'Minecraft Account',
    details: {
      game_type: 'Bedrock Edition',
      email: 'Basic Email',
      region: 'Global',
      warranty: '14 days'
    }
  },

  // Social Club Accounts
  {
    id: 'socialclub-1',
    title: 'Rockstar Social Club - GTA V',
    price: 22.99,
    type: 'Social Club Account',
    details: {
      game_type: 'GTA V',
      email: 'Premium Email',
      region: 'Global',
      warranty: '60 days'
    }
  }
]

// Cart testing functions that work with localStorage
window.CartTester = {
  // Get current cart from localStorage
  getCart: function () {
    try {
      const cartData = localStorage.getItem('senjagames_cart')
      return cartData ? JSON.parse(cartData) : { items: [], total: 0 }
    } catch (error) {
      console.error('Error reading cart:', error)
      return { items: [], total: 0 }
    }
  },

  // Save cart to localStorage
  saveCart: function (cart) {
    try {
      localStorage.setItem('senjagames_cart', JSON.stringify(cart))
      // Dispatch custom event to notify React components
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }))
    } catch (error) {
      console.error('Error saving cart:', error)
    }
  },

  // Get random items from the sample list
  getRandomItems: function (count = 3) {
    const shuffled = [...SAMPLE_ITEMS].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  },

  // Add random items to cart
  addRandomItems: function (count = 3) {
    console.log(`🎯 Adding ${count} random items to cart...`)

    const cart = this.getCart()
    const itemsToAdd = this.getRandomItems(count)
    let addedCount = 0

    itemsToAdd.forEach(item => {
      // Check if item already exists
      const existingItem = cart.items.find(cartItem => cartItem.id === item.id)

      if (!existingItem) {
        // Add new item with quantity 1
        cart.items.push({ ...item, quantity: 1 })
        console.log(`➕ Added: ${item.title} - $${item.price}`)
        addedCount++
      } else {
        console.log(`⚠️ Skipped (already in cart): ${item.title}`)
      }
    })

    // Recalculate total
    cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    this.saveCart(cart)
    console.log(`✅ Added ${addedCount} items to cart. Total: $${cart.total.toFixed(2)}`)
    return itemsToAdd
  },

  // Add specific item by ID
  addItem: function (itemId) {
    const item = SAMPLE_ITEMS.find(item => item.id === itemId)
    if (!item) {
      console.error(`❌ Item with ID '${itemId}' not found`)
      return false
    }

    const cart = this.getCart()
    const existingItem = cart.items.find(cartItem => cartItem.id === item.id)

    if (existingItem) {
      console.log(`⚠️ Item already in cart: ${item.title}`)
      return false
    }

    cart.items.push({ ...item, quantity: 1 })
    cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    this.saveCart(cart)
    console.log(`➕ Added: ${item.title} - $${item.price}`)
    return true
  },

  // Clear cart
  clearCart: function () {
    const emptyCart = { items: [], total: 0 }
    this.saveCart(emptyCart)
    console.log('🗑️ Cart cleared')
    return emptyCart
  },

  // Show cart status
  showCartStatus: function () {
    const cart = this.getCart()
    console.log('🛒 Current Cart Status:')
    console.log(`   Items: ${cart.items?.length || 0}`)
    console.log(`   Total: $${cart.total?.toFixed(2) || '0.00'}`)

    if (cart.items?.length > 0) {
      console.log('   Items in cart:')
      cart.items.forEach((item, index) => {
        console.log(`     ${index + 1}. ${item.title} - $${item.price} (${item.type})`)
      })
    } else {
      console.log('   Cart is empty')
    }
    return cart
  },

  // List available test items
  listItems: function () {
    console.log('� Available Test Items:')
    SAMPLE_ITEMS.forEach((item, index) => {
      console.log(`   ${index + 1}. [${item.id}] ${item.title} - $${item.price} (${item.type})`)
    })
    console.log(`\n💡 Use addItem('item-id') to add specific item`)
    console.log(`💡 Use addRandomItems(3) to add random items`)
  },

  // Test payment flow
  testPayment: function () {
    console.log('💳 Setting up payment test...')

    // Clear cart first
    this.clearCart()

    // Add random items after a short delay
    setTimeout(() => {
      const items = this.addRandomItems(2)
      console.log(
        '📦 Test items added:',
        items.map(item => item.title)
      )

      // Show final cart status
      setTimeout(() => {
        this.showCartStatus()
        console.log('🎯 Ready for payment testing! Go to cart/checkout page.')
        console.log('💰 Total amount will be converted to IDR for WinPay VA creation.')
      }, 500)
    }, 500)
  }
}

// Quick commands for easy console access
window.addRandomToCart = (count = 3) => window.CartTester.addRandomItems(count)
window.addToCart = itemId => window.CartTester.addItem(itemId)
window.clearCart = () => window.CartTester.clearCart()
window.showCart = () => window.CartTester.showCartStatus()
window.listCartItems = () => window.CartTester.listItems()
window.testPayment = () => window.CartTester.testPayment()

console.log(`
🎮 SenjaGames Cart Testing Script Loaded! 🎮

Available commands:
• addRandomToCart(3)   - Add 3 random items to cart
• addToCart('item-id') - Add specific item by ID
• clearCart()          - Clear all items from cart
• showCart()           - Show current cart status
• listCartItems()      - List all available test items
• testPayment()        - Quick payment test setup

Example usage:
  listCartItems()      // See available items
  addToCart('steam-1') // Add specific Steam account
  addRandomToCart(2)   // Add 2 random items
  showCart()           // Check cart contents
  clearCart()          // Empty cart

For payment testing:
  testPayment()        // Sets up cart with 2 random items

Note: This script directly manipulates localStorage and triggers
React updates via custom events. Perfect for testing WinPay VA creation!
`)

export default {}
