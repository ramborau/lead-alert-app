'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  Phone,
  Mail,
  Facebook
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

// Mock data - in a real app this would come from API
const leads = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    status: 'new',
    source: 'Facebook Page',
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
    page: { name: 'My Business Page' }
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1234567891',
    status: 'contacted',
    source: 'Facebook Ad',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    page: { name: 'My Business Page' }
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    phone: '+1234567892',
    status: 'qualified',
    source: 'Facebook Page',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    page: { name: 'Secondary Page' }
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    phone: '+1234567893',
    status: 'converted',
    source: 'Facebook Ad',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
    page: { name: 'My Business Page' }
  },
  {
    id: '5',
    name: 'David Brown',
    email: 'david@example.com',
    phone: '+1234567894',
    status: 'new',
    source: 'Facebook Page',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    page: { name: 'Secondary Page' }
  },
]

const statusConfig = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-800' },
  contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
  qualified: { label: 'Qualified', color: 'bg-purple-100 text-purple-800' },
  converted: { label: 'Converted', color: 'bg-green-100 text-green-800' },
}

export default function LeadTable() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(search.toLowerCase()) ||
                         lead.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.map((lead) => (
              <TableRow key={lead.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {lead.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Facebook className="mr-1 h-3 w-3" />
                        {lead.page.name}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Mail className="mr-1 h-3 w-3" />
                      {lead.email}
                    </div>
                    {lead.phone && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="mr-1 h-3 w-3" />
                        {lead.phone}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={statusConfig[lead.status as keyof typeof statusConfig].color}>
                    {statusConfig[lead.status as keyof typeof statusConfig].label}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {lead.source}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(lead.createdAt, { addSuffix: true })}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/leads/${lead.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Lead
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Lead
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Results summary */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredLeads.length} of {leads.length} leads
      </div>
    </div>
  )
}