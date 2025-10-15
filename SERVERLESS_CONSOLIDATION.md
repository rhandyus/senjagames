# Serverless Functions Consolidation

## ✅ Successfully Reduced to 12 Functions (Vercel Limit)

### Actions Taken:

#### 1. Deleted Unused Test/Debug Files (2 files):

- ❌ `api/debug-env.js` - Debug file (removed)
- ❌ `api/test/account-details.js` - Test file (removed)

#### 2. Deleted Individual API Files Already in Unify.js (4 files):

- ❌ `api/mihoyo.js` - Now using `/api/unify?name=mihoyo`
- ❌ `api/riot.js` - Now using `/api/unify?name=riot`
- ❌ `api/telegram.js` - Now using `/api/unify?name=telegram`
- ❌ `api/ea.js` - Now using `/api/unify?name=ea` or `/api/unify?name=origin`

### Remaining 12 Serverless Functions:

1. ✅ `battlenet.js` - Battle.net accounts
2. ✅ `epic.js` - Epic Games accounts
3. ✅ `fortnite.js` - Fortnite accounts
4. ✅ `lzt-proxy.js` - LZT Market proxy
5. ✅ `minecraft.js` - Minecraft accounts
6. ✅ `roblox.js` - Roblox accounts
7. ✅ `socialclub.js` - Social Club accounts
8. ✅ `steam.js` - Steam accounts
9. ✅ `unify.js` - **Unified endpoint** (handles: mihoyo, riot, telegram, ea, origin, epicgamesgames, steamgames, search)
10. ✅ `uplay.js` - Uplay accounts
11. ✅ `lzt/[...category].js` - Dynamic LZT category handler
12. ✅ `winpay/payment.js` - Payment callback

### Unified API Endpoints (unify.js):

The `unify.js` handles multiple categories to save serverless functions:

```javascript
// Supported categories in unify.js:
/api/unify?name=mihoyo          // miHoYo accounts
/api/unify?name=riot            // Riot Games accounts
/api/unify?name=telegram        // Telegram accounts
/api/unify?name=ea              // EA/Origin accounts
/api/unify?name=origin          // EA/Origin accounts (alias)
/api/unify?name=epicgamesgames  // Epic Games games list
/api/unify?name=steamgames      // Steam games list
/api/unify?name=search&id=XXX   // Search account by ID
```

### Component Updates:

All components are already using the correct endpoints:

- ✅ `TelegramPage.jsx` - Uses `/api/unify?name=telegram`
- ✅ `SteamFilters.jsx` - Uses `/api/unify?name=steamgames`
- ✅ `SteamPage.jsx` - Uses `/api/steam` (separate endpoint still needed)
- ✅ Other pages use their respective endpoints

### Benefits:

1. **Meets Vercel Limits**: Exactly 12 serverless functions
2. **No Breaking Changes**: All existing functionality preserved
3. **Easier Maintenance**: Consolidated similar endpoints
4. **Room for Growth**: Can add more categories to unify.js without creating new functions

### Future Considerations:

If you need to add more endpoints in the future, consider adding them to `unify.js` instead of creating new serverless functions.

Example:

```javascript
// Instead of creating api/newgame.js, add to unify.js:
const categoryMapping = {
  // ... existing
  newgame: 'newgame' // Add here
}
```

---

**Date**: October 15, 2025
**Status**: ✅ Production Ready
**Vercel Compliance**: ✅ 12/12 Functions Used
