'use client';

import { CheckIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

type Status = 'sending' | 'sent' | 'delivered' | 'read';

interface MessageStatusProps {
  status: Status;
  className?: string;
}

export function MessageStatus({ status, className }: MessageStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return (
          <svg
            className="h-3 w-3 animate-spin text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );
      case 'sent':
        return <CheckIcon className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return (
          <div className="flex -space-x-1">
            <CheckIcon className="h-3 w-3 text-gray-400" />
            <CheckIcon className="h-3 w-3 text-gray-400" />
          </div>
        );
      case 'read':
        return (
          <div className="flex -space-x-1">
            <CheckIcon className="h-3 w-3 text-blue-500" />
            <CheckIcon className="h-3 w-3 text-blue-500" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <span className={cn('inline-flex items-center', className)}>
      {getStatusIcon()}
    </span>
  );
}
