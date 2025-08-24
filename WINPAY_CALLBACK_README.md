# WinPay Virtual Account Callback Setup

## Overview

This setup provides a complete callback handler for WinPay Virtual Account payments according to their SNAP API documentation.

## Files Created

- `server.js` - Express server for handling callbacks
- `src/api/winpayCallback.js` - WinPay callback handler
- `.env.example` - Environment variables template

## Setup Instructions

### 1. Install Dependencies

```powershell
npm install
```

### 2. Environment Configuration

1. Copy `.env.example` to `.env`
2. Fill in your Firebase and WinPay credentials:
   ```
   WINPAY_PARTNER_ID=fe515458-df5e-4ab6-9136-84b18e79f1e8
   WINPAY_CLIENT_SECRET=your_secret_from_winpay
   ```

### 3. Run the Callback Server

```powershell
# Development mode
npm run dev:server

# Production mode
npm run server
```

### 4. Callback URL

Your callback URL will be:

- **Local Development**: `http://localhost:3001/api/winpay/v1.0/transfer-va/payment`
- **Production**: `https://yourdomain.com/api/winpay/v1.0/transfer-va/payment`

## Callback Flow

### 1. Payment Process

1. Customer makes payment to Virtual Account
2. WinPay sends callback to your URL
3. Server verifies signature and processes payment
4. Transaction status updated in Firestore
5. User's purchased accounts updated

### 2. Security Features

- **Signature Verification**: Uses HMAC-SHA256 to verify WinPay callbacks
- **Rate Limiting**: Prevents abuse
- **CORS Protection**: Only allows configured origins
- **Request Validation**: Validates all required headers and payload

### 3. Callback Headers (from WinPay)

```
Content-Type: application/json
X-Timestamp: 2023-08-24T17:07:05+07:00
X-Partner-ID: fe515458-df5e-4ab6-9136-84b18e79f1e8
X-Signature: generated_signature
X-External-ID: unique_external_id
Channel-ID: channel_id
```

### 4. Callback Payload Example

```json
{
  "partnerServiceId": "22691",
  "customerNo": "41693903614",
  "virtualAccountNo": "2269141693903614",
  "virtualAccountName": "Bayar 2269141693903614",
  "trxId": "INV-000000023212x2224",
  "paymentRequestId": "88889123",
  "paidAmount": {
    "value": "10000",
    "currency": "IDR"
  },
  "trxDateTime": "2023-09-05T22:47:00+07:00",
  "referenceNo": "36238",
  "additionalInfo": {
    "channel": "CIMB",
    "contractId": "ci71a51730-2373-455f-b538-3f9912fefb73"
  }
}
```

### 5. Expected Response

```json
{
  "responseCode": "2002500",
  "responseMessage": "Successful"
}
```

## Deployment

### For Local Testing (ngrok)

1. Install ngrok: https://ngrok.com/
2. Run your server: `npm run dev:server`
3. Expose via ngrok: `ngrok http 3001`
4. Use the ngrok URL as your callback URL in WinPay dashboard

### For Production

1. Deploy to your hosting service (Vercel, Railway, etc.)
2. Set environment variables in your hosting dashboard
3. Update WinPay callback URL to your production URL

## Testing

### Health Check

```bash
curl http://localhost:3001/health
```

### Manual Callback Test

```bash
curl -X POST http://localhost:3001/api/winpay/v1.0/transfer-va/payment \
  -H "Content-Type: application/json" \
  -H "X-Timestamp: 2023-08-24T17:07:05+07:00" \
  -H "X-Partner-ID: fe515458-df5e-4ab6-9136-84b18e79f1e8" \
  -H "X-Signature: test_signature" \
  -H "X-External-ID: test_123" \
  -d '{"test": "data"}'
```

## Error Handling

### Response Codes

- `2002500` - Successful
- `4000000` - Missing required headers
- `4000001` - Payment amount mismatch
- `4010000` - Invalid signature
- `4040000` - Transaction/Endpoint not found
- `5000000` - Internal server error

## WinPay Configuration

In your WinPay dashboard, set the callback URL to:

- Development: `https://your-ngrok-url.ngrok.io/api/winpay/v1.0/transfer-va/payment`
- Production: `https://yourdomain.com/api/winpay/v1.0/transfer-va/payment`

## Notes

- WinPay will retry callbacks 3 times if no proper response is received
- Signature verification is mandatory for security
- All transactions are logged for debugging
- Firestore integration automatically updates user accounts and stats
