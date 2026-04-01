'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { ScenarioSelector } from '@/components/shared/ScenarioSelector';
import { DisclaimerModal } from '@/components/shared/DisclaimerModal';
import type { ScenarioListItem } from '@/types/scenario';

// Mock scenarios for now - will be fetched from API
const mockScenarios: ScenarioListItem[] = [
  {
    id: 'scenario-flaming-001',
    name: 'Discussão Acalorada no Grupo de Trabalho',
    description: 'Simulação de conflito onde um participante se torna hostil após discordância sobre um projeto',
    type: 'FLAMING',
    isActive: true,
    messageCount: 9,
    participantCount: 3,
    sessionCount: 0,
    createdAt: new Date(),
  },
  {
    id: 'scenario-exclusion-001',
    name: 'Exclusão do Grupo de Amigos',
    description: 'Simulação onde participantes deliberadamente excluem uma pessoa das conversas e planejamentos',
    type: 'SOCIAL_EXCLUSION',
    isActive: true,
    messageCount: 9,
    participantCount: 3,
    sessionCount: 0,
    createdAt: new Date(),
  },
  {
    id: 'scenario-denigration-001',
    name: 'Rumores Falsos no Grupo',
    description: 'Simulação onde participantes espalham informações falsas sobre uma pessoa',
    type: 'DENIGRATION',
    isActive: true,
    messageCount: 9,
    participantCount: 3,
    sessionCount: 0,
    createdAt: new Date(),
  },
];

type Step = 'info' | 'scenario' | 'disclaimer';

export default function TutorPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('info');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<ScenarioListItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateInfo = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextFromInfo = () => {
    if (validateInfo()) {
      setStep('scenario');
    }
  };

  const handleNextFromScenario = () => {
    if (selectedScenario) {
      setStep('disclaimer');
    }
  };

  const handleAcceptDisclaimer = async () => {
    if (!selectedScenario) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantName: name,
          participantEmail: email,
          role: 'TUTOR',
          scenarioId: selectedScenario.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const session = await response.json();
      router.push(`/tutor/${session.id}`);
    } catch (error) {
      console.error('Error creating session:', error);
      setIsLoading(false);
    }
  };

  const handleDeclineDisclaimer = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-2xl px-4">
        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {['info', 'scenario', 'disclaimer'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  step === s
                    ? 'bg-chat-header text-white'
                    : i < ['info', 'scenario', 'disclaimer'].indexOf(step)
                    ? 'bg-chat-header/20 text-chat-header'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i + 1}
              </div>
              {i < 2 && (
                <div
                  className={`mx-2 h-0.5 w-12 ${
                    i < ['info', 'scenario', 'disclaimer'].indexOf(step)
                      ? 'bg-chat-header/20'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {step === 'info' && (
          <Card>
            <CardHeader
              title="Participar como Tutor"
              description="Informe seus dados para continuar"
            />
            <CardContent className="space-y-4">
              <Input
                label="Nome completo"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
              />
              <Input
                label="Email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />
            </CardContent>
            <CardFooter>
              <Button variant="ghost" onClick={() => router.push('/')}>
                Cancelar
              </Button>
              <Button onClick={handleNextFromInfo}>
                Continuar
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 'scenario' && (
          <Card>
            <CardHeader
              title="Selecione um Cenário"
              description="Escolha o cenário que deseja participar"
            />
            <CardContent>
              <ScenarioSelector
                scenarios={mockScenarios}
                selectedId={selectedScenario?.id}
                onSelect={setSelectedScenario}
              />
            </CardContent>
            <CardFooter>
              <Button variant="ghost" onClick={() => setStep('info')}>
                Voltar
              </Button>
              <Button onClick={handleNextFromScenario} disabled={!selectedScenario}>
                Continuar
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 'disclaimer' && (
          <DisclaimerModal
            isOpen={true}
            onAccept={handleAcceptDisclaimer}
            onDecline={handleDeclineDisclaimer}
          />
        )}

        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="rounded-lg bg-white p-6 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-chat-header border-t-transparent" />
              <p className="mt-4 text-gray-600">Preparando sessão...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
