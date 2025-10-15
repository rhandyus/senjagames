# QUICK FIX: WinPay Production Issue

## 🔴 Problem
Production shows FAKE virtual account numbers instead of real WinPay VAs because Vercel can't save multi-line environment variables.

## ✅ Solution Applied

### 1. Code Updated
- Modified `src/services/winpayAPI.js` to automatically decode Base64 encoded private keys
- Now supports BOTH formats: PEM (local) and Base64 (Vercel)

### 2. Files Created
- ✅ `encode-private-key.js` - Script to convert PEM to Base64
- ✅ `private-key-base64.txt` - Your Base64 encoded private key (2240 characters)
- ✅ `VERCEL_WINPAY_ENV_SETUP.md` - Complete setup guide

### 3. Files Protected
- Updated `.gitignore` to prevent committing sensitive files

## 🚀 WHAT YOU NEED TO DO NOW

### Step 1: Copy Base64 Key
Open the file `private-key-base64.txt` and copy the ENTIRE contents (it's one very long line).

### Step 2: Update Vercel
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Find `VITE_WINPAY_PRIVATE_KEY` or create it
5. **Paste the entire Base64 string** (no quotes, single line)
6. Select: Production, Preview, Development
7. Click **Save**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click latest deployment
3. Click **Redeploy**

OR just push a new commit:
```powershell
git add .
git commit -m "Fix WinPay private key for Vercel"
git push origin main
```

### Step 4: Verify
After deployment:
1. Test creating a Virtual Account in production
2. Check Vercel function logs for: `Decoded Base64 private key for WinPay`
3. You should now get REAL WinPay VA numbers!

## 📋 Other Required Vercel Environment Variables

Make sure these are also set in Vercel:
```
VITE_WINPAY_PARTNER_ID=fe515458-df5e-4ab6-9136-84b18e79f1e8
VITE_WINPAY_CHANNEL_ID=SenjaGames
VITE_WINPAY_BASE_URL=https://api.winpay.id
VITE_WINPAY_DEMO_MODE=false
```

## 🔍 Why This Happened

Vercel's environment variable input doesn't support multi-line values properly. When you paste a private key with line breaks:
- ❌ Vercel truncates or corrupts it
- ❌ Shows empty or incomplete value
- ❌ Code falls back to mock/fake responses

By encoding to Base64:
- ✅ Single line string
- ✅ Vercel saves it completely
- ✅ Code automatically decodes it
- ✅ Real WinPay API calls work!

## 📖 Full Documentation

See `VERCEL_WINPAY_ENV_SETUP.md` for detailed guide and troubleshooting.
