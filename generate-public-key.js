const fs = require('fs')
const crypto = require('crypto')

// Read the private key
const privateKeyPem = fs.readFileSync('private-key.pem', 'utf8')

console.log('=== Extracting Public Key from Private Key ===\n')

try {
  // Create a key object from the private key
  const privateKey = crypto.createPrivateKey(privateKeyPem)

  // Extract the public key
  const publicKey = crypto.createPublicKey(privateKey)

  // Export public key in PEM format
  const publicKeyPem = publicKey.export({
    type: 'spki',
    format: 'pem'
  })

  // Save to file
  fs.writeFileSync('public-key.pem', publicKeyPem)

  console.log('✅ Public key successfully generated!')
  console.log('\n📄 Public Key (PEM format):')
  console.log('─'.repeat(80))
  console.log(publicKeyPem)
  console.log('─'.repeat(80))

  console.log('\n📝 Files created:')
  console.log('   - private-key.pem (your private key - KEEP SECRET)')
  console.log('   - public-key.pem (your public key - upload to WinPay)')

  console.log('\n🔐 Next Steps:')
  console.log('   1. Copy the content of public-key.pem')
  console.log('   2. Login to WinPay Merchant Dashboard')
  console.log('   3. Go to Settings > API Configuration')
  console.log('   4. Paste the public key in the "Public Key" field')
  console.log('   5. Save the configuration')

  console.log('\n⚠️  IMPORTANT:')
  console.log('   - NEVER share your private-key.pem file')
  console.log('   - Only upload the public-key.pem to WinPay')
  console.log('   - Keep private-key.pem secure and backed up')
} catch (error) {
  console.error('❌ Error generating public key:', error.message)
  process.exit(1)
}
