# Plano: Behavioral Cyberbullying Response Task (BCRT)

## Visão Geral do Projeto

Sistema web para pesquisa comportamental sobre respostas a situações de cyberbullying, permitindo medir decisões reais, tempo de reação, sequência de ações e mudanças de decisão em ambiente controlado.

---

## 1. Arquitetura do Sistema

### 1.1 Stack Tecnológica
- **Frontend**: Next.js 14+ (App Router) com TypeScript
- **Backend**: Next.js API Routes + Server Actions
- **Banco de Dados**: SQLite com Prisma ORM (Turso para produção)
- **Autenticação**: Passwordless via Magic Links (Resend + NextAuth)
- **Estilização**: Tailwind CSS + Headless UI
- **Internacionalização**: next-intl (PT-BR + EN)
- **Deploy**: Vercel
- **Testes**: Vitest + React Testing Library + Playwright (E2E)

### 1.2 Estrutura de URLs
```
/admin              - Painel administrativo (requer autenticação)
/tutor/:sessionId   - Interface do tutor (participante com ações)
/bystander/:sessionId - Interface do bystander (observador)
```

### 1.3 Diagrama de Arquitetura
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

## 2. Estrutura de Arquivos

```
bcrt-system/
├── docs/
│   ├── TDD.md                      # Technical Design Document
│   ├── AI_CONTEXT.md               # Contexto para sessões de IA
│   ├── PROJECT_BOARD.md            # Controle de evolução (TO DO|DOING|DONE)
│   └── DISCLAIMER_LGPD.md          # Termo de aceite
│
├── messages/                       # Internacionalização (i18n)
│   ├── pt-BR.json                  # Traduções português
│   └── en.json                     # Traduções inglês
│
├── prisma/
│   ├── schema.prisma               # Schema do banco de dados
│   ├── seed.ts                     # Seed com cenários iniciais
│   └── migrations/                 # Migrações do banco
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Landing page
│   │   ├── admin/
│   │   │   ├── layout.tsx          # Admin layout com auth
│   │   │   ├── page.tsx            # Dashboard admin
│   │   │   ├── scenarios/
│   │   │   │   ├── page.tsx        # Lista de cenários
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx    # Editar cenário
│   │   │   │   │   └── messages/
│   │   │   │   │       └── page.tsx # Editar mensagens
│   │   │   │   └── new/
│   │   │   │       └── page.tsx    # Novo cenário
│   │   │   └── reports/
│   │   │       ├── page.tsx        # Lista de relatórios
│   │   │       └── [sessionId]/
│   │   │           └── page.tsx    # Relatório detalhado
│   │   ├── tutor/
│   │   │   └── [sessionId]/
│   │   │       └── page.tsx        # Interface do tutor
│   │   ├── bystander/
│   │   │   └── [sessionId]/
│   │   │       └── page.tsx        # Interface do bystander
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts    # Auth endpoints
│   │       ├── scenarios/
│   │       │   └── route.ts        # CRUD cenários
│   │       ├── sessions/
│   │       │   └── route.ts        # Gestão de sessões
│   │       ├── actions/
│   │       │   └── route.ts        # Registro de ações
│   │       └── metrics/
│   │           └── route.ts        # Coleta de métricas
│   │
│   ├── components/
│   │   ├── ui/                     # Componentes base
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ...
│   │   ├── chat/
│   │   │   ├── ChatContainer.tsx   # Container principal do chat
│   │   │   ├── MessageBubble.tsx   # Bolha de mensagem
│   │   │   ├── TypingIndicator.tsx # Indicador "digitando..."
│   │   │   ├── ChatHeader.tsx      # Header do chat
│   │   │   ├── MessageStatus.tsx   # Status (enviado, lido, etc)
│   │   │   ├── AudioMessage.tsx    # Mensagem de áudio
│   │   │   ├── EmojiMessage.tsx    # Mensagem de emoji
│   │   │   └── ImageMessage.tsx    # Mensagem de imagem
│   │   ├── admin/
│   │   │   ├── ScenarioEditor.tsx
│   │   │   ├── MessageTimeline.tsx
│   │   │   └── ReportViewer.tsx
│   │   ├── tutor/
│   │   │   ├── ActionPanel.tsx     # Painel de ações do tutor
│   │   │   ├── MessageActions.tsx  # Ações em mensagens
│   │   │   └── NotesPanel.tsx      # Painel de notas
│   │   ├── bystander/
│   │   │   └── QuestionnaireModal.tsx
│   │   └── shared/
│   │       ├── DisclaimerModal.tsx # Modal de aceite LGPD
│   │       └── ScenarioSelector.tsx
│   │
│   ├── lib/
│   │   ├── db.ts                   # Cliente Prisma
│   │   ├── auth.ts                 # Configuração auth
│   │   ├── metrics.ts              # Funções de métricas
│   │   └── timeline.ts             # Engine de timeline
│   │
│   ├── hooks/
│   │   ├── useChat.ts              # Hook do chat
│   │   ├── useTimeline.ts          # Hook da timeline
│   │   ├── useMetrics.ts           # Hook de métricas
│   │   └── useActions.ts           # Hook de ações
│   │
│   ├── types/
│   │   ├── scenario.ts             # Tipos de cenário
│   │   ├── message.ts              # Tipos de mensagem
│   │   ├── action.ts               # Tipos de ação
│   │   ├── metrics.ts              # Tipos de métricas
│   │   └── session.ts              # Tipos de sessão
│   │
│   ├── utils/
│   │   ├── time.ts                 # Utilitários de tempo
│   │   └── validation.ts           # Validações
│   │
│   └── i18n/
│       ├── config.ts               # Configuração next-intl
│       ├── request.ts              # getRequestConfig
│       └── navigation.ts           # Links e redirect localizados
│
├── data/
│   └── scenarios/
│       ├── flaming.json            # Cenário de Flaming
│       ├── social-exclusion.json   # Cenário de Exclusão Social
│       └── denigration.json        # Cenário de Difamação
│
├── __tests__/
│   ├── unit/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── lib/
│   ├── integration/
│   │   └── api/
│   └── e2e/
│       ├── admin.spec.ts
│       ├── tutor.spec.ts
│       └── bystander.spec.ts
│
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vitest.config.ts
├── playwright.config.ts
└── README.md
```

