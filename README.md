# BCRT - Behavioral Cyberbullying Response Task

A web-based research platform for studying behavioral responses to cyberbullying situations.

## Overview

BCRT (Behavioral Cyberbullying Response Task) is designed to measure real decisions, reaction times, action sequences, and decision changes in a controlled environment simulating cyberbullying scenarios.

## Features

- **Chat Simulation**: WhatsApp-like interface for realistic scenario presentation
- **Multiple Roles**: Tutor (active participant) and Bystander (observer) modes
- **Metrics Collection**: Comprehensive behavioral data capture
- **Admin Dashboard**: Scenario management and reporting
- **Internationalization**: Support for Portuguese (BR) and English

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth with Magic Links
- **Styling**: Tailwind CSS
- **Testing**: Vitest + Playwright

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bcrt-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Initialize the database:
```bash
npm run db:push
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
bcrt-system/
├── docs/               # Documentation
├── messages/           # i18n translations
├── prisma/             # Database schema and migrations
├── src/
│   ├── app/           # Next.js pages and API
│   ├── components/    # React components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility libraries
│   ├── types/         # TypeScript types
│   └── i18n/          # Internationalization config
├── data/              # Scenario JSON files
└── __tests__/         # Test files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks
- `npm test` - Run unit tests
- `npm run test:e2e` - Run E2E tests
- `npm run db:studio` - Open Prisma Studio

## User Roles

### Admin
- Manage scenarios (CRUD)
- View session reports
- Export data (CSV/PDF)

### Tutor
- Observe chat simulation
- Execute moderation actions
- Add notes and observations

### Bystander
- Observe chat simulation (no actions)
- Complete post-scenario questionnaire

## Documentation

- [Technical Design Document](./docs/TDD.md)
- [AI Context](./docs/AI_CONTEXT.md)
- [Project Board](./docs/PROJECT_BOARD.md)
- [LGPD Disclaimer](./docs/DISCLAIMER_LGPD.md)

## License

This project is for academic research purposes.

## Contact

For questions about this research project, contact the principal investigator.
