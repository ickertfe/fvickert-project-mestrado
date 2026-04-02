import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await prisma.session.update({
      where: { id: params.sessionId },
      data: { completedAt: new Date() },
    });
    return NextResponse.json(session);
  } catch {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: params.sessionId },
      include: {
        scenario: {
          include: {
            messages: {
              include: { participant: true },
              orderBy: { order: 'asc' },
            },
            participants: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}
