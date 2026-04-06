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
    return (
      <DarkScreen>
        <div
          className="max-w-md w-full rounded-xl p-8 text-center"
          style={{ backgroundColor: 'rgba(15,15,25,0.9)', border: '1px solid rgba(139,92,246,0.25)' }}
        >
          {/* Game icon */}
          <div
            className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl"
            style={{ backgroundColor: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}
          >
            <svg className="h-10 w-10 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>

          <div
            className="inline-block mb-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest"
            style={{ backgroundColor: 'rgba(139,92,246,0.15)', color: 'rgba(167,139,250,0.8)', border: '1px solid rgba(139,92,246,0.2)' }}
          >
            {isTutor ? 'Moderador' : 'Observador'}
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">
            {sessionData!.scenario.softName ?? sessionData!.scenario.name}
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            {isTutor
              ? 'Você irá moderar um lobby de jogo. Monitore as mensagens e intervenha quando necessário usando as ações disponíveis.'
              : 'Você irá observar um lobby de jogo. Acompanhe a conversa e responda um questionário ao final.'}
          </p>

          <div className="space-y-3">
            <button
              onClick={handleStart}
              className="w-full py-3 rounded-lg text-sm font-bold transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.4) 0%, rgba(99,102,241,0.4) 100%)',
                color: '#c4b5fd',
                border: '1px solid rgba(139,92,246,0.5)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Entrar no Lobby
            </button>
            <button
              onClick={() => router.push('/game-lobby')}
              className="w-full py-2 rounded-lg text-sm transition-colors"
              style={{ color: 'rgba(156,163,175,0.6)' }}
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
