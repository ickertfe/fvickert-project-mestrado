'use client';

import { useEffect, useRef, useState } from 'react';
import { SpeechBubble } from './SpeechBubble';
import type { DisplayMessage } from '@/types/message';
import type { ActionType } from '@/types/action';

export interface AvatarConfig {
  id: string;
  name: string;
  color: string;
  startX: number; // % of container
  startY: number; // % of container
}

interface Avatar2DProps {
  config: AvatarConfig;
  currentMessage: DisplayMessage | null;
  isSpeaking: boolean;
  canTakeActions: boolean;
  onAction?: (messageId: string, action: ActionType) => void;
  onHoverStart?: (messageId: string) => void;
  onHoverEnd?: (messageId: string) => void;
}

function darken(hex: string, amount = 30) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `rgb(${r},${g},${b})`;
}

// Random within bounds: 8–78% x, 40–68% y (walkable floor area)
function randomPos() {
  return {
    x: 8 + Math.random() * 70,
    y: 40 + Math.random() * 28,
  };
}

export function Avatar2D({
  config,
  currentMessage,
  isSpeaking,
  canTakeActions,
  onAction,
  onHoverStart,
  onHoverEnd,
}: Avatar2DProps) {
  const [pos, setPos] = useState({ x: config.startX, y: config.startY });
  const [flipped, setFlipped] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Random movement when not speaking
  useEffect(() => {
    if (isSpeaking) {
      if (intervalRef.current) clearTimeout(intervalRef.current);
      return;
    }

    function scheduleMove() {
      const delay = 2000 + Math.random() * 3000;
      intervalRef.current = setTimeout(() => {
        const next = randomPos();
        setFlipped((prev) => {
          // flip if moving left
          return next.x < pos.x ? true : next.x > pos.x ? false : prev;
        });
        setPos(next);
        scheduleMove();
      }, delay);
    }

    scheduleMove();
    return () => { if (intervalRef.current) clearTimeout(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpeaking]);

  const dark = darken(config.color, 40);
  const visor = '#aee6f8';

  return (
    <div
      className="absolute"
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: 'translate(-50%, -100%)',
        transition: isSpeaking ? 'none' : 'left 2s ease-in-out, top 2s ease-in-out',
        zIndex: 10,
        width: 48,
      }}
    >
      {/* Speech bubble above avatar */}
      {currentMessage && isSpeaking && (
        <SpeechBubble
          content={currentMessage.content}
          messageId={currentMessage.id}
          isDeleted={currentMessage.isDeleted}
          hasWarning={currentMessage.hasWarning}
          canTakeActions={canTakeActions}
          onAction={onAction}
          onHoverStart={onHoverStart}
          onHoverEnd={onHoverEnd}
        />
      )}

      {/* Name tag */}
      <div
        className="text-center text-[10px] font-bold mb-0.5 truncate"
        style={{ color: config.color, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
      >
        {config.name}
      </div>

      {/* Among Us style avatar SVG */}
      <svg
        viewBox="0 0 40 50"
        width={48}
        height={60}
        style={{ transform: flipped ? 'scaleX(-1)' : 'scaleX(1)', display: 'block', margin: '0 auto' }}
      >
        {/* Shadow */}
        <ellipse cx="20" cy="49" rx="12" ry="2.5" fill="rgba(0,0,0,0.3)" />
        {/* Body */}
        <ellipse cx="20" cy="36" rx="14" ry="15" fill={config.color} />
        {/* Head */}
        <circle cx="20" cy="17" r="13" fill={config.color} />
        {/* Visor */}
        <ellipse cx="22" cy="14" rx="8.5" ry="7" fill={visor} opacity="0.85" />
        {/* Visor shine */}
        <ellipse cx="19" cy="11" rx="3" ry="2.5" fill="white" opacity="0.4" />
        {/* Backpack */}
        <rect x="32" y="27" width="7" height="13" rx="3" fill={dark} />
        {/* Legs */}
        <rect x="12" y="47" width="6" height="4" rx="2" fill={dark} />
        <rect x="22" y="47" width="6" height="4" rx="2" fill={dark} />
      </svg>
    </div>
  );
}
