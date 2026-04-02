import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const config = await prisma.adminConfig.upsert({
      where: { id: 'default' },
      update: {},
      create: { id: 'default', requireUserIdentification: false, showRoleToParticipants: false },
    });
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}
