# BCRT — Behavioral Cyberbullying Response Task
## Documento de Contexto do Sistema para Pesquisa de Mestrado

---

## 1. O que é o sistema

Plataforma web desenvolvida para pesquisa acadêmica de mestrado, cujo objetivo é medir e registrar respostas comportamentais de participantes adultos (18+) diante de situações simuladas de cyberbullying.

O sistema apresenta uma simulação de conversa em grupo (chat) com personagens fictícios, onde uma situação de cyberbullying se desenrola em tempo real — mensagens aparecem sequencialmente com intervalos e indicadores de digitação, simulando uma conversa autêntica.

---

## 2. Papéis experimentais

### Tutor (moderador)
- Observa a conversa e pode executar **ações de moderação** nas mensagens
- Ações disponíveis: **Excluir mensagem** ou **Emitir aviso**
- O sistema registra cada ação com timestamp preciso
- Métricas coletadas: tempo de reação, sequência de decisões, eventos de hesitação, tempo entre ações

### Observador (bystander)
- Assiste à conversa sem poder intervir
- Ao final responde um **questionário** sobre o que observou

---

## 3. Categorias de cyberbullying simuladas

Baseadas na tipologia de Willard (2007) e literatura subsequente sobre cyberbullying.

### 3.1 Flaming
Troca hostil e bilateral com escalada de agressividade. O agressor ataca a vítima pessoalmente, rejeita mediação do bystander e encerra com racionalização clássica de moral disengagement ("só estou dizendo o que todo mundo pensa").

**Mecanismos psicológicos representados:**
- Desinibição online
- Moral disengagement por justificação moral
- Ataque ao bystander quando ele tenta intervir

### 3.2 Exclusão Social (Social Exclusion)
Ostracismo ativo e intencional. Dois agressores planejam um evento na frente da vítima, rejeitam sua tentativa de participar com minimização ("não precisa fazer drama") e a ignoram completamente ao retomar o planejamento — enquanto a vítima permanece no chat sem resposta.

**Mecanismos psicológicos representados:**
- Ostracismo ativo (Cyberball/Ostracism Online paradigm)
- Ameaça ao senso de pertencimento
- Minimização/trivialização da exclusão

### 3.3 Difamação (Denigration)
Espalhamento de boato falso sobre o comportamento da vítima, com fabricação de prova social ("mais de uma pessoa falou", "o pessoal todo tá comentando"). O participante neutro vai cedendo à pressão social ao longo da conversa, terminando em dúvida sobre a vítima.

**Mecanismos psicológicos representados:**
- Fabricação de prova social e testemunhos implícitos
- Displacement of responsibility ("só estou repassando o que ouvi")
- Conformismo social do neutro (bystander effect)
- Racionalização via heurística ("onde tem fumaça tem fogo")

---

## 4. Estrutura de dados (banco de dados)

```
Scenario
├── id, name, description
├── softName, softDescription   ← versão "neutra" do nome (sem revelar categoria)
├── type: FLAMING | SOCIAL_EXCLUSION | DENIGRATION
├── isActive: boolean
├── ChatParticipant[]
│   ├── id, name, avatar
│   └── role: AGGRESSOR | VICTIM | NEUTRAL
└── Message[]
    ├── id, content, type: TEXT | EMOJI | IMAGE
    ├── appearDelay (ms)        ← atraso após mensagem anterior
    ├── typingDuration (ms)     ← duração do indicador "digitando..."
    └── order

Session
├── id
├── participantName, participantEmail
├── role: TUTOR | BYSTANDER
├── scenarioId
├── disclaimerAccepted, disclaimerAcceptedAt
├── startedAt, completedAt
├── MessageAction[]
│   ├── type: DELETE_MESSAGE | WARN_MESSAGE | UNDO | RESTART_SIMULATION
│   ├── messageId (opcional — null para ações de sessão)
│   ├── timestamp
│   ├── undone, undoneAt
│   └── metadata (JSON)
├── SessionMetrics
│   ├── totalDuration (ms)
│   ├── firstActionTime (ms até primeira ação)
│   ├── totalActions, totalUndos
│   ├── hesitationEvents: [{messageId, duration}]
│   ├── decisionSequence: [{action, timestamp, messageId}]
│   └── actionTimings: [ms entre ações]
├── Note[]                      ← anotações livres do tutor durante sessão
└── BystanderAnswer[]
    ├── questionId
    └── answer

BystanderQuestion
├── question, type: MULTIPLE_CHOICE | SCALE | OPEN_TEXT
├── options (JSON para múltipla escolha)
└── order, isActive

AdminConfig (singleton)
├── requireUserIdentification   ← se false, participante é anonimizado
├── showRoleToParticipants      ← se exibe o papel (tutor/observador) ao participante
└── showScenarioType            ← se exibe a categoria do cenário (flaming, etc.)
```

---

## 5. Cenários — conteúdo completo

### Cenário 1 — Flaming: "Confronto no Grupo de Trabalho"
**Contexto:** grupo de projeto universitário  
**Participantes:** Rafael (AGRESSOR), Camila (VÍTIMA), Diego (NEUTRO)  
**Total:** 11 mensagens

