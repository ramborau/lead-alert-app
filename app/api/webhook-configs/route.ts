import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const configs = await prisma.webhookConfig.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ configs })
  } catch (error) {
    console.error('Error fetching webhook configs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
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

    // Check if configuration already exists for this page
    const existingConfig = await prisma.webhookConfig.findFirst({
      where: {
        pageId,
        userId: session.user.id
      }
    })

    if (existingConfig) {
      return NextResponse.json({ error: 'Configuration already exists for this page' }, { status: 409 })
    }

    const config = await prisma.webhookConfig.create({
      data: {
        userId: session.user.id,
        pageId,
        pageName,
        webhookUrl,
        isActive: isActive ?? true,
        authHeader,
        customHeaders: customHeaders ? JSON.stringify(customHeaders) : null
      }
    })

    return NextResponse.json({ config })
  } catch (error) {
    console.error('Error creating webhook config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}