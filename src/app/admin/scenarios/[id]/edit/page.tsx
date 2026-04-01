import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ScenarioForm } from '../../_components/ScenarioForm';
import { updateScenario } from '../../actions';

interface EditScenarioPageProps {
  params: { id: string };
}

export default async function EditScenarioPage({ params }: EditScenarioPageProps) {
  const scenario = await prisma.scenario.findUnique({
    where: { id: params.id },
  });

  if (!scenario) notFound();

  const boundAction = updateScenario.bind(null, scenario.id);

  return (
    <ScenarioForm
      action={boundAction}
      title="Editar Cenário"
      initialData={{
        name: scenario.name,
        description: scenario.description,
        type: scenario.type,
        isActive: scenario.isActive,
      }}
    />
  );
}
