import { Users, TrendingUp, Calendar, Facebook, Bell } from 'lucide-react'
import StatsCard from '@/components/dashboard/StatsCard'
import { FacebookConnectionPrompt, NoLeadsState } from '@/components/dashboard/EmptyState'
import LeadMonitor from '@/components/dashboard/LeadMonitor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// This page uses authentication and must be rendered dynamically
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Dashboard - Lead Alert Pro',
  description: 'Your lead capture dashboard'
}

async function getUserStats(userId: string) {
  const [pages, totalLeads, newLeads] = await Promise.all([
    prisma.facebookPage.findMany({
      where: { userId, isActive: true },
      include: { _count: { select: { leads: true } } }
    }),
    prisma.lead.count({ where: { userId } }),
    prisma.lead.count({ 
      where: { 
        userId, 
        status: 'new',
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      } 
    })
  ])

  return { pages, totalLeads, newLeads }
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const { pages, totalLeads, newLeads } = await getUserStats(session.user.id)
  const hasFacebookPages = pages.length > 0
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {hasFacebookPages 
              ? "Welcome back! Here's what's happening with your leads."
              : "Welcome to Lead Alert Pro! Connect your Facebook account to get started."
            }
          </p>
        </div>
        {hasFacebookPages && (
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Facebook className="mr-2 h-4 w-4" />
              Sync Pages
            </Button>
            <Button>
              <Bell className="mr-2 h-4 w-4" />
              Test Notification
            </Button>
          </div>
        )}
      </div>

      {!hasFacebookPages ? (
        /* Show Facebook connection prompt for new users */
        <FacebookConnectionPrompt />
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Leads"
              value={totalLeads.toString()}
              change={newLeads > 0 ? `+${newLeads} today` : "No new leads today"}
              changeType={newLeads > 0 ? "positive" : "neutral"}
              icon={Users}
            />
            <StatsCard
              title="Connected Pages"
              value={pages.length.toString()}
              change="Active monitoring"
              changeType="positive"
              icon={Facebook}
              iconColor="text-blue-600"
            />
            <StatsCard
              title="New Leads Today"
              value={newLeads.toString()}
              change="Last 24 hours"
              changeType={newLeads > 0 ? "positive" : "neutral"}
              icon={TrendingUp}
              iconColor="text-green-600"
            />
            <StatsCard
              title="Response Time"
              value="< 5 min"
              change="Real-time alerts"
              changeType="positive"
              icon={Calendar}
              iconColor="text-orange-600"
            />
          </div>

          {/* Leads Section */}
          {totalLeads === 0 ? (
            <NoLeadsState />
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest leads and interactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-8">
                    Your recent leads will appear here once you start receiving them.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks and shortcuts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full justify-start" variant="outline" asChild>
                      <a href="/leads">
                        <Users className="mr-2 h-4 w-4" />
                        View All Leads
                      </a>
                    </Button>
                    <Button className="w-full justify-start" variant="outline" asChild>
                      <a href="/settings">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Manage Settings
                      </a>
                    </Button>
                    <Button className="w-full justify-start" variant="outline" asChild>
                      <a href="/api/auth/facebook/connect">
                        <Facebook className="mr-2 h-4 w-4" />
                        Connect More Pages
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Facebook Pages Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Facebook className="mr-2 h-5 w-5 text-blue-600" />
                Connected Facebook Pages
              </CardTitle>
              <CardDescription>
                Manage your connected Facebook pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pages.map((page) => (
                  <div key={page.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Facebook className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{page.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Active monitoring
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                      <Badge variant="secondary">
                        {page._count.leads} leads
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Real-time Lead Monitoring */}
          <LeadMonitor />
        </>
      )}
    </div>
  )
}