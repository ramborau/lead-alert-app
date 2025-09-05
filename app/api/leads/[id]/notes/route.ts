import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required')
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { content } = createNoteSchema.parse(body)

    // Verify the lead exists and belongs to the user
    const lead = await prisma.lead.findUnique({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const note = await prisma.note.create({
      data: {
        content,
        leadId: params.id
      }
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Failed to create note:', error)
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    )
  }
}