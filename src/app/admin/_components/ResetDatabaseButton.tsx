'use client';

import { useState, useTransition } from 'react';
import { resetDatabase } from '../actions';
import { Button } from '@/components/ui/Button';

export function ResetDatabaseButton() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleOpen = () => {
    setPassword('');
    setError('');
    setDone(false);
    setOpen(true);
  };

  const handleConfirm = () => {
    setError('');
    startTransition(async () => {
      const result = await resetDatabase(password);
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
      <Button variant="outline" size="sm" onClick={handleOpen} className="border-red-300 text-red-600 hover:bg-red-50">
        Zerar Base
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">Zerar base de dados</h2>
            <p className="mt-1 text-sm text-gray-500">
              Esta ação remove <strong>todas as sessões e ações</strong> registradas. Os cenários são preservados.
            </p>

            {done ? (
              <p className="mt-4 text-center text-sm font-medium text-green-600">Base zerada com sucesso.</p>
            ) : (
              <>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Senha de confirmação</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
                    placeholder="Digite a senha..."
                    autoFocus
                  />
                  {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={isPending}>
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleConfirm}
                    disabled={!password || isPending}
                    isLoading={isPending}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Confirmar
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
