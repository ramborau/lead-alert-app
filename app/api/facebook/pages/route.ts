import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get connected Facebook pages for the user
    const facebookPages = await prisma.facebookPage.findMany({
      where: {
        userId: session.user.id,
        isActive: true
      },
      include: {
        _count: {
          select: {
            leads: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get Facebook account info
    const facebookAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'facebook'
      }
    })

    return NextResponse.json({
      connected: facebookPages.length > 0,
      pages: facebookPages.map(page => ({
        id: page.id,
        pageId: page.pageId,
        name: page.name,
        isActive: page.isActive,
        createdAt: page.createdAt,
        leadsCount: page._count.leads
      })),
      accountConnected: !!facebookAccount,
      totalPages: facebookPages.length,
      totalLeads: facebookPages.reduce((total, page) => total + page._count.leads, 0)
    })
  } catch (error) {
    console.error('Error fetching Facebook pages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Facebook pages' },
      { status: 500 }
    )
  }
}