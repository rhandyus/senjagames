// Test LZT Market API token
const testToken = async () => {
  const token = process.env.LZT_TOKEN

  if (!token) {
    console.log('❌ No token found in environment variables')
    return
  }

  console.log('✅ Token found, testing API...')

  try {
    const response = await fetch('https://prod-api.lzt.market/mihoyo?page=1&per_page=5', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SenjaGames-API/1.0'
      }
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    if (response.ok) {
      const data = await response.json()
      console.log('✅ API Success! Items returned:', data.items?.length || 0)
      console.log('Sample data keys:', Object.keys(data))
    } else {
      const errorText = await response.text()
      console.log('❌ API Error:', errorText)
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message)
  }
}

testToken()
