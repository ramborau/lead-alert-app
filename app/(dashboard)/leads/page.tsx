'use client'

import { useState, useEffect } from 'react'
import { Plus, Users, UserCheck, Clock, TrendingUp, Filter, Facebook, Mail, Phone, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import StatsCard from '@/components/dashboard/StatsCard'
import { NoLeadsState } from '@/components/dashboard/EmptyState'

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
  page?: {
    name: string
    pageId: string
  }
}

interface FacebookPage {
  id: string
  pageId: string
  name: string
  leadsCount: number
}

interface LeadsData {
  totalLeads: number
  newLeads: number
  contactedLeads: number
  convertedLeads: number
  leads: Lead[]
  pages: FacebookPage[]
}

export default function LeadsPage() {
  const [leadsData, setLeadsData] = useState<LeadsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPage, setSelectedPage] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/leads?page=${selectedPage}&status=${selectedStatus}&include=page`)
      if (response.ok) {
        const data = await response.json()
        setLeadsData(data)
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [selectedPage, selectedStatus])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new': return 'bg-green-100 text-green-800'
      case 'contacted': return 'bg-blue-100 text-blue-800'
      case 'qualified': return 'bg-purple-100 text-purple-800'
      case 'converted': return 'bg-yellow-100 text-yellow-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Manage and track all your Facebook leads in one place.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Export Leads
        </Button>
      </div>

      {/* Stats Cards */}
      {leadsData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Leads"
            value={leadsData.totalLeads.toString()}
            change="All time"
            changeType="neutral"
            icon={Users}
          />
          <StatsCard
            title="New Leads"
            value={leadsData.newLeads.toString()}
            change="Awaiting contact"
            changeType={leadsData.newLeads > 0 ? "positive" : "neutral"}
            icon={Clock}
            iconColor="text-blue-600"
          />
          <StatsCard
            title="Contacted"
            value={leadsData.contactedLeads.toString()}
            change="In progress"
            changeType={leadsData.contactedLeads > 0 ? "positive" : "neutral"}
            icon={UserCheck}
            iconColor="text-yellow-600"
          />
          <StatsCard
            title="Converted"
            value={leadsData.convertedLeads.toString()}
            change={leadsData.totalLeads > 0 ? `${Math.round((leadsData.convertedLeads / leadsData.totalLeads) * 100)}% conversion` : "No conversions yet"}
            changeType={leadsData.convertedLeads > 0 ? "positive" : "neutral"}
            icon={TrendingUp}
            iconColor="text-green-600"
          />
        </div>
      )}

      {/* Filters */}
      {leadsData && leadsData.pages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filter Leads
            </CardTitle>
            <CardDescription>
              Filter leads by Facebook page and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Facebook Page</label>
                <Select value={selectedPage} onValueChange={setSelectedPage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pages ({leadsData.totalLeads})</SelectItem>
                    {leadsData.pages.map((page) => (
                      <SelectItem key={page.id} value={page.pageId}>
                        {page.name} ({page.leadsCount})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leads List */}
      {!leadsData || leadsData.totalLeads === 0 ? (
        <NoLeadsState />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedPage === 'all' ? 'All Leads' : `Leads from ${leadsData.pages.find(p => p.pageId === selectedPage)?.name}`}
            </CardTitle>
            <CardDescription>
              {leadsData.leads.length} lead(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leadsData.leads.map((lead) => (
                <div key={lead.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">{lead.name}</h3>
                        <Badge variant="secondary" className={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                        {lead.page && (
                          <Badge variant="outline" className="text-blue-600">
                            <Facebook className="mr-1 h-3 w-3" />
                            {lead.page.name}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm">
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
                        
                        {/* Show all received data */}
                        {lead.metadata && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-muted-foreground mb-2">All Facebook Data:</p>
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
                      <div className="flex items-center space-x-1 mb-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatTime(lead.createdAt)}</span>
                      </div>
                      <p className="text-xs">{lead.source}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}