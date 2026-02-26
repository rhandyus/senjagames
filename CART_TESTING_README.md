# SenjaGames Cart Testing Script

A console-based testing script for quickly adding items to the cart to test WinPay Virtual Account payment functionality.

## 🚀 Quick Start

1. **Open your browser** and go to SenjaGames
2. **Open Developer Console** (F12)
3. **Load the script**:
   ```javascript
   import('./cart-test-script.js')
   ```
4. **Run test commands**:
   ```javascript
   testPayment() // Quick setup for payment testing
   ```

## 📋 Available Commands

### Quick Commands (Global)

```javascript
addRandomToCart(3) // Add 3 random items
addToCart('item-id') // Add specific item
clearCart() // Clear cart
showCart() // Show cart status
listCartItems() // List available items
testPayment() // Complete test setup
```

### CartTester Object Methods

```javascript
CartTester.addRandomItems(2) // Add 2 random items
CartTester.addItem('steam-1') // Add specific item
CartTester.clearCart() // Clear cart
CartTester.showCartStatus() // Show detailed cart info
CartTester.listItems() // List all test items
CartTester.testPayment() // Quick payment test
```

## 🎯 Sample Items Available

### Battle.net Accounts

- `battlenet-1`: World of Warcraft - $15.99
- `battlenet-2`: Diablo IV - $25.99
- `battlenet-3`: Overwatch 2 - $12.99

### Steam Accounts

- `steam-1`: CS2 Prime - $8.99
- `steam-2`: Dota 2 - $5.99
- `steam-3`: PUBG - $7.99

### Epic Games Accounts

- `epic-1`: Fortnite - $18.99
- `epic-2`: Rocket League - $14.99

### Minecraft Accounts

- `minecraft-1`: Java Edition - $9.99
- `minecraft-2`: Bedrock Edition - $7.99

### Social Club Accounts

- `socialclub-1`: GTA V - $22.99

## 💳 Payment Testing Flow

1. **Load the script** in browser console
2. **Run**: `testPayment()`
3. **Go to cart/checkout page**
4. **Click "Pay with WinPay VA"**
5. **Check console** for Virtual Account creation logs

## 🔧 Manual Testing Examples

```javascript
// Load script first
import('./cart-test-script.js')

// Add specific items
addToCart('steam-1') // Add CS2 account
addToCart('epic-1') // Add Fortnite account

// Add random items
addRandomToCart(3) // Add 3 random items

// Check cart
showCart() // Show current cart

// Clear if needed
clearCart()
```

## ⚠️ Important Notes

- **Testing Only**: Items are fake and for testing WinPay VA creation only
- **Real API Calls**: WinPay Virtual Account creation uses real API calls
- **Environment**: Make sure your `.env` has correct WinPay credentials
- **Development**: Test on development server first
- **localStorage**: Script directly manipulates browser localStorage

## 🖥️ Alternative: HTML Testing Page

Open `http://localhost:3000/cart-testing.html` for a user-friendly testing interface.

## 🔍 Troubleshooting

**Script not loading?**

```javascript
// Try direct import
import('./cart-test-script.js')
  .then(() => {
    console.log('Script loaded!')
  })
  .catch(console.error)
```

**Cart not updating in UI?**

- The script triggers React updates via custom events
- Try refreshing the page after adding items
- Check browser console for errors

**WinPay API errors?**

- Check your `.env` file has correct credentials
- Verify `VITE_WINPAY_BASE_URL=https://snap.winpay.id`
- Check server logs for detailed error messages

## 📁 Files

- `public/cart-test-script.js` - Main testing script
- `public/cart-testing.html` - User-friendly testing page
- `src/context/CartContext.jsx` - Modified to listen for external updates

---

**Happy Testing! 🎮** Test your WinPay Virtual Account integration with ease.
