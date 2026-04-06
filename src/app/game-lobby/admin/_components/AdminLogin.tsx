'use client';

import { useState, useTransition } from 'react';
import { loginGameAdmin } from '../actions';

export function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    setError('');
    startTransition(async () => {
      const result = await loginGameAdmin(password);
      if (result.success) {
        window.location.reload();
      } else {
        setError(result.error ?? 'Erro desconhecido.');
        setPassword('');
      }
    });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #131428 0%, #1d1f40 100%)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ backgroundColor: 'rgba(15,15,28,0.9)', border: '1px solid rgba(139,92,246,0.25)' }}
      >
        <div className="text-center mb-7">
          <div
            className="inline-block mb-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest"
            style={{ backgroundColor: 'rgba(139,92,246,0.15)', color: 'rgba(167,139,250,0.8)', border: '1px solid rgba(139,92,246,0.25)' }}
          >
            Admin
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Game Lobby</h1>
          <p className="text-xs text-gray-500 mt-1">Acesso restrito</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(139,92,246,0.25)'}`,
              }}
              placeholder="Digite a senha..."
              autoFocus
            />
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!password || isPending}
            className="w-full py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-40"
            style={{ backgroundColor: 'rgba(139,92,246,0.3)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.5)' }}
          >
            {isPending ? 'Entrando...' : 'Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
}
