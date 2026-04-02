import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({
  sessionId: z.string().min(1),
  answers: z.array(z.object({
    questionId: z.string().min(1),
    answer: z.string(),
  })).min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = schema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }

    const { sessionId, answers } = validation.data;

    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    await prisma.bystanderAnswer.createMany({
      data: answers.map((a) => ({ sessionId, questionId: a.questionId, answer: a.answer })),
    });

    // Mark session complete
    await prisma.session.update({
      where: { id: sessionId },
      data: { completedAt: new Date() },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error('Error saving bystander answers:', error);
    return NextResponse.json({ error: 'Failed to save answers' }, { status: 500 });
  }
}