---

## 3. Modelo de Dados (Prisma Schema)

```prisma
// Cenário de cyberbullying
model Scenario {
  id          String    @id @default(cuid())
  name        String
  description String
  type        ScenarioType
  isActive    Boolean   @default(true)
  messages    Message[]
  sessions    Session[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum ScenarioType {
  FLAMING
  SOCIAL_EXCLUSION
  DENIGRATION
}

// Participante do chat (personagem fictício)
model ChatParticipant {
  id        String    @id @default(cuid())
  name      String
  avatar    String?
  role      ParticipantRole
  messages  Message[]
}

enum ParticipantRole {
  AGGRESSOR
  VICTIM
  NEUTRAL
}

// Mensagem do cenário
model Message {
  id              String          @id @default(cuid())
  scenarioId      String
  scenario        Scenario        @relation(fields: [scenarioId], references: [id])
  participantId   String
  participant     ChatParticipant @relation(fields: [participantId], references: [id])
  content         String
  type            MessageType
  appearDelay     Int             // ms após início ou msg anterior
  typingDuration  Int?            // ms de "digitando..."
  order           Int
  metadata        Json?           // dados extras (url audio, emoji, etc)
  actions         MessageAction[]
  createdAt       DateTime        @default(now())
}

enum MessageType {
  TEXT
  AUDIO
  EMOJI
  IMAGE
}

// Sessão de participante
model Session {
  id              String          @id @default(cuid())
  participantName String
  participantEmail String
  role            SessionRole
  scenarioId      String
  scenario        Scenario        @relation(fields: [scenarioId], references: [id])
  disclaimerAccepted Boolean      @default(false)
  disclaimerAcceptedAt DateTime?
  startedAt       DateTime?
  completedAt     DateTime?
  actions         MessageAction[]
  metrics         SessionMetrics?
  notes           Note[]
  bystanderAnswers BystanderAnswer[]
  createdAt       DateTime        @default(now())
}

enum SessionRole {
  TUTOR
  BYSTANDER
}

// Ação do tutor em uma mensagem
model MessageAction {
  id          String      @id @default(cuid())
  sessionId   String
  session     Session     @relation(fields: [sessionId], references: [id])
  messageId   String
  message     Message     @relation(fields: [messageId], references: [id])
  type        ActionType
  timestamp   DateTime    @default(now())
  undone      Boolean     @default(false)
  undoneAt    DateTime?
  metadata    Json?
}

enum ActionType {
  DELETE_MESSAGE
  WARN_MESSAGE
  KICK_PARTICIPANT
  MARK_DANGER
  MARK_ATTENTION
  ADD_NOTE
  UNDO
}

// Métricas da sessão
model SessionMetrics {
  id                    String   @id @default(cuid())
  sessionId             String   @unique
  session               Session  @relation(fields: [sessionId], references: [id])
  totalDuration         Int      // ms
  firstActionTime       Int?     // ms até primeira ação
  totalActions          Int
  totalUndos            Int
  hesitationEvents      Json     // [{messageId, duration}]
  decisionSequence      Json     // [{action, timestamp, messageId}]
  actionTimings         Json     // tempo entre ações
  createdAt             DateTime @default(now())
}

// Nota do tutor
model Note {
  id        String   @id @default(cuid())
  sessionId String
  session   Session  @relation(fields: [sessionId], references: [id])
  content   String
  timestamp DateTime @default(now())
}

// Respostas do bystander
model BystanderAnswer {
  id         String   @id @default(cuid())
  sessionId  String
  session    Session  @relation(fields: [sessionId], references: [id])
  questionId String
  answer     String
  timestamp  DateTime @default(now())
}

// Perguntas para bystander
model BystanderQuestion {
  id       String @id @default(cuid())
  question String
  type     QuestionType
  options  Json?  // para múltipla escolha
  order    Int
  isActive Boolean @default(true)
}

enum QuestionType {
  MULTIPLE_CHOICE
  SCALE
  OPEN_TEXT
}

// Admin do sistema
model Admin {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
}
```

