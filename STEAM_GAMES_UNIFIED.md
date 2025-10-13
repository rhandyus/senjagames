# Steam Games Unified API Integration

## Changes Made

### 1. Updated `api/unify.js`

Added Steam games support to the unified API endpoint to avoid creating additional serverless functions and hitting Vercel's 12-function limit.

**New endpoint**: `/api/unify?name=steamgames`

### 2. Updated `src/components/SteamFilters.jsx`

Changed the Steam games fetch from:

- ❌ Old: `/api/lzt/steam/games` (separate serverless function)
- ✅ New: `/api/unify?name=steamgames` (unified endpoint)

### 3. Updated SearchableGameDropdown endpoint

Changed the search endpoint from:

- ❌ Old: `searchEndpoint='/api/lzt/steam/games'`
- ✅ New: `searchEndpoint='/api/unify?name=steamgames'`

## Benefits

✅ **Reduces serverless function count** - No need for separate `api/lzt/steam/games.js`
✅ **Avoids Vercel limits** - Stays under 12 serverless functions
✅ **Maintains functionality** - Same API response format
✅ **Easier maintenance** - All LZT API calls in one place

## Supported Categories in Unify API

The unified API now supports:

- `mihoyo` - miHoYo accounts
- `riot` - Riot Games accounts
- `telegram` - Telegram accounts
- `ea` / `origin` - EA/Origin accounts
- `epicgamesgames` - Epic Games games list
- **`steamgames`** - Steam games list ⭐ NEW
- `search` - Search for account details by ID

## Usage Example

```javascript
// Fetch Steam games list
const response = await fetch('/api/unify?name=steamgames')
const gamesData = await response.json()

// The response format is the same as the original LZT API:
// {
//   "730": { "name": "Counter-Strike 2", ... },
//   "570": { "name": "Dota 2", ... },
//   ...
// }
```

## Testing

Test the new endpoint:

```bash
curl http://localhost:5173/api/unify?name=steamgames
```

Or in the browser:

```
http://localhost:5173/api/unify?name=steamgames
```

## Original LZT API Call

The unified endpoint makes this call internally:

```bash
curl --request GET \
     --url https://prod-api.lzt.market/steam/games \
     --header 'accept: application/json' \
     --header 'authorization: Bearer YOUR_TOKEN'
```

## Migration Notes

If you previously had a separate `api/lzt/steam/games.js` file, you can now safely delete it as it's no longer needed.

All Steam games functionality now goes through the unified API endpoint.
