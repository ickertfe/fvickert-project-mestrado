import type { ChatParticipant } from './scenario';
import type { ActionType } from './action';

export type MessageType = 'TEXT' | 'AUDIO' | 'EMOJI' | 'IMAGE';

export interface MessageMetadata {
  imageUrl?: string;
  caption?: string;
  audioUrl?: string;
  audioDuration?: number;
}

export interface Message {
  id: string;
  scenarioId: string;
  participantId: string;
  participant?: ChatParticipant;
  content: string;
  type: MessageType;
  appearDelay: number; // ms after start or previous message
  typingDuration: number | null; // ms of "typing..." indicator
  order: number;
  metadata?: MessageMetadata | null;
  createdAt?: Date;
}

export interface MessageWithActions extends Message {
  actions: MessageActionDisplay[];
}

export interface MessageActionDisplay {
  id: string;
  type: ActionType;
  timestamp: Date;
  undone: boolean;
}

export interface CreateMessageInput {
  scenarioId: string;
  participantId: string;
  content: string;
  type: MessageType;
  appearDelay: number;
  typingDuration?: number | null;
  order: number;
  metadata?: MessageMetadata;
}

export interface UpdateMessageInput {
  content?: string;
  type?: MessageType;
  appearDelay?: number;
  typingDuration?: number | null;
  order?: number;
  metadata?: MessageMetadata;
}

// Display state for chat simulation
export interface DisplayMessage extends Message {
  isVisible: boolean;
  isTyping: boolean;
  appliedActions: ActionType[];
  isDeleted: boolean;
  hasWarning: boolean;
  hasDangerMark: boolean;
  hasAttentionMark: boolean;
}