---

## 4. Estrutura dos JSONs de Cenários

### 4.1 Cenário Flaming (flaming.json)
```json
{
  "id": "scenario-flaming-001",
  "name": "Discussão Acalorada no Grupo de Trabalho",
  "description": "Simulação de conflito onde um participante se torna hostil após discordância sobre um projeto",
  "type": "FLAMING",
  "participants": [
    {
      "id": "part-1",
      "name": "Carlos",
      "avatar": "/avatars/carlos.png",
      "role": "AGGRESSOR"
    },
    {
      "id": "part-2",
      "name": "Marina",
      "avatar": "/avatars/marina.png",
      "role": "VICTIM"
    },
    {
      "id": "part-3",
      "name": "Pedro",
      "avatar": "/avatars/pedro.png",
      "role": "NEUTRAL"
    }
  ],
  "messages": [
    {
      "id": "msg-1",
      "participantId": "part-2",
      "content": "Pessoal, terminei a minha parte do relatório. Podem revisar?",
      "type": "TEXT",
      "appearDelay": 0,
      "typingDuration": 2000,
      "order": 1
    },
    {
      "id": "msg-2",
      "participantId": "part-1",
      "content": "Já vi. Tá bem fraco, sinceramente.",
      "type": "TEXT",
      "appearDelay": 3000,
      "typingDuration": 1500,
      "order": 2
    },
    {
      "id": "msg-3",
      "participantId": "part-2",
      "content": "Pode me dizer o que posso melhorar?",
      "type": "TEXT",
      "appearDelay": 2000,
      "typingDuration": 1800,
      "order": 3
    },
    {
      "id": "msg-4",
      "participantId": "part-1",
      "content": "Olha, não sei nem por onde começar. Você deveria ter vergonha de entregar isso.",
      "type": "TEXT",
      "appearDelay": 1000,
      "typingDuration": 2500,
      "order": 4
    },
    {
      "id": "msg-5",
      "participantId": "part-3",
      "content": "Calma, Carlos...",
      "type": "TEXT",
      "appearDelay": 1500,
      "typingDuration": 1000,
      "order": 5
    },
    {
      "id": "msg-6",
      "participantId": "part-1",
      "content": "Cala a boca, Pedro. Ninguém pediu sua opinião.",
      "type": "TEXT",
      "appearDelay": 500,
      "typingDuration": 1200,
      "order": 6
    },
    {
      "id": "msg-7",
      "participantId": "part-1",
      "content": "Marina, você é uma INCOMPETENTE! Todo mundo sabe disso.",
      "type": "TEXT",
      "appearDelay": 800,
      "typingDuration": 2000,
      "order": 7
    },
    {
      "id": "msg-8",
      "participantId": "part-2",
      "content": "😢",
      "type": "EMOJI",
      "appearDelay": 2000,
      "typingDuration": null,
      "order": 8
    },
    {
      "id": "msg-9",
      "participantId": "part-1",
      "content": "Vai chorar agora? Que patético!",
      "type": "TEXT",
      "appearDelay": 1000,
      "typingDuration": 1500,
      "order": 9
    }
  ]
}
```

