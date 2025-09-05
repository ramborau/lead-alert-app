'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Facebook, 
  Bell, 
  Mail, 
  Smartphone, 
  Settings, 
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (success === 'facebook_connected') {
      toast.success('Facebook account connected successfully!')
    } else if (error) {
      const errorMessages: { [key: string]: string } = {
        facebook_denied: 'Facebook connection was denied',
        connection_failed: 'Failed to connect to Facebook',
        invalid_request: 'Invalid Facebook request'
      }
      toast.error(errorMessages[error] || 'An error occurred')
    }
  }, [searchParams])

  const handleConnectFacebook = () => {
    setIsConnecting(true)
    window.location.href = '/api/auth/facebook/connect'
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and integrations.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Facebook Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Facebook className="mr-2 h-5 w-5 text-blue-600" />
              Facebook Integration
            </CardTitle>
            <CardDescription>
              Connect your Facebook account to automatically capture leads
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Facebook className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">Facebook Account</p>
                  <p className="text-sm text-muted-foreground">
                    Connect to start capturing leads
                  </p>
                </div>
              </div>
              <Badge variant="outline">
                <AlertCircle className="mr-1 h-3 w-3" />
                Not Connected
              </Badge>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Connect your Facebook account to start capturing leads automatically from your Facebook pages.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="text-center text-muted-foreground py-4">
                <p>No Facebook pages connected yet.</p>
                <p className="text-sm">Connect your Facebook account to see your pages here.</p>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                className="flex-1"
                onClick={handleConnectFacebook}
                disabled={isConnecting}
              >
                <Facebook className="mr-2 h-4 w-4" />
                {isConnecting ? 'Connecting...' : 'Connect Facebook'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure how you want to be notified about new leads
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive emails when new leads arrive
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Browser Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get push notifications in your browser
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive text messages for urgent leads
                  </p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Daily Summary</Label>
                  <p className="text-sm text-muted-foreground">
                    Get a daily email with lead statistics
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Webhook Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Webhook Configuration
            </CardTitle>
            <CardDescription>
              Advanced settings for developers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                  https://yourapp.com/api/webhooks/facebook
                </div>
                <Button variant="outline" size="sm">
                  Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This URL is automatically registered with Facebook when you connect your account.
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Verify Token</Label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                  ••••••••••••••••
                </div>
                <Button variant="outline" size="sm">
                  Regenerate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Used to verify webhook requests from Facebook.
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Webhook is active and receiving lead data successfully.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your account preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Account Type</Label>
                <div className="flex items-center space-x-2">
                  <Badge>Free Plan</Badge>
                  <Link href="/upgrade">
                    <Button variant="outline" size="sm">
                      Upgrade to Pro
                    </Button>
                  </Link>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Usage This Month</Label>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Leads Captured</span>
                    <span>127 / 500</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Data Export</Label>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Export All Leads
                  </Button>
                  <Button variant="outline" size="sm">
                    Download Data
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}