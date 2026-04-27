'use client';

import { useMemo } from 'react';
import { Avatar2D, type AvatarConfig } from './Avatar2D';
import { GameChat } from './GameChat';
import type { DisplayMessage } from '@/types/message';
import type { ChatParticipant } from '@/types/scenario';
import type { ActionType } from '@/types/action';

// Game-style vivid colors, one per participant slot
const SLOT_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];

// Spread starting positions across the walkable floor of the lobby image
const START_POSITIONS = [
  { x: 28, y: 52 },
  { x: 58, y: 45 },
  { x: 42, y: 65 },
  { x: 72, y: 60 },
];

interface GameSceneProps {
  participants: ChatParticipant[];
  visibleMessages: DisplayMessage[];
  typingParticipantId: string | null;
  canTakeActions: boolean;
  isTutor: boolean;
  canUndo: boolean;
  isComplete: boolean;
  onAction?: (messageId: string, action: ActionType) => void;
  onUndo?: () => void;
  onRestart?: () => void;
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
  isComplete,
  onAction,
  onUndo,
  onRestart,
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
    // Fixed 1280×720 scene — scales to fit the viewport container via CSS transform in the parent
    <div className="relative overflow-hidden select-none" style={{ width: 1280, height: 720, fontFamily: "'Inter', sans-serif" }}>

      {/* ── Background: game lobby image ────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/game-lobby-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Subtle dark overlay so avatars/UI pop */}
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(5,5,15,0.12)' }} />

      {/* ── Avatars ──────────────────────────────────────────────────── */}
      {avatarConfigs.map((cfg) => (
        <Avatar2D
          key={cfg.id}
          config={cfg}
          currentMessage={lastMessageByParticipant[cfg.id] ?? null}
          isSpeaking={cfg.id === activeSpeakerId && !typingParticipantId}
          isTyping={cfg.id === typingParticipantId}
          isComplete={isComplete}
          canTakeActions={canTakeActions}
          onAction={onAction}
          onHoverStart={onHoverStart}
          onHoverEnd={onHoverEnd}
        />
      ))}

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
          <button
            onClick={onRestart}
            className="px-3 py-1.5 rounded text-[11px] font-medium text-center transition-colors"
            style={{
              backgroundColor: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.3)',
              color: '#6ee7b7',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.12)')}
          >
            ↺ Reiniciar
          </button>
        </div>
      )}
    </div>
  );
}
