import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateLeadSchema = z.object({
  status: z.enum(['new', 'contacted', 'qualified', 'converted']).optional(),
  notes: z.string().optional()
})

export async function GET(request: Request) {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  try {
    const where: any = {
      userId: session.user.id
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [leads, total, stats, pagesWithLeads] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          page: {
            select: {
              name: true,
              pageId: true
            }
          },
          notes: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.lead.count({ where }),
      // Get lead statistics
      Promise.all([
        prisma.lead.count({ where: { userId: session.user.id } }),
        prisma.lead.count({ where: { userId: session.user.id, status: 'new' } }),
        prisma.lead.count({ where: { userId: session.user.id, status: 'contacted' } }),
        prisma.lead.count({ where: { userId: session.user.id, status: 'converted' } })
      ]),
      // Get pages with leads only
      prisma.facebookPage.findMany({
        where: {
          userId: session.user.id,
          leads: {
            some: {}
          }
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
    ])

    const [totalLeads, newLeads, contactedLeads, convertedLeads] = stats
    const pages = pagesWithLeads.map(page => ({
      id: page.id,
      pageId: page.pageId,
      name: page.name,
      leadsCount: page._count.leads
    }))

    return NextResponse.json({
      leads,
      totalLeads,
      newLeads,
      contactedLeads,
      convertedLeads,
      pages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Failed to fetch leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    const lead = await prisma.lead.create({
      data: {
        ...body,
        userId: session.user.id
      }
    })

    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    console.error('Failed to create lead:', error)
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    )
  }
}