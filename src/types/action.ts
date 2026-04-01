export type ActionType =
  | 'DELETE_MESSAGE'
  | 'WARN_MESSAGE'
  | 'KICK_PARTICIPANT'
  | 'MARK_DANGER'
  | 'MARK_ATTENTION'
  | 'ADD_NOTE'
  | 'UNDO';

export interface MessageAction {
  id: string;
  sessionId: string;
  messageId: string;
  type: ActionType;
  timestamp: Date;
  undone: boolean;
  undoneAt?: Date | null;
  metadata?: ActionMetadata | null;
}

export interface ActionMetadata {
  noteContent?: string;
  previousAction?: string;
  participantId?: string;
  participantName?: string;
}

export interface CreateActionInput {
  sessionId: string;
  messageId: string;
  type: ActionType;
  metadata?: ActionMetadata;
}

export interface ActionEvent {
  action: ActionType;
  timestamp: number; // Unix timestamp
  messageId: string;
  metadata?: ActionMetadata;
}

// Action display configuration
export interface ActionConfig {
  type: ActionType;
  label: string;
  icon: string;
  color: 'danger' | 'warning' | 'info' | 'success' | 'neutral';
  requiresConfirmation: boolean;
  description?: string;
}

export const ACTION_CONFIGS: Record<ActionType, Omit<ActionConfig, 'type'>> = {
  DELETE_MESSAGE: {
    label: 'deleteMessage',
    icon: 'trash',
    color: 'danger',
    requiresConfirmation: true,
    description: 'Remove this message from the chat',
  },
  WARN_MESSAGE: {
    label: 'warnMessage',
    icon: 'exclamation-triangle',
    color: 'warning',
    requiresConfirmation: true,
    description: 'Send a warning about this message',
  },
  KICK_PARTICIPANT: {
    label: 'kickParticipant',
    icon: 'user-minus',
    color: 'danger',
    requiresConfirmation: true,
    description: 'Remove participant from the group',
  },
  MARK_DANGER: {
    label: 'markDanger',
    icon: 'shield-exclamation',
    color: 'danger',
    requiresConfirmation: false,
    description: 'Mark as dangerous content',
  },
  MARK_ATTENTION: {
    label: 'markAttention',
    icon: 'flag',
    color: 'warning',
    requiresConfirmation: false,
    description: 'Flag for attention',
  },
  ADD_NOTE: {
    label: 'addNote',
    icon: 'pencil',
    color: 'info',
    requiresConfirmation: false,
    description: 'Add a note about this message',
  },
  UNDO: {
    label: 'undo',
    icon: 'arrow-uturn-left',
    color: 'neutral',
    requiresConfirmation: false,
    description: 'Undo last action',
  },
};
