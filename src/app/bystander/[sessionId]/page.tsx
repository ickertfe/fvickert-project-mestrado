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

// Mock data - will be fetched from API
const mockParticipants: ChatParticipant[] = [
  { id: 'part-1', name: 'Carlos', role: 'AGGRESSOR' },
  { id: 'part-2', name: 'Marina', role: 'VICTIM' },
  { id: 'part-3', name: 'Pedro', role: 'NEUTRAL' },
];

const mockMessages: Message[] = [
  {
    id: 'msg-1',
    scenarioId: 'scenario-flaming-001',
    participantId: 'part-2',
    content: 'Pessoal, terminei a minha parte do relatório. Podem revisar?',
    type: 'TEXT',
    appearDelay: 0,
    typingDuration: 2000,
    order: 1,
  },
  {
    id: 'msg-2',
    scenarioId: 'scenario-flaming-001',
    participantId: 'part-1',
    content: 'Já vi. Tá bem fraco, sinceramente.',
    type: 'TEXT',
    appearDelay: 3000,
    typingDuration: 1500,
    order: 2,
  },
  {
    id: 'msg-3',
    scenarioId: 'scenario-flaming-001',
    participantId: 'part-2',
    content: 'Pode me dizer o que posso melhorar?',
    type: 'TEXT',
    appearDelay: 2000,
    typingDuration: 1800,
    order: 3,
  },
  {
    id: 'msg-4',
    scenarioId: 'scenario-flaming-001',
    participantId: 'part-1',
    content: 'Olha, não sei nem por onde começar. Você deveria ter vergonha de entregar isso.',
    type: 'TEXT',
    appearDelay: 1000,
    typingDuration: 2500,
    order: 4,
  },
  {
    id: 'msg-5',
    scenarioId: 'scenario-flaming-001',
    participantId: 'part-3',
    content: 'Calma, Carlos...',
    type: 'TEXT',
    appearDelay: 1500,
    typingDuration: 1000,
    order: 5,
  },
  {
    id: 'msg-6',
    scenarioId: 'scenario-flaming-001',
    participantId: 'part-1',
    content: 'Cala a boca, Pedro. Ninguém pediu sua opinião.',
    type: 'TEXT',
    appearDelay: 500,
    typingDuration: 1200,
    order: 6,
  },
  {
    id: 'msg-7',
    scenarioId: 'scenario-flaming-001',
    participantId: 'part-1',
    content: 'Marina, você é uma INCOMPETENTE! Todo mundo sabe disso.',
    type: 'TEXT',
    appearDelay: 800,
    typingDuration: 2000,
    order: 7,
  },
  {
    id: 'msg-8',
    scenarioId: 'scenario-flaming-001',
    participantId: 'part-2',
    content: '😢',
    type: 'EMOJI',
    appearDelay: 2000,
    typingDuration: null,
    order: 8,
  },
  {
    id: 'msg-9',
    scenarioId: 'scenario-flaming-001',
    participantId: 'part-1',
    content: 'Vai chorar agora? Que patético!',
    type: 'TEXT',
    appearDelay: 1000,
    typingDuration: 1500,
    order: 9,
  },
];

export default function BystanderSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [hasStarted, setHasStarted] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showRole, setShowRole] = useState(true);

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((cfg) => setShowRole(cfg.showRoleToParticipants ?? true));
  }, []);

  const chat = useChat({
    sessionId,
    messages: mockMessages,
    participants: mockParticipants,
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

  const handleFinalize = () => {
    setShowThankYou(true);
  };

  if (!hasStarted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md text-center">
          <div className="p-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-action-info/10">
              <svg
                className="h-8 w-8 text-action-info"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Pronto para observar?</h1>
            <p className="mt-2 text-gray-600">
              Você irá observar uma simulação de conversa em grupo. Como observador, você não
              poderá intervir, apenas assistir. Ao final, responderá um breve questionário.
            </p>
            <div className="mt-6 space-y-3">
              <Button onClick={handleStart} className="w-full">
                Iniciar Observação
              </Button>
              <Button variant="ghost" onClick={() => router.push('/')} className="w-full">
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

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

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      <ChatContainer
        header={
          <ChatHeader
            groupName="Grupo de Trabalho"
            participants={mockParticipants}
            typingParticipant={chat.typingParticipant}
          />
        }
        footer={
          chat.isComplete ? (
            <div className="flex items-center justify-between gap-3 bg-green-50 border-t border-green-200 px-4 py-3">
              <p className="text-sm text-green-800 font-medium">A conversa chegou ao fim.</p>
              <Button size="sm" onClick={handleFinalize}>Finalizar Sessão</Button>
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
