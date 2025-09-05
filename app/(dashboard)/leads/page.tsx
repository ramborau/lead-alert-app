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
        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            {leadsData?.totalLeads || 0} total leads
          </p>
        </div>
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
                <div key={lead.id} className="p-6 border rounded-xl bg-gradient-to-r from-white to-gray-50 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header Section */}
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{lead.name}</h3>
                            <p className="text-sm text-muted-foreground">{lead.source}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className={getStatusColor(lead.status)}>
                            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                          </Badge>
                          {lead.page && (
                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                              <Facebook className="mr-1 h-3 w-3" />
                              {lead.page.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Contact Details */}
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 p-2 bg-white rounded-lg border">
                            <Mail className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="text-xs text-muted-foreground">Email</p>
                              <p className="font-medium">{lead.email}</p>
                            </div>
                          </div>
                          {lead.phone && (
                            <div className="flex items-center space-x-3 p-2 bg-white rounded-lg border">
                              <Phone className="h-5 w-5 text-green-500" />
                              <div>
                                <p className="text-xs text-muted-foreground">Phone</p>
                                <p className="font-medium">{lead.phone}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-3 p-2 bg-white rounded-lg border">
                          <Calendar className="h-5 w-5 text-purple-500" />
                          <div>
                            <p className="text-xs text-muted-foreground">Received</p>
                            <p className="font-medium">{formatTime(lead.createdAt)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Message */}
                      {lead.message && (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-xs font-medium text-amber-800 mb-1">Message</p>
                          <p className="text-sm text-amber-900">{lead.message}</p>
                        </div>
                      )}
                      
                      {/* All Facebook Data */}
                      {lead.metadata && (
                        <div className="mt-4">
                          <details className="group">
                            <summary className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border cursor-pointer hover:bg-slate-100 transition-colors">
                              <span className="text-sm font-medium text-slate-700">Complete Facebook Data</span>
                              <span className="text-xs text-slate-500 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="mt-2 p-4 bg-slate-900 rounded-lg border max-h-48 overflow-auto">
                              <pre className="text-xs text-green-300 font-mono whitespace-pre-wrap">
                                {typeof lead.metadata === 'string' 
                                  ? lead.metadata 
                                  : JSON.stringify(JSON.parse(lead.metadata), null, 2)
                                }
                              </pre>
                            </div>
                          </details>
                        </div>
                      )}
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