### 4.2 Cenário Social Exclusion (social-exclusion.json)
```json
{
  "id": "scenario-exclusion-001",
  "name": "Exclusão do Grupo de Amigos",
  "description": "Simulação onde participantes deliberadamente excluem uma pessoa das conversas e planejamentos",
  "type": "SOCIAL_EXCLUSION",
  "participants": [
    {
      "id": "part-1",
      "name": "Julia",
      "avatar": "/avatars/julia.png",
      "role": "AGGRESSOR"
    },
    {
      "id": "part-2",
      "name": "Fernanda",
      "avatar": "/avatars/fernanda.png",
      "role": "VICTIM"
    },
    {
      "id": "part-3",
      "name": "Beatriz",
      "avatar": "/avatars/beatriz.png",
      "role": "AGGRESSOR"
    }
  ],
  "messages": [
    {
      "id": "msg-1",
      "participantId": "part-1",
      "content": "Gente, vamos combinar a festa de aniversário da Bia?",
      "type": "TEXT",
      "appearDelay": 0,
      "typingDuration": 2000,
      "order": 1
    },
    {
      "id": "msg-2",
      "participantId": "part-2",
      "content": "Oba! Posso ajudar a organizar!",
      "type": "TEXT",
      "appearDelay": 2000,
      "typingDuration": 1500,
      "order": 2
    },
    {
      "id": "msg-3",
      "participantId": "part-3",
      "content": "Julia, vamos conversar no outro grupo",
      "type": "TEXT",
      "appearDelay": 1500,
      "typingDuration": 1800,
      "order": 3
    },
    {
      "id": "msg-4",
      "participantId": "part-1",
      "content": "Boa ideia 👍",
      "type": "TEXT",
      "appearDelay": 1000,
      "typingDuration": 800,
      "order": 4
    },
    {
      "id": "msg-5",
      "participantId": "part-2",
      "content": "Que outro grupo? Posso entrar?",
      "type": "TEXT",
      "appearDelay": 2500,
      "typingDuration": 1500,
      "order": 5
    },
    {
      "id": "msg-6",
      "participantId": "part-1",
      "content": "É um grupo só nosso, Fernanda",
      "type": "TEXT",
      "appearDelay": 3000,
      "typingDuration": 1200,
      "order": 6
    },
    {
      "id": "msg-7",
      "participantId": "part-3",
      "content": "É, não é pra todo mundo não",
      "type": "TEXT",
      "appearDelay": 1000,
      "typingDuration": 1500,
      "order": 7
    },
    {
      "id": "msg-8",
      "participantId": "part-2",
      "content": "Mas eu pensei que éramos amigas...",
      "type": "TEXT",
      "appearDelay": 4000,
      "typingDuration": 2000,
      "order": 8
    },
    {
      "id": "msg-9",
      "participantId": "part-1",
      "content": "🙄",
      "type": "EMOJI",
      "appearDelay": 1500,
      "typingDuration": null,
      "order": 9
    }
  ]
}
```

