import WinPayAPI from './src/services/winpayAPI.js'

console.log('Testing WinPay Virtual Account Implementation...')
console.log('================================================')

// Initialize WinPay API
const winpay = new WinPayAPI()

// Test data for Virtual Account creation
const testPaymentData = {
  amount: 150000,
  customerName: 'John Doe Test',
  channel: 'BCA', // Test with BCA
  items: [{ name: 'Steam Account Premium', price: 150000 }]
}

console.log('\n--- Test 1: Create Virtual Account ---')
console.log('Payment Data:', testPaymentData)

try {
  const vaResult = await winpay.createVirtualAccount(testPaymentData)

  console.log('\n✅ Virtual Account Created Successfully!')
  console.log('Response Code:', vaResult.responseCode)
  console.log('Response Message:', vaResult.responseMessage)

  if (vaResult.virtualAccountData) {
    const vaData = vaResult.virtualAccountData
    console.log('\nVirtual Account Details:')
    console.log('- Partner Service ID:', vaData.partnerServiceId)
    console.log('- Customer No:', vaData.customerNo)
    console.log('- VA Number:', vaData.virtualAccountNo)
    console.log('- VA Name:', vaData.virtualAccountName)
    console.log('- Transaction ID:', vaData.trxId)
    console.log('- Amount:', vaData.totalAmount?.value, vaData.totalAmount?.currency)
    console.log('- Transaction Type:', vaData.virtualAccountTrxType)
    console.log('- Expiry Date:', vaData.expiredDate)
    console.log('- Channel:', vaData.additionalInfo?.channel)
    console.log('- Contract ID:', vaData.additionalInfo?.contractId)

    // Test payment status check
    if (vaData.virtualAccountNo && vaData.trxId && vaData.additionalInfo?.contractId) {
      console.log('\n--- Test 2: Check Payment Status ---')

      try {
        const statusResult = await winpay.checkPaymentStatus(
          vaData.virtualAccountNo,
          vaData.trxId,
          vaData.additionalInfo.contractId,
          vaData.additionalInfo.channel
        )

        console.log('\n✅ Payment Status Check Successful!')
        console.log('Status Response Code:', statusResult.responseCode)
        console.log('Status Response Message:', statusResult.responseMessage)

        if (statusResult.virtualAccountData) {
          const statusData = statusResult.virtualAccountData
          console.log('\nPayment Status Details:')
          console.log('- VA Number:', statusData.virtualAccountNo)
          console.log('- VA Name:', statusData.virtualAccountName)
          console.log(
            '- Payment Status:',
            statusData.paymentFlagStatus,
            statusData.paymentFlagStatus === '00'
              ? '(PAID)'
              : statusData.paymentFlagStatus === '01'
                ? '(UNPAID)'
                : '(CHECK)'
          )
          console.log('- Transaction Date:', statusData.transactionDate || 'Not paid yet')
          console.log('- Reference No:', statusData.referenceNo || 'Not available')
          console.log('- Amount:', statusData.totalAmount?.value, statusData.totalAmount?.currency)
        }
      } catch (statusError) {
        console.error('❌ Payment Status Check Failed:', statusError.message)
      }
    }
  }
} catch (error) {
  console.error('❌ Virtual Account Creation Failed:', error.message)
}

console.log('\n--- Test 3: Supported Channels ---')
const supportedChannels = winpay.getSupportedChannels()
console.log('\nSupported Payment Channels:')
supportedChannels.forEach(channel => {
  console.log(`- ${channel.code}: ${channel.name}`)
  console.log(`  Supported Types: ${channel.supportedTypes.join(', ')}`)
  console.log(`  Type Meanings: c=One Off, o=Open Recurring, r=Close Recurring`)
})

console.log('\n--- Test 4: Bank Codes ---')
console.log('\nBank Codes for VA Generation:')
const testChannels = ['BCA', 'BRI', 'BNI', 'MANDIRI', 'BSI', 'CIMB']
testChannels.forEach(channel => {
  const bankCode = winpay.getBankCode(channel)
  console.log(`- ${channel}: ${bankCode}`)
})

console.log('\n--- Test 5: Payment Instructions ---')
console.log('\nPayment Instructions for Popular Channels:')
testChannels.forEach(channel => {
  const instructions = winpay.getPaymentInstructions(channel)
  console.log(`\n${channel} Instructions:`)
  instructions.forEach((instruction, index) => {
    console.log(`  ${index + 1}. ${instruction}`)
  })
})

console.log('\n================================================')
console.log('WinPay Virtual Account Test Completed!')
console.log('================================================')

// Test callback payload structure
console.log('\n--- Test 6: Mock Callback Payload ---')
const mockCallbackPayload = {
  partnerServiceId: '   22691',
  customerNo: '41693903614',
  virtualAccountNo: '   2269141693903614',
  virtualAccountName: 'John Doe Test',
  trxId: 'TRX-123456789',
  paymentRequestId: '88889123',
  paidAmount: {
    value: '150000.00',
    currency: 'IDR'
  },
  trxDateTime: new Date().toISOString().replace('Z', '+07:00'),
  referenceNo: '50966',
  additionalInfo: {
    channel: 'BCA',
    contractId: 'ci71a51730-2373-455f-b538-3f9912fefb73'
  }
}

console.log('Mock Callback Payload:', JSON.stringify(mockCallbackPayload, null, 2))

console.log('\nExpected Callback Response:')
console.log(
  JSON.stringify(
    {
      responseCode: '2002500',
      responseMessage: 'Successful'
    },
    null,
    2
  )
)
