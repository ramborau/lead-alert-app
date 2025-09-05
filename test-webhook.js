// Simple script to test webhook endpoint
// Note: This requires a valid session cookie to work

const testWebhook = async () => {
  try {
    const response = await fetch('http://localhost:3004/api/test/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': process.env.SESSION_COOKIE || ''
      }
    })

    const data = await response.json()
    
    console.log('Response status:', response.status)
    console.log('Response data:', data)
    
    if (response.ok) {
      console.log('✅ Test webhook endpoint is working!')
      console.log('Created test lead:', data.lead)
    } else {
      console.log('❌ Test webhook failed:', data.error)
    }
  } catch (error) {
    console.error('❌ Network error:', error.message)
  }
}

console.log('🧪 Testing webhook endpoint...')
testWebhook()