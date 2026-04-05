'use client';

import { useEffect, useState } from 'react';
import type { ActionType } from '@/types/action';

interface SpeechBubbleProps {
  content: string;
  messageId: string;
  isDeleted: boolean;
  hasWarning: boolean;
  canTakeActions: boolean;
  onAction?: (messageId: string, action: ActionType) => void;
  onHoverStart?: (messageId: string) => void;
  onHoverEnd?: (messageId: string) => void;
}

export function SpeechBubble({
  content,
  messageId,
  isDeleted,
  hasWarning,
  canTakeActions,
  onAction,
  onHoverStart,
  onHoverEnd,
}: SpeechBubbleProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [content]);

  if (isDeleted) return null;

  return (
    <div
      className="absolute bottom-full left-1/2 mb-2 w-max max-w-[180px]"
      style={{ transform: 'translateX(-50%)', zIndex: 20 }}
      onMouseEnter={() => onHoverStart?.(messageId)}
      onMouseLeave={() => onHoverEnd?.(messageId)}
    >
      {/* Bubble */}
      <div
        className="relative rounded-xl px-3 py-2 text-xs leading-snug shadow-lg transition-all duration-300"
        style={{
          backgroundColor: hasWarning ? 'rgba(217,119,6,0.15)' : 'rgba(15,15,20,0.92)',
          border: hasWarning ? '1px solid rgba(217,119,6,0.5)' : '1px solid rgba(139,92,246,0.3)',
          color: hasWarning ? '#fcd34d' : '#e5e7eb',
          backdropFilter: 'blur(8px)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.95)',
        }}
      >
        <span className="block break-words">{content}</span>

        {/* Tutor action buttons */}
        {canTakeActions && !hasWarning && onAction && (
          <div className="flex gap-1 mt-1.5 pt-1.5 border-t border-white/10">
            <button
              onClick={() => onAction(messageId, 'DELETE_MESSAGE')}
              className="flex-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors"
              style={{ backgroundColor: 'rgba(220,38,38,0.2)', color: '#fca5a5' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.4)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.2)')}
            >
              Excluir
            </button>
            <button
              onClick={() => onAction(messageId, 'WARN_MESSAGE')}
              className="flex-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors"
              style={{ backgroundColor: 'rgba(217,119,6,0.2)', color: '#fcd34d' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(217,119,6,0.4)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(217,119,6,0.2)')}
            >
              Avisar
            </button>
          </div>
        )}

        {hasWarning && (
          <div className="mt-1 text-[10px] text-amber-400/70">⚠ mensagem avisada</div>
        )}

        {/* Arrow */}
        <div
          className="absolute top-full left-1/2 -translate-x-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: hasWarning ? '7px solid rgba(217,119,6,0.5)' : '7px solid rgba(139,92,246,0.3)',
          }}
        />
      </div>
    </div>
  );
}
