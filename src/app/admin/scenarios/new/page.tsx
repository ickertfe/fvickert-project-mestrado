import { ScenarioForm } from '../_components/ScenarioForm';
import { createScenario } from '../actions';

export default function NewScenarioPage() {
  return <ScenarioForm action={createScenario} title="Novo Cenário" />;
}
