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
  const pageParam = searchParams.get('page')
  const limitParam = searchParams.get('limit') 
  const statusParam = searchParams.get('status')
  const searchParam = searchParams.get('search')
  const pageIdParam = searchParams.get('pageId') // For filtering by Facebook page
  
  const page = Math.max(1, parseInt(pageParam || '1')) // Ensure page is at least 1
  const limit = Math.max(1, Math.min(100, parseInt(limitParam || '10'))) // Ensure limit is between 1-100
  const status = statusParam
  const search = searchParam
  const pageIdFilter = pageIdParam

  console.log('API request params:', { 
    pageParam, 
    limitParam, 
    page, 
    limit, 
    statusParam,
    searchParam,
    pageIdParam,
    url: request.url
  })

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

    // Handle page filtering - support both Facebook page ID and internal page ID
    if (pageIdFilter && pageIdFilter !== 'all') {
      where.page = {
        pageId: pageIdFilter // Filter by Facebook page ID
      }
    }

    console.log('Executing leads query with:', { 
      userId: session.user.id,
      page, 
      limit, 
      skip: (page - 1) * limit,
      where: JSON.stringify(where)
    })

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
    
    // Return empty data structure to prevent frontend crashes
    return NextResponse.json({
      leads: [],
      totalLeads: 0,
      newLeads: 0,
      contactedLeads: 0,
      convertedLeads: 0,
      pages: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      },
      error: 'Database query failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 }) // Return 200 to prevent frontend errors
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