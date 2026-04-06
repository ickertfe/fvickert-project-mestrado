'use client';

import { useTransition } from 'react';
import { closeGameSession } from '../actions';

export function CloseGameSessionButton({ sessionId }: { sessionId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => closeGameSession(sessionId))}
      className="text-xs font-medium px-2 py-0.5 rounded transition-colors disabled:opacity-40"
      style={{ backgroundColor: 'rgba(220,38,38,0.15)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.25)' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.3)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.15)')}
    >
      {isPending ? '...' : 'Encerrar'}
    </button>
  );
}
