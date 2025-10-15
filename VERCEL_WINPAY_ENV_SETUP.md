# WinPay Vercel Environment Variable Setup Guide

## Problem

Vercel doesn't allow multi-line environment variables with `\n` escape sequences. When you paste a private key with line breaks, Vercel doesn't save it properly.

## Solution: Use Base64 Encoding

### Step 1: Get Your Base64 Encoded Private Key

The Base64 encoded private key has been generated and saved to:

- **File**: `private-key-base64.txt`
- **Console output** from running `node encode-private-key.js`

Your Base64 encoded key is a single long string that looks like:

```
LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFcGdJQkFBS0NBUUVB...
```

### Step 2: Add to Vercel Environment Variables

1. **Go to Vercel Dashboard**:
   - Visit https://vercel.com/dashboard
   - Select your project (senjagames)

2. **Navigate to Settings**:
   - Click on "Settings" tab
   - Click on "Environment Variables" in the sidebar

3. **Add/Edit the Variable**:
   - **Key**: `VITE_WINPAY_PRIVATE_KEY`
   - **Value**: Paste the ENTIRE Base64 string (from `private-key-base64.txt`)
   - **Important**: Paste as a single line, NO quotes, NO line breaks
   - Select environments: Production, Preview, Development (check all)

4. **Other Required Variables**:
   Make sure these are also set in Vercel:

   ```
   VITE_WINPAY_PARTNER_ID=fe515458-df5e-4ab6-9136-84b18e79f1e8
   VITE_WINPAY_CHANNEL_ID=SenjaGames
   VITE_WINPAY_BASE_URL=https://api.winpay.id
   VITE_WINPAY_DEMO_MODE=false
   ```

5. **Save** the variables

### Step 3: Redeploy

After saving the environment variables:

1. Go to "Deployments" tab
2. Click on the latest deployment
3. Click "Redeploy" button
4. Or push a new commit to trigger automatic deployment

### How It Works

The code has been updated to automatically detect and decode Base64 encoded keys:

```javascript
// In src/services/winpayAPI.js
let privateKey = import.meta.env.VITE_WINPAY_PRIVATE_KEY
if (privateKey && !privateKey.includes('-----BEGIN')) {
  // If it doesn't contain PEM header, assume it's Base64 encoded
  privateKey = atob(privateKey) // Decode from Base64
}
```

This means:

- ✅ **Local Development**: You can use the PEM format in `.env` file (with `\n` escapes)
- ✅ **Vercel Production**: Use the Base64 encoded string
- ✅ **Automatic Detection**: Code automatically handles both formats

### Verification

After deployment, check your Vercel function logs:

1. Go to Vercel Dashboard > Deployments > Click latest deployment
2. Click "Functions" tab
3. Look for log message: `Decoded Base64 private key for WinPay`

If you see this message, the key was successfully decoded.

### Testing

Create a test Virtual Account in production:

- The system will use the decoded private key to generate real signatures
- You should receive a real Virtual Account number from WinPay
- No more fake/mock account numbers!

## Troubleshooting

### Issue: Still Getting Fake Account Numbers

**Check**:

1. Verify the Base64 string was copied completely (it's very long!)
2. Check Vercel logs for any errors about the private key
3. Make sure `VITE_WINPAY_DEMO_MODE` is set to `false`
4. Verify all other WinPay env vars are set correctly

### Issue: Signature Generation Errors

**Check**:

1. The Base64 string might be corrupted
2. Re-generate it by running: `node encode-private-key.js`
3. Copy the new Base64 string to Vercel
4. Redeploy

### Issue: "Private key not found" Error

**Check**:

1. Make sure the environment variable name is exactly: `VITE_WINPAY_PRIVATE_KEY`
2. It's case-sensitive!
3. Must have the `VITE_` prefix for Vite to expose it

## Local Development vs Production

### Local (.env file):

```properties
# Option 1: PEM format with \n escapes (current)
VITE_WINPAY_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----"

# Option 2: Base64 format (also works)
VITE_WINPAY_PRIVATE_KEY=LS0tLS1CRUdJTi...
```

### Vercel (Environment Variables):

```
Key: VITE_WINPAY_PRIVATE_KEY
Value: LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFcGdJQkFBS0NBUUVB...
(Single line Base64 string, no quotes)
```

## Security Notes

- ✅ Never commit `private-key.pem` to git (already in `.gitignore`)
- ✅ Never commit `private-key-base64.txt` to git (already in `.gitignore`)
- ✅ The `.env` file is already in `.gitignore`
- ✅ Vercel environment variables are encrypted and secure
- ⚠️ Don't share your Base64 key publicly

## Files Generated

- `private-key.pem` - Original PEM format private key
- `private-key-base64.txt` - Base64 encoded version for Vercel
- `encode-private-key.js` - Script to generate Base64 (can run again if needed)

All these files are in `.gitignore` and won't be committed to git.

## Summary

1. ✅ Run `node encode-private-key.js` to generate Base64 key
2. ✅ Copy Base64 string from `private-key-base64.txt`
3. ✅ Paste into Vercel > Settings > Environment Variables > `VITE_WINPAY_PRIVATE_KEY`
4. ✅ Save and redeploy
5. ✅ Test Virtual Account creation - should now get real WinPay VA numbers!
