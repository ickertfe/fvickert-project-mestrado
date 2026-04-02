'use client';

import { useState, useTransition } from 'react';
import { updateMessage } from '../../actions';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';

interface MessageEditorProps {
  message: {
    id: string;
    content: string;
    type: string;
    order: number;
    metadata: string | null;
    participant: { name: string; role: string };
  };
}

const ROLE_VARIANT: Record<string, 'danger' | 'warning' | 'default'> = {
  AGGRESSOR: 'danger',
  VICTIM: 'warning',
  NEUTRAL: 'default',
};

const ROLE_LABEL: Record<string, string> = {
  AGGRESSOR: 'Agressor',
  VICTIM: 'Vítima',
  NEUTRAL: 'Neutro',
};

export function MessageEditor({ message }: MessageEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState(message.content);
  const [metadata, setMetadata] = useState(message.metadata ?? '');
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    startTransition(async () => {
      await updateMessage(message.id, {
        content,
        metadata: metadata.trim() || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setIsOpen(false);
    });
  };

  const handleCancel = () => {
    setContent(message.content);
    setMetadata(message.metadata ?? '');
    setIsOpen(false);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-xs font-mono text-gray-400 w-6">{message.order}</span>
        <Badge variant={ROLE_VARIANT[message.participant.role] ?? 'default'} className="text-xs shrink-0">
          {message.participant.name}
        </Badge>
        <span className="text-xs text-gray-500 shrink-0 uppercase">[{message.type}]</span>
        <span className="flex-1 truncate text-sm text-gray-700">{content}</span>
        {saved && <span className="text-xs text-green-600 shrink-0">Salvo!</span>}
        <span className="text-gray-400 text-xs shrink-0">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Edit area */}
      {isOpen && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 space-y-3">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Badge variant={ROLE_VARIANT[message.participant.role] ?? 'default'}>
              {ROLE_LABEL[message.participant.role] ?? message.participant.role}
            </Badge>
            <span>·</span>
            <span>{message.participant.name}</span>
            <span>·</span>
            <span>Tipo: {message.type}</span>
          </div>

          <Textarea
            label="Conteúdo da mensagem"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[80px] font-mono text-sm"
          />

          <Textarea
            label="Metadata (JSON)"
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            placeholder='Ex: {"imageUrl": "...", "caption": "..."}'
            className="min-h-[60px] font-mono text-xs"
          />

          <div className="flex justify-end gap-2 pt-1">
            <Button size="sm" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button size="sm" isLoading={isPending} onClick={handleSave}>
              Salvar Mensagem
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
