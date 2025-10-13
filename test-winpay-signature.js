import {
  generateTestKeyPair,
  generateWinPaySignature,
  verifyWinPaySignature
} from './src/utils/winpaySignature.js'

console.log('Testing WinPay Signature Generation...')
console.log('======================================')

// Generate test keys
const { privateKey, publicKey } = generateTestKeyPair()

// Test data matching the WinPay documentation example
const httpMethod = 'POST'
const endpointUrl = '/v1.0/transfer-va/create-va'
const timestamp = '2023-09-19T12:11:14+07:00'
const requestBody = {
  customerNo: '08123456789',
  virtualAccountName: 'CHUS PANDI',
  trxId: 'INV-000000001',
  totalAmount: {
    value: '10000.00',
    currency: 'IDR'
  },
  virtualAccountTrxType: 'c',
  expiredDate: '2023-11-02T17:18:48+07:00',
  additionalInfo: {
    channel: 'BSI'
  }
}

console.log('\nTest Parameters:')
console.log('- HTTP Method:', httpMethod)
console.log('- Endpoint URL:', endpointUrl)
console.log('- Timestamp:', timestamp)
console.log('- Request Body:', JSON.stringify(requestBody, null, 2))

console.log('\n--- Signature Generation ---')
const signature = generateWinPaySignature(
  httpMethod,
  endpointUrl,
  requestBody,
  timestamp,
  privateKey
)
console.log('Generated Signature:', signature)

console.log('\n--- Signature Verification ---')
const isValid = verifyWinPaySignature(requestBody, timestamp, signature, publicKey, endpointUrl)
console.log('Signature Verification:', isValid ? 'VALID ✅' : 'INVALID ❌')

console.log('\n======================================')
console.log('Test completed!')

// Test with current timestamp
console.log('\n--- Testing with Current Timestamp ---')
const currentTimestamp = new Date().toISOString().replace('Z', '+07:00')
const currentSignature = generateWinPaySignature(
  httpMethod,
  endpointUrl,
  requestBody,
  currentTimestamp,
  privateKey
)
console.log('Current Signature:', currentSignature)

const currentValid = verifyWinPaySignature(
  requestBody,
  currentTimestamp,
  currentSignature,
  publicKey,
  endpointUrl
)
console.log('Current Verification:', currentValid ? 'VALID ✅' : 'INVALID ❌')
