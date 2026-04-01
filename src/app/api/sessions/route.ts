import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createSessionSchema, formatZodErrors } from '@/utils/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const scenarioId = searchParams.get('scenarioId');

    const sessions = await prisma.session.findMany({
      where: {
        ...(role && { role: role as 'TUTOR' | 'BYSTANDER' }),
        ...(scenarioId && { scenarioId }),
      },
      include: {
        scenario: true,
        _count: {
          select: { actions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createSessionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatZodErrors(validation.error) },
        { status: 400 }
      );
    }

    const { participantName, participantEmail, role, scenarioId } = validation.data;

    // Verify scenario exists
    const scenario = await prisma.scenario.findUnique({
      where: { id: scenarioId },
    });

    if (!scenario) {
      return NextResponse.json(
        { error: 'Scenario not found' },
        { status: 404 }
      );
    }

    const session = await prisma.session.create({
      data: {
        participantName,
        participantEmail,
        role,
        scenarioId,
        disclaimerAccepted: true,
        disclaimerAcceptedAt: new Date(),
      },
      include: {
        scenario: true,
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
