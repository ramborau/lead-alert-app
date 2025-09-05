import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'

// Mock data for recent leads
const recentLeads = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    source: 'Facebook Page',
    status: 'new',
    createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    source: 'Facebook Ad',
    status: 'contacted',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    source: 'Facebook Page',
    status: 'qualified',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    source: 'Facebook Ad',
    status: 'converted',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
  },
  {
    id: '5',
    name: 'David Brown',
    email: 'david@example.com',
    source: 'Facebook Page',
    status: 'new',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
  },
]

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-purple-100 text-purple-800',
  converted: 'bg-green-100 text-green-800',
}

export default function RecentLeads() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Leads</CardTitle>
        <CardDescription>
          Your latest leads from Facebook
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentLeads.map((lead) => (
            <div key={lead.id} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {lead.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground truncate">
                    {lead.name}
                  </p>
                  <Badge className={statusColors[lead.status as keyof typeof statusColors]}>
                    {lead.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {lead.email}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">
                    {lead.source}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(lead.createdAt, { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}