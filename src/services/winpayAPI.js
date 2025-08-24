import CryptoJS from 'crypto-js'

class WinPayAPI {
  constructor() {
    // Use proxy in development, direct URL in production
    this.baseURL = import.meta.env.DEV ? '/winpay-api' : import.meta.env.VITE_WINPAY_BASE_URL
    this.partnerId = import.meta.env.VITE_WINPAY_PARTNER_ID
    this.channelId = import.meta.env.VITE_WINPAY_CHANNEL_ID
    this.privateKey = import.meta.env.VITE_WINPAY_PRIVATE_KEY
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
  generateSignature(httpMethod, endpointUrl, hashedBody, timestamp) {
    // SNAP signature format: HTTPMethod:URL:AccessToken:HashedBody:Timestamp
    const stringToSign = `${httpMethod}:${endpointUrl}:${this.partnerId}:${hashedBody}:${timestamp}`

    // For WinPay SNAP, we use HMAC-SHA256 with partner ID as key
    const signature = CryptoJS.HmacSHA256(stringToSign, this.partnerId).toString(
      CryptoJS.enc.Base64
    )

    return signature
  }

  // Create headers for API requests according to WinPay SNAP standard
  createHeaders(httpMethod, endpointUrl, body) {
    const timestamp = this.generateTimestamp()
    const externalId = this.generateExternalId()
    const hashedBody = this.hashBody(body)
    const signature = this.generateSignature(httpMethod, endpointUrl, hashedBody, timestamp)

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

  // Create Virtual Account for payment
  async createVirtualAccount(paymentData) {
    const endpointUrl = '/v1.0/transfer-va/create-va'
    const httpMethod = 'POST'

    const body = {
      virtualAccountName: paymentData.customerName,
      trxId: this.generateTrxId(),
      totalAmount: {
        value: paymentData.amount.toString(),
        currency: 'IDR'
      },
      virtualAccountTrxType: 'c', // ONE OFF payment
      expiredDate: this.getExpiryDate(),
      additionalInfo: {
        channel: paymentData.channel || 'BCA'
      }
    }

    const headers = this.createHeaders(httpMethod, endpointUrl, body)

    try {
      // Use demo mode if credentials are missing or demo mode is enabled
      if (this.demoMode || !this.privateKey || !this.clientSecret) {
        return this.simulateVirtualAccountResponse(body, paymentData)
      }

      // Real API call

      const response = await fetch(`${this.baseURL}${endpointUrl}`, {
        method: httpMethod,
        headers: headers,
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)

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

      return result
    } catch (error) {
      console.error('WinPay API Error:', error)
      throw new Error('Failed to create virtual account: ' + error.message)
    }
  }

  // Simulate API response for development/testing
  simulateVirtualAccountResponse(body, paymentData) {
    const mockVANumber = this.generateMockVANumber(paymentData.channel)

    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          responseCode: '2000000',
          responseMessage: 'Successful',
          virtualAccountData: {
            partnerServiceId: this.partnerId,
            customerNumber: mockVANumber,
            virtualAccountNumber: mockVANumber,
            virtualAccountNo: mockVANumber, // Add this for compatibility
            virtualAccountName: body.virtualAccountName,
            trxId: body.trxId,
            totalAmount: body.totalAmount,
            expiredDate: body.expiredDate,
            additionalInfo: {
              channel: paymentData.channel,
              instructions: this.getPaymentInstructions(paymentData.channel),
              bankCode: this.getBankCode(paymentData.channel),
              contractId: `CONTRACT-${Date.now()}` // Add contract ID for demo
            }
          }
        })
      }, 1500) // Simulate API delay
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

  // Get bank code for channel
  getBankCode(channel) {
    const bankCodes = {
      BCA: '014',
      BNI: '009',
      BRI: '002',
      MANDIRI: '008',
      CIMB: '022',
      PERMATA: '013',
      BSI: '451',
      INDOMARET: 'INDOMARET',
      ALFAMART: 'ALFAMART'
    }
    return bankCodes[channel] || '014'
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

  // Check payment status
  async checkPaymentStatus(virtualAccountNo, trxId, contractId) {
    const endpointUrl = '/v1.0/transfer-va/status'
    const httpMethod = 'POST'

    const body = {
      virtualAccountNo: virtualAccountNo,
      trxId: trxId,
      additionalInfo: {
        contractId: contractId,
        channel: 'BCA'
      }
    }

    const headers = this.createHeaders(httpMethod, endpointUrl, body)

    try {
      const response = await fetch(`${this.baseURL}${endpointUrl}`, {
        method: httpMethod,
        headers: headers,
        body: JSON.stringify(body)
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('WinPay Status Check Error:', error)
      throw new Error('Failed to check payment status')
    }
  }

  // Get supported payment channels
  getSupportedChannels() {
    return [
      { code: 'BCA', name: 'Bank Central Asia', type: 'VA' },
      { code: 'BNI', name: 'Bank Negara Indonesia', type: 'VA' },
      { code: 'BRI', name: 'Bank Rakyat Indonesia', type: 'VA' },
      { code: 'MANDIRI', name: 'Bank Mandiri', type: 'VA' },
      { code: 'PERMATA', name: 'Bank Permata', type: 'VA' },
      { code: 'BSI', name: 'Bank Syariah Indonesia', type: 'VA' },
      { code: 'CIMB', name: 'Bank CIMB Niaga', type: 'VA' },
      { code: 'INDOMARET', name: 'Indomaret', type: 'VA' },
      { code: 'ALFAMART', name: 'Alfamart', type: 'VA' }
    ]
  }
}

export default WinPayAPI
