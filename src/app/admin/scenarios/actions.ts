'use server';

import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const scenarioSchema = z.object({
  name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres').max(200),
  description: z.string().min(10, 'Descrição deve ter ao menos 10 caracteres').max(1000),
  type: z.enum(['FLAMING', 'SOCIAL_EXCLUSION', 'DENIGRATION'], {
    errorMap: () => ({ message: 'Tipo inválido' }),
  }),
  isActive: z.boolean().optional().default(true),
});

export type FormState = {
  errors?: Record<string, string>;
  message?: string;
};

export async function createScenario(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = {
    name: formData.get('name'),
    description: formData.get('description'),
    type: formData.get('type'),
    isActive: formData.get('isActive') === 'true',
  };

  const parsed = scenarioSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[issue.path[0] as string] = issue.message;
    }
    return { errors };
  }

  await prisma.scenario.create({ data: parsed.data });
  redirect('/admin');
}

export async function updateScenario(
  id: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = {
    name: formData.get('name'),
    description: formData.get('description'),
    type: formData.get('type'),
    isActive: formData.get('isActive') === 'true',
  };

  const parsed = scenarioSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[issue.path[0] as string] = issue.message;
    }
    return { errors };
  }

  const scenario = await prisma.scenario.findUnique({ where: { id } });
  if (!scenario) {
    return { message: 'Cenário não encontrado.' };
  }

  await prisma.scenario.update({ where: { id }, data: parsed.data });
  redirect('/admin');
}
