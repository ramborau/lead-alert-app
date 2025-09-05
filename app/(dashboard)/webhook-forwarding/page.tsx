'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Webhook, 
  Plus, 
  Settings, 
  Trash2, 
  Facebook,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Save,
  TestTube
} from 'lucide-react'
import { toast } from 'sonner'

interface FacebookPage {
  id: string
  pageId: string
  name: string
  leadsCount: number
}

interface WebhookConfig {
  id?: string
  pageId: string
  pageName: string
  webhookUrl: string
  isActive: boolean
  authHeader?: string
  customHeaders?: Record<string, string>
  createdAt?: string
  lastUsed?: string
}

export default function WebhookForwardingPage() {
  const [pages, setPages] = useState<FacebookPage[]>([])
  const [webhookConfigs, setWebhookConfigs] = useState<WebhookConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedPageId, setSelectedPageId] = useState<string>('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [authHeader, setAuthHeader] = useState('')
  const [customHeaders, setCustomHeaders] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      // Fetch Facebook pages
      const pagesResponse = await fetch('/api/pages')
      if (pagesResponse.ok) {
        const pagesData = await pagesResponse.json()
        setPages(pagesData.pages || [])
      }

      // Fetch existing webhook configurations
      const webhooksResponse = await fetch('/api/webhook-configs')
      if (webhooksResponse.ok) {
        const webhooksData = await webhooksResponse.json()
        setWebhookConfigs(webhooksData.configs || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const saveWebhookConfig = async () => {
    if (!selectedPageId || !webhookUrl) {
      toast.error('Please select a page and enter webhook URL')
      return
    }

    try {
      setSaving(true)
      const selectedPage = pages.find(p => p.pageId === selectedPageId)
      
      const config: WebhookConfig = {
        pageId: selectedPageId,
        pageName: selectedPage?.name || 'Unknown Page',
        webhookUrl,
        isActive: true,
        authHeader: authHeader || undefined,
        customHeaders: customHeaders ? JSON.parse(customHeaders) : undefined
      }

      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/webhook-configs/${editingId}` : '/api/webhook-configs'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      })

      if (response.ok) {
        toast.success(`Webhook configuration ${editingId ? 'updated' : 'saved'} successfully`)
        await fetchData()
        resetForm()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to save configuration')
      }
    } catch (error) {
      console.error('Error saving webhook config:', error)
      toast.error('Invalid JSON in custom headers or other error')
    } finally {
      setSaving(false)
    }
  }

  const testWebhook = async (config: WebhookConfig) => {
    try {
      const response = await fetch('/api/webhook-configs/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          webhookUrl: config.webhookUrl,
          authHeader: config.authHeader,
          customHeaders: config.customHeaders
        })
      })

      if (response.ok) {
        toast.success('Webhook test successful!')
      } else {
        const error = await response.json()
        toast.error(`Webhook test failed: ${error.message}`)
      }
    } catch (error) {
      toast.error('Webhook test failed: Connection error')
    }
  }

  const deleteWebhookConfig = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook configuration?')) {
      return
    }

    try {
      const response = await fetch(`/api/webhook-configs/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Webhook configuration deleted')
        await fetchData()
      } else {
        toast.error('Failed to delete configuration')
      }
    } catch (error) {
      toast.error('Failed to delete configuration')
    }
  }

  const editWebhookConfig = (config: WebhookConfig) => {
    setEditingId(config.id || null)
    setSelectedPageId(config.pageId)
    setWebhookUrl(config.webhookUrl)
    setAuthHeader(config.authHeader || '')
    setCustomHeaders(config.customHeaders ? JSON.stringify(config.customHeaders, null, 2) : '')
  }

  const resetForm = () => {
    setEditingId(null)
    setSelectedPageId('')
    setWebhookUrl('')
    setAuthHeader('')
    setCustomHeaders('')
  }

  const toggleConfigStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/webhook-configs/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive })
      })

      if (response.ok) {
        toast.success(`Webhook ${isActive ? 'activated' : 'deactivated'}`)
        await fetchData()
      } else {
        toast.error('Failed to update status')
      }
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Webhook className="mr-2 h-8 w-8" />
          Webhook Forwarding
        </h1>
        <p className="text-muted-foreground">
          Configure external webhooks to forward Facebook leads to your own systems
        </p>
      </div>

      {/* Create/Edit Webhook Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="mr-2 h-5 w-5" />
            {editingId ? 'Edit Webhook Configuration' : 'Add New Webhook Configuration'}
          </CardTitle>
          <CardDescription>
            Set up external webhook endpoints to receive lead data from specific Facebook pages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="page-select">Facebook Page</Label>
              <Select value={selectedPageId} onValueChange={setSelectedPageId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a Facebook page" />
                </SelectTrigger>
                <SelectContent>
                  {pages.map((page) => (
                    <SelectItem key={page.pageId} value={page.pageId}>
                      {page.name} ({page.leadsCount} leads)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://your-app.com/api/webhooks/leads"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="auth-header">Authorization Header (Optional)</Label>
            <Input
              id="auth-header"
              placeholder="Bearer your-api-key-here"
              value={authHeader}
              onChange={(e) => setAuthHeader(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-headers">Custom Headers (Optional JSON)</Label>
            <textarea
              id="custom-headers"
              className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder='{"X-Custom-Header": "value", "X-API-Version": "1.0"}'
              value={customHeaders}
              onChange={(e) => setCustomHeaders(e.target.value)}
            />
          </div>

          <div className="flex space-x-2">
            <Button onClick={saveWebhookConfig} disabled={saving}>
              {saving ? (
                <Settings className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {saving ? 'Saving...' : (editingId ? 'Update Configuration' : 'Save Configuration')}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Existing Configurations */}
      <Card>
        <CardHeader>
          <CardTitle>Active Webhook Configurations</CardTitle>
          <CardDescription>
            Manage your existing webhook forwarding configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {webhookConfigs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Webhook className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No webhook configurations yet</p>
              <p className="text-sm">Create your first configuration above to start forwarding leads</p>
            </div>
          ) : (
            <div className="space-y-4">
              {webhookConfigs.map((config) => (
                <div key={config.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className="text-blue-600">
                          <Facebook className="mr-1 h-3 w-3" />
                          {config.pageName}
                        </Badge>
                        <Badge variant={config.isActive ? "default" : "secondary"}>
                          {config.isActive ? (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          ) : (
                            <AlertCircle className="mr-1 h-3 w-3" />
                          )}
                          {config.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center space-x-2">
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono break-all">{config.webhookUrl}</span>
                        </div>
                        {config.authHeader && (
                          <div className="text-muted-foreground">
                            Auth: {config.authHeader.substring(0, 20)}...
                          </div>
                        )}
                        {config.lastUsed && (
                          <div className="text-muted-foreground">
                            Last used: {new Date(config.lastUsed).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testWebhook(config)}
                      >
                        <TestTube className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editWebhookConfig(config)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleConfigStatus(config.id!, !config.isActive)}
                      >
                        {config.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteWebhookConfig(config.id!)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>
            Understanding the webhook forwarding system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Webhook className="h-4 w-4" />
              <AlertDescription>
                When a new lead is received from Facebook for a configured page, it will be automatically 
                forwarded to your external webhook URL with all the lead data.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <p className="font-medium">Lead Received</p>
                  <p className="text-sm text-muted-foreground">
                    Facebook sends lead data to our webhook endpoint
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <p className="font-medium">Lead Processed</p>
                  <p className="text-sm text-muted-foreground">
                    Our system saves the lead and checks for forwarding configurations
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <p className="font-medium">Lead Forwarded</p>
                  <p className="text-sm text-muted-foreground">
                    If a configuration exists for the page, the lead is sent to your external webhook
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}