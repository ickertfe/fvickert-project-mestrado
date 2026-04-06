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
    const tutorActions = [
      {
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        ),
        label: 'Excluir mensagem',
        desc: 'Remove uma mensagem inadequada do chat',
        colorClass: 'text-red-600',
        bgClass: 'bg-red-50 border-red-200',
      },
      {
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
        label: 'Avisar participante',
        desc: 'Marca a mensagem com um aviso',
        colorClass: 'text-amber-600',
        bgClass: 'bg-amber-50 border-amber-200',
      },
      {
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ),
        label: 'Adicionar nota',
        desc: 'Registra uma observação sobre a sessão',
        colorClass: 'text-blue-600',
        bgClass: 'bg-blue-50 border-blue-200',
      },
    ];

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="max-w-lg w-full rounded-2xl overflow-hidden bg-white shadow-lg border border-violet-200">
          {/* Role header */}
          <div className="px-8 pt-8 pb-5 text-center border-b border-violet-100">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 border border-violet-200">
              <svg className="h-8 w-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-violet-600 mb-1">Você é o Tutor</p>
            <h1 className="text-xl font-black text-gray-900">{groupName}</h1>
          </div>

          {/* Role description */}
          <div className="px-8 pt-5 pb-1">
            <p className="text-sm text-gray-600 leading-relaxed">
              Como <strong>Tutor</strong>, você irá observar uma simulação de conversa e poderá moderar o conteúdo clicando nas mensagens. Sua função é identificar comportamentos inadequados e agir conforme necessário.
            </p>
          </div>

          {/* Actions */}
          <div className="px-8 py-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Ações disponíveis</p>
            <div className="space-y-2">
              {tutorActions.map((a) => (
                <div key={a.label} className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${a.bgClass}`}>
                  <div className={`shrink-0 ${a.colorClass}`}>{a.icon}</div>
                  <div>
                    <p className={`text-sm font-semibold ${a.colorClass}`}>{a.label}</p>
                    <p className="text-xs text-gray-500">{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="px-8 pb-8 space-y-2">
            <Button onClick={handleStart} className="w-full">Iniciar Simulação →</Button>
            <Button variant="ghost" onClick={() => router.push('/')} className="w-full text-gray-400">Cancelar</Button>
          </div>
        </div>
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
