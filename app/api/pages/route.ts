import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pages = await prisma.facebookPage.findMany({
      where: {
        userId: session.user.id,
        isActive: true
      },
      select: {
        id: true,
        pageId: true,
        name: true,
        _count: {
          select: {
            leads: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    const formattedPages = pages.map(page => ({
      id: page.id,
      pageId: page.pageId,
      name: page.name,
      leadsCount: page._count.leads
    }))

    return NextResponse.json({ pages: formattedPages })
  } catch (error) {
    console.error('Error fetching pages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}