import { Bell, Sparkles, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="relative z-10">
        {/* Header */}
        <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8 z-20">
          <div className="flex items-center space-x-2 p-2 rounded-lg bg-background/80 backdrop-blur-sm border shadow-sm hover:shadow-md transition-shadow">
            <Bell className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Lead Alert Pro</span>
          </div>
        </Link>

        <div className="container flex h-screen w-screen">
          {/* Left side - Hero content */}
          <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-16">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                  <span className="text-primary font-semibold">Welcome to Lead Alert Pro</span>
                </div>
                <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
                  Never Miss a Lead from
                  <span className="text-primary"> Facebook</span> Again
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Automatically capture and manage leads from your Facebook pages with real-time notifications.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 rounded-lg bg-background/50 backdrop-blur-sm border">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Real-time Lead Capture</h3>
                    <p className="text-sm text-muted-foreground">Instant notifications when leads come in</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 rounded-lg bg-background/50 backdrop-blur-sm border">
                  <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Smart Analytics</h3>
                    <p className="text-sm text-muted-foreground">Track performance and conversion rates</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 rounded-lg bg-background/50 backdrop-blur-sm border">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Multi-channel Alerts</h3>
                    <p className="text-sm text-muted-foreground">Email, SMS, and browser notifications</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth form */}
          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-4">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}