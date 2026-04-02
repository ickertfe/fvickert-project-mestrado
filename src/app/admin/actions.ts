'use server';

import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const RESET_PASSWORD_HASH = '736c5d641814992057ee6fbcc82be0871415df08557ff05f9208809c889787a1';

export async function resetDatabase(password: string): Promise<{ success: boolean; error?: string }> {
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  if (hash !== RESET_PASSWORD_HASH) {
    return { success: false, error: 'Senha incorreta.' };
  }

  // Delete in dependency order (keep scenarios, participants, messages, config)
  await prisma.bystanderAnswer.deleteMany();
  await prisma.note.deleteMany();
  await prisma.messageAction.deleteMany();
  await prisma.sessionMetrics.deleteMany();
  await prisma.session.deleteMany();

  revalidatePath('/admin');
  return { success: true };
}

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

export async function closeAllOpenSessions(): Promise<{ count: number }> {
  const result = await prisma.session.updateMany({
    where: { completedAt: null },
    data: { completedAt: new Date() },
  });
  revalidatePath('/admin');
  return { count: result.count };
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
