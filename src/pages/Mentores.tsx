import { BookOpen } from 'lucide-react';
import PlaceholderPage from './PlaceholderPage';

export default function Mentores() {
  return (
    <PlaceholderPage
      title="Mentores"
      description="Explore mentores especializados, filtre por área de conhecimento e conecte-se com os melhores profissionais."
      icon={<BookOpen className="w-12 h-12 text-primary" />}
    />
  );
}