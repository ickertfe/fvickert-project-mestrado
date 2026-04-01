'use client';

import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import type { Note } from '@/types/session';
import { cn } from '@/lib/utils';
import { formatTimestamp } from '@/utils/time';

interface NotesPanelProps {
  notes: Note[];
  onAddNote: (content: string) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export function NotesPanel({
  notes,
  onAddNote,
  isLoading = false,
  className,
}: NotesPanelProps) {
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setIsAdding(true);
    try {
      await onAddNote(newNote.trim());
      setNewNote('');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className={cn('p-4', className)} padding="none">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Suas Notas</h3>

        <div className="space-y-2">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Digite sua observação..."
            className="min-h-[80px] resize-none text-sm"
            disabled={isLoading || isAdding}
          />
          <Button
            size="sm"
            onClick={handleAddNote}
            disabled={!newNote.trim() || isLoading || isAdding}
            isLoading={isAdding}
            className="w-full gap-1"
          >
            <PlusIcon className="h-4 w-4" />
            Adicionar Nota
          </Button>
        </div>

        {notes.length > 0 ? (
          <div className="max-h-60 space-y-2 overflow-y-auto">
            {notes.map((note) => (
              <div
                key={note.id}
                className="rounded-lg bg-gray-50 p-3 text-sm"
              >
                <p className="text-gray-700">{note.content}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {formatTimestamp(note.timestamp)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-500">
            Nenhuma nota adicionada
          </p>
        )}
      </div>
    </Card>
  );
}
