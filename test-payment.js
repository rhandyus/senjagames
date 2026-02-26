// Simple test script to check Doku Direct API payment
fetch('http://localhost:3010/api/payment/create-payment', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 50000, // 50,000 IDR
    customerName: 'Test Customer',
    customerEmail: 'test@senjagames.id',
    trxId: `TEST${Date.now()}`,
    paymentChannel: 'VIRTUAL_ACCOUNT_BANK_CIMB'
  })
})
  .then(response => {
    console.log('✅ Response status:', response.status)
    return response.json()
  })
  .then(data => {
    console.log('📦 Response data:', JSON.stringify(data, null, 2))
    if (data.success) {
      console.log('✅ Payment created successfully!')
      console.log('💳 Virtual Account:', data.data.virtualAccountNo)
      console.log('💰 Amount:', data.data.amount, data.data.currency)
    } else {
      console.error('❌ Payment failed:', data.error)
    }
  })
  .catch(error => {
    console.error('❌ Error:', error.message)
  })
