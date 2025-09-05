'use client'

import { Bell, Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useSession } from 'next-auth/react'

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-6">
        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search leads, pages..."
              className="w-64 pl-10"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Add Lead Button */}
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge 
                  variant="destructive" 
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-start space-x-3 p-4">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">New lead received</p>
                  <p className="text-sm text-muted-foreground">
                    John Doe submitted a form on your Facebook page
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">2 minutes ago</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-start space-x-3 p-4">
                <div className="h-2 w-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">Lead converted</p>
                  <p className="text-sm text-muted-foreground">
                    Jane Smith's status changed to 'Converted'
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-start space-x-3 p-4">
                <div className="h-2 w-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">Page disconnected</p>
                  <p className="text-sm text-muted-foreground">
                    Business Page connection lost
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">3 hours ago</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center text-sm text-primary">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Avatar */}
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {session?.user?.name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}