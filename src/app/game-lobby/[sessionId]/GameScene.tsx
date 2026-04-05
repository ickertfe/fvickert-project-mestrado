'use client';

import { useMemo } from 'react';
import { Avatar2D, type AvatarConfig } from './Avatar2D';
import { GameChat } from './GameChat';
import type { DisplayMessage } from '@/types/message';
import type { ChatParticipant } from '@/types/scenario';
import type { ActionType } from '@/types/action';

// Game-style vivid colors, one per participant slot
const SLOT_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];

// Spread starting positions so avatars don't pile up
const START_POSITIONS = [
  { x: 20, y: 55 },
  { x: 65, y: 48 },
  { x: 42, y: 62 },
  { x: 80, y: 58 },
];

interface GameSceneProps {
  participants: ChatParticipant[];
  visibleMessages: DisplayMessage[];
  typingParticipantId: string | null;
  canTakeActions: boolean;
  isTutor: boolean;
  canUndo: boolean;
  onAction?: (messageId: string, action: ActionType) => void;
  onUndo?: () => void;
  onHoverStart?: (messageId: string) => void;
  onHoverEnd?: (messageId: string) => void;
}

export function GameScene({
  participants,
  visibleMessages,
  typingParticipantId,
  canTakeActions,
  isTutor,
  canUndo,
  onAction,
  onUndo,
  onHoverStart,
  onHoverEnd,
}: GameSceneProps) {
  // Assign a color and start position to each participant
  const avatarConfigs: AvatarConfig[] = useMemo(
    () =>
      participants.map((p, i) => ({
        id: p.id,
        name: p.name,
        color: SLOT_COLORS[i % SLOT_COLORS.length],
        startX: START_POSITIONS[i % START_POSITIONS.length].x,
        startY: START_POSITIONS[i % START_POSITIONS.length].y,
      })),
    [participants]
  );

  const avatarColors = useMemo(
    () => Object.fromEntries(avatarConfigs.map((c) => [c.id, c.color])),
    [avatarConfigs]
  );

  // Last visible message per participant (for speech bubble)
  const lastMessageByParticipant = useMemo(() => {
    const map: Record<string, DisplayMessage> = {};
    for (const msg of visibleMessages) {
      if (!msg.isDeleted) map[msg.participantId] = msg;
    }
    return map;
  }, [visibleMessages]);

  // The participant currently typing or the sender of the most recent message
  const activeSpeakerId = typingParticipantId
    ?? (visibleMessages.length > 0 ? visibleMessages[visibleMessages.length - 1].participantId : null);

  return (
    <div className="relative w-full h-full overflow-hidden select-none" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Background: game lobby room ─────────────────────────────── */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0b0c1a 0%, #10122a 60%, #1a1235 100%)' }} />

      {/* Starfield dots */}
      {[...Array(40)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 35}%`,
            backgroundColor: 'rgba(255,255,255,0.5)',
            opacity: Math.random() * 0.7 + 0.1,
          }}
        />
      ))}

      {/* Floor */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '45%',
          background: 'linear-gradient(180deg, #1c1f3a 0%, #14162e 100%)',
          borderTop: '2px solid rgba(139,92,246,0.25)',
        }}
      />

      {/* Floor grid lines */}
      <svg className="absolute bottom-0 left-0 w-full" style={{ height: '45%', opacity: 0.12 }} preserveAspectRatio="none">
        {[...Array(8)].map((_, i) => (
          <line key={`v${i}`} x1={`${(i + 1) * 12.5}%`} y1="0" x2={`${(i + 1) * 12.5}%`} y2="100%" stroke="#8b5cf6" strokeWidth="1" />
        ))}
        {[...Array(4)].map((_, i) => (
          <line key={`h${i}`} x1="0" y1={`${(i + 1) * 25}%`} x2="100%" y2={`${(i + 1) * 25}%`} stroke="#8b5cf6" strokeWidth="1" />
        ))}
      </svg>

      {/* Lobby objects (terminals, lights) */}
      {/* Left terminal */}
      <div className="absolute" style={{ left: '4%', bottom: '42%' }}>
        <div style={{ width: 36, height: 28, backgroundColor: '#1e2240', border: '1px solid rgba(139,92,246,0.4)', borderRadius: 4 }}>
          <div style={{ margin: '4px', height: 8, backgroundColor: 'rgba(139,92,246,0.3)', borderRadius: 2 }} />
          <div style={{ margin: '2px 4px', height: 4, backgroundColor: 'rgba(99,102,241,0.2)', borderRadius: 1 }} />
          <div style={{ margin: '1px 4px', height: 4, backgroundColor: 'rgba(99,102,241,0.15)', borderRadius: 1 }} />
        </div>
        <div style={{ width: 36, height: 6, backgroundColor: '#252848', borderRadius: '0 0 3px 3px' }} />
      </div>

      {/* Right terminal */}
      <div className="absolute" style={{ right: '5%', bottom: '42%' }}>
        <div style={{ width: 36, height: 28, backgroundColor: '#1e2240', border: '1px solid rgba(59,130,246,0.4)', borderRadius: 4 }}>
          <div style={{ margin: '4px', height: 8, backgroundColor: 'rgba(59,130,246,0.25)', borderRadius: 2 }} />
          <div style={{ margin: '2px 4px', height: 4, backgroundColor: 'rgba(99,102,241,0.2)', borderRadius: 1 }} />
        </div>
        <div style={{ width: 36, height: 6, backgroundColor: '#252848', borderRadius: '0 0 3px 3px' }} />
      </div>

      {/* Center sign / banner */}
      <div
        className="absolute text-center"
        style={{ top: '8%', left: '50%', transform: 'translateX(-50%)' }}
      >
        <div
          className="px-4 py-1.5 rounded text-xs font-bold uppercase tracking-widest"
          style={{
            backgroundColor: 'rgba(139,92,246,0.15)',
            border: '1px solid rgba(139,92,246,0.3)',
            color: 'rgba(167,139,250,0.9)',
            backdropFilter: 'blur(4px)',
          }}
        >
          ◈ LOBBY — Aguardando jogadores ◈
        </div>
      </div>

      {/* Ceiling lights */}
      {[20, 50, 80].map((x) => (
        <div key={x} className="absolute" style={{ left: `${x}%`, top: '14%', transform: 'translateX(-50%)' }}>
          <div style={{ width: 6, height: 16, backgroundColor: '#2a2d50', margin: '0 auto' }} />
          <div
            style={{
              width: 20,
              height: 6,
              borderRadius: '0 0 4px 4px',
              backgroundColor: '#8b5cf6',
              boxShadow: '0 0 12px 4px rgba(139,92,246,0.4)',
              margin: '0 auto',
            }}
          />
        </div>
      ))}

      {/* ── Avatars ──────────────────────────────────────────────────── */}
      {avatarConfigs.map((cfg) => (
        <Avatar2D
          key={cfg.id}
          config={cfg}
          currentMessage={lastMessageByParticipant[cfg.id] ?? null}
          isSpeaking={cfg.id === activeSpeakerId}
          canTakeActions={canTakeActions}
          onAction={onAction}
          onHoverStart={onHoverStart}
          onHoverEnd={onHoverEnd}
        />
      ))}

      {/* Typing indicator on map */}
      {typingParticipantId && (() => {
        const cfg = avatarConfigs.find((c) => c.id === typingParticipantId);
        if (!cfg) return null;
        return (
          <div
            className="absolute text-[10px] animate-pulse"
            style={{
              left: `${cfg.startX}%`,
              top: `calc(${cfg.startY}% - 90px)`,
              transform: 'translateX(-50%)',
              color: cfg.color,
              zIndex: 25,
            }}
          >
            digitando...
          </div>
        );
      })()}

      {/* ── Game Chat (bottom-left) ───────────────────────────────────── */}
      <GameChat
        messages={visibleMessages}
        participants={participants}
        avatarColors={avatarColors}
        canTakeActions={canTakeActions}
        onAction={onAction}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
      />

      {/* ── Tutor HUD (top-right) ────────────────────────────────────── */}
      {isTutor && (
        <div
          className="absolute top-4 right-4 flex flex-col gap-2"
          style={{ zIndex: 30 }}
        >
          <div
            className="px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest text-center"
            style={{
              backgroundColor: 'rgba(139,92,246,0.15)',
              border: '1px solid rgba(139,92,246,0.3)',
              color: 'rgba(167,139,250,0.9)',
            }}
          >
            Modo Moderador
          </div>
          {canUndo && (
            <button
              onClick={onUndo}
              className="px-3 py-1.5 rounded text-[11px] font-medium text-center transition-colors"
              style={{
                backgroundColor: 'rgba(75,85,99,0.3)',
                border: '1px solid rgba(107,114,128,0.4)',
                color: '#d1d5db',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(75,85,99,0.5)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(75,85,99,0.3)')}
            >
              ↩ Desfazer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
