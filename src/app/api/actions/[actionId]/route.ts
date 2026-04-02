import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { actionId: string } }
) {
  try {
    const action = await prisma.messageAction.findUnique({
      where: { id: params.actionId },
    });

    if (!action) {
      return NextResponse.json({ error: 'Action not found' }, { status: 404 });
    }

    if (action.undone) {
      return NextResponse.json({ error: 'Action already undone' }, { status: 400 });
    }

    const updated = await prisma.messageAction.update({
      where: { id: params.actionId },
      data: { undone: true, undoneAt: new Date() },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error undoing action:', error);
    return NextResponse.json({ error: 'Failed to undo action' }, { status: 500 });
  }
}
