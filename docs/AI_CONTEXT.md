# AI Context - BCRT System

## Project Overview

This document provides context for AI assistants working on the BCRT (Behavioral Cyberbullying Response Task) system.

---

## What is BCRT?

BCRT is a web-based research platform designed to study behavioral responses to cyberbullying situations. It simulates a WhatsApp-like chat environment where:

1. **Tutors** observe cyberbullying scenarios and can take moderation actions
2. **Bystanders** observe the same scenarios without action capabilities, then answer a questionnaire
3. **Admins** manage scenarios and analyze collected data

---

## Key Technical Concepts

### Timeline Engine
The chat simulation uses a timeline engine that controls when messages appear:
- Each message has an `appearDelay` (ms after previous message)
- Optional `typingDuration` shows "typing..." indicator before message
- Messages appear in sequential order based on `order` field
- `useTimeline.ts` uses a `useRef` + `useEffect` re-init pattern to handle async data load (messages arrive after mount)

### Metrics Collection
The system captures behavioral metrics in real-time:
- Timestamps for all user actions
- Hesitation detection: cursor hover on a message without clicking
- **Fixation**: hover duration ≥ 1500ms (`FIXATION_THRESHOLD` in `src/lib/metrics.ts`), flagged as `isFixation: true` on `HesitationEvent`
- Action sequences and undo operations
- Session duration and completion status

### Session Types
- **TUTOR**: Can execute 2 actions — `DELETE_MESSAGE` (Excluir) and `WARN_MESSAGE` (Aviso). Can undo last action.
- **BYSTANDER**: Observation only. At the end of the chat, a 4-question questionnaire modal appears. Answers are saved via `POST /api/bystander-answers`.

### Scenario Soft Names
Each scenario has a `softName` and `softDescription` — neutral names shown to participants when the admin config `showScenarioType` is `false`. The selector also applies pastel color accents per scenario type (via inline `style` on the Card, not Tailwind classes, to avoid JIT purging).

### Scenario Data Files
Located in `data/scenarios/`. Each file has participant and message IDs **prefixed with the scenario name** (e.g., `flaming-part-1`, `exclusion-msg-3`) to prevent upsert collisions across scenarios.

- `flaming.json` — 11 messages
- `social-exclusion.json` — 12 messages
- `denigration.json` — 12 messages

---

## File Structure Quick Reference

```
src/
├── app/
│   ├── admin/
│   │   ├── page.tsx                          # Admin dashboard
│   │   ├── actions.ts                        # Server Actions (resetDatabase, closeAllOpenSessions)
│   │   ├── _components/
│   │   │   ├── CloseAllSessionsButton.tsx    # Closes all open sessions with confirmation
│   │   │   ├── CloseSessionButton.tsx        # Closes a single session
│   │   │   ├── ConfigToggle.tsx              # Admin config toggle
│   │   │   └── ResetDatabaseButton.tsx       # Password-protected DB reset (SHA-256)
│   │   ├── scenarios/[id]/
│   │   │   ├── edit/                         # Scenario editor
│   │   │   └── report/
│   │   │       ├── page.tsx                  # Scenario report (metrics + charts)
│   │   │       └── ReportCharts.tsx          # Recharts client components
│   │   └── sessions/[sessionId]/
│   │       ├── page.tsx                      # Session detail (tutor metrics / bystander duration)
│   │       └── SessionTimeline.tsx           # Horizontal timeline with action dots + hesitation markers
│   ├── tutor/[sessionId]/page.tsx            # Tutor simulation page
│   ├── bystander/[sessionId]/page.tsx        # Bystander simulation page + questionnaire
│   └── api/
│       ├── actions/route.ts                  # POST — record action
│       ├── actions/[actionId]/route.ts       # DELETE — undo action (sets undone: true)
│       ├── bystander-answers/route.ts        # POST — save questionnaire answers + mark session complete
│       ├── config/route.ts                   # GET/PATCH admin config
│       ├── metrics/route.ts                  # GET/POST session metrics
│       ├── scenarios/route.ts                # GET/POST scenarios
│       └── sessions/
│           ├── route.ts                      # POST — create session
│           └── [sessionId]/route.ts          # GET — session details; PATCH — mark complete
├── components/
│   ├── ui/                                   # Button, Card, Badge, Modal, Avatar, Textarea…
│   ├── chat/
│   │   ├── ChatHeader.tsx                    # Legend: Excluir, Aviso, Desfazer only
│   │   ├── MessageActions.tsx                # DELETE_MESSAGE + WARN_MESSAGE only
│   │   └── …
│   ├── admin/
│   ├── tutor/                                # ActionPanel, NotesPanel
│   └── bystander/
│       └── QuestionnaireModal.tsx            # 4-question modal (SCALE, MULTIPLE_CHOICE, OPEN_TEXT)
├── hooks/
│   ├── useChat.ts                            # Main chat orchestration
│   ├── useTimeline.ts                        # Message scheduling + re-init on async load
│   └── …
├── lib/
│   ├── db.ts                                 # Prisma client
│   └── metrics.ts                            # FIXATION_THRESHOLD=1500, endHover sets isFixation
├── types/
│   ├── metrics.ts                            # HesitationEvent has isFixation?: boolean
│   └── session.ts                            # Session, BystanderAnswer, BystanderQuestion types
└── utils/
    └── time.ts                               # All date fns accept Date | string (JSON-safe)
```

