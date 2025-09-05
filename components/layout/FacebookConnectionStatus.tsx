'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Facebook, CheckCircle, Plus } from 'lucide-react'

interface FacebookPage {
  id: string
  pageId: string
  name: string
  leadsCount?: number
}

export default function FacebookConnectionStatus() {
  const [pages, setPages] = useState<FacebookPage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/pages')
      if (response.ok) {
        const data = await response.json()
        setPages(data.pages || [])
      }
    } catch (error) {
      console.error('Error fetching pages:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg bg-gray-100 p-3 animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 bg-gray-200 rounded mb-2"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (pages.length === 0) {
    return (
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
    )
  }

  return (
    <div className="rounded-lg bg-green-50 border border-green-200 p-3">
      <div className="flex items-center space-x-2 mb-3">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <span className="text-sm font-medium text-green-800">Facebook Connected</span>
      </div>
      
      <div className="space-y-2 mb-3">
        {pages.slice(0, 2).map((page) => (
          <div key={page.id} className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1">
              <Facebook className="h-3 w-3 text-blue-600" />
              <span className="text-green-700 truncate max-w-24">{page.name}</span>
            </div>
            {page.leadsCount !== undefined && (
              <Badge variant="outline" className="text-xs py-0 px-1">
                {page.leadsCount}
              </Badge>
            )}
          </div>
        ))}
        
        {pages.length > 2 && (
          <p className="text-xs text-green-600">
            +{pages.length - 2} more page{pages.length - 2 > 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="flex space-x-1">
        <Button size="sm" variant="outline" className="flex-1 text-xs" asChild>
          <Link href="/settings">
            Settings
          </Link>
        </Button>
        <Button size="sm" variant="outline" className="flex-1 text-xs" asChild>
          <Link href="/api/auth/facebook/connect">
            <Plus className="mr-1 h-3 w-3" />
            Add More
          </Link>
        </Button>
      </div>
    </div>
  )
}