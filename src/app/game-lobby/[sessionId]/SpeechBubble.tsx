'use client';

import { useEffect, useState } from 'react';
import type { ActionType } from '@/types/action';

interface SpeechBubbleProps {
  content: string;
  messageId: string;
  isTyping: boolean;
  isDeleted: boolean;
  hasWarning: boolean;
  canTakeActions: boolean;
  onAction?: (messageId: string, action: ActionType) => void;
  onHoverStart?: (messageId: string) => void;
  onHoverEnd?: (messageId: string) => void;
}

// Animated typing dots
function TypingDots() {
  return (
    <span className="inline-flex items-center gap-[3px]">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400"
          style={{
            animation: `typing-dot 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes typing-dot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </span>
  );
}

export function SpeechBubble({
  content,
  messageId,
  isTyping,
  isDeleted,
  hasWarning,
  canTakeActions,
  onAction,
  onHoverStart,
  onHoverEnd,
}: SpeechBubbleProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fade in on mount and whenever content changes
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(t);
  }, [content, isTyping]);

  if (isDeleted) return null;

  const borderColor = hasWarning
    ? 'rgba(217,119,6,0.55)'
    : isTyping
    ? 'rgba(99,102,241,0.35)'
    : 'rgba(139,92,246,0.4)';

  const bgColor = hasWarning
    ? 'rgba(217,119,6,0.12)'
    : 'rgba(10,10,18,0.93)';

  const arrowColor = hasWarning
    ? 'rgba(217,119,6,0.55)'
    : isTyping
    ? 'rgba(99,102,241,0.35)'
    : 'rgba(139,92,246,0.4)';

  return (
    <div
      className="absolute bottom-full left-1/2 mb-2 w-max max-w-[200px]"
      style={{ transform: 'translateX(-50%)', zIndex: 50 }}
      onMouseEnter={() => !isTyping && onHoverStart?.(messageId)}
      onMouseLeave={() => !isTyping && onHoverEnd?.(messageId)}
    >
      <div
        className="relative rounded-xl px-3 py-2 text-xs leading-snug shadow-xl transition-all duration-200"
        style={{
          backgroundColor: bgColor,
          border: `1px solid ${borderColor}`,
          color: hasWarning ? '#fcd34d' : '#e5e7eb',
          backdropFilter: 'blur(10px)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.92)',
          minWidth: 60,
        }}
      >
        {/* Content or typing dots */}
        {isTyping ? (
          <div className="flex items-center justify-center py-0.5">
            <TypingDots />
          </div>
        ) : (
          <span className="block break-words">{content}</span>
        )}

        {hasWarning && !isTyping && (
          <div className="mt-1 text-[10px] text-amber-400/60">⚠ mensagem avisada</div>
        )}

        {/* Arrow pointing down to avatar */}
        <div
          className="absolute top-full left-1/2 -translate-x-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: `7px solid ${arrowColor}`,
          }}
        />
      </div>
    </div>
  );
}
