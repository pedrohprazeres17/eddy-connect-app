import { Calendar } from 'lucide-react';
import PlaceholderPage from './PlaceholderPage';

export default function Sessoes() {
  return (
    <PlaceholderPage
      title="Sessões de Mentoria"
      description="Gerencie suas sessões de mentoria, visualize seu calendário e acompanhe o histórico de aprendizado."
      icon={<Calendar className="w-12 h-12 text-secondary-foreground" />}
    />
  );
}