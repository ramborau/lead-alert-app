import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { isActive } = body

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive must be a boolean' }, { status: 400 })
    }

    const config = await prisma.webhookConfig.updateMany({
      where: {
        id: params.id,
        userId: session.user.id
      },
      data: {
        isActive,
        updatedAt: new Date()
      }
    })

    if (config.count === 0) {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error toggling webhook config status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}