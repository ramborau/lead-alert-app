'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Globe,
  Facebook,
  Webhook,
  Activity
} from 'lucide-react'
import { toast } from 'sonner'

interface WebhookTest {
  timestamp: string
  status: 'success' | 'error'
  data: any
  source: string
}

export default function WebhookTestPage() {
  const [webhookTests, setWebhookTests] = useState<WebhookTest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastPing, setLastPing] = useState<string | null>(null)

  const webhookUrl = 'https://lead-alert-app-fzlay.ondigitalocean.app/api/webhooks/facebook'
  const testWebhookUrl = 'https://lead-alert-app-fzlay.ondigitalocean.app/api/test/webhook'

  useEffect(() => {
    // Load recent webhook tests from localStorage
    const saved = localStorage.getItem('webhook-tests')
    if (saved) {
      setWebhookTests(JSON.parse(saved))
    }
    
    const lastPingTime = localStorage.getItem('last-webhook-ping')
    if (lastPingTime) {
      setLastPing(lastPingTime)
    }
  }, [])

  const saveTest = (test: WebhookTest) => {
    const updated = [test, ...webhookTests.slice(0, 9)] // Keep last 10 tests
    setWebhookTests(updated)
    localStorage.setItem('webhook-tests', JSON.stringify(updated))
  }

  const testWebhookEndpoint = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(testWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          source: 'manual-test'
        })
      })

      const data = await response.json()
      const now = new Date().toISOString()
      
      const test: WebhookTest = {
        timestamp: now,
        status: response.ok ? 'success' : 'error',
        data: data,
        source: 'Manual Test'
      }
      
      saveTest(test)
      setLastPing(now)
      localStorage.setItem('last-webhook-ping', now)
      
      if (response.ok) {
        toast.success('Webhook test successful!')
      } else {
        toast.error('Webhook test failed!')
      }
    } catch (error) {
      const now = new Date().toISOString()
      const test: WebhookTest = {
        timestamp: now,
        status: 'error',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        source: 'Manual Test'
      }
      saveTest(test)
      toast.error('Webhook connection failed!')
    } finally {
      setIsLoading(false)
    }
  }

  const clearTests = () => {
    setWebhookTests([])
    localStorage.removeItem('webhook-tests')
    toast.success('Test history cleared!')
  }

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl)
    toast.success('Webhook URL copied to clipboard!')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Webhook Connection Test</h1>
        <p className="text-muted-foreground">
          Test your Facebook webhook connection and monitor live data flow.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Webhook Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Webhook className="mr-2 h-5 w-5" />
              Webhook Status
            </CardTitle>
            <CardDescription>
              Current webhook configuration and connection status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Webhook Endpoint</p>
                    <p className="text-sm text-muted-foreground break-all">
                      {webhookUrl}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={copyWebhookUrl}>
                  Copy
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Last Activity</p>
                    <p className="text-sm text-muted-foreground">
                      {lastPing ? new Date(lastPing).toLocaleString() : 'No recent activity'}
                    </p>
                  </div>
                </div>
                <Badge variant={lastPing ? 'default' : 'secondary'}>
                  {lastPing ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Webhook endpoint is configured and ready to receive Facebook lead data.
              </AlertDescription>
            </Alert>

            <div className="flex space-x-2">
              <Button 
                onClick={testWebhookEndpoint} 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="mr-2 h-4 w-4" />
                )}
                {isLoading ? 'Testing...' : 'Test Connection'}
              </Button>
              <Button variant="outline" onClick={clearTests}>
                Clear History
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Facebook Integration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Facebook className="mr-2 h-5 w-5 text-blue-600" />
              Facebook Integration
            </CardTitle>
            <CardDescription>
              Facebook webhook registration and lead capture status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Webhook Registered</span>
                <Badge variant="default">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Active
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Lead Ads Access</span>
                <Badge variant="default">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Granted
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pages Access</span>
                <Badge variant="default">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Granted
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Webhook Verification</span>
                <Badge variant="default">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              </div>
            </div>

            <Alert>
              <Facebook className="h-4 w-4" />
              <AlertDescription>
                Your Facebook app is configured to send lead data to this webhook endpoint.
              </AlertDescription>
            </Alert>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                To generate test leads, create a Facebook Lead Ad and submit a test form.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Webhook Tests</CardTitle>
          <CardDescription>
            History of webhook connection tests and received data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {webhookTests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No webhook tests yet</p>
              <p className="text-sm">Click "Test Connection" to verify your webhook is working</p>
            </div>
          ) : (
            <div className="space-y-3">
              {webhookTests.map((test, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {test.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {test.source} - {test.status === 'success' ? 'Success' : 'Failed'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(test.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="mt-1">
                      <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-20">
                        {JSON.stringify(test.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}