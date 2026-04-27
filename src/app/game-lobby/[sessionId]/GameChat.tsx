'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { DisplayMessage } from '@/types/message';
import type { ChatParticipant } from '@/types/scenario';
import type { ActionType } from '@/types/action';

interface GameChatProps {
  messages: DisplayMessage[];
  participants: ChatParticipant[];
  avatarColors: Record<string, string>;
  canTakeActions: boolean;
  onAction?: (messageId: string, action: ActionType) => void;
  onHoverStart?: (messageId: string) => void;
  onHoverEnd?: (messageId: string) => void;
}

// Portal-based tooltip — escapes any overflow container
function Tip({ label, children }: { label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  return (
    <div
      ref={ref}
      onMouseEnter={() => ref.current && setRect(ref.current.getBoundingClientRect())}
      onMouseLeave={() => setRect(null)}
    >
      {children}
      {rect &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="pointer-events-none fixed px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap"
            style={{
              left: rect.left + rect.width / 2,
              top: rect.top - 6,
              transform: 'translate(-50%, -100%)',
              backgroundColor: 'rgba(15,15,28,0.95)',
              color: '#e2e8f0',
              border: '1px solid rgba(139,92,246,0.3)',
              zIndex: 9999,
            }}
          >
            {label}
          </div>,
          document.body
        )}
    </div>
  );
}

// Legend popover shown by ℹ button
function ActionsLegend({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="absolute bottom-full right-0 mb-2 w-56 rounded-xl p-4 shadow-2xl"
      style={{ backgroundColor: 'rgba(15,15,28,0.97)', border: '1px solid rgba(139,92,246,0.3)', zIndex: 9999 }}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400/70 mb-3">Ações de Moderação</p>
      <div className="space-y-2.5">
        <div className="flex items-start gap-2">
          <span className="shrink-0 mt-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold" style={{ backgroundColor: 'rgba(220,38,38,0.2)', color: '#fca5a5' }}>✕ Excluir</span>
          <p className="text-[11px] text-gray-400 leading-snug">Remove a mensagem do chat. Fica visível riscada apenas para você.</p>
        </div>
        <div className="flex items-start gap-2">
          <span className="shrink-0 mt-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold" style={{ backgroundColor: 'rgba(217,119,6,0.2)', color: '#fcd34d' }}>⚠ Avisar</span>
          <p className="text-[11px] text-gray-400 leading-snug">Marca a mensagem com um aviso de conteúdo impróprio.</p>
        </div>
      </div>
      <button onClick={onClose} className="mt-3 w-full text-center text-[10px] text-gray-600 hover:text-gray-400 transition-colors">fechar</button>
    </div>
  );
}

export function GameChat({
  messages,
  participants,
  avatarColors,
  canTakeActions,
  onAction,
  onHoverStart,
  onHoverEnd,
}: GameChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showLegend, setShowLegend] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const getParticipant = (id: string) => participants.find((p) => p.id === id);

  return (
    // No overflow-hidden on the outer div so tooltips and the legend can escape
    <div
      className="absolute bottom-4 left-4 w-[480px] max-h-60 flex flex-col rounded-xl"
      style={{
        backgroundColor: 'rgba(10,10,24,0.22)',
        border: '1px solid rgba(139,92,246,0.18)',
        backdropFilter: 'blur(28px)',
        zIndex: 30,
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-1.5 flex items-center justify-between shrink-0 rounded-t-xl"
        style={{ borderBottom: '1px solid rgba(139,92,246,0.1)' }}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(167,139,250,0.65)' }}>
          Chat do Lobby
        </span>
        {canTakeActions && (
          <div className="relative">
            <button
              onClick={() => setShowLegend((v) => !v)}
              className="flex items-center justify-center h-5 w-5 rounded-full text-[11px] font-bold transition-colors"
              style={{ color: 'rgba(167,139,250,0.5)', backgroundColor: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}
            >
              ℹ
            </button>
            {showLegend && <ActionsLegend onClose={() => setShowLegend(false)} />}
          </div>
        )}
      </div>

      {/* Messages — scroll only here, rounded bottom */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-1.5 space-y-0.5 scrollbar-hide rounded-b-xl">
        {messages.map((msg) => {
          const participant = getParticipant(msg.participantId);
          const color = avatarColors[msg.participantId] ?? '#9ca3af';
          const isWarn = msg.hasWarning;
          const isDeleted = msg.isDeleted;

          return (
            <div
              key={msg.id}
              className="group relative flex items-start gap-1.5 rounded px-1.5 py-1 transition-colors"
              style={{
                backgroundColor: isWarn ? 'rgba(217,119,6,0.07)' : 'transparent',
                opacity: isDeleted ? 0.45 : 1,
              }}
              onMouseEnter={() => !isDeleted && onHoverStart?.(msg.id)}
              onMouseLeave={() => !isDeleted && onHoverEnd?.(msg.id)}
            >
              <span
                className="text-[11px] font-bold shrink-0"
                style={{ color: isDeleted ? '#6b7280' : color, textShadow: isDeleted ? 'none' : '0 0 8px currentColor' }}
              >
                {participant?.name ?? 'Unknown'}:
              </span>
              <span
                className="text-[11px] leading-snug break-words min-w-0"
                style={{
                  color: isDeleted ? '#6b7280' : isWarn ? '#fcd34d' : 'rgba(229,231,235,0.85)',
                  textDecoration: isDeleted ? 'line-through' : 'none',
                }}
              >
                {msg.content}
                {isWarn && !isDeleted && <span className="ml-1 text-[9px] text-amber-400/60">⚠</span>}
                {isDeleted && <span className="ml-1 text-[9px] text-gray-500">excluída</span>}
              </span>

              {/* Action buttons on hover — tutor only, active messages */}
              {canTakeActions && !isWarn && !isDeleted && onAction && (
                <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-1">
                  <Tip label="Excluir mensagem">
                    <button
                      onClick={() => onAction(msg.id, 'DELETE_MESSAGE')}
                      className="rounded px-1.5 py-0.5 text-[9px] font-bold transition-colors"
                      style={{ backgroundColor: 'rgba(220,38,38,0.25)', color: '#fca5a5' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.45)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.25)')}
                    >
                      ✕
                    </button>
                  </Tip>
                  <Tip label="Avisar jogador">
                    <button
                      onClick={() => onAction(msg.id, 'WARN_MESSAGE')}
                      className="rounded px-1.5 py-0.5 text-[9px] font-bold transition-colors"
                      style={{ backgroundColor: 'rgba(217,119,6,0.25)', color: '#fcd34d' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(217,119,6,0.45)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(217,119,6,0.25)')}
                    >
                      ⚠
                    </button>
                  </Tip>
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
