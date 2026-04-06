'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { ScenarioSelector } from '@/components/shared/ScenarioSelector';
import { DisclaimerModal } from '@/components/shared/DisclaimerModal';
import type { ScenarioListItem } from '@/types/scenario';

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

type Step = 'info' | 'scenario' | 'disclaimer';

export default function BystanderPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('info');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<ScenarioListItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [scenarios, setScenarios] = useState<ScenarioListItem[]>([]);
  const [requireIdentification, setRequireIdentification] = useState<boolean | null>(null);
  const [showScenarioType, setShowScenarioType] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/scenarios?active=true').then((r) => r.json()),
      fetch('/api/config').then((r) => r.json()),
    ]).then(([scenariosData, configData]) => {
      setScenarios(scenariosData);
      const requireId = configData.requireUserIdentification ?? false;
      setRequireIdentification(requireId);
      setShowScenarioType(configData.showScenarioType ?? false);
      if (!requireId) setStep('scenario');
    });
  }, []);

  const validateInfo = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!email.trim()) newErrors.email = 'Email é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Email inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextFromInfo = () => {
    if (requireIdentification) {
      if (validateInfo()) setStep('scenario');
    } else {
      setStep('scenario');
    }
  };

  const handleNextFromScenario = () => {
    if (selectedScenario) setStep('disclaimer');
  };

  const handleAcceptDisclaimer = async () => {
    if (!selectedScenario) return;
    setIsLoading(true);
    try {
      const token = generateToken();
      const participantName = requireIdentification ? name : `Obs-${token}`;
      const participantEmail = requireIdentification ? email : `${token.toLowerCase()}@anonymous.local`;

      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantName,
          participantEmail,
          role: 'BYSTANDER',
          scenarioId: selectedScenario.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to create session');
      const session = await response.json();
      router.push(`/bystander/${session.id}`);
    } catch (error) {
      console.error('Error creating session:', error);
      setIsLoading(false);
    }
  };

  const handleDeclineDisclaimer = () => router.push('/');

  if (requireIdentification === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-action-info border-t-transparent" />
      </div>
    );
  }

  const steps = requireIdentification
    ? (['info', 'scenario', 'disclaimer'] as Step[])
    : (['scenario', 'disclaimer'] as Step[]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-2xl px-4">
        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  step === s
                    ? 'bg-action-info text-white'
                    : steps.indexOf(step) > i
                    ? 'bg-action-info/20 text-action-info'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 w-12 ${
                    steps.indexOf(step) > i ? 'bg-action-info/20' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step: info (only when requireIdentification) */}
        {step === 'info' && requireIdentification && (
          <Card>
            <CardHeader title="Participar como Observador" description="Informe seus dados para continuar" />
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
              <Button variant="ghost" onClick={() => router.push('/')}>Cancelar</Button>
              <Button onClick={handleNextFromInfo}>Continuar</Button>
            </CardFooter>
          </Card>
        )}

        {/* Step: scenario */}
        {step === 'scenario' && (
          <Card>
            <CardHeader title="Selecione um Cenário" description="Escolha o cenário que deseja observar" />
            <CardContent>
              <ScenarioSelector
                scenarios={scenarios}
                selectedId={selectedScenario?.id}
                onSelect={setSelectedScenario}
                showType={showScenarioType}
              />
            </CardContent>
            <CardFooter>
              <Button
                variant="ghost"
                onClick={() => (requireIdentification ? setStep('info') : router.push('/'))}
              >
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
            showIdentification={requireIdentification ?? false}
          />
        )}

        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="rounded-lg bg-white p-6 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-action-info border-t-transparent" />
              <p className="mt-4 text-gray-600">Preparando sessão...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
