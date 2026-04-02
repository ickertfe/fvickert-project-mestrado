import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { ScenarioForm } from '../../_components/ScenarioForm';
import { MessageEditor } from '../../_components/MessageEditor';
import { updateScenario } from '../../actions';

interface EditScenarioPageProps {
  params: { id: string };
}

export default async function EditScenarioPage({ params }: EditScenarioPageProps) {
  const scenario = await prisma.scenario.findUnique({
    where: { id: params.id },
    include: {
      messages: {
        include: { participant: true },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!scenario) notFound();

  const boundAction = updateScenario.bind(null, scenario.id);

  return (
    <>
      <ScenarioForm
        action={boundAction}
        title="Editar Cenário"
        initialData={{
          name: scenario.name,
          description: scenario.description,
          softName: scenario.softName,
          softDescription: scenario.softDescription,
          type: scenario.type,
          isActive: scenario.isActive,
        }}
        extraContent={
          scenario.messages.length > 0 ? (
            <Card className="mt-6">
              <CardHeader
                title="Mensagens do Cenário"
                description={`${scenario.messages.length} mensagens — clique em uma para editar`}
              />
              <CardContent>
                <div className="space-y-2">
                  {scenario.messages.map((msg) => (
                    <MessageEditor
                      key={msg.id}
                      message={{
                        id: msg.id,
                        content: msg.content,
                        type: msg.type,
                        order: msg.order,
                        metadata: msg.metadata,
                        participant: {
                          name: msg.participant.name,
                          role: msg.participant.role,
                        },
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null
        }
      />
    </>
  );
}
