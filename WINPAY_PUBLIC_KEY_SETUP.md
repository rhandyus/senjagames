# WinPay Public Key Setup Guide

## 📋 Overview

WinPay uses **Asymmetric Signature** (RSA) to authenticate API requests. You need to provide your **PUBLIC KEY** to WinPay so they can verify the signatures you send.

## 🔑 Your Keys

### Private Key (KEEP SECRET! ❌ Never share!)

- **File**: `private-key.pem`
- **Location**: Local only, NOT in git
- **Usage**: Used by your application to SIGN requests
- **Environment Variable**: `VITE_WINPAY_PRIVATE_KEY`

### Public Key (✅ Upload to WinPay)

- **File**: `public-key.pem`
- **Generated**: Using `generate-public-key.js`
- **Usage**: Upload to WinPay Dashboard for verification

## 📄 Your Public Key

```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnAEY47hE2EhaFgPldcu7
K6A9Rd1MJ2kOyAjf9giDvFx6epRZyrxe3oPSIB1e3r/CYAZ3JPN6MUCWPMrIz0D7
+8cmL44tob38NAOIHUbeir/4JkiGEvyuPk1qiyilf0oxPc7gg21y/oqZ5l5qHJTe
Ig1zshGDuFgrmaToPyFctO09v9QCMuAaYTMakOUUsYpwCq5wweWdEY9B/Kade+Z5
7gLRQiUKc2M4Fr5L23ZO20Qh6aj6XXKpmhhhjtGrid3w6/8pmGr04pAJT3gBGNEd
rhd+5593apNCQVLM4sGd+3n7hggq//GezbakEirFtneOxTzYpN3JZtxTV1sJ9dIS
mQIDAQAB
-----END PUBLIC KEY-----
```

## 🚀 Setup Steps

### Step 1: Login to WinPay Merchant Dashboard

1. Go to: https://merchant.winpay.id (or your WinPay merchant portal)
2. Login with your merchant credentials

### Step 2: Navigate to API Settings

1. Go to **Settings** or **API Configuration**
2. Look for **Public Key** or **RSA Public Key** field

### Step 3: Upload Your Public Key

1. Copy the entire content from `public-key.pem` (including the BEGIN/END lines)
2. Paste it in the **Public Key** field
3. Click **Save** or **Update**

### Step 4: Verify Configuration

Make sure these settings are configured in WinPay Dashboard:

- ✅ **Partner ID**: `fe515458-df5e-4ab6-9136-84b18e79f1e8`
- ✅ **Channel ID**: `SenjaGames`
- ✅ **Public Key**: (paste the key above)
- ✅ **Callback URL**: `https://yourdomain.com/api/winpay/payment`

## 🔐 How Signature Works

### 1. Your Application (Signs with Private Key)

```javascript
// String to sign
stringToSign = "POST:/v1.0/transfer-va/create-va:sha256hash:2023-09-19T12:11:14+07:00"

// Sign with your PRIVATE key
signature = SHA256withRSA(private_key, stringToSign)

// Send to WinPay with signature in header
headers: {
  "X-SIGNATURE": signature,
  "X-TIMESTAMP": timestamp,
  ...
}
```

### 2. WinPay Server (Verifies with Your Public Key)

```javascript
// WinPay receives your request
// Uses your PUBLIC key (that you uploaded) to verify
isValid = verify(public_key, signature, stringToSign)

// If valid, process the request
// If invalid, reject with error
```

## ✅ What You've Done

- [x] Generated private key (`private-key.pem`)
- [x] Generated public key (`public-key.pem`)
- [x] Added Base64 decoding support in code
- [x] Created setup scripts

## 📝 What You Need to Do

- [ ] Copy public key from `public-key.pem`
- [ ] Login to WinPay Merchant Dashboard
- [ ] Paste public key in API Settings
- [ ] Save the configuration
- [ ] Test Virtual Account creation

## 🧪 Testing

After uploading the public key to WinPay, test the integration:

```bash
# Test Virtual Account Creation
npm run dev

# In your app, try to create a payment
# Check the browser console for signature generation logs
# Check WinPay response for errors
```

### Expected Flow:

1. ✅ Your app generates signature with private key
2. ✅ Sends request to WinPay with signature
3. ✅ WinPay verifies signature with your public key
4. ✅ WinPay processes request and returns VA number

## 🔧 Troubleshooting

### Error: "Invalid Signature"

- ❌ Public key not uploaded to WinPay
- ❌ Wrong public key uploaded
- ❌ Mismatch between private and public key

**Solution**: Re-upload the public key from `public-key.pem`

### Error: "Unauthorized"

- ❌ Partner ID or Channel ID incorrect
- ❌ API credentials not activated

**Solution**: Contact WinPay support to verify credentials

### Error: Still Getting Mock VA Number

- ❌ Private key not loaded correctly
- ❌ VITE_WINPAY_PRIVATE_KEY not set in Vercel

**Solution**:

1. For local: Check `.env` file
2. For Vercel: Set environment variable with Base64 encoded key

## 📞 Support

If you need help:

- WinPay Documentation: https://docs.winpay.id
- WinPay Support: support@winpay.id
- Technical Support: Your WinPay Account Manager

## 🔒 Security Reminder

**NEVER** commit or share:

- ❌ `private-key.pem`
- ❌ `.env` file
- ❌ `private-key-base64.txt`

**Safe to share with WinPay**:

- ✅ `public-key.pem` (upload to their dashboard)
- ✅ Partner ID
- ✅ Channel ID
