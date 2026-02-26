// Test script for Doku SNAP API integration
const { Snap } = require('doku-nodejs-library')
require('dotenv').config()

async function testSnapIntegration() {
  console.log('Testing Doku SNAP API Integration...\n')

  try {
    // Initialize SNAP client
    const snap = new Snap({
      clientId: process.env.DOKU_CLIENT_ID,
      privateKey: process.env.DOKU_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      publicKey: process.env.DOKU_PUBLIC_KEY?.replace(/\\n/g, '\n'),
      secretKey: process.env.DOKU_SECRET_KEY,
      isProduction: process.env.DOKU_IS_PRODUCTION === 'true',
      baseUrl: process.env.DOKU_IS_PRODUCTION === 'true'
        ? 'https://api.doku.com'
        : 'https://api-sandbox.doku.com'
    })

    console.log('✓ SNAP client initialized successfully')
    console.log('Base URL:', process.env.DOKU_IS_PRODUCTION === 'true' ? 'https://api.doku.com' : 'https://api-sandbox.doku.com')

    // Test token generation
    console.log('\nTesting token generation...')
    const token = await snap.generateToken()
    console.log('✓ Token generated:', token.substring(0, 50) + '...')

    // Test Virtual Account creation
    console.log('\nTesting Virtual Account creation...')
    const vaRequest = {
      order: {
        invoice_number: 'TEST-' + Date.now(),
        amount: 10000,
        currency: 'IDR'
      },
      virtual_account_info: {
        expired_time: 60,
        reusable_status: false,
        info1: 'Test Payment',
        info2: 'Senja Games',
        info3: 'Test VA'
      },
      customer: {
        name: 'Test Customer',
        email: 'test@example.com'
      }
    }

    const vaResponse = await snap.createVa(vaRequest)
    console.log('✓ Virtual Account created successfully')
    console.log('VA Number:', vaResponse.virtual_account_info.virtual_account_number)
    console.log('Amount:', vaResponse.order.amount)
    console.log('Expired:', vaResponse.virtual_account_info.expired_date)

    console.log('\n🎉 All tests passed! SNAP API integration is working.')
  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    }
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Make sure your DOKU_PUBLIC_KEY is uploaded to Doku dashboard')
    console.log('2. Verify your Client ID and Secret Key are correct')
    console.log('3. Check if your account is activated for SNAP API')
    console.log('4. Confirm the base URL is correct for your environment')
  }
}

testSnapIntegration()