---

## Admin Features

### Config Toggles (`AdminConfig` table, id = `'default'`)
| Field | Description |
|---|---|
| `requireUserIdentification` | Ask name/email before session; if false, generates 8-char anon token |
| `showRoleToParticipants` | Show Agressor/Vítima/Neutro badges on messages |
| `showScenarioType` | Show scenario type (Flaming etc.) in selector; if false, uses softName |

### Reset Database
Button in admin dashboard. Requires SHA-256 password. Deletes: `bystanderAnswer`, `note`, `messageAction`, `sessionMetrics`, `session`.
- Password hash in `src/app/admin/actions.ts`

### Close All Sessions
Runs `prisma.session.updateMany({ where: { completedAt: null } })`. Button only shown when `openSessions > 0`.

---

## Session Detail Page (`/admin/sessions/[sessionId]`)

**Tutor sessions show:**
- 6 metric cards: Duração, Ações, Desfeitas, Hesitações, Fixações, T. médio resp.
- `SessionTimeline`: horizontal bar, action dots (colored by type, outlined if undone), hesitation squares below bar (purple = fixation, gray = hesitation), floating tooltip on hover
- Sequência de Ações table
- Hesitações e Fixações table

**Bystander sessions show:**
- Single card: Tempo em Sessão (duration)

---

## Scenario Report Page (`/admin/scenarios/[id]/report`)

Charts (all Recharts, client components in `ReportCharts.tsx`):

| Chart | Description |
|---|---|
| Tutores — Ações & Hesitações | 5 bars: Excluir (red), Aviso (amber), Desfeitas (gray), Hesitações (dark gray), Fixações (purple) — aggregated across all tutor sessions |
| Tutores — Duração por Sessão | Bar per session (S1, S2…) in green |
| Observadores — Duração por Sessão | Bar per session in amber |
| Observadores — Respostas do Questionário | Horizontal bars per question showing answer distribution; shown only when answers exist |

Sessions table also has "Ver Detalhes" link to `/admin/sessions/[id]`.

---

## Questionnaire (Bystander)

Defined in `QuestionnaireModal.tsx` as `defaultQuestions` (used when no `questions` prop passed):
1. **q1** — Scale 1–5: intensidade do cyberbullying
2. **q2** — Multiple choice: como se sentiu
3. **q3** — Multiple choice: o que faria na vida real
4. **q4** — Open text: consequência sugerida

Flow: chat ends → `onComplete` fires → modal opens automatically; footer also shows "Responder Questionário" button → user submits → `POST /api/bystander-answers` saves answers + marks session complete → thank-you screen.

---

## API Endpoints

### Scenarios
- `GET /api/scenarios` — List all scenarios
- `POST /api/scenarios` — Create scenario
- `GET /api/scenarios/:id` — Get scenario details
- `PUT /api/scenarios/:id` — Update scenario
- `DELETE /api/scenarios/:id` — Delete scenario

### Sessions
- `POST /api/sessions` — Create new session
- `GET /api/sessions/:id` — Get session with scenario messages + participants
- `PATCH /api/sessions/:id` — Mark session complete (`completedAt: now()`)

### Actions
- `POST /api/actions` — Record new action
- `DELETE /api/actions/:id` — Undo action (`undone: true, undoneAt: now()`)

### Metrics
- `GET /api/metrics?sessionId=` — Get session metrics
- `POST /api/metrics` — Save metrics + mark session complete (tutor flow)

### Bystander
- `POST /api/bystander-answers` — Save questionnaire answers + mark session complete (bystander flow)

### Config
- `GET /api/config` — Get admin config
- `PATCH /api/config` — Update config field

---

## Common Gotchas

- **Tailwind JIT + dynamic colors**: use inline `style` prop, not string-interpolated class names
- **JSON date serialization**: API returns date strings, not `Date` objects — `src/utils/time.ts` wraps all inputs with `new Date(date)` 
- **Scenario IDs must be prefixed**: e.g. `flaming-part-1`, not `part-1` — otherwise upsert overwrites data across scenarios
- **useTimeline async init**: messages may be empty at mount (async fetch); hook re-initializes via `useRef` + `useEffect` when messages arrive
- **Recharts Tooltip formatter**: type is `(value: unknown) => [...]` — cast with `as number` inside

---

## Troubleshooting

### Database Issues
```bash
npx prisma migrate reset  # Reset database
npx prisma db push        # Push schema changes
npx prisma db seed        # Re-seed scenarios
npx prisma studio         # Open database GUI
```

### Build Issues
```bash
npm run lint              # Check for lint errors
npx tsc --noEmit          # Check TypeScript
npm run build             # Full production build
rm -rf .next && npm run dev  # Clear cache and restart dev server
```
