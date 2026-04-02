'use client';

import { useTransition } from 'react';
import { updateAdminConfig } from '../actions';

interface ConfigToggleProps {
  field: 'requireUserIdentification' | 'showRoleToParticipants' | 'showScenarioType';
  value: boolean;
  label: string;
  description: string;
}

export function ConfigToggle({ field, value, label, description }: ConfigToggleProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = () => {
    startTransition(() => {
      updateAdminConfig(field, !value);
    });
  };

  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={handleChange}
        disabled={isPending}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-chat-header focus:ring-offset-2 disabled:opacity-50 ${
          value ? 'bg-chat-header' : 'bg-gray-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            value ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
