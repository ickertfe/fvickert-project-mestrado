'use client';

import { useState, useTransition } from 'react';
import { closeAllOpenSessions } from '../actions';
import { Button } from '@/components/ui/Button';

export function CloseAllSessionsButton({ openCount }: { openCount: number }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [closedCount, setClosedCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  if (openCount === 0) return null;

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await closeAllOpenSessions();
      setClosedCount(result.count);
      setDone(true);
      setTimeout(() => setOpen(false), 1500);
    });
  };

  return (
    <>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => { setDone(false); setOpen(true); }}
      >
        Encerrar Todas ({openCount})
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">Encerrar todas as sessões abertas</h2>
            <p className="mt-2 text-sm text-gray-500">
              Isso encerrará <strong>{openCount} sessão{openCount > 1 ? 's' : ''}</strong> em andamento. Essa ação não pode ser desfeita.
            </p>

            {done ? (
              <p className="mt-4 text-center text-sm font-medium text-green-600">
                {closedCount} sessão{closedCount > 1 ? 's encerradas' : ' encerrada'} com sucesso.
              </p>
            ) : (
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={isPending}>
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleConfirm}
                  isLoading={isPending}
                  disabled={isPending}
                >
                  Confirmar
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