### 4.3 Cenário Denigration (denigration.json)
```json
{
  "id": "scenario-denigration-001",
  "name": "Rumores Falsos no Grupo",
  "description": "Simulação onde participantes espalham informações falsas sobre uma pessoa",
  "type": "DENIGRATION",
  "participants": [
    {
      "id": "part-1",
      "name": "Lucas",
      "avatar": "/avatars/lucas.png",
      "role": "AGGRESSOR"
    },
    {
      "id": "part-2",
      "name": "Amanda",
      "avatar": "/avatars/amanda.png",
      "role": "VICTIM"
    },
    {
      "id": "part-3",
      "name": "Rafael",
      "avatar": "/avatars/rafael.png",
      "role": "NEUTRAL"
    }
  ],
  "messages": [
    {
      "id": "msg-1",
      "participantId": "part-1",
      "content": "Vocês ficaram sabendo da Amanda?",
      "type": "TEXT",
      "appearDelay": 0,
      "typingDuration": 1500,
      "order": 1
    },
    {
      "id": "msg-2",
      "participantId": "part-3",
      "content": "O que tem ela?",
      "type": "TEXT",
      "appearDelay": 2000,
      "typingDuration": 1000,
      "order": 2
    },
    {
      "id": "msg-3",
      "participantId": "part-1",
      "content": "Ouvi dizer que ela foi pega colando na prova",
      "type": "TEXT",
      "appearDelay": 1500,
      "typingDuration": 2000,
      "order": 3
    },
    {
      "id": "msg-4",
      "participantId": "part-2",
      "content": "QUÊ?! Isso é mentira!",
      "type": "TEXT",
      "appearDelay": 1000,
      "typingDuration": 1200,
      "order": 4
    },
    {
      "id": "msg-5",
      "participantId": "part-1",
      "content": "Todo mundo tá comentando. Não adianta negar.",
      "type": "TEXT",
      "appearDelay": 800,
      "typingDuration": 1800,
      "order": 5
    },
    {
      "id": "msg-6",
      "participantId": "part-1",
      "content": "[IMAGEM: Screenshot falso de conversa]",
      "type": "IMAGE",
      "appearDelay": 1500,
      "typingDuration": null,
      "order": 6,
      "metadata": {
        "imageUrl": "/scenarios/fake-screenshot.png",
        "caption": "Olha a prova"
      }
    },
    {
      "id": "msg-7",
      "participantId": "part-2",
      "content": "Isso é editado! Eu nunca disse isso!",
      "type": "TEXT",
      "appearDelay": 2000,
      "typingDuration": 2000,
      "order": 7
    },
    {
      "id": "msg-8",
      "participantId": "part-1",
      "content": "Sei sei... uma vez trapaceira, sempre trapaceira",
      "type": "TEXT",
      "appearDelay": 1000,
      "typingDuration": 2000,
      "order": 8
    },
    {
      "id": "msg-9",
      "participantId": "part-3",
      "content": "Lucas, tem certeza disso? Parece meio estranho...",
      "type": "TEXT",
      "appearDelay": 3000,
      "typingDuration": 2500,
      "order": 9
    }
  ]
}
```

---

## 5. Métricas a Serem Coletadas

### 5.1 Métricas Temporais
- **Tempo até primeira ação**: ms desde início da sessão até primeira intervenção
- **Tempo de reação por mensagem**: ms entre aparecimento da mensagem e ação
- **Tempo total da sessão**: duração completa da participação
- **Hesitação**: tempo que o cursor ficou sobre uma ação sem clicar

### 5.2 Métricas Comportamentais
- **Sequência de decisões**: ordem cronológica de todas as ações
- **Mudanças de decisão**: quantas vezes usou "desfazer"
- **Tipo de ações preferidas**: distribuição entre tipos de ação
- **Padrão de intervenção**: precoce vs tardio, frequente vs esparso

### 5.3 Métricas de Conteúdo
- **Mensagens marcadas**: quais mensagens foram sinalizadas
- **Notas criadas**: conteúdo e contexto das anotações
- **Severidade das ações**: escala de intervenção (warn < delete < kick)

---

## 6. Fluxos de Usuário

### 6.1 Fluxo Admin
```
1. Acessa /admin
2. Login via magic link (email)
3. Dashboard com:
   - Lista de cenários (criar/editar/ativar/desativar)
   - Lista de sessões (filtrar por data/cenário/role)
   - Relatórios (exportar CSV/PDF)
4. Gerenciar cenário:
   - Editar informações básicas
   - Gerenciar mensagens (timeline visual)
   - Configurar delays e efeitos
```

### 6.2 Fluxo Tutor
```
1. Acessa /tutor (recebe link único)
2. Seleciona cenário disponível
3. Informa nome e email
4. Aceita disclaimer LGPD
5. Inicia simulação:
   - Visualiza chat em tempo real
   - Pode executar ações nas mensagens
   - Pode adicionar notas
   - Pode desfazer última ação
6. Cenário termina automaticamente
7. Visualiza resumo (opcional)
```

### 6.3 Fluxo Bystander
```
1. Acessa /bystander (recebe link único)
2. Seleciona cenário disponível
3. Informa nome e email
4. Aceita disclaimer LGPD
5. Inicia simulação:
   - Apenas observa o chat
   - NÃO pode executar ações
6. Ao final, responde questionário (4 perguntas)
7. Sessão encerrada
```

---

## 7. Interface do Chat (WhatsApp-like)

### 7.1 Elementos Visuais
- Header com nome do grupo e participantes
- Área de mensagens com scroll
- Bolhas de mensagem com:
  - Avatar do remetente
  - Nome do remetente
  - Conteúdo (texto/emoji/imagem/áudio)
  - Horário
  - Status de ações (se houver warning/deleted)
- Indicador "digitando..." com animação
- Status de online/offline dos participantes

