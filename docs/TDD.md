# Technical Design Document - BCRT System

## Behavioral Cyberbullying Response Task

### Version: 1.0.0
### Date: 2024

---

## 1. Executive Summary

The BCRT (Behavioral Cyberbullying Response Task) is a web-based research platform designed to measure behavioral responses to cyberbullying situations. The system enables researchers to:

- Present realistic chat scenarios simulating cyberbullying situations
- Measure real decisions, reaction times, action sequences, and decision changes
- Collect metrics in a controlled environment for behavioral analysis

---

## 2. System Architecture

### 2.1 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 14+ (App Router) | Server-side rendering, React components |
| Language | TypeScript | Type safety |
| Database | SQLite + Prisma ORM | Data persistence |
| Auth | NextAuth + Magic Links | Passwordless authentication |
| Styling | Tailwind CSS + Headless UI | UI components |
| i18n | next-intl | Internationalization (PT-BR, EN) |
| Testing | Vitest + RTL + Playwright | Unit, integration, E2E tests |
| Deploy | Vercel | Production hosting |

### 2.2 URL Structure

```
/                   - Landing page
/admin              - Admin dashboard (authenticated)
/tutor/:sessionId   - Tutor interface (participant with actions)
/bystander/:sessionId - Bystander interface (observer only)
```

### 2.3 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌─────────┐  ┌─────────────┐  ┌──────────────┐             │
│  │  Admin  │  │    Tutor    │  │  Bystander   │             │
│  │  Panel  │  │  Interface  │  │  Interface   │             │
│  └────┬────┘  └──────┬──────┘  └──────┬───────┘             │
└───────┼──────────────┼────────────────┼─────────────────────┘
        │              │                │
        ▼              ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (Next.js)                       │
│  ┌──────────────┐  ┌────────────────┐  ┌─────────────────┐  │
│  │  Scenarios   │  │   Sessions     │  │    Metrics      │  │
│  │  Management  │  │   Management   │  │   Collection    │  │
│  └──────┬───────┘  └───────┬────────┘  └────────┬────────┘  │
└─────────┼──────────────────┼───────────────────┬────────────┘
          │                  │                   │
          ▼                  ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (SQLite)                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │Scenarios │ │ Sessions │ │ Actions  │ │    Metrics     │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Data Models

### 3.1 Core Entities

#### Scenario
Represents a cyberbullying scenario with messages and participants.

| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| name | String | Scenario name |
| description | String | Detailed description |
| type | Enum | FLAMING, SOCIAL_EXCLUSION, DENIGRATION |
| isActive | Boolean | Whether scenario is available |
| messages | Message[] | List of messages |

#### Session
Represents a participant's session interacting with a scenario.

| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| participantName | String | Participant's name |
| participantEmail | String | Participant's email |
| role | Enum | TUTOR or BYSTANDER |
| scenarioId | String | Reference to scenario |
| disclaimerAccepted | Boolean | LGPD consent |
| startedAt | DateTime | Session start time |
| completedAt | DateTime | Session end time |

#### Message
Individual message within a scenario.

| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| participantId | String | Who sent the message |
| content | String | Message content |
| type | Enum | TEXT, AUDIO, EMOJI, IMAGE |
| appearDelay | Int | Delay in ms before appearing |
| typingDuration | Int | Duration of "typing" indicator |
| order | Int | Message order in timeline |

#### MessageAction
Action taken by a tutor on a message.

| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| sessionId | String | Reference to session |
| messageId | String | Reference to message |
| type | Enum | DELETE, WARN, KICK, etc. |
| timestamp | DateTime | When action was taken |
| undone | Boolean | Whether action was undone |

---

## 4. Metrics Collection

### 4.1 Temporal Metrics
- **Time to first action**: ms from session start to first intervention
- **Reaction time per message**: ms between message appearance and action
- **Total session duration**: Complete participation time
- **Hesitation time**: Time cursor hovered over action without clicking

### 4.2 Behavioral Metrics
- **Decision sequence**: Chronological order of all actions
- **Decision changes**: Number of "undo" operations
- **Preferred action types**: Distribution across action types
- **Intervention pattern**: Early vs. late, frequent vs. sparse

### 4.3 Content Metrics
- **Flagged messages**: Which messages were marked
- **Notes created**: Content and context of annotations
- **Action severity**: Intervention scale (warn < delete < kick)

---

## 5. User Flows

### 5.1 Admin Flow
1. Access /admin
2. Login via magic link
3. Manage scenarios (CRUD)
4. View session reports
5. Export data (CSV/PDF)

### 5.2 Tutor Flow
1. Receive unique session link
2. Select available scenario
3. Provide name and email
4. Accept LGPD disclaimer
5. Participate in simulation with action capabilities
6. View summary (optional)

### 5.3 Bystander Flow
1. Receive unique session link
2. Select available scenario
3. Provide name and email
4. Accept LGPD disclaimer
5. Observe simulation (no actions)
6. Complete questionnaire (4 questions)
7. Session ends

---

## 6. Security Considerations

### 6.1 Authentication
- Admin access via passwordless magic links
- Session links contain unique, non-guessable IDs
- Session tokens expire after use

### 6.2 Data Protection (LGPD)
- Explicit consent required before participation
- Data anonymization options available
- Right to withdraw at any time
- Secure data storage

### 6.3 Input Validation
- All user inputs sanitized
- Rate limiting on API endpoints
- CSRF protection enabled

---

## 7. Performance Requirements

- Page load time: < 2s
- Message rendering: < 100ms
- Action registration: < 200ms
- Database queries: < 100ms average

---

## 8. Testing Strategy

### 8.1 Unit Tests
- Component rendering
- Hook behavior
- Utility functions

### 8.2 Integration Tests
- API endpoint behavior
- Database operations
- Authentication flow

### 8.3 E2E Tests
- Complete user flows
- Cross-browser compatibility
- Mobile responsiveness
