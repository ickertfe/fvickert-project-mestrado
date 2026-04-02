import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { formatZodErrors } from '@/utils/validation';

const createMetricsSchema = z.object({
  sessionId: z.string().min(1),
  totalDuration: z.number().min(0),
  firstActionTime: z.number().min(0).nullable().optional(),
  totalActions: z.number().min(0),
  totalUndos: z.number().min(0),
  hesitationEvents: z.array(z.object({
    messageId: z.string(),
    duration: z.number(),
    timestamp: z.number(),
    actionType: z.string().optional(),
    isFixation: z.boolean().optional(),
  })),
  decisionSequence: z.array(z.object({
    action: z.string(),
    timestamp: z.number(),
    messageId: z.string(),
    undone: z.boolean(),
  })),
  actionTimings: z.array(z.object({
    fromAction: z.string(),
    toAction: z.string(),
    duration: z.number(),
    messageId: z.string(),
  })),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const metrics = await prisma.sessionMetrics.findUnique({
      where: { sessionId },
    });

    if (!metrics) {
      return NextResponse.json(
        { error: 'Metrics not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...metrics,
      hesitationEvents: JSON.parse(metrics.hesitationEvents),
      decisionSequence: JSON.parse(metrics.decisionSequence),
      actionTimings: JSON.parse(metrics.actionTimings),
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createMetricsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatZodErrors(validation.error) },
        { status: 400 }
      );
    }

    const {
      sessionId,
      totalDuration,
      firstActionTime,
      totalActions,
      totalUndos,
      hesitationEvents,
      decisionSequence,
      actionTimings,
    } = validation.data;

    // Verify session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if metrics already exist
    const existingMetrics = await prisma.sessionMetrics.findUnique({
      where: { sessionId },
    });

    if (existingMetrics) {
      return NextResponse.json(
        { error: 'Metrics already exist for this session' },
        { status: 409 }
      );
    }

    const metrics = await prisma.sessionMetrics.create({
      data: {
        sessionId,
        totalDuration,
        firstActionTime: firstActionTime ?? null,
        totalActions,
        totalUndos,
        hesitationEvents: JSON.stringify(hesitationEvents),
        decisionSequence: JSON.stringify(decisionSequence),
        actionTimings: JSON.stringify(actionTimings),
      },
    });

    // Update session as completed
    await prisma.session.update({
      where: { id: sessionId },
      data: { completedAt: new Date() },
    });

    return NextResponse.json(
      {
        ...metrics,
        hesitationEvents,
        decisionSequence,
        actionTimings,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating metrics:', error);
    return NextResponse.json(
      { error: 'Failed to create metrics' },
      { status: 500 }
    );
  }
}
