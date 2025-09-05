'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Activity, 
  Users, 
  Mail, 
  Phone, 
  Clock,
  RefreshCw,
  CheckCircle,
  Facebook,
  Zap,
  Eye
} from 'lucide-react'
import { toast } from 'sonner'

interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  message: string | null
  source: string
  status: string
  createdAt: string
  metadata: any
}

export default function LiveLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [newLeadCount, setNewLeadCount] = useState(0)

  const fetchLeads = async (showLoading = true) => {
    try {
      if (showLoading) setIsRefreshing(true)
      
      const response = await fetch('/api/leads?limit=20&sort=desc')
      if (response.ok) {
        const data = await response.json()
        
        // Check for new leads
        const newLeads = data.leads || []
        if (leads.length > 0 && newLeads.length > 0) {
          const latestExistingTime = new Date(leads[0]?.createdAt || 0).getTime()
          const newLeadsCount = newLeads.filter((lead: Lead) => 
            new Date(lead.createdAt).getTime() > latestExistingTime
          ).length
          
          if (newLeadsCount > 0) {
            setNewLeadCount(prev => prev + newLeadsCount)
            toast.success(`${newLeadsCount} new lead(s) received!`, {
              duration: 5000,
            })
          }
        }
        
        setLeads(newLeads)
        setLastUpdate(new Date().toISOString())
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
      toast.error('Failed to fetch leads')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchLeads()
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      fetchLeads(false)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const resetNewLeadCount = () => {
    setNewLeadCount(0)
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new': return 'bg-green-100 text-green-800'
      case 'contacted': return 'bg-blue-100 text-blue-800'
      case 'qualified': return 'bg-purple-100 text-purple-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Activity className="mr-2 h-8 w-8" />
            Live Lead Monitor
          </h1>
          <p className="text-muted-foreground">
            Real-time monitoring of incoming Facebook leads
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {newLeadCount > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {newLeadCount} new lead(s)!
            </Badge>
          )}
          <Button 
            variant="outline" 
            onClick={() => fetchLeads(true)}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
            <p className="text-xs text-muted-foreground">Last 20 leads shown</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <Zap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{newLeadCount}</div>
            <p className="text-xs text-muted-foreground">Since page opened</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Update</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {lastUpdate ? formatTime(lastUpdate) : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground">Auto-refresh: 5s</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold">Live</span>
            </div>
            <p className="text-xs text-muted-foreground">Monitoring active</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert for new leads */}
      {newLeadCount > 0 && (
        <Alert className="border-green-200 bg-green-50">
          <Zap className="h-4 w-4 text-green-600" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              <strong>{newLeadCount} new lead(s)</strong> have been received! 
              Check the list below for details.
            </span>
            <Button size="sm" variant="outline" onClick={resetNewLeadCount}>
              Mark as Seen
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="mr-2 h-5 w-5" />
            How to Test Lead Reception
          </CardTitle>
          <CardDescription>
            Use Facebook's Lead Ads Testing tool to verify your webhook is working
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <p className="font-medium">Go to Facebook Lead Ads Testing Tool</p>
                <a 
                  href="https://developers.facebook.com/tools/lead-ads-testing" 
                  target="_blank"
                  className="text-blue-600 hover:underline text-sm"
                >
                  https://developers.facebook.com/tools/lead-ads-testing →
                </a>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <p className="font-medium">Select your Facebook Page and Lead Ad</p>
                <p className="text-sm text-muted-foreground">Choose the page you connected to Lead Alert Pro</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <p className="font-medium">Submit Test Lead</p>
                <p className="text-sm text-muted-foreground">Fill out the test form and submit - the lead should appear here within seconds!</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
          <CardDescription>
            Live feed of leads from your Facebook pages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading leads...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Facebook className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No leads yet</p>
              <p className="text-sm">
                Test your webhook using the Facebook Lead Ads Testing tool above
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {leads.map((lead, index) => (
                <div key={lead.id} className={`p-4 border rounded-lg ${
                  index < newLeadCount ? 'border-green-200 bg-green-50' : ''
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">{lead.name}</h3>
                        <Badge variant="secondary" className={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                        {index < newLeadCount && (
                          <Badge variant="destructive" className="animate-pulse">
                            NEW
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{lead.email}</span>
                        </div>
                        {lead.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                        {lead.message && (
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground">{lead.message}</p>
                          </div>
                        )}
                        
                        {/* Show all metadata */}
                        {lead.metadata && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-muted-foreground mb-2">All Received Data:</p>
                            <div className="bg-muted p-3 rounded-md max-h-32 overflow-auto">
                              <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                                {typeof lead.metadata === 'string' 
                                  ? lead.metadata 
                                  : JSON.stringify(lead.metadata, null, 2)
                                }
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{formatTime(lead.createdAt)}</p>
                      <p className="text-xs">{lead.source}</p>
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