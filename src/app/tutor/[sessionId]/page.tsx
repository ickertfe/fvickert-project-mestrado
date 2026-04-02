'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChatContainer, ChatHeader, MessageBubble, TypingIndicator } from '@/components/chat';
import { ActionPanel, NotesPanel } from '@/components/tutor';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useChat } from '@/hooks/useChat';
import type { Message } from '@/types/message';
import type { ChatParticipant } from '@/types/scenario';

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

export default function TutorSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [notes, setNotes] = useState<Array<{ id: string; sessionId: string; content: string; timestamp: Date }>>([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [showExit, setShowExit] = useState(false);
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
    role: 'TUTOR',
  });

  const handleStart = () => {
    setHasStarted(true);
    chat.startChat();
  };

  const handleAddNote = async (content: string) => {
    const newNote = { id: `note-${Date.now()}`, sessionId, content, timestamp: new Date() };
    setNotes((prev) => [...prev, newNote]);
  };

  const handleFinalize = async () => {
    const metricsData = chat.finalizeChat();
    try {
      await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...metricsData, sessionId }),
      });
    } catch { /* session still shows exit even if metrics fail */ }
    setShowExit(true);
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (!sessionData && !loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-chat-header border-t-transparent" />
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
              groupName={groupName}
              participants={sessionData!.scenario.participants}
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

          {chat.isComplete && (
            <div className="mx-4 my-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-center">
              <p className="text-sm font-medium text-green-800">A conversa chegou ao fim.</p>
              <p className="text-xs text-green-600 mt-0.5">Clique em "Finalizar Sessão" no painel lateral para encerrar.</p>
            </div>
          )}
        </ChatContainer>
      </div>

      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 flex flex-col border-l border-gray-200 bg-white">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <ActionPanel
            canUndo={chat.canUndo}
            onUndo={chat.undoLastAction}
            stats={chat.stats}
            isLoading={chat.isLoading}
          />
          <NotesPanel notes={notes} onAddNote={handleAddNote} />
        </div>

        <div className="flex-shrink-0 border-t border-gray-100 p-4">
          <button
            type="button"
            onClick={handleFinalize}
            disabled={!chat.isComplete}
            className="w-full rounded-md px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
          >
            {chat.isComplete ? 'Finalizar Sessão' : 'Aguardando fim da conversa…'}
          </button>
        </div>
      </div>
    </div>
  );
}
