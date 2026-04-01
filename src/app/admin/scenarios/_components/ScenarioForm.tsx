'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import type { FormState } from '../actions';

const SCENARIO_TYPE_OPTIONS = [
  { value: 'FLAMING', label: 'Flaming' },
  { value: 'SOCIAL_EXCLUSION', label: 'Exclusão Social' },
  { value: 'DENIGRATION', label: 'Difamação' },
];

const IS_ACTIVE_OPTIONS = [
  { value: 'true', label: 'Ativo' },
  { value: 'false', label: 'Inativo' },
];

interface ScenarioFormProps {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  initialData?: {
    name: string;
    description: string;
    type: string;
    isActive: boolean;
  };
  title: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} disabled={pending}>
      Salvar Cenário
    </Button>
  );
}

export function ScenarioForm({ action, initialData, title }: ScenarioFormProps) {
  const [state, formAction] = useFormState(action, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-chat-header text-white">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{title}</h1>
            <Link href="/admin">
              <Button variant="ghost" className="border border-white/40 text-white hover:bg-white/10 hover:text-white">
                Cancelar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {state.message && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.message}
          </div>
        )}

        <Card>
          <CardContent>
            <form action={formAction} className="space-y-6 pt-4">
              <Input
                label="Nome do Cenário"
                name="name"
                defaultValue={initialData?.name}
                placeholder="Ex: Discussão Acalorada no Grupo"
                error={state.errors?.name}
              />

              <Textarea
                label="Descrição"
                name="description"
                defaultValue={initialData?.description}
                placeholder="Descreva brevemente o cenário de simulação..."
                className="min-h-[120px]"
                error={state.errors?.description}
              />

              <Select
                label="Tipo de Cyberbullying"
                name="type"
                defaultValue={initialData?.type ?? ''}
                options={SCENARIO_TYPE_OPTIONS}
                placeholder="Selecione o tipo..."
                error={state.errors?.type}
              />

              <Select
                label="Status"
                name="isActive"
                defaultValue={initialData ? String(initialData.isActive) : 'true'}
                options={IS_ACTIVE_OPTIONS}
              />

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <Link href="/admin">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
                <SubmitButton />
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
