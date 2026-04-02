'use client';

import {
  TrashIcon,
  ExclamationTriangleIcon,
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

export function MessageActions({
  messageId,
  onAction,
  onHoverStart,
  onHoverEnd,
  appliedActions = [],
  className,
}: MessageActionsProps) {
  const isApplied = (type: ActionType) => appliedActions.includes(type);
  const isDeleted = isApplied('DELETE_MESSAGE');

  return (
    <div
      className={cn(
        'absolute -top-10 right-0 flex items-center gap-1 rounded-lg bg-white p-1 shadow-lg border border-gray-100',
        'animate-fade-in',
        className
      )}
    >
      {/* DELETE_MESSAGE — irreversível (use undo) */}
      <ActionBtn
        icon={TrashIcon}
        label="Excluir"
        color="text-action-danger"
        hoverColor="hover:bg-red-50"
        disabled={isDeleted}
        onClick={() => onAction?.(messageId, 'DELETE_MESSAGE')}
        onMouseEnter={() => onHoverStart?.(messageId, 'DELETE_MESSAGE')}
        onMouseLeave={onHoverEnd}
      />

      {/* WARN_MESSAGE */}
      <ActionBtn
        icon={ExclamationTriangleIcon}
        label="Aviso"
        color="text-action-warning"
        hoverColor="hover:bg-amber-50"
        disabled={isApplied('WARN_MESSAGE') || isDeleted}
        onClick={() => onAction?.(messageId, 'WARN_MESSAGE')}
        onMouseEnter={() => onHoverStart?.(messageId, 'WARN_MESSAGE')}
        onMouseLeave={onHoverEnd}
      />
    </div>
  );
}

interface ActionBtnProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  hoverColor: string;
  disabled?: boolean;
  active?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

function ActionBtn({ icon: Icon, label, color, hoverColor, disabled, active, onClick, onMouseEnter, onMouseLeave }: ActionBtnProps) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={disabled}
      className={cn(
        'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
        hoverColor,
        color,
        active && 'bg-gray-100 ring-1 ring-inset ring-gray-200',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
      title={label}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
