'use client';

import { Avatar } from '@/components/ui/Avatar';
import type { ChatParticipant } from '@/types/scenario';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  participant: ChatParticipant;
  className?: string;
}

export function TypingIndicator({ participant, className }: TypingIndicatorProps) {
  return (
    <div className={cn('flex gap-2 animate-fade-in', className)}>
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
        </div>

        <div className="inline-block rounded-lg bg-chat-typing px-4 py-3 shadow-sm">
          <div className="flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-full bg-gray-400 animate-typing-dot"
              style={{ animationDelay: '0ms' }}
            />
            <span
              className="h-2 w-2 rounded-full bg-gray-400 animate-typing-dot"
              style={{ animationDelay: '200ms' }}
            />
            <span
              className="h-2 w-2 rounded-full bg-gray-400 animate-typing-dot"
              style={{ animationDelay: '400ms' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
