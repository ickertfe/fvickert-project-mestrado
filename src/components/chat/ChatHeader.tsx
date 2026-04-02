'use client';

import { ArrowLeftIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { AvatarGroup } from '@/components/ui/Avatar';
import type { ChatParticipant } from '@/types/scenario';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  groupName: string;
  participants: ChatParticipant[];
  typingParticipant?: ChatParticipant | null;
  showLegend?: boolean;
  onBack?: () => void;
  className?: string;
}

const ACTION_LEGEND = [
  { color: 'bg-red-500', label: 'Perigo', desc: 'Marca a mensagem como conteúdo de alto risco de bullying' },
  { color: 'bg-amber-500', label: 'Atenção', desc: 'Sinaliza a mensagem para revisão posterior' },
  { color: 'bg-blue-500', label: 'Nota', desc: 'Adiciona uma anotação pessoal à mensagem' },
  { color: 'bg-red-700', label: 'Excluir', desc: 'Remove a mensagem do chat por conter bullying' },
  { color: 'bg-amber-600', label: 'Aviso', desc: 'Envia um aviso público ao remetente da mensagem' },
  { color: 'bg-gray-500', label: 'Desfazer', desc: 'Reverte a última ação realizada' },
];

export function ChatHeader({
  groupName,
  participants,
  typingParticipant,
  showLegend = false,
  onBack,
  className,
}: ChatHeaderProps) {
  const getStatusText = () => {
    if (typingParticipant) return `${typingParticipant.name} está digitando...`;
    return `${participants.length} participantes`;
  };

  return (
    <div className={cn('flex items-center gap-3 bg-chat-header px-4 py-3 text-white', className)}>
      {onBack && (
        <button onClick={onBack} className="rounded-full p-1 hover:bg-white/10">
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
      )}

      <AvatarGroup
        avatars={participants.map((p) => ({ src: p.avatar, name: p.name }))}
        max={3}
        size="sm"
      />

      <div className="flex-1 min-w-0">
        <h1 className="truncate text-base font-semibold">{groupName}</h1>
        <p className="truncate text-xs text-white/80">{getStatusText()}</p>
      </div>

      {/* Info icon with legend tooltip — only for tutors */}
      {showLegend && <div className="relative group">
        <button className="rounded-full p-1 hover:bg-white/10">
          <InformationCircleIcon className="h-5 w-5 text-white/80" />
        </button>

        {/* Tooltip */}
        <div className="absolute right-0 top-full mt-2 z-50 hidden group-hover:block w-72 rounded-lg bg-white shadow-xl border border-gray-100 p-3">
          <p className="text-xs font-semibold text-gray-700 mb-2">Legenda das Ações</p>
          <div className="space-y-2">
            {ACTION_LEGEND.map((item) => (
              <div key={item.label} className="flex items-start gap-2">
                <span className={cn('mt-0.5 h-3 w-3 rounded-full flex-shrink-0', item.color)} />
                <div>
                  <span className="text-xs font-medium text-gray-800">{item.label}: </span>
                  <span className="text-xs text-gray-500">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>}
    </div>
  );
}