| # | Participante | Mensagem |
|---|-------------|----------|
| 1 | Camila | Reorganizei a estrutura dos slides. Acho que ficou mais claro. Podem dar uma olhada? |
| 2 | Rafael | Mudou tudo sem avisar ninguém? Que falta de consideração. |
| 3 | Camila | Avisei na reunião de quinta que ia fazer isso, Rafael. |
| 4 | Rafael | Não lembro disso. E olhando o resultado, preferia que não tivesse mexido. |
| 5 | Rafael | O problema é você sempre querendo aparecer e no final atrapalhando mais do que ajuda. |
| 6 | Camila | O que isso significa? Você tem algum problema específico com o meu trabalho? |
| 7 | Rafael | Tenho sim: você é difícil de trabalhar. Todo mundo aqui já sabe disso. |
| 8 | Diego | Calma, dá pra resolver isso sem atacar ninguém— |
| 9 | Rafael | Diego, não me interrompe. Camila, se não aguenta feedback, não manda trabalho. |
| 10 | Camila | Isso não é feedback, é ataque pessoal. Não vou aceitar. |
| 11 | Rafael | Só estou dizendo o que todo mundo pensa mas não tem coragem de falar. |

---

### Cenário 2 — Exclusão Social: "Fora do Grupo"
**Contexto:** grupo de amigos adultos  
**Participantes:** Ana (AGRESSORA), Bianca (AGRESSORA), Renata (VÍTIMA)  
**Total:** 11 mensagens

| # | Participante | Mensagem |
|---|-------------|----------|
| 1 | Ana | Bia, confirmei o jantar pra sexta! Luísa e Carol já tão dentro 🎉 |
| 2 | Bianca | Perfeito! Mal posso esperar |
| 3 | Renata | Que jantar? Posso ir também? |
| 4 | Ana | Ah... é uma coisa mais fechada, Renata. |
| 5 | Renata | Fechada como? A gente sempre sai junto... |
| 6 | Bianca | Esse é um grupo diferente. Não é nada contra você. |
| 7 | Renata | Aconteceu alguma coisa? Me fala se eu fiz algo errado. |
| 8 | Ana | Não aconteceu nada. Às vezes as pessoas querem sair em grupos menores. Não precisa fazer drama. |
| 9 | Bianca | Ana, o restaurante italiano de março tá confirmado? *(ignora Renata)* |
| 10 | Ana | Confirmado! Vai ser ótimo 😊 |
| 11 | Renata | Ok. Boa festa pra vocês. |

---

### Cenário 3 — Difamação: "O Boato"
**Contexto:** grupo de colegas de trabalho/faculdade  
**Participantes:** Bruno (AGRESSOR), Thiago (NEUTRO), Isabela (VÍTIMA)  
**Total:** 12 mensagens  
**Nota:** Thiago forma opinião negativa (msg 4) *antes* de Isabela poder se defender — captura o viés de confirmação por prova social. Sua posição deteriora progressivamente nas msgs 9 e 12.

| # | Participante | Mensagem |
|---|-------------|----------|
| 1 | Bruno | Vocês souberam o que tão falando da Isabela? |
| 2 | Thiago | Não. O que foi? |
| 3 | Bruno | Que foi ela quem ficou espalhando fofoca sobre a vida pessoal do Marcus. Tava indo de mesa em mesa. |
| 4 | Thiago | Nossa... ela sempre pareceu tão reservada. |
| 5 | Isabela | Que absurdo. Eu nunca fiz isso. |
| 6 | Bruno | Não fui eu que inventei. Ouvi de mais de uma pessoa. |
| 7 | Isabela | Quem disse isso? Me aponta uma pessoa. |
| 8 | Bruno | Não vou citar nomes. O pessoal todo tá comentando. Você sabe como é. |
| 9 | Thiago | Isabela, sendo honesto... quando fica esse volume de comentário assim... |
| 10 | Isabela | Thiago, você me conhece há anos. Não pode acreditar nisso sem nenhuma prova. |
| 11 | Bruno | Onde tem fumaça tem fogo. Eu só tô repassando o que ouvi. |
| 12 | Thiago | Eu honestamente não sei o que pensar. |

---

## 6. Fluxo do participante

```
Tela inicial
└── Seleciona papel (Tutor ou Observador)
    └── [se config ativa] Identifica-se (nome + email)
        └── Seleciona cenário
            └── Aceita TCLE (Termo de Consentimento Livre e Esclarecido)
                └── Tela de pré-início
                    ├── Tutor: vê ações disponíveis (Excluir / Avisar / Nota)
                    └── Observador: vê que vai observar + responder questionário
                        └── Simulação em tempo real
                            ├── Tutor: pode agir nas mensagens
                            └── Observador: só assiste
                                └── Fim da simulação
                                    ├── Tutor: finaliza → métricas salvas
                                    └── Observador: responde questionário → salvo
```

---

## 7. Aspectos éticos

- Todas as mensagens são explicitamente fictícias (declarado no TCLE)
- TCLE digital com conformidade LGPD (Lei 13.709/2018)
- Identificação do participante configurável — pode ser completamente anonimizada
- Participação voluntária com direito de desistência a qualquer momento
- Dados armazenados por 5 anos após conclusão da pesquisa
- Nenhum dado pessoal identificável é divulgado nos resultados

---

## 8. Variáveis mensuradas (para análise)

**Variáveis comportamentais do Tutor:**
- `firstActionTime` — latência até a primeira intervenção (ms)
- `totalActions` — número total de ações realizadas
- `totalUndos` — número de ações desfeitas (indicador de hesitação/arrependimento)
- `decisionSequence` — sequência de tipos de ação com timestamps
- `hesitationEvents` — eventos onde o cursor passou sobre uma mensagem sem ação
- `actionTimings` — intervalos entre ações consecutivas

**Variáveis do Observador:**
- Respostas ao questionário pós-simulação (escala / múltipla escolha / texto livre)

**Variável independente:**
- Tipo de cyberbullying: FLAMING | SOCIAL_EXCLUSION | DENIGRATION
