import { generateTestKeyPair } from './src/utils/winpaySignature.js'

console.log('Generating RSA Key Pair for WinPay Testing...')
console.log('========================================')

const { privateKey, publicKey } = generateTestKeyPair()

console.log('\nPrivate Key (Add this to your .env file):')
console.log('VITE_WINPAY_PRIVATE_KEY="' + privateKey.replace(/\n/g, '\\n') + '"')

console.log('\nPublic Key (For WinPay Dashboard Configuration):')
console.log(publicKey)

console.log('\n========================================')
console.log('Instructions:')
console.log('1. Copy the private key to your .env file')
console.log('2. Send the public key to WinPay for configuration')
console.log('3. Test the signature generation with test-winpay-signature.js')
