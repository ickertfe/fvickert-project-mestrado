'use client';

import { useTransition } from 'react';
import { updateGameAdminConfig } from '../actions';

interface GameConfigToggleProps {
  field: 'requireUserIdentification' | 'showRoleToParticipants' | 'showScenarioType';
  value: boolean;
  label: string;
  description: string;
}

export function GameConfigToggle({ field, value, label, description }: GameConfigToggleProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-start justify-between gap-6 py-4" style={{ borderBottom: '1px solid rgba(139,92,246,0.08)' }}>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-200">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => startTransition(() => updateGameAdminConfig(field, !value))}
        disabled={isPending}
        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 disabled:opacity-50"
        style={{ backgroundColor: value ? 'rgba(139,92,246,0.8)' : 'rgba(75,85,99,0.5)' }}
      >
        <span
          className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200"
          style={{ transform: value ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
}
