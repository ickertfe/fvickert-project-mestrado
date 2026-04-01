import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createScenarioSchema, formatZodErrors } from '@/utils/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const scenarios = await prisma.scenario.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      include: {
        _count: {
          select: {
            messages: true,
            participants: true,
            sessions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedScenarios = scenarios.map((scenario) => ({
      id: scenario.id,
      name: scenario.name,
      description: scenario.description,
      type: scenario.type,
      isActive: scenario.isActive,
      messageCount: scenario._count.messages,
      participantCount: scenario._count.participants,
      sessionCount: scenario._count.sessions,
      createdAt: scenario.createdAt,
    }));

    return NextResponse.json(formattedScenarios);
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scenarios' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createScenarioSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatZodErrors(validation.error) },
        { status: 400 }
      );
    }

    const scenario = await prisma.scenario.create({
      data: validation.data,
    });

    return NextResponse.json(scenario, { status: 201 });
  } catch (error) {
    console.error('Error creating scenario:', error);
    return NextResponse.json(
      { error: 'Failed to create scenario' },
      { status: 500 }
    );
  }
}
