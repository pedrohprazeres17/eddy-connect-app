import { Link } from 'react-router-dom';
import { Calendar, MapPin, Star } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Mentor } from '@/types/mentor';

interface MentorCardProps {
  mentor: Mentor;
  onAgendar: (mentorId: string) => void;
}

export function MentorCard({ mentor, onAgendar }: MentorCardProps) {
  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatPrice = (price: number | undefined) => {
    if (!price) return 'A combinar';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const truncateBio = (bio: string | undefined, maxLength: number = 120) => {
    if (!bio) return '';
    if (bio.length <= maxLength) return bio;
    return bio.slice(0, maxLength) + '...';
  };

  return (
    <Card className="gradient-surface shadow-card hover:shadow-glow transition-all duration-300 h-full flex flex-col">
      <CardHeader className="text-center pb-3">
        <div className="flex justify-center mb-3">
          <Avatar className="w-16 h-16">
            <AvatarImage 
              src={mentor.foto_url} 
              alt={`Foto de ${mentor.nome}`}
            />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {getInitials(mentor.nome)}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <h3 className="font-semibold text-lg leading-tight mb-2">
          {mentor.nome}
        </h3>
        
        <div className="flex items-center justify-center gap-1 text-sm text-accent">
          <MapPin className="w-4 h-4" />
          <span className="font-medium">
            {formatPrice(mentor.preco_hora)}/hora
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Áreas de conhecimento */}
        {mentor.areas.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center">
            {mentor.areas.slice(0, 3).map((area) => (
              <Badge 
                key={area} 
                variant="secondary" 
                className="text-xs"
              >
                {area}
              </Badge>
            ))}
            {mentor.areas.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{mentor.areas.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Bio truncada */}
        {mentor.bio && (
          <p className="text-sm text-muted-foreground text-center line-clamp-3 flex-1">
            {truncateBio(mentor.bio)}
          </p>
        )}

        {/* Botões de ação */}
        <div className="flex flex-col gap-2 pt-2">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to={`/mentor/${mentor.id}`}>
              Ver Perfil
            </Link>
          </Button>
          
          <Button 
            size="sm" 
            className="w-full" 
            variant="hero"
            onClick={() => onAgendar(mentor.id)}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Agendar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}