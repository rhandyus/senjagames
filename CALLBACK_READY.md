# 🎯 WinPay Virtual Account Callback - READY TO USE!

## ✅ Your Callback Server is Running!

### 🌐 Callback URLs

**For WinPay Dashboard Configuration:**

- **Local Development (testing)**: `http://localhost:3002/api/winpay/v1.0/transfer-va/payment`
- **For Production**: Deploy and use your production URL

### 🏃‍♂️ Quick Start

1. **Your server is already running** on `http://localhost:3002`
2. **Configure WinPay Dashboard**:
   - Login to your WinPay merchant dashboard
   - Go to API Settings or Webhook Configuration
   - Set callback URL to: `http://localhost:3002/api/winpay/v1.0/transfer-va/payment`

### 🧪 Test Your Callback

#### Health Check

```bash
curl http://localhost:3002/health
```

#### Test Endpoint

```bash
curl -X POST http://localhost:3002/api/winpay/test -H "Content-Type: application/json" -d '{"test": "data"}'
```

#### Simulate WinPay Callback

```bash
curl -X POST http://localhost:3002/api/winpay/v1.0/transfer-va/payment \
  -H "Content-Type: application/json" \
  -H "X-Timestamp: 2023-08-24T17:07:05+07:00" \
  -H "X-Partner-ID: fe515458-df5e-4ab6-9136-84b18e79f1e8" \
  -H "X-Signature: test_signature" \
  -H "X-External-ID: test_123" \
  -d '{
    "partnerServiceId": "22691",
    "customerNo": "41693903614",
    "virtualAccountNo": "2269141693903614",
    "virtualAccountName": "Test Payment",
    "trxId": "INV-TEST-123",
    "paymentRequestId": "88889123",
    "paidAmount": {
      "value": "10000",
      "currency": "IDR"
    },
    "trxDateTime": "2023-09-05T22:47:00+07:00",
    "referenceNo": "36238",
    "additionalInfo": {
      "channel": "CIMB",
      "contractId": "test-contract-id"
    }
  }'
```

### 🚀 For Production Deployment

#### Option 1: Using ngrok (for testing with real WinPay)

1. Install ngrok: https://ngrok.com/download
2. Run: `ngrok http 3002`
3. Use the ngrok URL in WinPay dashboard: `https://abc123.ngrok.io/api/winpay/v1.0/transfer-va/payment`

#### Option 2: Deploy to Cloud

- **Vercel**:
  ```bash
  npm install -g vercel
  vercel
  ```
- **Railway**: https://railway.app
- **Heroku**: https://heroku.com
- **DigitalOcean**: https://digitalocean.com

### 🔧 Configuration

Set these in your `.env` file or environment variables:

```env
WINPAY_PARTNER_ID=fe515458-df5e-4ab6-9136-84b18e79f1e8
WINPAY_CLIENT_SECRET=your_actual_secret_from_winpay
PORT=3002
```

### 📊 Callback Flow

1. **Customer pays** to Virtual Account
2. **WinPay sends callback** to your URL
3. **Server verifies** signature (if configured)
4. **Server processes** payment data
5. **Server responds** with success code
6. **WinPay confirms** payment completion

### 🛡️ Security Features

- ✅ Signature verification (HMAC-SHA256)
- ✅ CORS protection
- ✅ Request validation
- ✅ Error handling
- ✅ Request logging

### 📝 Server Logs

Your callback server logs all incoming requests. Check the terminal where you ran `npm run dev:callback` to see:

- Incoming callback data
- Signature verification results
- Processing status
- Any errors

### 🎉 Next Steps

1. **Configure WinPay Dashboard** with your callback URL
2. **Test with a real payment** (use ngrok for external access)
3. **Monitor the logs** to ensure callbacks are working
4. **Deploy to production** when ready

### 🆘 Troubleshooting

- **Port 3002 in use?** Change `PORT=3003` in `.env` file
- **WinPay not calling?** Check the callback URL in your dashboard
- **Signature errors?** Verify your `WINPAY_CLIENT_SECRET`
- **Still issues?** Check the server logs for detailed error messages

---

**Your WinPay callback system is ready! 🎯**
