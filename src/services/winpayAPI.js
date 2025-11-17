import CryptoJS from 'crypto-js'
import { generateWinPaySignature } from '../utils/winpaySignature.js'

class WinPayAPI {
  constructor() {
    // Always use server-side API routes to avoid CORS issues
    this.baseURL = '/api/winpay'
    this.partnerId = import.meta.env.VITE_WINPAY_PARTNER_ID
    this.channelId = import.meta.env.VITE_WINPAY_CHANNEL_ID

    // Decode private key from Base64 if needed (for Vercel environment variables)
    let privateKey = import.meta.env.VITE_WINPAY_PRIVATE_KEY
    if (privateKey && !privateKey.includes('-----BEGIN')) {
      // If it doesn't contain PEM header, assume it's Base64 encoded
      try {
        privateKey = atob(privateKey)
        console.log('Decoded Base64 private key for WinPay')
      } catch (e) {
        console.error('Failed to decode Base64 private key:', e)
      }
    }
    this.privateKey = privateKey

    this.clientSecret = import.meta.env.VITE_WINPAY_CLIENT_SECRET
    this.demoMode = import.meta.env.VITE_WINPAY_DEMO_MODE === 'true'
  }

  // Generate timestamp in ISO8601 format
  generateTimestamp() {
    return new Date().toISOString().replace('Z', '+07:00')
  }

  // Generate external ID (unique per day)
  generateExternalId() {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    return `EXT-${timestamp}-${random}`
  }

  // Generate transaction ID
  generateTrxId() {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    return `TRX-${timestamp}-${random}`
  }

  // Hash body with SHA-256
  hashBody(body) {
    const minifiedBody = JSON.stringify(body)
    const hash = CryptoJS.SHA256(minifiedBody).toString(CryptoJS.enc.Hex)
    return hash.toLowerCase()
  }

  // Generate signature according to WinPay SNAP standard
  generateSignature(httpMethod, endpointUrl, requestBody, timestamp) {
    // Use the WinPay signature generation utility
    return generateWinPaySignature(httpMethod, endpointUrl, requestBody, timestamp, this.privateKey)
  }

  // Create headers for API requests according to WinPay SNAP standard
  createHeaders(httpMethod, endpointUrl, body) {
    const timestamp = this.generateTimestamp()
    const externalId = this.generateExternalId()
    const signature = this.generateSignature(httpMethod, endpointUrl, body, timestamp)

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-TIMESTAMP': timestamp,
      'X-SIGNATURE': signature,
      'X-PARTNER-ID': this.partnerId,
      'X-EXTERNAL-ID': externalId,
      'CHANNEL-ID': this.channelId
    }

