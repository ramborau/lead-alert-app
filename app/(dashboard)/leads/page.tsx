import { Plus, Users, UserCheck, Clock, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import StatsCard from '@/components/dashboard/StatsCard'
import { NoLeadsState } from '@/components/dashboard/EmptyState'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const metadata = {
  title: 'Leads - Lead Alert Pro',
  description: 'Manage your Facebook leads'
}

async function getUserLeadsStats(userId: string) {
  const [totalLeads, newLeads, contactedLeads, convertedLeads] = await Promise.all([
    prisma.lead.count({ where: { userId } }),
    prisma.lead.count({ where: { userId, status: 'new' } }),
    prisma.lead.count({ where: { userId, status: 'contacted' } }),
    prisma.lead.count({ where: { userId, status: 'converted' } })
  ])

  return { totalLeads, newLeads, contactedLeads, convertedLeads }
}

export default async function LeadsPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const { totalLeads, newLeads, contactedLeads, convertedLeads } = await getUserLeadsStats(session.user.id)
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
          Add Lead
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Leads"
          value={totalLeads.toString()}
          change="All time"
          changeType="neutral"
          icon={Users}
        />
        <StatsCard
          title="New Leads"
          value={newLeads.toString()}
          change="Awaiting contact"
          changeType={newLeads > 0 ? "positive" : "neutral"}
          icon={Clock}
          iconColor="text-blue-600"
        />
        <StatsCard
          title="Contacted"
          value={contactedLeads.toString()}
          change="In progress"
          changeType={contactedLeads > 0 ? "positive" : "neutral"}
          icon={UserCheck}
          iconColor="text-yellow-600"
        />
        <StatsCard
          title="Converted"
          value={convertedLeads.toString()}
          change={totalLeads > 0 ? `${Math.round((convertedLeads / totalLeads) * 100)}% conversion` : "No conversions yet"}
          changeType={convertedLeads > 0 ? "positive" : "neutral"}
          icon={TrendingUp}
          iconColor="text-green-600"
        />
      </div>

      {/* Leads Section */}
      {totalLeads === 0 ? (
        <NoLeadsState />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Leads</CardTitle>
            <CardDescription>
              A comprehensive view of all your leads from Facebook
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-12">
              Your leads will appear here as they come in from your connected Facebook pages.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}