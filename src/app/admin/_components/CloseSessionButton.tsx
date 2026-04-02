'use client';

import { useTransition } from 'react';
import { closeSession } from '../actions';
import { Button } from '@/components/ui/Button';

export function CloseSessionButton({ sessionId }: { sessionId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="destructive"
      isLoading={isPending}
      onClick={() => startTransition(() => closeSession(sessionId))}
    >
      Encerrar
    </Button>
  );
}
