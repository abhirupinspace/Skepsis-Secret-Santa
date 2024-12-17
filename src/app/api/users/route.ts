import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, name, cryptoName } = body
    
    const user = await prisma.user.create({
      data: {
        email,
        name,
        cryptoName,
      },
    })
    
    return NextResponse.json({ cryptoName: user.cryptoName })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}