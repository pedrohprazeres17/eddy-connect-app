import { Users } from 'lucide-react';
import PlaceholderPage from './PlaceholderPage';

export default function Grupos() {
  return (
    <PlaceholderPage
      title="Grupos de Estudo"
      description="Participe de grupos de estudo colaborativos, crie seus próprios grupos e conecte-se com outros estudantes."
      icon={<Users className="w-12 h-12 text-accent" />}
    />
  );
}