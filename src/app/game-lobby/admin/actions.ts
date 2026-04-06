'use server';

import crypto from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { COOKIE_NAME, AUTH_COOKIE_VALUE } from './auth';

const RESET_PASSWORD_HASH = '736c5d641814992057ee6fbcc82be0871415df08557ff05f9208809c889787a1';

export async function loginGameAdmin(password: string): Promise<{ success: boolean; error?: string }> {
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  if (hash !== RESET_PASSWORD_HASH) {
    return { success: false, error: 'Senha incorreta.' };
  }
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, AUTH_COOKIE_VALUE, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/game-lobby/admin',
    maxAge: 60 * 60 * 8,
  });
  return { success: true };
}

export async function logoutGameAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function closeGameSession(sessionId: string) {
  await prisma.session.update({
    where: { id: sessionId },
    data: { completedAt: new Date() },
  });
  revalidatePath('/game-lobby/admin');
}

export async function closeAllOpenGameSessions(): Promise<{ count: number }> {
  // Only sessions belonging to game-* scenarios
  const result = await prisma.session.updateMany({
    where: { completedAt: null, scenario: { id: { startsWith: 'game-' } } },
    data: { completedAt: new Date() },
  });
  revalidatePath('/game-lobby/admin');
  return { count: result.count };
}

export async function resetGameDatabase(password: string): Promise<{ success: boolean; error?: string }> {
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  if (hash !== RESET_PASSWORD_HASH) {
    return { success: false, error: 'Senha incorreta.' };
  }

  // Only delete data for game-* scenario sessions
  const gameSessions = await prisma.session.findMany({
    where: { scenario: { id: { startsWith: 'game-' } } },
    select: { id: true },
  });
  const ids = gameSessions.map((s) => s.id);

  await prisma.bystanderAnswer.deleteMany({ where: { sessionId: { in: ids } } });
  await prisma.note.deleteMany({ where: { sessionId: { in: ids } } });
  await prisma.messageAction.deleteMany({ where: { sessionId: { in: ids } } });
  await prisma.sessionMetrics.deleteMany({ where: { sessionId: { in: ids } } });
  await prisma.session.deleteMany({ where: { id: { in: ids } } });

  revalidatePath('/game-lobby/admin');
  return { success: true };
}

export async function updateGameAdminConfig(
  field: 'requireUserIdentification' | 'showRoleToParticipants' | 'showScenarioType',
  value: boolean
) {
  await prisma.adminConfig.upsert({
    where: { id: 'default' },
    update: { [field]: value },
    create: { id: 'default', requireUserIdentification: false, showRoleToParticipants: false, showScenarioType: false, [field]: value },
  });
  revalidatePath('/game-lobby/admin');
}
