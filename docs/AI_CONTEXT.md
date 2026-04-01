# AI Context - BCRT System

## Project Overview

This document provides context for AI assistants working on the BCRT (Behavioral Cyberbullying Response Task) system.

---

## What is BCRT?

BCRT is a web-based research platform designed to study behavioral responses to cyberbullying situations. It simulates a WhatsApp-like chat environment where:

1. **Tutors** observe cyberbullying scenarios and can take moderation actions
2. **Bystanders** observe the same scenarios without action capabilities
3. **Admins** manage scenarios and analyze collected data

---

## Key Technical Concepts

### Timeline Engine
The chat simulation uses a timeline engine that controls when messages appear:
- Each message has an `appearDelay` (ms after previous message)
- Optional `typingDuration` shows "typing..." indicator before message
- Messages appear in sequential order based on `order` field

### Metrics Collection
The system captures behavioral metrics in real-time:
- Timestamps for all user actions
- Hesitation detection (cursor hover without click)
- Action sequences and undo operations
- Session duration and completion status

### Session Types
- **TUTOR**: Can execute actions (delete, warn, kick, mark, note)
- **BYSTANDER**: Observation only, answers questionnaire at end

---

## File Structure Quick Reference

```
src/
├── app/           # Next.js pages and API routes
├── components/    # React components
│   ├── ui/        # Base components (Button, Input, Modal)
│   ├── chat/      # Chat simulation components
│   ├── admin/     # Admin panel components
│   ├── tutor/     # Tutor-specific components
│   └── bystander/ # Bystander-specific components
├── hooks/         # Custom React hooks
├── lib/           # Core utilities (db, auth, metrics)
├── types/         # TypeScript type definitions
└── i18n/          # Internationalization config
```

---

## Common Tasks

### Adding a New Scenario Type
1. Add enum value to `ScenarioType` in `prisma/schema.prisma`
2. Create JSON file in `data/scenarios/`
3. Add translations in `messages/pt-BR.json` and `messages/en.json`

### Adding a New Action Type
1. Add enum value to `ActionType` in `prisma/schema.prisma`
2. Update `ActionPanel.tsx` to include new action button
3. Update `useActions.ts` hook to handle new action
4. Add translations for action labels

### Adding a New Metric
1. Add field to `SessionMetrics` model in schema
2. Update `metrics.ts` utility functions
3. Update `useMetrics.ts` hook to capture metric
4. Update report views in admin panel

---

## Code Conventions

### TypeScript
- Strict mode enabled
- Explicit return types on functions
- Interface over type when possible
- Use `as const` for literal types

### React
- Functional components with hooks
- Server Components by default (Next.js 14+)
- "use client" directive only when necessary
- Composition over inheritance

### Styling
- Tailwind CSS utility classes
- Component variants via `clsx` or `cva`
- No inline styles
- Responsive-first design

### Testing
- Unit tests for utilities and hooks
- Integration tests for API routes
- E2E tests for critical user flows
- Test files co-located or in `__tests__/`

---

## Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"

# Authentication
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Email (Resend)
RESEND_API_KEY="re_xxx"
EMAIL_FROM="noreply@yourdomain.com"

# Admin emails (comma-separated)
ADMIN_EMAILS="admin@example.com"
```

---

## API Endpoints

### Scenarios
- `GET /api/scenarios` - List all scenarios
- `POST /api/scenarios` - Create scenario
- `GET /api/scenarios/:id` - Get scenario details
- `PUT /api/scenarios/:id` - Update scenario
- `DELETE /api/scenarios/:id` - Delete scenario

### Sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Get session details
- `PATCH /api/sessions/:id` - Update session status

### Actions
- `POST /api/actions` - Record new action
- `DELETE /api/actions/:id` - Undo action

### Metrics
- `GET /api/metrics/:sessionId` - Get session metrics
- `POST /api/metrics/hesitation` - Record hesitation event

---

## Troubleshooting

### Database Issues
```bash
npx prisma migrate reset  # Reset database
npx prisma db push        # Push schema changes
npx prisma studio         # Open database GUI
```

### Build Issues
```bash
npm run lint              # Check for lint errors
npm run type-check        # Check TypeScript
npm run build             # Full production build
```

### Testing Issues
```bash
npm test                  # Run unit tests
npm run test:e2e          # Run E2E tests
npm run test:coverage     # Generate coverage report
```
