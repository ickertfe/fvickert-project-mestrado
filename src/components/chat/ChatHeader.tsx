'use client';

import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Avatar, AvatarGroup } from '@/components/ui/Avatar';
import type { ChatParticipant } from '@/types/scenario';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  groupName: string;
  participants: ChatParticipant[];
  typingParticipant?: ChatParticipant | null;
  onBack?: () => void;
  className?: string;
}

export function ChatHeader({
  groupName,
  participants,
  typingParticipant,
  onBack,
  className,
}: ChatHeaderProps) {
  const getStatusText = () => {
    if (typingParticipant) {
      return `${typingParticipant.name} está digitando...`;
    }
    return `${participants.length} participantes`;
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 bg-chat-header px-4 py-3 text-white',
        className
      )}
    >
      {onBack && (
        <button
          onClick={onBack}
          className="rounded-full p-1 hover:bg-white/10"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
      )}

      <AvatarGroup
        avatars={participants.map((p) => ({
          src: p.avatar,
          name: p.name,
        }))}
        max={3}
        size="sm"
      />

      <div className="flex-1 min-w-0">
        <h1 className="truncate text-base font-semibold">{groupName}</h1>
        <p className="truncate text-xs text-white/80">
          {getStatusText()}
        </p>
      </div>
    </div>
  );
}
