'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChatContainer, ChatHeader, MessageBubble, TypingIndicator } from '@/components/chat';
import { ActionPanel, NotesPanel } from '@/components/tutor';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useChat } from '@/hooks/useChat';
import type { Session } from '@/types/session';
import type { Message } from '@/types/message';
import type { ChatParticipant } from '@/types/scenario';

const mockSession: Session = {
  id: 'session-1',
  participantName: 'Participante',
  participantEmail: 'participante@email.com',
  role: 'TUTOR',
  scenarioId: 'scenario-flaming-001',
  disclaimerAccepted: true,
  disclaimerAcceptedAt: new Date(),
  startedAt: null,
  completedAt: null,
  createdAt: new Date(),
};

const mockParticipants: ChatParticipant[] = [
  { id: 'part-1', name: 'Carlos', role: 'AGGRESSOR' },
  { id: 'part-2', name: 'Marina', role: 'VICTIM' },
  { id: 'part-3', name: 'Pedro', role: 'NEUTRAL' },
];

const mockMessages: Message[] = [
  { id: 'msg-1', scenarioId: 'scenario-flaming-001', participantId: 'part-2', content: 'Pessoal, terminei a minha parte do relatório. Podem revisar?', type: 'TEXT', appearDelay: 0, typingDuration: 2000, order: 1 },
  { id: 'msg-2', scenarioId: 'scenario-flaming-001', participantId: 'part-1', content: 'Já vi. Tá bem fraco, sinceramente.', type: 'TEXT', appearDelay: 3000, typingDuration: 1500, order: 2 },
  { id: 'msg-3', scenarioId: 'scenario-flaming-001', participantId: 'part-2', content: 'Pode me dizer o que posso melhorar?', type: 'TEXT', appearDelay: 2000, typingDuration: 1800, order: 3 },
  { id: 'msg-4', scenarioId: 'scenario-flaming-001', participantId: 'part-1', content: 'Olha, não sei nem por onde começar. Você deveria ter vergonha de entregar isso.', type: 'TEXT', appearDelay: 1000, typingDuration: 2500, order: 4 },
  { id: 'msg-5', scenarioId: 'scenario-flaming-001', participantId: 'part-3', content: 'Calma, Carlos...', type: 'TEXT', appearDelay: 1500, typingDuration: 1000, order: 5 },
  { id: 'msg-6', scenarioId: 'scenario-flaming-001', participantId: 'part-1', content: 'Cala a boca, Pedro. Ninguém pediu sua opinião.', type: 'TEXT', appearDelay: 500, typingDuration: 1200, order: 6 },
  { id: 'msg-7', scenarioId: 'scenario-flaming-001', participantId: 'part-1', content: 'Marina, você é uma INCOMPETENTE! Todo mundo sabe disso.', type: 'TEXT', appearDelay: 800, typingDuration: 2000, order: 7 },
  { id: 'msg-8', scenarioId: 'scenario-flaming-001', participantId: 'part-2', content: '😢', type: 'EMOJI', appearDelay: 2000, typingDuration: null, order: 8 },
  { id: 'msg-9', scenarioId: 'scenario-flaming-001', participantId: 'part-1', content: 'Vai chorar agora? Que patético!', type: 'TEXT', appearDelay: 1000, typingDuration: 1500, order: 9 },
];

export default function TutorSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session] = useState<Session>(mockSession);
  const [notes, setNotes] = useState<Array<{ id: string; sessionId: string; content: string; timestamp: Date }>>([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [showExit, setShowExit] = useState(false);
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
    role: 'TUTOR',
    onComplete: () => {
      // Session naturally finished — handled via banner in sidebar
    },
  });

  const handleStart = () => {
    setHasStarted(true);
    chat.startChat();
  };

  const handleAddNote = async (content: string) => {
    const newNote = { id: `note-${Date.now()}`, sessionId, content, timestamp: new Date() };
    setNotes((prev) => [...prev, newNote]);
  };

  const handleFinalize = () => {
    chat.finalizeChat();
    setShowExit(true);
  };

  // ── Exit / Thank-you screen ──────────────────────────────────────────────
  if (showExit) {
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
              Sua participação como <strong>Tutor</strong> foi registrada com sucesso.
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
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-chat-header/10">
              <svg className="h-8 w-8 text-chat-header" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Pronto para começar?</h1>
            <p className="mt-2 text-gray-600">
              Você irá observar uma simulação de conversa em grupo. Como tutor, você pode executar ações de moderação clicando nas mensagens.
            </p>
            <div className="mt-6 space-y-3">
              <Button onClick={handleStart} className="w-full">Iniciar Simulação</Button>
              <Button variant="ghost" onClick={() => router.push('/')} className="w-full">Cancelar</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ── Active session ────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Chat area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <ChatContainer
          header={
            <ChatHeader
              groupName="Grupo de Trabalho"
              participants={mockParticipants}
              typingParticipant={chat.typingParticipant}
              showLegend
            />
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
                canTakeActions={chat.canTakeActions}
                showRole={showRole}
                onAction={chat.executeAction}
                onHoverStart={chat.onMessageHoverStart}
                onHoverEnd={chat.onMessageHoverEnd}
              />
            );
          })}
          {chat.typingParticipant && <TypingIndicator participant={chat.typingParticipant} />}

          {/* Session-ended banner inside the chat */}
          {chat.isComplete && (
            <div className="mx-4 my-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-center">
              <p className="text-sm font-medium text-green-800">A conversa chegou ao fim.</p>
              <p className="text-xs text-green-600 mt-0.5">Clique em "Finalizar Sessão" no painel lateral para encerrar.</p>
            </div>
          )}
        </ChatContainer>
      </div>

      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 space-y-4 overflow-y-auto border-l border-gray-200 bg-white p-4">
        <ActionPanel
          canUndo={chat.canUndo}
          onUndo={chat.undoLastAction}
          stats={chat.stats}
          isLoading={chat.isLoading}
        />

        <NotesPanel notes={notes} onAddNote={handleAddNote} />

        <Button
          variant="destructive"
          className="w-full"
          onClick={handleFinalize}
        >
          Finalizar Sessão
        </Button>
      </div>
    </div>
  );
}
