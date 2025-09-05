import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Bell, Users, BarChart, Shield, Zap, Globe, ChevronRight, Facebook } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Lead Alert Pro</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-4" variant="secondary">
            <Zap className="mr-1 h-3 w-3" /> Powered by Facebook Lead Ads
          </Badge>
          <h1 className="mb-6 text-5xl font-bold tracking-tight lg:text-6xl">
            Never Miss a Lead from
            <span className="text-primary"> Facebook</span> Again
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Automatically capture and manage leads from your Facebook pages with real-time notifications. 
            Connect once, capture forever.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <Facebook className="mr-2 h-4 w-4" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Everything You Need to Capture Leads</h2>
            <p className="text-lg text-muted-foreground">
              Simple setup, powerful features, amazing results
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6 transition-all hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Instant Setup</h3>
              <p className="text-muted-foreground">
                Connect your Facebook account in seconds. No technical knowledge required.
              </p>
            </Card>

            <Card className="p-6 transition-all hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Real-time Notifications</h3>
              <p className="text-muted-foreground">
                Get instant alerts when new leads come in. Never miss an opportunity.
              </p>
            </Card>

            <Card className="p-6 transition-all hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Lead Management</h3>
              <p className="text-muted-foreground">
                Organize, filter, and manage all your leads in one centralized dashboard.
              </p>
            </Card>

            <Card className="p-6 transition-all hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BarChart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Analytics Dashboard</h3>
              <p className="text-muted-foreground">
                Track conversion rates, response times, and lead sources with detailed analytics.
              </p>
            </Card>

            <Card className="p-6 transition-all hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Secure & Compliant</h3>
              <p className="text-muted-foreground">
                GDPR compliant with bank-level encryption. Your data is always safe.
              </p>
            </Card>

            <Card className="p-6 transition-all hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Multi-Page Support</h3>
              <p className="text-muted-foreground">
                Manage leads from multiple Facebook pages in a single account.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Get started in 3 simple steps
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                1
              </div>
              <h3 className="mb-2 text-xl font-semibold">Sign Up</h3>
              <p className="text-muted-foreground">
                Create your account in seconds with just your email
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                2
              </div>
              <h3 className="mb-2 text-xl font-semibold">Connect Facebook</h3>
              <p className="text-muted-foreground">
                Login with Facebook and select your pages
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                3
              </div>
              <h3 className="mb-2 text-xl font-semibold">Capture Leads</h3>
              <p className="text-muted-foreground">
                Leads automatically flow into your dashboard
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-primary text-primary-foreground p-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold">Ready to Capture More Leads?</h2>
            <p className="mb-8 text-lg opacity-90">
              Join thousands of businesses that never miss a lead with Lead Alert Pro
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Start Free Trial
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <p className="text-sm opacity-75">No credit card required</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-primary" />
              <span className="font-semibold">Lead Alert Pro</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Lead Alert Pro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
