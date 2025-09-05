import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateLeadSchema = z.object({
  status: z.enum(['new', 'contacted', 'qualified', 'converted']).optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional()
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const lead = await prisma.lead.findUnique({
      where: {
        id: params.id,
        userId: session.user.id
      },
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
          }
        }
      }
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Failed to fetch lead:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lead' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = updateLeadSchema.parse(body)

    const lead = await prisma.lead.findUnique({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const updatedLead = await prisma.lead.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        page: {
          select: {
            name: true,
            pageId: true
          }
        }
      }
    })

    return NextResponse.json(updatedLead)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Failed to update lead:', error)
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const lead = await prisma.lead.findUnique({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    await prisma.lead.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete lead:', error)
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    )
  }
}