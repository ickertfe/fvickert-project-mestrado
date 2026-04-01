import { PrismaClient } from '@prisma/client';
import flamingScenario from '../data/scenarios/flaming.json';
import socialExclusionScenario from '../data/scenarios/social-exclusion.json';
import denigrationScenario from '../data/scenarios/denigration.json';

const prisma = new PrismaClient();

interface ScenarioData {
  id: string;
  name: string;
  description: string;
  type: 'FLAMING' | 'SOCIAL_EXCLUSION' | 'DENIGRATION';
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
    role: 'AGGRESSOR' | 'VICTIM' | 'NEUTRAL';
  }>;
  messages: Array<{
    id: string;
    participantId: string;
    content: string;
    type: 'TEXT' | 'AUDIO' | 'EMOJI' | 'IMAGE';
    appearDelay: number;
    typingDuration: number | null;
    order: number;
    metadata?: Record<string, unknown>;
  }>;
}

async function seedScenario(scenarioData: ScenarioData) {
  console.log(`Seeding scenario: ${scenarioData.name}`);

  // Create scenario
  const scenario = await prisma.scenario.upsert({
    where: { id: scenarioData.id },
    update: {
      name: scenarioData.name,
      description: scenarioData.description,
      type: scenarioData.type,
    },
    create: {
      id: scenarioData.id,
      name: scenarioData.name,
      description: scenarioData.description,
      type: scenarioData.type,
      isActive: true,
    },
  });

  // Create participants
  for (const participant of scenarioData.participants) {
    await prisma.chatParticipant.upsert({
      where: { id: participant.id },
      update: {
        name: participant.name,
        avatar: participant.avatar || null,
        role: participant.role,
        scenarioId: scenario.id,
      },
      create: {
        id: participant.id,
        name: participant.name,
        avatar: participant.avatar || null,
        role: participant.role,
        scenarioId: scenario.id,
      },
    });
  }

  // Create messages
  for (const message of scenarioData.messages) {
    await prisma.message.upsert({
      where: { id: message.id },
      update: {
        content: message.content,
        type: message.type,
        appearDelay: message.appearDelay,
        typingDuration: message.typingDuration,
        order: message.order,
        metadata: message.metadata ? JSON.stringify(message.metadata) : null,
      },
      create: {
        id: message.id,
        scenarioId: scenario.id,
        participantId: message.participantId,
        content: message.content,
        type: message.type,
        appearDelay: message.appearDelay,
        typingDuration: message.typingDuration,
        order: message.order,
        metadata: message.metadata ? JSON.stringify(message.metadata) : null,
      },
    });
  }

  console.log(`  - Created ${scenarioData.participants.length} participants`);
  console.log(`  - Created ${scenarioData.messages.length} messages`);
}

async function seedBystanderQuestions() {
  console.log('Seeding bystander questions...');

  const questions = [
    {
      id: 'q1',
      question:
        'Em uma escala de 1 a 5, o quanto você considera que as mensagens observadas representam uma situação de cyberbullying?',
      type: 'SCALE' as const,
      options: JSON.stringify(['1', '2', '3', '4', '5']),
      order: 1,
    },
    {
      id: 'q2',
      question: 'Como você se sentiu ao observar esta conversa?',
      type: 'MULTIPLE_CHOICE' as const,
      options: JSON.stringify([
        'Desconfortável',
        'Com raiva',
        'Triste',
        'Indiferente',
        'Ansioso',
        'Outro',
      ]),
      order: 2,
    },
    {
      id: 'q3',
      question:
        'Se você estivesse participando desta conversa na vida real, o que você faria?',
      type: 'MULTIPLE_CHOICE' as const,
      options: JSON.stringify([
        'Defenderia a vítima',
        'Denunciaria ao administrador',
        'Sairia do grupo',
        'Ignoraria',
        'Confrontaria o agressor',
        'Outro',
      ]),
      order: 3,
    },
    {
      id: 'q4',
      question:
        'Na sua opinião, qual deveria ser a consequência para o comportamento observado?',
      type: 'OPEN_TEXT' as const,
      options: null,
      order: 4,
    },
  ];

  for (const question of questions) {
    await prisma.bystanderQuestion.upsert({
      where: { id: question.id },
      update: question,
      create: {
        ...question,
        isActive: true,
      },
    });
  }

  console.log(`  - Created ${questions.length} questions`);
}

async function main() {
  console.log('Starting database seed...\n');

  // Seed scenarios
  await seedScenario(flamingScenario as ScenarioData);
  await seedScenario(socialExclusionScenario as ScenarioData);
  await seedScenario(denigrationScenario as ScenarioData);

  // Seed bystander questions
  await seedBystanderQuestions();

  console.log('\nDatabase seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
