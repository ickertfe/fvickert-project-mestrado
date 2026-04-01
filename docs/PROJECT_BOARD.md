# Project Board - BCRT System

## Sprint Overview

Last Updated: 2024

---

## TO DO

### Documentation
- [ ] API documentation (OpenAPI/Swagger)
- [ ] User manual for admins
- [ ] Deployment guide

### Features
- [ ] PDF export for reports
- [ ] Batch session creation
- [ ] Real-time admin notifications
- [ ] Audio message player
- [ ] Dark mode support

### Testing
- [ ] Increase unit test coverage to 80%
- [ ] Add performance benchmarks
- [ ] Cross-browser testing (Safari, Firefox)

### DevOps
- [ ] CI/CD pipeline setup
- [ ] Staging environment
- [ ] Monitoring and alerting

---

## DOING

### Phase 1: Core Infrastructure
- [x] Project setup (Next.js, TypeScript, Tailwind)
- [x] Database schema (Prisma)
- [x] Documentation files
- [ ] Authentication system (in progress)

---

## DONE

### Initial Setup
- [x] Project structure created
- [x] Technical Design Document
- [x] AI Context documentation
- [x] LGPD Disclaimer template
- [x] Scenario JSON schemas

### Database
- [x] Prisma schema defined
- [x] Core models (Scenario, Session, Message, Action)
- [x] Metrics model

### Data
- [x] Flaming scenario JSON
- [x] Social Exclusion scenario JSON
- [x] Denigration scenario JSON

### Types
- [x] TypeScript type definitions
- [x] API response types

---

## Backlog

### Nice to Have
- [ ] Scenario preview mode
- [ ] Multi-language scenarios (not just UI)
- [ ] Participant demographics collection
- [ ] Heat map of action timing
- [ ] Comparative analytics dashboard
- [ ] Mobile app version
- [ ] Offline mode support
- [ ] Custom avatar upload
- [ ] Scenario templates
- [ ] Bulk data import/export

### Technical Debt
- [ ] Refactor chat components for better composition
- [ ] Optimize database queries
- [ ] Add request caching
- [ ] Improve error handling
- [ ] Add logging system

---

## Milestones

### MVP (Minimum Viable Product)
- [x] Documentation complete
- [ ] Admin can create/manage scenarios
- [ ] Tutor can participate in simulation
- [ ] Bystander can observe and answer questions
- [ ] Basic metrics collection
- [ ] CSV export

### v1.0 Release
- [ ] All MVP features
- [ ] Magic link authentication
- [ ] Full metrics dashboard
- [ ] PDF reports
- [ ] E2E test coverage
- [ ] Production deployment

### v1.1 Enhancement
- [ ] Audio/video message support
- [ ] Real-time collaboration features
- [ ] Advanced analytics
- [ ] API documentation
- [ ] Multi-tenant support

---

## Notes

### Known Issues
- None currently tracked

### Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2024 | Use SQLite | Simplicity for MVP, easy migration to PostgreSQL |
| 2024 | Magic Links | Better UX, no password management |
| 2024 | next-intl | Best Next.js 14 App Router support |

### Blockers
- None currently

---

## Team

### Roles
- **Researcher**: Defines scenarios and metrics requirements
- **Developer**: Implements features and fixes bugs
- **Designer**: UI/UX improvements (as needed)

### Contacts
- Project Lead: [TBD]
- Technical Lead: [TBD]