    return headers
  }

  // Create Virtual Account for payment according to WinPay VA specification
  async createVirtualAccount(paymentData) {
    const endpointUrl = '/v1.0/transfer-va/create-va'
    const httpMethod = 'POST'

    // Prepare request body according to WinPay VA documentation
    const body = {
      // customerNo is optional for ONE OFF (c) type - will be auto-generated if not provided
      virtualAccountName: paymentData.customerName,
      trxId: this.generateTrxId(),
      totalAmount: {
        value: paymentData.amount.toFixed(2), // Must be string with 2 decimal places
        currency: 'IDR'
      },
      virtualAccountTrxType: 'c', // ONE OFF payment (c = one-time use)
      expiredDate: this.getExpiryDate(), // Required for ONE OFF payments
      additionalInfo: {
        channel: paymentData.channel || 'BCA' // Channel code (BCA, BRI, BNI, etc.)
      }
    }

    console.log('Creating WinPay Virtual Account:', {
      endpoint: endpointUrl,
      channel: body.additionalInfo.channel,
      amount: body.totalAmount.value,
      trxId: body.trxId,
      customer: body.virtualAccountName
    })

    const headers = this.createHeaders(httpMethod, endpointUrl, body)

    try {
      // Use demo mode if credentials are missing or demo mode is enabled
      if (this.demoMode || !this.privateKey) {
        console.log('Using demo mode for Virtual Account creation')
        return this.simulateVirtualAccountResponse(body, paymentData)
      }

      // Real API call to WinPay via server-side proxy
      console.log('Making WinPay API call via server proxy...')
      const response = await fetch(`${this.baseURL}/create-va`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerNo: body.customerNo,
          virtualAccountName: body.virtualAccountName,
          trxId: body.trxId,
          totalAmount: body.totalAmount,
          virtualAccountTrxType: body.virtualAccountTrxType,
          expiredDate: body.expiredDate,
          channel: body.additionalInfo.channel
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('WinPay API Error Response:', errorText)

        // Try to parse error response as JSON
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch (e) {
          errorData = { message: errorText }
        }

        throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`)
      }

      const result = await response.json()

      console.log('WinPay API Success Response:', result)

      // Validate response according to WinPay specification
      if (result.responseCode !== '2002700') {
        console.error('WinPay API returned error:', result)
        throw new Error(`WinPay Error ${result.responseCode}: ${result.responseMessage}`)
      }

      return result
    } catch (error) {
      console.error('WinPay Virtual Account Creation Error:', error)
      throw new Error('Failed to create virtual account: ' + error.message)
    }
  }

  // Simulate API response for development/testing according to WinPay VA specification
  simulateVirtualAccountResponse(body, paymentData) {
    const mockVANumber = this.generateMockVANumber(paymentData.channel)
    const partnerServiceId = this.getBankCode(paymentData.channel).padStart(8, ' ') // Bank BIN with padding
    const contractId = `ci${Math.random().toString(36).substring(2, 15)}-${Date.now()}`

    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          responseCode: '2002700', // Success code according to WinPay spec
          responseMessage: 'Success',
          virtualAccountData: {
            partnerServiceId: partnerServiceId,
            customerNo: mockVANumber.replace(partnerServiceId.trim(), ''), // Customer number without BIN
            virtualAccountNo: mockVANumber, // Full VA number including BIN
            virtualAccountName: body.virtualAccountName,
            trxId: body.trxId,
            totalAmount: body.totalAmount,
            virtualAccountTrxType: body.virtualAccountTrxType,
            expiredDate: body.expiredDate,
            additionalInfo: {
              channel: paymentData.channel,
              contractId: contractId, // Contract ID for tracking
              instructions: this.getPaymentInstructions(paymentData.channel),
              bankCode: this.getBankCode(paymentData.channel)
            }
          }
        })
      }, 1000) // Simulate API delay
    })
  }

  // Generate mock virtual account number based on channel
  generateMockVANumber(channel) {
    // Bank codes for Indonesian banks
    const bankCodes = {
      BCA: '014',
      BNI: '009',
      BRI: '002',
      MANDIRI: '008',
      CIMB: '022',
      Danamon: '011',
      Permata: '013',
      BTN: '200',
      BSI: '451'
    }

    const bankCode = bankCodes[channel] || '014'
    // Generate all numeric components to ensure VA number contains only digits
    const randomNumber = Math.floor(Math.random() * 1000000000)
      .toString()
      .padStart(9, '0')
    const numericId = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')

    // Format: [BankCode][NumericID][RandomNumber] - all digits only
    const vaNumber = `${bankCode}${numericId}${randomNumber}`

    return vaNumber
  }

  // Get bank code for channel according to WinPay VA specification
  getBankCode(channel) {
    const bankCodes = {
      BCA: '22691', // Bank Central Asia
      BRI: '22689', // Bank Rakyat Indonesia
      BNI: '22688', // Bank Negara Indonesia
      MANDIRI: '22687', // Bank Mandiri
      CIMB: '22692', // Bank CIMB Niaga
      PERMATA: '22690', // Bank Permata
      BSI: '22693', // Bank Syariah Indonesia
      MUAMALAT: '22694', // Bank Muamalat
      SINARMAS: '22695', // Bank Sinarmas
      BNC: '22696', // Bank Neo Commerce
      INDOMARET: 'INDOMARET',
      ALFAMART: 'ALFAMART'
    }
    return bankCodes[channel] || '22691' // Default to BCA
  }

  // Get payment instructions for each channel
  getPaymentInstructions(channel) {
    const instructions = {
      BCA: [
        'Login ke aplikasi BCA mobile atau internet banking',
        'Pilih menu Transfer > Virtual Account',
        'Masukkan nomor Virtual Account',
        'Konfirmasi detail pembayaran',
        'Masukkan PIN/password untuk menyelesaikan transaksi'
      ],
      BNI: [
        'Login ke aplikasi BNI Mobile Banking',
        'Pilih menu Transfer > Virtual Account Billing',
        'Masukkan nomor Virtual Account',
        'Konfirmasi detail pembayaran',
        'Masukkan PIN untuk menyelesaikan transaksi'
      ],
      BRI: [
        'Login ke aplikasi BRImo',
        'Pilih menu Transfer > BRIVA',
        'Masukkan nomor Virtual Account',
        'Konfirmasi detail pembayaran',
        'Masukkan PIN untuk menyelesaikan transaksi'
      ],
      MANDIRI: [
        'Login ke aplikasi Livin by Mandiri',
        'Pilih menu Bayar > Virtual Account',
        'Masukkan nomor Virtual Account',
        'Konfirmasi detail pembayaran',
        'Masukkan PIN untuk menyelesaikan transaksi'
      ]
    }

    return instructions[channel] || instructions['BCA']
  }

  // Get expiry date (3 hours from now)
  getExpiryDate() {
    const expiry = new Date()
    expiry.setHours(expiry.getHours() + 3)
    return expiry.toISOString().replace('Z', '+07:00')
  }

  // Check payment status according to WinPay VA specification
  async checkPaymentStatus(virtualAccountNo, trxId, contractId, channel = 'BCA') {
    const endpointUrl = '/v1.0/transfer-va/status'
    const httpMethod = 'POST'

    const body = {
      virtualAccountNo: virtualAccountNo,
      trxId: trxId,
      additionalInfo: {
        contractId: contractId,
        channel: channel
      }
    }

    console.log('Checking WinPay VA Payment Status:', {
      virtualAccountNo,
      trxId,
      contractId,
      channel
    })

    const headers = this.createHeaders(httpMethod, endpointUrl, body)

    try {
      if (this.demoMode || !this.privateKey) {
        console.log('Using demo mode for status check')
        return this.simulateStatusResponse(body)
      }

      const response = await fetch(`${this.baseURL}${endpointUrl}`, {
        method: httpMethod,
        headers: headers,
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('WinPay Status Check Error Response:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()

      console.log('WinPay Status Check Response:', result)

      // Validate response according to WinPay specification
      if (result.responseCode !== '2002600') {
        console.error('WinPay Status API returned error:', result)
        throw new Error(`WinPay Error ${result.responseCode}: ${result.responseMessage}`)
      }

      return result
    } catch (error) {
      console.error('WinPay Status Check Error:', error)
      throw new Error('Failed to check payment status: ' + error.message)
    }
  }

  // Simulate status response for development/testing
  simulateStatusResponse(body) {
    const isPaid = Math.random() > 0.7 // 30% chance of being paid for demo

    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          responseCode: '2002600', // Success code for status inquiry
          responseMessage: 'Successful',
          virtualAccountData: {
            virtualAccountNo: body.virtualAccountNo,
            virtualAccountName: 'Demo Payment',
            paymentFlagStatus: isPaid ? '00' : '01', // 00 = paid, 01 = unpaid, 02 = check
            transactionDate: isPaid ? new Date().toISOString().replace('Z', '+00:00') : null,
            referenceNo: isPaid ? Math.floor(Math.random() * 100000).toString() : null,
            totalAmount: {
              value: '15000.00',
              currency: 'IDR'
            }
          },
          additionalInfo: body.additionalInfo
        })
      }, 800)
    })
  }

  // Get supported payment channels according to WinPay VA specification
  getSupportedChannels() {
    return [
      { code: 'BCA', name: 'Bank Central Asia', type: 'VA', supportedTypes: ['c', 'o', 'r'] },
      { code: 'BRI', name: 'Bank Rakyat Indonesia', type: 'VA', supportedTypes: ['c', 'o', 'r'] },
      { code: 'BNI', name: 'Bank Negara Indonesia', type: 'VA', supportedTypes: ['c'] }, // Only ONE OFF
      { code: 'MANDIRI', name: 'Bank Mandiri', type: 'VA', supportedTypes: ['c'] }, // Only ONE OFF
      { code: 'PERMATA', name: 'Bank Permata', type: 'VA', supportedTypes: ['c', 'o', 'r'] },
      { code: 'BSI', name: 'Bank Syariah Indonesia', type: 'VA', supportedTypes: ['c', 'o', 'r'] },
      { code: 'MUAMALAT', name: 'Bank Muamalat', type: 'VA', supportedTypes: ['c', 'o', 'r'] },
      { code: 'CIMB', name: 'Bank CIMB Niaga', type: 'VA', supportedTypes: ['c', 'o', 'r'] },
      { code: 'SINARMAS', name: 'Bank Sinarmas', type: 'VA', supportedTypes: ['c', 'o', 'r'] },
      { code: 'BNC', name: 'Bank Neo Commerce', type: 'VA', supportedTypes: ['c', 'o', 'r'] },
      { code: 'INDOMARET', name: 'Indomaret', type: 'VA', supportedTypes: ['c'] }, // Only ONE OFF
      { code: 'ALFAMART', name: 'Alfamart', type: 'VA', supportedTypes: ['c'] } // Only ONE OFF
    ]
  }
}

export default WinPayAPI
