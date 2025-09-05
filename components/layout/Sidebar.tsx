'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  Home, 
  Users, 
  Settings, 
  LogOut,
  BarChart3,
  Facebook
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <div className="flex h-full w-64 flex-col bg-background border-r">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Bell className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Lead Alert Pro</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
              pathname === item.href
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground'
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Get Started */}
      <div className="border-t p-4">
        <div className="rounded-lg bg-primary/10 p-3">
          <div className="text-sm font-medium text-primary mb-2">
            Get Started
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Connect your Facebook account to start capturing leads automatically.
          </p>
          <Button size="sm" className="w-full" asChild>
            <Link href="/settings">
              <Facebook className="mr-2 h-3 w-3" />
              Connect Facebook
            </Link>
          </Button>
        </div>
      </div>

      {/* User Menu */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
            {session?.user?.name?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {session?.user?.name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {session?.user?.email || 'user@example.com'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 w-full justify-start"
          onClick={() => signOut()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  )
}