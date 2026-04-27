'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useChat } from '@/hooks/useChat';
import { GameScene } from './GameScene';
import { QuestionnaireModal } from '@/components/bystander';
import type { Message } from '@/types/message';
import type { ChatParticipant } from '@/types/scenario';
import type { CreateBystanderAnswerInput } from '@/types/session';

interface SessionData {
  id: string;
  participantName: string;
  role: 'TUTOR' | 'BYSTANDER';
  scenario: {
    id: string;
    name: string;
    softName: string | null;
    messages: Message[];
    participants: ChatParticipant[];
  };
}

// ── Scales a fixed 1280×720 child to fill available container ─────────────────
function ScaledScene({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setScale(Math.min(width / 1280, height / 720));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden">
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center', willChange: 'transform' }}>
        {children}
      </div>
    </div>
  );
}

// ── Shared dark screen wrapper ────────────────────────────────────────────────
function DarkScreen({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #131428 0%, #1d1f40 100%)' }}
    >
      {children}
    </div>
  );
}

export default function GameLobbyPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setSessionData)
      .catch(() => setLoadError(true));
  }, [sessionId]);

  const isTutor = sessionData?.role === 'TUTOR';

  const chat = useChat({
    sessionId,
    messages: sessionData?.scenario.messages ?? [],
    participants: sessionData?.scenario.participants ?? [],
    role: sessionData?.role ?? 'BYSTANDER',
    onComplete: () => {
      if (!isTutor) setShowQuestionnaire(true);
    },
  });

  const handleStart = () => {
    setHasStarted(true);
    chat.startChat();
  };

  const handleRestart = async () => {
    chat.resetChat();
    chat.startChat();
    try {
      await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, type: 'RESTART_SIMULATION' }),
      });
    } catch { /* record best-effort */ }
  };

  const handleFinalize = async () => {
    const metricsData = chat.finalizeChat();
    try {
      await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...metricsData, sessionId }),
      });
    } catch { /* show exit anyway */ }
    setShowThankYou(true);
  };

  const handleSubmitQuestionnaire = async (
    answers: Omit<CreateBystanderAnswerInput, 'sessionId'>[]
  ) => {
    try {
      await fetch('/api/bystander-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, answers }),
      });
    } catch { /* show thank you anyway */ }
    setShowQuestionnaire(false);
    setShowThankYou(true);
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (!sessionData && !loadError) {
    return (
      <DarkScreen>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          <p className="text-sm text-violet-300/60 tracking-widest uppercase">Carregando lobby...</p>
        </div>
      </DarkScreen>
    );
  }

  if (loadError) {
    return (
      <DarkScreen>
        <div className="text-center">
          <p className="text-violet-300 mb-4">Sessão não encontrada.</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 rounded text-sm font-medium"
            style={{ backgroundColor: 'rgba(139,92,246,0.2)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}
          >
            Voltar ao início
          </button>
        </div>
      </DarkScreen>
    );
  }

  // ── Thank you ──────────────────────────────────────────────────────────────
  if (showThankYou) {
    return (
      <DarkScreen>
        <div
          className="max-w-md w-full rounded-xl p-8 text-center"
          style={{ backgroundColor: 'rgba(15,15,25,0.9)', border: '1px solid rgba(139,92,246,0.25)' }}
        >
          <div
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}
          >
            <svg className="h-8 w-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Sessão Encerrada</h1>
          <p className="text-sm text-gray-400 mb-6">
            Obrigado por participar como <span className="text-violet-400 font-semibold">{isTutor ? 'Moderador' : 'Observador'}</span>.
          </p>
          <div className="rounded-lg p-4 mb-6 text-left" style={{ backgroundColor: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400/60 mb-1">ID da sessão</p>
            <p className="font-mono text-xs text-gray-300 break-all">{sessionId}</p>
          </div>
          <button
            onClick={() => router.push('/game-lobby')}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-colors"
            style={{ backgroundColor: 'rgba(139,92,246,0.25)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.35)' }}
          >
            Voltar ao Lobby
          </button>
        </div>
      </DarkScreen>
    );
  }

  // ── Pre-start ──────────────────────────────────────────────────────────────
  if (!hasStarted) {
    const tutorActions = [
      {
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        ),
        label: 'Excluir mensagem',
        desc: 'Remove uma mensagem do chat',
        color: '#fca5a5',
        bg: 'rgba(220,38,38,0.12)',
        border: 'rgba(220,38,38,0.25)',
      },
      {
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
        label: 'Avisar jogador',
        desc: 'Marca a mensagem com aviso',
        color: '#fcd34d',
        bg: 'rgba(217,119,6,0.12)',
        border: 'rgba(217,119,6,0.25)',
      },
      {
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ),
        label: 'Adicionar nota',
        desc: 'Registra uma observação',
        color: '#93c5fd',
        bg: 'rgba(59,130,246,0.12)',
        border: 'rgba(59,130,246,0.25)',
      },
    ];

    const bystanderActions = [
      {
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        ),
        label: 'Observar o lobby',
        desc: 'Acompanhe as mensagens em tempo real',
        color: '#93c5fd',
        bg: 'rgba(59,130,246,0.12)',
        border: 'rgba(59,130,246,0.25)',
      },
      {
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        ),
        label: 'Responder questionário',
        desc: 'Ao final, avalie o que observou',
        color: '#a78bfa',
        bg: 'rgba(139,92,246,0.12)',
        border: 'rgba(139,92,246,0.25)',
      },
    ];

    const actions = isTutor ? tutorActions : bystanderActions;
    const roleColor = isTutor ? 'rgba(167,139,250,1)' : '#60a5fa';
    const roleBg = isTutor ? 'rgba(139,92,246,0.15)' : 'rgba(59,130,246,0.15)';
    const roleBorder = isTutor ? 'rgba(139,92,246,0.35)' : 'rgba(59,130,246,0.35)';

    return (
      <DarkScreen>
        <div
          className="max-w-lg w-full rounded-2xl overflow-hidden"
          style={{ backgroundColor: 'rgba(15,15,28,0.92)', border: `1px solid ${roleBorder}` }}
        >
          {/* Role header */}
          <div className="px-8 pt-8 pb-5 text-center" style={{ borderBottom: `1px solid ${roleBorder}` }}>
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ backgroundColor: roleBg, border: `1px solid ${roleBorder}` }}
            >
              {isTutor ? (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: roleColor }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ) : (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: roleColor }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: roleColor }}>
              Você é o {isTutor ? 'Moderador' : 'Observador'}
            </p>
            <h1 className="text-xl font-black text-white">
              {sessionData!.scenario.softName ?? sessionData!.scenario.name}
            </h1>
          </div>

          {/* Role description */}
          <div className="px-8 pt-5 pb-1">
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(156,163,175,0.85)' }}>
              {isTutor
                ? 'Como Moderador, você observará o chat do lobby e poderá intervir nas mensagens. Sua função é identificar comportamentos inadequados e agir conforme necessário.'
                : 'Como Observador, você acompanhará o chat do lobby sem poder intervir. Ao final da simulação, responderá um breve questionário sobre o que observou.'}
            </p>
          </div>

          {/* Actions */}
          <div className="px-8 py-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-3">
              {isTutor ? 'Ações disponíveis' : 'O que você vai fazer'}
            </p>
            <div className="space-y-2">
              {actions.map((a) => (
                <div
                  key={a.label}
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ backgroundColor: a.bg, border: `1px solid ${a.border}` }}
                >
                  <div className="shrink-0" style={{ color: a.color }}>{a.icon}</div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: a.color }}>{a.label}</p>
                    <p className="text-xs text-gray-500">{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="px-8 pb-8 space-y-2">
            <button
              onClick={handleStart}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all"
              style={{
                background: `linear-gradient(135deg, ${roleBg} 0%, ${roleBorder} 100%)`,
                color: roleColor,
                border: `1px solid ${roleBorder}`,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Entrar no Lobby →
            </button>
            <button
              onClick={() => router.push('/game-lobby')}
              className="w-full py-2 rounded-xl text-xs transition-colors"
              style={{ color: 'rgba(107,114,128,0.7)' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </DarkScreen>
    );
  }

  // ── Active game lobby ──────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen" style={{ background: '#131428' }}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ backgroundColor: 'rgba(18,18,38,0.88)', borderBottom: '1px solid rgba(139,92,246,0.2)' }}
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-bold text-gray-300 tracking-wide">
            {sessionData!.scenario.softName ?? sessionData!.scenario.name}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isTutor && chat.isComplete && (
            <button
              onClick={handleFinalize}
              className="px-3 py-1 rounded text-xs font-bold transition-colors"
              style={{
                backgroundColor: 'rgba(34,197,94,0.2)',
                color: '#86efac',
                border: '1px solid rgba(34,197,94,0.35)',
              }}
            >
              Finalizar Sessão
            </button>
          )}
          {!isTutor && chat.isComplete && (
            <button
              onClick={() => setShowQuestionnaire(true)}
              className="px-3 py-1 rounded text-xs font-bold transition-colors"
              style={{
                backgroundColor: 'rgba(139,92,246,0.2)',
                color: '#a78bfa',
                border: '1px solid rgba(139,92,246,0.35)',
              }}
            >
              Responder Questionário
            </button>
          )}
          <span
            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest"
            style={{ backgroundColor: 'rgba(139,92,246,0.1)', color: 'rgba(167,139,250,0.7)', border: '1px solid rgba(139,92,246,0.2)' }}
          >
            {isTutor ? 'Moderador' : 'Observador'}
          </span>
        </div>
      </div>

      {/* Main game scene — fixed 1280×720, scaled to fit available space */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-[#0b0c1a]">
        <ScaledScene>
          <GameScene
            participants={sessionData!.scenario.participants}
            visibleMessages={chat.visibleMessages}
            typingParticipantId={chat.typingParticipant?.id ?? null}
            canTakeActions={chat.canTakeActions}
            isTutor={isTutor}
            canUndo={chat.canUndo}
            isComplete={chat.isComplete}
            onAction={chat.executeAction}
            onUndo={chat.undoLastAction}
            onRestart={isTutor ? handleRestart : undefined}
            onHoverStart={(id) => chat.onMessageHoverStart(id, 'DELETE_MESSAGE')}
            onHoverEnd={() => chat.onMessageHoverEnd()}
          />
        </ScaledScene>
      </div>

      {/* Bystander questionnaire */}
      <QuestionnaireModal
        isOpen={showQuestionnaire}
        onClose={() => {}}
        onSubmit={handleSubmitQuestionnaire}
        sessionId={sessionId}
      />
    </div>
  );
}
