'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Play, 
  Square, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Activity,
  Webhook
} from 'lucide-react'
import { toast } from 'sonner'

interface Lead {
  id: string
  name: string
  email: string
  createdAt: string
  source: string
}

export default function LeadMonitor() {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])
  const [lastCheck, setLastCheck] = useState<Date>(new Date())
  const [webhookStatus, setWebhookStatus] = useState<'unknown' | 'active' | 'error'>('unknown')

  // Test webhook endpoint
  const testWebhook = async () => {
    try {
      const response = await fetch('/api/test/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('🧪 Test lead created successfully!')
        
        // Add to recent leads
        setRecentLeads(prev => [data.lead, ...prev.slice(0, 4)])
        
        // Refresh page data after a delay
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        toast.error('Failed to create test lead: ' + data.error)
      }
    } catch {
      toast.error('Network error: Unable to test webhook')
    }
  }

  // Check webhook status
  const checkWebhookStatus = async () => {
    try {
      const response = await fetch('/api/test/webhook')
      if (response.ok) {
        setWebhookStatus('active')
      } else {
        setWebhookStatus('error')
      }
    } catch {
      setWebhookStatus('error')
    }
  }

  // Simulate monitoring (in real app, this would use WebSocket or Server-Sent Events)
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isMonitoring) {
      interval = setInterval(() => {
        setLastCheck(new Date())
        // In a real implementation, this would check for new leads
        console.log('Checking for new leads...', new Date().toISOString())
      }, 5000) // Check every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isMonitoring])

  // Check webhook status on mount
  useEffect(() => {
    checkWebhookStatus()
  }, [])

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring)
    if (!isMonitoring) {
      toast.success('🔍 Lead monitoring started')
    } else {
      toast.info('⏹️ Lead monitoring stopped')
    }
  }

  return (
    <div className="space-y-6">
      {/* Monitoring Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Real-time Lead Monitor
          </CardTitle>
          <CardDescription>
            Test webhook functionality and monitor live lead capture
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Webhook Status */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Webhook className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Webhook Status</p>
                <p className="text-sm text-muted-foreground">
                  Last checked: {lastCheck.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <Badge 
              className={
                webhookStatus === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : webhookStatus === 'error'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }
            >
              {webhookStatus === 'active' && <CheckCircle className="mr-1 h-3 w-3" />}
              {webhookStatus === 'error' && <AlertCircle className="mr-1 h-3 w-3" />}
              {webhookStatus === 'unknown' && <Clock className="mr-1 h-3 w-3" />}
              {webhookStatus === 'active' ? 'Active' : webhookStatus === 'error' ? 'Error' : 'Checking...'}
            </Badge>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={toggleMonitoring} 
              variant={isMonitoring ? "destructive" : "default"}
              className="flex-1"
            >
              {isMonitoring ? (
                <>
                  <Square className="mr-2 h-4 w-4" />
                  Stop Monitoring
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Monitoring
                </>
              )}
            </Button>
            
            <Button onClick={testWebhook} variant="outline" className="flex-1">
              <Zap className="mr-2 h-4 w-4" />
              Test Webhook
            </Button>
          </div>

          {isMonitoring && (
            <Alert>
              <Activity className="h-4 w-4" />
              <AlertDescription>
                🔍 Monitoring active - Checking for new leads every 5 seconds...
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Recent Test Leads */}
      {recentLeads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Test Leads</CardTitle>
            <CardDescription>
              Latest test leads generated via webhook
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50/50">
                  <div>
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-sm text-muted-foreground">{lead.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">Test Lead</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(lead.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <p className="text-sm"><strong>1. Start Monitoring:</strong> Click &quot;Start Monitoring&quot; to begin watching for leads</p>
            <p className="text-sm"><strong>2. Test Webhook:</strong> Click &quot;Test Webhook&quot; to simulate a Facebook lead</p>
            <p className="text-sm"><strong>3. Check Dashboard:</strong> New leads will appear in your dashboard and leads page</p>
            <p className="text-sm"><strong>4. Live Testing:</strong> Once deployed, Facebook will send real leads to your webhook</p>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Webhook URL:</strong> Your app will receive leads at <code>/api/webhooks/facebook</code>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}