'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateAdminConfig(field: 'requireUserIdentification' | 'showRoleToParticipants' | 'showScenarioType', value: boolean) {
  await prisma.adminConfig.upsert({
    where: { id: 'default' },
    update: { [field]: value },
    create: { id: 'default', requireUserIdentification: false, showRoleToParticipants: false, showScenarioType: false, [field]: value },
  });
  revalidatePath('/admin');
}

export async function closeSession(sessionId: string) {
  await prisma.session.update({
    where: { id: sessionId },
    data: { completedAt: new Date() },
  });
  revalidatePath('/admin');
}

export async function updateMessage(
  messageId: string,
  data: { content: string; metadata: string | null }
) {
  await prisma.message.update({
    where: { id: messageId },
    data: {
      content: data.content,
      metadata: data.metadata || null,
    },
  });
  revalidatePath('/admin');
}
