import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { pageId, pageName, webhookUrl, isActive, authHeader, customHeaders } = body

    if (!pageId || !webhookUrl) {
      return NextResponse.json({ error: 'Page ID and webhook URL are required' }, { status: 400 })
    }

    const config = await prisma.webhookConfig.updateMany({
      where: {
        id: params.id,
        userId: session.user.id
      },
      data: {
        pageId,
        pageName,
        webhookUrl,
        isActive: isActive ?? true,
        authHeader,
        customHeaders: customHeaders ? JSON.stringify(customHeaders) : null,
        updatedAt: new Date()
      }
    })

    if (config.count === 0) {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating webhook config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const config = await prisma.webhookConfig.deleteMany({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (config.count === 0) {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting webhook config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}