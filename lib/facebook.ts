import axios from 'axios'

const FACEBOOK_GRAPH_URL = 'https://graph.facebook.com/v18.0'

export interface FacebookPage {
  id: string
  name: string
  access_token: string
}

export interface FacebookLead {
  id: string
  created_time: string
  field_data: Array<{
    name: string
    values: string[]
  }>
}

export async function registerWebhookProgrammatically() {
  const appAccessToken = `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`
  
  try {
    const response = await axios.post(
      `${FACEBOOK_GRAPH_URL}/${process.env.FACEBOOK_APP_ID}/subscriptions`,
      {
        object: 'page',
        callback_url: `${process.env.NEXTAUTH_URL}/api/webhooks/facebook`,
        fields: 'leadgen',
        verify_token: process.env.NEXTAUTH_SECRET,
        access_token: appAccessToken
      }
    )
    
    console.log('Webhook registered successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Failed to register webhook:', error)
    throw error
  }
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  try {
    const response = await axios.get(`${FACEBOOK_GRAPH_URL}/oauth/access_token`, {
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
        code
      }
    })
    
    return response.data.access_token
  } catch (error) {
    console.error('Failed to exchange code for token:', error)
    throw error
  }
}

export async function getUserPages(accessToken: string): Promise<FacebookPage[]> {
  try {
    const response = await axios.get(`${FACEBOOK_GRAPH_URL}/me/accounts`, {
      params: {
        access_token: accessToken,
        fields: 'id,name,access_token'
      }
    })
    
    return response.data.data
  } catch (error) {
    console.error('Failed to get user pages:', error)
    throw error
  }
}

export async function subscribePageToWebhook(pageId: string, pageAccessToken: string) {
  try {
    const response = await axios.post(
      `${FACEBOOK_GRAPH_URL}/${pageId}/subscribed_apps`,
      {
        subscribed_fields: 'leadgen',
        access_token: pageAccessToken
      }
    )
    
    console.log(`Page ${pageId} subscribed to webhook:`, response.data)
    return response.data
  } catch (error) {
    console.error(`Failed to subscribe page ${pageId}:`, error)
    throw error
  }
}

export async function getLeadDetails(leadId: string, pageAccessToken: string): Promise<FacebookLead> {
  try {
    const response = await axios.get(`${FACEBOOK_GRAPH_URL}/${leadId}`, {
      params: {
        access_token: pageAccessToken,
        fields: 'id,created_time,field_data'
      }
    })
    
    return response.data
  } catch (error) {
    console.error(`Failed to get lead details for ${leadId}:`, error)
    throw error
  }
}

export function parseLeadData(fieldData: FacebookLead['field_data']) {
  const leadInfo: any = {}
  
  fieldData.forEach(field => {
    const value = field.values[0]
    
    switch (field.name.toLowerCase()) {
      case 'full_name':
      case 'name':
        leadInfo.name = value
        break
      case 'email':
        leadInfo.email = value
        break
      case 'phone_number':
      case 'phone':
        leadInfo.phone = value
        break
      default:
        if (!leadInfo.metadata) leadInfo.metadata = {}
        leadInfo.metadata[field.name] = value
    }
  })
  
  return leadInfo
}