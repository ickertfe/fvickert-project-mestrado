'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChatContainer, ChatHeader, MessageBubble, TypingIndicator } from '@/components/chat';
import { QuestionnaireModal } from '@/components/bystander';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useChat } from '@/hooks/useChat';
import type { Message } from '@/types/message';
import type { ChatParticipant } from '@/types/scenario';
import type { CreateBystanderAnswerInput } from '@/types/session';

interface SessionData {
  id: string;
  participantName: string;
  scenario: {
    id: string;
    name: string;
    softName: string | null;
    messages: Message[];
    participants: ChatParticipant[];
  };
}

export default function BystanderSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showRole, setShowRole] = useState(false);
  const [showScenarioType, setShowScenarioType] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/sessions/${sessionId}`).then((r) => {
        if (!r.ok) throw new Error('Session not found');
        return r.json();
      }),
      fetch('/api/config').then((r) => r.json()),
    ])
      .then(([data, cfg]) => {
        setSessionData(data);
        setShowRole(cfg.showRoleToParticipants ?? false);
        setShowScenarioType(cfg.showScenarioType ?? false);
      })
      .catch(() => setLoadError(true));
  }, [sessionId]);

  const chat = useChat({
    sessionId,
    messages: sessionData?.scenario.messages ?? [],
    participants: sessionData?.scenario.participants ?? [],
    role: 'BYSTANDER',
    onComplete: () => {
      setShowQuestionnaire(true);
    },
  });

  const handleStart = () => {
    setHasStarted(true);
    chat.startChat();
  };

  const handleSubmitQuestionnaire = async (
    answers: Omit<CreateBystanderAnswerInput, 'sessionId'>[]
  ) => {
    console.log('Questionnaire answers:', answers);
    setShowQuestionnaire(false);
    setShowThankYou(true);
  };

  const handleFinalize = async () => {
    try {
      await fetch(`/api/sessions/${sessionId}`, { method: 'PATCH' });
    } catch { /* ignore */ }
    setShowThankYou(true);
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (!sessionData && !loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-action-info border-t-transparent" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="max-w-sm text-center p-8">
          <p className="text-gray-600">Sessão não encontrada.</p>
          <Button onClick={() => router.push('/')} className="mt-4">Voltar ao início</Button>
        </Card>
      </div>
    );
  }

  const groupName = showScenarioType
    ? sessionData!.scenario.name
    : (sessionData!.scenario.softName ?? sessionData!.scenario.name);

  // ── Thank-you screen ──────────────────────────────────────────────────────
  if (showThankYou) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Obrigado por participar!</h1>
            <p className="mt-2 text-gray-600">
              Sua participação como <strong>Observador</strong> foi registrada com sucesso.
            </p>
            <div className="mt-6 rounded-lg bg-gray-50 border border-gray-200 p-4 text-left space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Identificador da sessão</p>
                <p className="mt-1 font-mono text-sm font-bold text-gray-800 break-all">{sessionId}</p>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <p className="text-xs text-gray-500 leading-relaxed">
                  🔒 <strong>Sua participação é anônima.</strong> Nenhum dado pessoal foi coletado ou associado a esta sessão. O identificador acima serve apenas para fins de pesquisa e não permite identificar você.
                </p>
              </div>
            </div>
            <Button onClick={() => router.push('/')} className="mt-6 w-full">
              Voltar ao início
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ── Pre-start screen ─────────────────────────────────────────────────────
  if (!hasStarted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md text-center">
          <div className="p-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-action-info/10">
              <svg className="h-8 w-8 text-action-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Pronto para observar?</h1>
            <p className="mt-2 text-gray-600">
              Você irá observar uma simulação de conversa em grupo. Como observador, você não poderá intervir, apenas assistir. Ao final, responderá um breve questionário.
            </p>
            <div className="mt-6 space-y-3">
              <Button onClick={handleStart} className="w-full">Iniciar Observação</Button>
              <Button variant="ghost" onClick={() => router.push('/')} className="w-full">Cancelar</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ── Active session ────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen flex-col bg-gray-100">
      <ChatContainer
        header={
          <ChatHeader
            groupName={groupName}
            participants={sessionData!.scenario.participants}
            typingParticipant={chat.typingParticipant}
          />
        }
        footer={
          chat.isComplete ? (
            <div className="flex items-center justify-between gap-3 bg-green-50 border-t border-green-200 px-4 py-3">
              <p className="text-sm text-green-800 font-medium">A conversa chegou ao fim.</p>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleFinalize}>
                Finalizar Sessão
              </Button>
            </div>
          ) : (
            <div className="bg-gray-100 px-4 py-3 text-center text-sm text-gray-500">
              Você está observando esta conversa
            </div>
          )
        }
        className="h-full"
      >
        {chat.visibleMessages.map((message) => {
          const participant = chat.getParticipant(message.participantId);
          if (!participant) return null;
          return (
            <MessageBubble
              key={message.id}
              message={message}
              participant={participant}
              canTakeActions={false}
              showRole={showRole}
            />
          );
        })}
        {chat.typingParticipant && <TypingIndicator participant={chat.typingParticipant} />}
      </ChatContainer>

      <QuestionnaireModal
        isOpen={showQuestionnaire}
        onClose={() => {}}
        questions={[]}
        onSubmit={handleSubmitQuestionnaire}
        sessionId={sessionId}
      />
    </div>
  );
}
