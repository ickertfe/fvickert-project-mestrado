import { z } from 'zod';

// Email validation
export const emailSchema = z.string().email('Invalid email address');

// Name validation
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters');

// Session creation validation
export const createSessionSchema = z.object({
  participantName: nameSchema,
  participantEmail: emailSchema,
  role: z.enum(['TUTOR', 'BYSTANDER']),
  scenarioId: z.string().min(1, 'Scenario is required'),
});

// Scenario creation validation
export const createScenarioSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(200, 'Name must be less than 200 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  type: z.enum(['FLAMING', 'SOCIAL_EXCLUSION', 'DENIGRATION']),
  isActive: z.boolean().optional().default(true),
});

// Message creation validation
export const createMessageSchema = z.object({
  scenarioId: z.string().min(1),
  participantId: z.string().min(1),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['TEXT', 'AUDIO', 'EMOJI', 'IMAGE']),
  appearDelay: z.number().min(0, 'Delay must be positive'),
  typingDuration: z.number().min(0).nullable().optional(),
  order: z.number().min(1),
  metadata: z
    .object({
      imageUrl: z.string().url().optional(),
      caption: z.string().optional(),
      audioUrl: z.string().url().optional(),
      audioDuration: z.number().optional(),
    })
    .optional(),
});

// Action creation validation
export const createActionSchema = z.object({
  sessionId: z.string().min(1),
  messageId: z.string().min(1).optional(),
  type: z.enum([
    'DELETE_MESSAGE',
    'WARN_MESSAGE',
    'KICK_PARTICIPANT',
    'MARK_DANGER',
    'MARK_ATTENTION',
    'ADD_NOTE',
    'UNDO',
    'RESTART_SIMULATION',
  ]),
  metadata: z
    .object({
      noteContent: z.string().optional(),
      previousAction: z.string().optional(),
      participantId: z.string().optional(),
      participantName: z.string().optional(),
    })
    .optional(),
});

// Note creation validation
export const createNoteSchema = z.object({
  sessionId: z.string().min(1),
  content: z.string().min(1, 'Note content is required').max(500, 'Note is too long'),
});

// Bystander answer validation
export const createBystanderAnswerSchema = z.object({
  sessionId: z.string().min(1),
  questionId: z.string().min(1),
  answer: z.string().min(1, 'Answer is required'),
});

// Participant creation validation
export const createParticipantSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  avatar: z.string().url().optional().nullable(),
  role: z.enum(['AGGRESSOR', 'VICTIM', 'NEUTRAL']),
  scenarioId: z.string().min(1),
});

// Utility function to validate and return typed result
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: result.error };
}

// Format Zod errors for API response
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  }

  return errors;
}

// Type exports
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type CreateScenarioInput = z.infer<typeof createScenarioSchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type CreateActionInput = z.infer<typeof createActionSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type CreateBystanderAnswerInput = z.infer<typeof createBystanderAnswerSchema>;
export type CreateParticipantInput = z.infer<typeof createParticipantSchema>;
