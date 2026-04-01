'use client';

import {
  TrashIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  FlagIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import type { ActionType } from '@/types/action';
import { cn } from '@/lib/utils';

interface MessageActionsProps {
  messageId: string;
  onAction?: (messageId: string, action: ActionType) => void;
  onHoverStart?: (messageId: string, actionType: ActionType) => void;
  onHoverEnd?: () => void;
  appliedActions?: ActionType[];
  className?: string;
}

interface ActionButton {
  type: ActionType;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  hoverColor: string;
}

const actionButtons: ActionButton[] = [
  {
    type: 'MARK_DANGER',
    icon: ShieldExclamationIcon,
    label: 'Perigo',
    color: 'text-action-danger',
    hoverColor: 'hover:bg-red-50',
  },
  {
    type: 'MARK_ATTENTION',
    icon: FlagIcon,
    label: 'Atenção',
    color: 'text-action-warning',
    hoverColor: 'hover:bg-amber-50',
  },
  {
    type: 'ADD_NOTE',
    icon: PencilIcon,
    label: 'Nota',
    color: 'text-action-info',
    hoverColor: 'hover:bg-blue-50',
  },
  {
    type: 'DELETE_MESSAGE',
    icon: TrashIcon,
    label: 'Excluir',
    color: 'text-action-danger',
    hoverColor: 'hover:bg-red-50',
  },
  {
    type: 'WARN_MESSAGE',
    icon: ExclamationTriangleIcon,
    label: 'Aviso',
    color: 'text-action-warning',
    hoverColor: 'hover:bg-amber-50',
  },
];

export function MessageActions({
  messageId,
  onAction,
  onHoverStart,
  onHoverEnd,
  appliedActions = [],
  className,
}: MessageActionsProps) {
  const isActionApplied = (type: ActionType) => appliedActions.includes(type);

  return (
    <div
      className={cn(
        'absolute -top-10 right-0 flex items-center gap-1 rounded-lg bg-white p-1 shadow-lg border border-gray-100',
        'animate-fade-in',
        className
      )}
    >
      {actionButtons.map((action) => {
        const Icon = action.icon;
        const isApplied = isActionApplied(action.type);

        return (
          <button
            key={action.type}
            onClick={() => onAction?.(messageId, action.type)}
            onMouseEnter={() => onHoverStart?.(messageId, action.type)}
            onMouseLeave={onHoverEnd}
            disabled={isApplied}
            className={cn(
              'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
              action.hoverColor,
              action.color,
              isApplied && 'opacity-50 cursor-not-allowed'
            )}
            title={action.label}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
