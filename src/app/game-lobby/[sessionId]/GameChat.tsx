'use client';

import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const getParticipant = (id: string) => participants.find((p) => p.id === id);

  return (
    <div
      className="absolute bottom-4 left-4 w-72 max-h-52 flex flex-col rounded-lg overflow-hidden"
      style={{
        backgroundColor: 'rgba(5,5,10,0.82)',
        border: '1px solid rgba(139,92,246,0.2)',
        backdropFilter: 'blur(12px)',
        zIndex: 30,
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest"
        style={{ color: 'rgba(139,92,246,0.8)', borderBottom: '1px solid rgba(139,92,246,0.15)' }}
      >
        Chat do Lobby
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2 py-1.5 space-y-0.5 scrollbar-hide">
        {messages.filter((m) => !m.isDeleted).map((msg) => {
          const participant = getParticipant(msg.participantId);
          const color = avatarColors[msg.participantId] ?? '#9ca3af';
          const isWarn = msg.hasWarning;

          return (
            <div
              key={msg.id}
              className="group relative flex items-start gap-1.5 rounded px-1.5 py-1 transition-colors"
              style={{ backgroundColor: isWarn ? 'rgba(217,119,6,0.08)' : 'transparent' }}
              onMouseEnter={() => onHoverStart?.(msg.id)}
              onMouseLeave={() => onHoverEnd?.(msg.id)}
            >
              <span
                className="text-[11px] font-bold shrink-0"
                style={{ color, textShadow: '0 0 8px currentColor' }}
              >
                {participant?.name ?? 'Unknown'}:
              </span>
              <span
                className="text-[11px] leading-snug break-words min-w-0"
                style={{ color: isWarn ? '#fcd34d' : 'rgba(229,231,235,0.85)' }}
              >
                {msg.content}
                {isWarn && <span className="ml-1 text-[9px] text-amber-400/60">⚠</span>}
              </span>

              {/* Action buttons — only for tutor, appear on hover */}
              {canTakeActions && !isWarn && onAction && (
                <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-1">
                  <button
                    onClick={() => onAction(msg.id, 'DELETE_MESSAGE')}
                    className="rounded px-1.5 py-0.5 text-[9px] font-bold transition-colors"
                    style={{ backgroundColor: 'rgba(220,38,38,0.25)', color: '#fca5a5' }}
                    title="Excluir mensagem"
                  >
                    ✕
                  </button>
                  <button
                    onClick={() => onAction(msg.id, 'WARN_MESSAGE')}
                    className="rounded px-1.5 py-0.5 text-[9px] font-bold transition-colors"
                    style={{ backgroundColor: 'rgba(217,119,6,0.25)', color: '#fcd34d' }}
                    title="Avisar jogador"
                  >
                    ⚠
                  </button>
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
