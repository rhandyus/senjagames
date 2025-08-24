# 🚀 Vercel Deployment Guide for WinPay Callback

## ✅ Pre-Deployment Checklist

Your project is now **Vercel-ready** with:

- ✅ Serverless API functions in `/api/winpay/`
- ✅ Proper Vercel configuration in `vercel.json`
- ✅ CORS headers configured
- ✅ Environment variables template
- ✅ Error handling and logging

## 🎯 Your Callback URLs (After Deployment)

### Production URLs

- **WinPay Callback**: `https://your-app.vercel.app/api/winpay/payment`
- **Health Check**: `https://your-app.vercel.app/api/winpay/health`

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**

   ```bash
   vercel login
   ```

3. **Deploy**

   ```bash
   vercel
   ```

4. **Set Environment Variables**

   ```bash
   vercel env add WINPAY_PARTNER_ID
   vercel env add WINPAY_CLIENT_SECRET
   vercel env add VITE_FIREBASE_API_KEY
   vercel env add VITE_FIREBASE_AUTH_DOMAIN
   vercel env add VITE_FIREBASE_PROJECT_ID
   vercel env add VITE_FIREBASE_STORAGE_BUCKET
   vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
   vercel env add VITE_FIREBASE_APP_ID
   ```

5. **Redeploy with Environment Variables**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub (Automatic)

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Add WinPay callback for Vercel"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in the dashboard

3. **Automatic Deployment**
   - Vercel will automatically deploy on every push

## 🔧 Environment Variables Setup

### In Vercel Dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add these variables:

```
WINPAY_PARTNER_ID = fe515458-df5e-4ab6-9136-84b18e79f1e8
WINPAY_CLIENT_SECRET = your_actual_secret_from_winpay
VITE_FIREBASE_API_KEY = your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN = your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = your_project_id
VITE_FIREBASE_STORAGE_BUCKET = your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID = your_sender_id
VITE_FIREBASE_APP_ID = your_app_id
```

## 🧪 Testing Your Deployed Callback

### Health Check

```bash
curl https://your-app.vercel.app/api/winpay/health
```

### Test Callback

```bash
curl -X POST https://your-app.vercel.app/api/winpay/payment \
  -H "Content-Type: application/json" \
  -H "X-Timestamp: 2023-08-24T17:07:05+07:00" \
  -H "X-Partner-ID: fe515458-df5e-4ab6-9136-84b18e79f1e8" \
  -H "X-Signature: test_signature" \
  -H "X-External-ID: test_123" \
  -d '{
    "trxId": "TEST-123",
    "paidAmount": {"value": "10000", "currency": "IDR"},
    "additionalInfo": {"channel": "CIMB", "contractId": "test"}
  }'
```

## 🏗️ Project Structure for Vercel

```
your-project/
├── api/
│   └── winpay/
│       ├── payment.js     # Main callback endpoint
│       └── health.js      # Health check endpoint
├── src/                   # Your React app
├── vercel.json           # Vercel configuration
├── package.json          # Dependencies
└── .env.vercel           # Environment template
```

## 📝 Configure WinPay Dashboard

1. **Login to WinPay Merchant Dashboard**
2. **Go to API Settings or Webhook Configuration**
3. **Set Callback URL to**: `https://your-app.vercel.app/api/winpay/payment`
4. **Save the configuration**

## 🔍 Monitoring & Debugging

### View Logs

1. Go to Vercel dashboard
2. Select your project
3. Click on "Functions" tab
4. View logs for `/api/winpay/payment`

### Check Function Status

- **Health Check**: `https://your-app.vercel.app/api/winpay/health`
- **Function Logs**: Available in Vercel dashboard

## ⚡ Vercel Serverless Benefits

- ✅ **Automatic Scaling**: Handles traffic spikes
- ✅ **Global CDN**: Fast response times worldwide
- ✅ **Built-in SSL**: HTTPS by default
- ✅ **Environment Variables**: Secure config management
- ✅ **Function Logs**: Easy debugging
- ✅ **Zero Downtime**: Continuous availability

## 🚨 Troubleshooting

### Common Issues:

1. **Environment Variables Not Set**
   - Check Vercel dashboard environment variables
   - Redeploy after adding variables

2. **Function Timeout**
   - Current timeout: 30 seconds (configured in vercel.json)
   - Increase if needed in vercel.json

3. **CORS Errors**
   - Headers are pre-configured in the API functions
   - Check browser developer tools for details

4. **Signature Verification Fails**
   - Verify `WINPAY_CLIENT_SECRET` is correct
   - Check WinPay documentation for signature format

## 🎉 Success Indicators

✅ **Deployment successful** when:

- Health check returns 200 OK
- Vercel dashboard shows function is active
- WinPay can reach your callback URL
- Test callback returns proper response

---

**Your WinPay callback is now production-ready on Vercel! 🎯**
