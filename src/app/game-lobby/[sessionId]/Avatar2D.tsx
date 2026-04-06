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
  isTyping: boolean;
  isComplete: boolean;
  canTakeActions: boolean;
  onAction?: (messageId: string, action: ActionType) => void;
  onHoverStart?: (messageId: string) => void;
  onHoverEnd?: (messageId: string) => void;
}

// Tile grid — each step moves exactly one tile
const TILE_X = 4; // % per tile horizontally
const TILE_Y = 4; // % per tile vertically
const STEP_MS = 160; // ms between each tile step
const PAUSE_MIN = 800; // ms to wait at destination before next walk
const PAUSE_MAX = 2500;

function snap(val: number, tile: number) {
  return Math.round(val / tile) * tile;
}

function randomDest() {
  return {
    x: snap(18 + Math.random() * 60, TILE_X),
    y: snap(38 + Math.random() * 28, TILE_Y),
  };
}

function darken(hex: string, amount = 40) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `rgb(${r},${g},${b})`;
}

// HD pixel-art avatar — small viewBox (16×20) rendered large for crisp pixel look
function PixelAvatar({ color, dark, visor, flipped }: { color: string; dark: string; visor: string; flipped: boolean }) {
  return (
    <svg
      viewBox="0 0 16 20"
      width={64}
      height={80}
      style={{
        display: 'block',
        margin: '0 auto',
        transform: flipped ? 'scaleX(-1)' : undefined,
        imageRendering: 'pixelated',
        shapeRendering: 'crispEdges',
      }}
    >
      {/* Shadow */}
      <rect x="3" y="19" width="10" height="1" fill="rgba(0,0,0,0.4)" />
      {/* Head — top row */}
      <rect x="3" y="0" width="8" height="1" fill={color} />
      {/* Head — main block */}
      <rect x="2" y="1" width="10" height="5" fill={color} />
      {/* Head — bottom row */}
      <rect x="3" y="6" width="8" height="1" fill={color} />
      {/* Visor (right side of head) */}
      <rect x="6" y="1" width="5" height="1" fill={visor} />
      <rect x="6" y="2" width="5" height="3" fill={visor} />
      <rect x="7" y="5" width="3" height="1" fill={visor} />
      {/* Visor shine pixel */}
      <rect x="6" y="2" width="2" height="1" fill="white" opacity="0.55" />
      {/* Body */}
      <rect x="2" y="7" width="10" height="8" fill={color} />
      {/* Body shading — bottom strip */}
      <rect x="2" y="14" width="10" height="1" fill={dark} opacity="0.35" />
      {/* Backpack */}
      <rect x="12" y="8" width="2" height="6" fill={dark} />
      {/* Left leg */}
      <rect x="3" y="15" width="3" height="4" fill={dark} />
      {/* Right leg */}
      <rect x="8" y="15" width="3" height="4" fill={dark} />
      {/* Leg top highlight */}
      <rect x="3" y="15" width="3" height="1" fill={color} opacity="0.25" />
      <rect x="8" y="15" width="3" height="1" fill={color} opacity="0.25" />
    </svg>
  );
}

export function Avatar2D({
  config,
  currentMessage,
  isSpeaking,
  isTyping,
  isComplete,
  canTakeActions,
  onAction,
  onHoverStart,
  onHoverEnd,
}: Avatar2DProps) {
  const [pos, setPos] = useState({
    x: snap(config.startX, TILE_X),
    y: snap(config.startY, TILE_Y),
  });
  const [flipped, setFlipped] = useState(false);

  const posRef = useRef(pos);
  posRef.current = pos;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    stoppedRef.current = isSpeaking || isTyping || isComplete;

    if (stoppedRef.current) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    function walkTo(dest: { x: number; y: number }) {
      if (stoppedRef.current) return;

      const cur = posRef.current;
      const dx = dest.x - cur.x;
      const dy = dest.y - cur.y;

      if (dx === 0 && dy === 0) {
        // Arrived — pause then pick new destination
        const pause = PAUSE_MIN + Math.random() * (PAUSE_MAX - PAUSE_MIN);
        timerRef.current = setTimeout(() => walkTo(randomDest()), pause);
        return;
      }

      // Move one tile toward destination — prefer horizontal first
      let nextX = cur.x;
      let nextY = cur.y;
      if (dx !== 0) {
        nextX = cur.x + (dx > 0 ? TILE_X : -TILE_X);
        setFlipped(dx < 0);
      } else if (dy !== 0) {
        nextY = cur.y + (dy > 0 ? TILE_Y : -TILE_Y);
      }

      setPos({ x: nextX, y: nextY });
      timerRef.current = setTimeout(() => walkTo(dest), STEP_MS);
    }

    walkTo(randomDest());
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpeaking, isTyping, isComplete]);

  const dark = darken(config.color, 40);
  const visor = '#aee6f8';

  const hasBubble = (isSpeaking || isTyping) && !isComplete;

  return (
    <div
      className="absolute"
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: 'translate(-50%, -100%)',
        // No CSS transition — instant snap per tile
        zIndex: hasBubble ? 50 : 10,
        width: 48,
      }}
    >
      {/* Speech bubble — shows during typing (dots) and speaking (text), hidden when complete */}
      {hasBubble && (
        <SpeechBubble
          content={isTyping ? '' : (currentMessage?.content ?? '')}
          messageId={currentMessage?.id ?? ''}
          isTyping={isTyping}
          isDeleted={isTyping ? false : (currentMessage?.isDeleted ?? false)}
          hasWarning={isTyping ? false : (currentMessage?.hasWarning ?? false)}
          canTakeActions={canTakeActions && !isTyping}
          onAction={onAction}
          onHoverStart={onHoverStart}
          onHoverEnd={onHoverEnd}
        />
      )}

      {/* Name tag */}
      <div
        style={{
          textAlign: 'center',
          fontSize: 9,
          fontFamily: 'monospace',
          fontWeight: 'bold',
          marginBottom: 2,
          color: config.color,
          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
          imageRendering: 'pixelated',
          whiteSpace: 'nowrap',
        }}
      >
        {config.name}
      </div>

      <PixelAvatar color={config.color} dark={dark} visor={visor} flipped={flipped} />
    </div>
  );
}
