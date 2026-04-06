'use client';

import { useState, useTransition } from 'react';
import { resetGameDatabase } from '../actions';

export function ResetGameDatabaseButton() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleOpen = () => { setPassword(''); setError(''); setDone(false); setOpen(true); };

  const handleConfirm = () => {
    setError('');
    startTransition(async () => {
      const result = await resetGameDatabase(password);
      if (result.success) {
        setDone(true);
        setPassword('');
        setTimeout(() => setOpen(false), 1500);
      } else {
        setError(result.error ?? 'Erro desconhecido.');
      }
    });
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="text-xs font-medium px-3 py-1.5 rounded transition-colors"
        style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.2)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)')}
      >
        Zerar Base
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-xl p-6 shadow-2xl" style={{ backgroundColor: 'rgba(15,15,25,0.98)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <h2 className="text-base font-bold text-white mb-1">Zerar dados do Game Lobby</h2>
            <p className="text-sm text-gray-400 mb-4">
              Remove todas as sessões, ações e respostas do game lobby. Cenários são preservados.
            </p>
            {done ? (
              <p className="text-center text-sm font-medium text-green-400">Base zerada com sucesso.</p>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-400 mb-1">Senha de confirmação</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                    className="w-full rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(239,68,68,0.3)' }}
                    placeholder="Digite a senha..."
                    autoFocus
                  />
                  {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
                </div>
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
                    disabled={!password || isPending}
                    className="text-xs font-semibold px-3 py-1.5 rounded transition-colors disabled:opacity-40"
                    style={{ backgroundColor: 'rgba(239,68,68,0.3)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.4)' }}
                  >
                    {isPending ? 'Zerando...' : 'Confirmar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
