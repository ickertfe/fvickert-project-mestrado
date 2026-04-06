'use client';

import { useState, useTransition } from 'react';
import { closeAllOpenGameSessions } from '../actions';

export function CloseAllGameSessionsButton({ openCount }: { openCount: number }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [closedCount, setClosedCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  if (openCount === 0) return null;

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await closeAllOpenGameSessions();
      setClosedCount(result.count);
      setDone(true);
      setTimeout(() => setOpen(false), 1500);
    });
  };

  return (
    <>
      <button
        onClick={() => { setDone(false); setOpen(true); }}
        className="text-xs font-medium px-3 py-1.5 rounded transition-colors"
        style={{ backgroundColor: 'rgba(220,38,38,0.15)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.25)' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.3)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.15)')}
      >
        Encerrar Todas ({openCount})
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-xl p-6 shadow-2xl" style={{ backgroundColor: 'rgba(15,15,25,0.98)', border: '1px solid rgba(220,38,38,0.3)' }}>
            <h2 className="text-base font-bold text-white mb-2">Encerrar todas as sessões abertas</h2>
            <p className="text-sm text-gray-400 mb-4">
              Isso encerrará <span className="text-white font-semibold">{openCount} sessão{openCount > 1 ? 's' : ''}</span> em andamento.
            </p>
            {done ? (
              <p className="text-center text-sm font-medium text-green-400">{closedCount} sessão{closedCount > 1 ? 's encerradas' : ' encerrada'}.</p>
            ) : (
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                  className="text-xs px-3 py-1.5 rounded text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isPending}
                  className="text-xs font-semibold px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                  style={{ backgroundColor: 'rgba(220,38,38,0.3)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.4)' }}
                >
                  {isPending ? 'Encerrando...' : 'Confirmar'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
