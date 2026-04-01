'use client';

import { useState, type ReactNode } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import type { DisplayMessage } from '@/types/message';
import type { ChatParticipant } from '@/types/scenario';
import type { ActionType } from '@/types/action';
import { cn } from '@/lib/utils';
import { formatTimestamp } from '@/utils/time';
import { MessageActions } from './MessageActions';

interface MessageBubbleProps {
  message: DisplayMessage;
  participant: ChatParticipant;
  canTakeActions?: boolean;
  onAction?: (messageId: string, action: ActionType) => void;
  onHoverStart?: (messageId: string, actionType: ActionType) => void;
  onHoverEnd?: () => void;
  className?: string;
}

export function MessageBubble({
  message,
  participant,
  canTakeActions = false,
  onAction,
  onHoverStart,
  onHoverEnd,
  className,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);

  const getRoleBadge = () => {
    switch (participant.role) {
      case 'AGGRESSOR':
        return <Badge variant="aggressor" className="text-[10px]">Agressor</Badge>;
      case 'VICTIM':
        return <Badge variant="victim" className="text-[10px]">Vítima</Badge>;
      default:
        return null;
    }
  };

  const getMessageStatusStyles = () => {
    const styles: string[] = [];

    if (message.isDeleted) {
      styles.push('opacity-50 line-through');
    }
    if (message.hasWarning) {
      styles.push('ring-2 ring-action-warning');
    }
    if (message.hasDangerMark) {
      styles.push('ring-2 ring-action-danger');
    }
    if (message.hasAttentionMark) {
      styles.push('ring-2 ring-action-info');
    }

    return styles.join(' ');
  };

  const renderContent = (): ReactNode => {
    switch (message.type) {
      case 'EMOJI':
        return <span className="text-4xl">{message.content}</span>;
      case 'IMAGE':
        const metadata = message.metadata as { imageUrl?: string; caption?: string } | undefined;
        return (
          <div>
            <div className="mb-1 rounded bg-gray-100 p-2 text-sm text-gray-600 italic">
              {message.content}
            </div>
            {metadata?.caption && (
              <p className="text-sm">{metadata.caption}</p>
            )}
          </div>
        );
      case 'AUDIO':
        return (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-chat-header flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="h-1 bg-gray-300 rounded-full">
                <div className="h-1 w-0 bg-chat-header rounded-full" />
              </div>
            </div>
            <span className="text-xs text-gray-500">0:00</span>
          </div>
        );
      default:
        return <p className="text-sm">{message.content}</p>;
    }
  };

  if (message.isDeleted && !canTakeActions) {
    return null;
  }

  return (
    <div
      className={cn('flex gap-2 animate-slide-up', className)}
      onMouseEnter={() => canTakeActions && setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        onHoverEnd?.();
      }}
    >
      <Avatar
        src={participant.avatar}
        name={participant.name}
        size="sm"
        className="flex-shrink-0 mt-1"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-gray-900">
            {participant.name}
          </span>
          {getRoleBadge()}
        </div>

        <div
          className={cn(
            'relative inline-block max-w-[85%] rounded-lg bg-chat-incoming px-3 py-2 shadow-sm',
            getMessageStatusStyles()
          )}
        >
          {renderContent()}

          <div className="mt-1 flex items-center justify-end gap-1">
            <span className="text-[10px] text-chat-timestamp">
              {formatTimestamp(message.createdAt || new Date())}
            </span>
            {message.hasWarning && (
              <span className="text-[10px] text-action-warning">Aviso enviado</span>
            )}
          </div>

          {canTakeActions && showActions && (
            <MessageActions
              messageId={message.id}
              onAction={onAction}
              onHoverStart={onHoverStart}
              onHoverEnd={onHoverEnd}
              appliedActions={message.appliedActions}
            />
          )}
        </div>
      </div>
    </div>
  );
}
