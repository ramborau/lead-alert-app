import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Facebook, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  actionButton?: {
    label: string
    href: string
  }
}

export default function EmptyState({ title, description, icon: Icon, actionButton }: EmptyStateProps) {
  return (
    <Card className="border-dashed border-2 border-muted-foreground/25">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-6">
          <Icon className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
        {actionButton && (
          <Link href={actionButton.href}>
            <Button size="lg">
              {actionButton.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}

export function FacebookConnectionPrompt() {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-6">
          <Facebook className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">Connect Your Facebook Account</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Get started by connecting your Facebook account to automatically capture leads from your Facebook pages.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/api/auth/facebook/connect">
            <Button size="lg" className="w-full sm:w-auto">
              <Facebook className="mr-2 h-4 w-4" />
              Connect Facebook
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Go to Settings
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export function NoLeadsState() {
  return (
    <EmptyState
      title="No Leads Yet"
      description="Your leads will appear here once you start receiving them from your connected Facebook pages."
      icon={Users}
      actionButton={{
        label: "Connect Facebook",
        href: "/settings"
      }}
    />
  )
}