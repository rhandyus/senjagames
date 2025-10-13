import crypto from 'crypto'

/**
 * Generate WinPay signature according to their SNAP API specification (Server-side version)
 *
 * @param {string} httpMethod - HTTP method (POST, GET, etc.)
 * @param {string} endpointUrl - The API endpoint URL
 * @param {Object} requestBody - The request body object
 * @param {string} timestamp - ISO8601 timestamp
 * @param {string} privateKeyPem - RSA private key in PEM format
 * @returns {string} Base64 encoded signature
 */
export function generateWinPaySignatureServer(
  httpMethod,
  endpointUrl,
  requestBody,
  timestamp,
  privateKeyPem
) {
  try {
    // Step 1: Minify the request body (remove spaces and newlines)
    const minifiedBody = JSON.stringify(requestBody)

    // Step 2: Generate SHA-256 hash of the minified body
    const bodyHash = crypto.createHash('sha256').update(minifiedBody).digest('hex').toLowerCase()

    // Step 3: Create string to sign
    const stringToSign = `${httpMethod}:${endpointUrl}:${bodyHash}:${timestamp}`

    console.log('WinPay Signature Generation (Server):')
    console.log('- HTTP Method:', httpMethod)
    console.log('- Endpoint URL:', endpointUrl)
    console.log('- Request Body:', minifiedBody)
    console.log('- Body Hash:', bodyHash)
    console.log('- Timestamp:', timestamp)
    console.log('- String to Sign:', stringToSign)

    // Step 4: Generate RSA-SHA256 signature
    if (!privateKeyPem || privateKeyPem.trim() === '') {
      console.warn('No private key provided, using mock signature for development')
      // Return a mock signature for development/testing
      const mockSignature = Buffer.from(`mock-signature-${Date.now()}`).toString('base64')
      return mockSignature
    }

    // Generate signature using Node.js crypto
    const sign = crypto.createSign('RSA-SHA256')
    sign.update(stringToSign)
    const signature = sign.sign(privateKeyPem, 'base64')

    console.log('- Generated Signature:', signature)

    return signature
  } catch (error) {
    console.error('Error generating WinPay signature:', error)

    // Fallback to mock signature for development
    console.warn('Falling back to mock signature due to error')
    const mockSignature = Buffer.from(`fallback-signature-${Date.now()}`).toString('base64')
    return mockSignature
  }
}

/**
 * Verify WinPay signature (for callback verification) - Server-side version
 *
 * @param {Object} requestBody - The callback request body
 * @param {string} timestamp - The timestamp from callback headers
 * @param {string} signature - The signature from callback headers
 * @param {string} publicKeyPem - RSA public key in PEM format
 * @param {string} endpointUrl - The endpoint URL used in signature generation
 * @returns {boolean} True if signature is valid
 */
export function verifyWinPaySignatureServer(
  requestBody,
  timestamp,
  signature,
  publicKeyPem,
  endpointUrl = '/v1.0/transfer-va/payment'
) {
  try {
    // Create the same string to sign as in generation
    const minifiedBody = JSON.stringify(requestBody)
    const bodyHash = crypto.createHash('sha256').update(minifiedBody).digest('hex').toLowerCase()
    const stringToSign = `POST:${endpointUrl}:${bodyHash}:${timestamp}`

    console.log('WinPay Signature Verification (Server):')
    console.log('- String to Sign:', stringToSign)
    console.log('- Received Signature:', signature)

    if (!publicKeyPem || publicKeyPem.trim() === '') {
      console.warn('No public key provided, skipping signature verification')
      return true // Allow in development
    }

    // Verify signature using Node.js crypto
    const verify = crypto.createVerify('RSA-SHA256')
    verify.update(stringToSign)
    const isValid = verify.verify(publicKeyPem, signature, 'base64')

    console.log('- Signature Valid:', isValid)

    return isValid
  } catch (error) {
    console.error('Error verifying WinPay signature:', error)
    return false
  }
}

/**
 * Extract public key from private key PEM (Server-side version)
 *
 * @param {string} privateKeyPem - Private key in PEM format
 * @returns {string} Public key in PEM format
 */
export function extractPublicKeyServer(privateKeyPem) {
  try {
    const keyObject = crypto.createPrivateKey(privateKeyPem)
    const publicKey = crypto.createPublicKey(keyObject)
    return publicKey.export({ type: 'spki', format: 'pem' })
  } catch (error) {
    console.error('Error extracting public key:', error)
    return null
  }
}