### 7.2 Ações do Tutor (hover sobre mensagem)
```
┌─────────────────────────────────────┐
│  [⚠️ Perigo] [⚡ Atenção] [📝 Nota]  │
│  [🗑️ Excluir] [⚠️ Aviso] [🚫 Kick]   │
│  [↩️ Desfazer última]               │
└─────────────────────────────────────┘
```

---

## 8. Termo de Aceite (LGPD + Ética)

O disclaimer incluirá:
- Identificação do pesquisador responsável
- Objetivo da pesquisa
- Procedimentos da participação
- Riscos e benefícios
- Confidencialidade e anonimato
- Direito de desistência
- Armazenamento de dados (LGPD Art. 7º, 11º)
- Contato do Comitê de Ética
- Checkbox de aceite ativo

---

## 9. Arquivos a Serem Criados

### Fase 1: Documentação
1. `docs/TDD.md` - Technical Design Document completo
2. `docs/AI_CONTEXT.md` - Contexto para agentes de IA
3. `docs/PROJECT_BOARD.md` - Kanban do projeto
4. `docs/DISCLAIMER_LGPD.md` - Termo de aceite

### Fase 2: Configuração
5. `package.json` - Dependências do projeto
6. `tsconfig.json` - Configuração TypeScript
7. `tailwind.config.js` - Configuração Tailwind
8. `prisma/schema.prisma` - Schema do banco
9. `.env.example` - Variáveis de ambiente
10. `messages/pt-BR.json` - Traduções português
11. `messages/en.json` - Traduções inglês
12. `src/i18n/config.ts` - Configuração i18n

### Fase 3: Dados
10. `data/scenarios/flaming.json`
11. `data/scenarios/social-exclusion.json`
12. `data/scenarios/denigration.json`

### Fase 4: Tipos e Utilitários
13. `src/types/*.ts` - Definições de tipos
14. `src/lib/*.ts` - Funções utilitárias
15. `src/hooks/*.ts` - React hooks

### Fase 5: Componentes
16. `src/components/ui/*.tsx` - Componentes base
17. `src/components/chat/*.tsx` - Componentes do chat
18. `src/components/admin/*.tsx` - Componentes admin
19. `src/components/tutor/*.tsx` - Componentes tutor
20. `src/components/bystander/*.tsx` - Componentes bystander

### Fase 6: Páginas e API
21. `src/app/**/*.tsx` - Páginas Next.js
22. `src/app/api/**/*.ts` - Rotas da API

### Fase 7: Testes
23. `__tests__/unit/**/*.test.ts`
24. `__tests__/integration/**/*.test.ts`
25. `__tests__/e2e/**/*.spec.ts`

---

## 10. Perguntas para o Bystander

1. **Percepção**: "Em uma escala de 1 a 5, o quanto você considera que as mensagens observadas representam uma situação de cyberbullying?"

2. **Emoção**: "Como você se sentiu ao observar esta conversa?" (múltipla escolha + campo aberto)

3. **Ação hipotética**: "Se você estivesse participando desta conversa na vida real, o que você faria?" (múltipla escolha)

4. **Reflexão**: "Na sua opinião, qual deveria ser a consequência para o comportamento observado?" (campo aberto)

---

## 11. Próximos Passos

1. **Criar documentação completa** (TDD, AI_CONTEXT, PROJECT_BOARD, DISCLAIMER)
2. **Configurar projeto Next.js** com todas as dependências
3. **Implementar schema Prisma** e criar migrations
4. **Criar JSONs de cenários** para carga inicial
5. **Implementar componentes do chat** (UI WhatsApp-like)
6. **Implementar engine de timeline** (controle de timing)
7. **Implementar coleta de métricas** (todos os eventos)
8. **Implementar fluxo admin** (CRUD cenários, relatórios)
9. **Implementar fluxo tutor** (ações, desfazer, notas)
10. **Implementar fluxo bystander** (observação, questionário)
11. **Implementar autenticação** (magic link para admin)
12. **Criar testes** (unit, integration, E2E)
13. **Deploy** (Vercel ou similar)

---

## Verificação

Para testar as mudanças end-to-end:
1. Rodar `npm run dev` e verificar se o sistema inicia
2. Testar fluxo admin: criar/editar cenário
3. Testar fluxo tutor: executar cenário completo com ações
4. Testar fluxo bystander: observar cenário e responder questionário
5. Verificar relatórios: métricas corretas e exportação
6. Rodar `npm test` para testes unitários
7. Rodar `npm run test:e2e` para testes E2E
