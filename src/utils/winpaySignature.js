import CryptoJS from 'crypto-js'
import * as jsrsasign from 'jsrsasign'

/**
 * Generate WinPay signature according to their SNAP API specification
 *
 * Signature Generation Rules:
 * 1. stringToSign = HTTPMethod + ":" + EndpointUrl + ":" + Lowercase(HexEncode(SHA-256(minify(RequestBody)))) + ":" + TimeStamp
 * 2. signature = base64_encode(SHA256withRSA(private_key, stringToSign))
 *
 * @param {string} httpMethod - HTTP method (POST, GET, etc.)
 * @param {string} endpointUrl - The API endpoint URL
 * @param {Object} requestBody - The request body object
 * @param {string} timestamp - ISO8601 timestamp
 * @param {string} privateKeyPem - RSA private key in PEM format
 * @returns {string} Base64 encoded signature
 */
export function generateWinPaySignature(
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
    const bodyHash = CryptoJS.SHA256(minifiedBody).toString(CryptoJS.enc.Hex).toLowerCase()

    // Step 3: Create string to sign
    const stringToSign = `${httpMethod}:${endpointUrl}:${bodyHash}:${timestamp}`

    console.log('WinPay Signature Generation:')
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
      const mockSignature = CryptoJS.enc.Base64.stringify(
        CryptoJS.enc.Utf8.parse(`mock-signature-${Date.now()}`)
      )
      return mockSignature
    }

    // Initialize RSA key with jsrsasign (browser-compatible)
    const sig = new jsrsasign.KJUR.crypto.Signature({ alg: 'SHA256withRSA' })

    // Parse the private key
    const key = jsrsasign.KEYUTIL.getKey(privateKeyPem)

    // Initialize signature with private key
    sig.init(key)

    // Update with string to sign
    sig.updateString(stringToSign)

    // Generate signature (returns hex)
    const signatureHex = sig.sign()

    // Convert hex to base64
    const signature = jsrsasign.hextob64(signatureHex)

    console.log('- Generated Signature:', signature)

    return signature
  } catch (error) {
    console.error('Error generating WinPay signature:', error)

    // Fallback to mock signature for development
    console.warn('Falling back to mock signature due to error')
    const mockSignature = CryptoJS.enc.Base64.stringify(
      CryptoJS.enc.Utf8.parse(`fallback-signature-${Date.now()}`)
    )
    return mockSignature
  }
}

/**
 * Verify WinPay signature (for callback verification)
 *
 * @param {Object} requestBody - The callback request body
 * @param {string} timestamp - The timestamp from callback headers
 * @param {string} signature - The signature from callback headers
 * @param {string} publicKeyPem - RSA public key in PEM format
 * @param {string} endpointUrl - The endpoint URL used in signature generation (default: /v1.0/transfer-va/payment)
 * @returns {boolean} True if signature is valid
 */
export function verifyWinPaySignature(
  requestBody,
  timestamp,
  signature,
  publicKeyPem,
  endpointUrl = '/v1.0/transfer-va/payment'
) {
  try {
    // Create the same string to sign as in generation
    const minifiedBody = JSON.stringify(requestBody)
    const bodyHash = CryptoJS.SHA256(minifiedBody).toString(CryptoJS.enc.Hex).toLowerCase()
    const stringToSign = `POST:${endpointUrl}:${bodyHash}:${timestamp}`

    console.log('WinPay Signature Verification:')
    console.log('- String to Sign:', stringToSign)
    console.log('- Received Signature:', signature)

    if (!publicKeyPem || publicKeyPem.trim() === '') {
      console.warn('No public key provided, skipping signature verification')
      return true // Allow in development
    }

    // Initialize RSA signature verification with jsrsasign (browser-compatible)
    const sig = new jsrsasign.KJUR.crypto.Signature({ alg: 'SHA256withRSA' })

    // Parse the public key
    const key = jsrsasign.KEYUTIL.getKey(publicKeyPem)

    // Initialize verification with public key
    sig.init(key)

    // Update with string to sign
    sig.updateString(stringToSign)

    // Verify signature (convert base64 signature to hex first)
    const signatureHex = jsrsasign.b64tohex(signature)
    const isValid = sig.verify(signatureHex)

    console.log('- Signature Valid:', isValid)

    return isValid
  } catch (error) {
    console.error('Error verifying WinPay signature:', error)
    return false
  }
}

/**
 * Generate RSA key pair for testing (development only)
 * Note: This function requires Node.js environment
 *
 * @returns {Object} Object containing privateKey and publicKey in PEM format
 */
export function generateTestKeyPair() {
  try {
    // Generate RSA key pair using jsrsasign
    const rsaKeypair = jsrsasign.KEYUTIL.generateKeypair('RSA', 2048)

    const privateKey = jsrsasign.KEYUTIL.getPEM(rsaKeypair.prvKeyObj, 'PKCS1PRV')
    const publicKey = jsrsasign.KEYUTIL.getPEM(rsaKeypair.pubKeyObj)

    return {
      privateKey: privateKey,
      publicKey: publicKey
    }
  } catch (error) {
    console.error('Error generating key pair:', error)
    console.warn('Key generation is not supported in browser. Use Node.js script instead.')
    return null
  }
}

/**
 * Extract public key from private key PEM
 *
 * @param {string} privateKeyPem - Private key in PEM format
 * @returns {string} Public key in PEM format
 */
export function extractPublicKey(privateKeyPem) {
  try {
    const key = jsrsasign.KEYUTIL.getKey(privateKeyPem)
    const publicKey = jsrsasign.KEYUTIL.getPEM(key, 'PKCS8PUB')
    return publicKey
  } catch (error) {
    console.error('Error extracting public key:', error)
    return null
  }
}
