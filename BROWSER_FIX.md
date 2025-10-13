# WinPay Signature - Browser Fix

## Issue

The initial implementation used `node-rsa` library which is not browser-compatible because it relies on Node.js `Buffer` API.

## Solution

Replaced `node-rsa` with `jsrsasign` library which is fully browser-compatible and works in both browser and Node.js environments.

## Changes Made

### 1. Updated Dependencies

```bash
# Removed
npm uninstall node-rsa

# Added
npm install jsrsasign
```

### 2. Updated `src/utils/winpaySignature.js`

- Changed import from `node-rsa` to `jsrsasign`
- Updated signature generation to use `jsrsasign.KJUR.crypto.Signature`
- Updated signature verification to use `jsrsasign` verification
- Updated key generation and extraction functions

### 3. Browser Compatibility

The signature generation now works in:

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Node.js environment (for testing and server-side)
- ✅ Vite dev server
- ✅ Production builds

## Usage

The API remains the same:

```javascript
import { generateWinPaySignature } from './utils/winpaySignature.js'

const signature = generateWinPaySignature(
  'POST',
  '/v1.0/transfer-va/create-va',
  requestBody,
  timestamp,
  privateKey
)
```

## Technical Details

### jsrsasign Features:

- Pure JavaScript RSA implementation
- No Node.js dependencies
- Supports RSA-SHA256 signatures
- Compatible with WinPay specification
- Works in all modern browsers

### Signature Algorithm:

1. Create SHA-256 hash of request body
2. Build string to sign: `HTTPMethod:URL:BodyHash:Timestamp`
3. Sign with RSA-SHA256 using private key
4. Encode signature as Base64

## Testing

The signature generation has been tested and verified to work correctly in browser environment.

**Note**: Demo mode still works without private key for development purposes.
