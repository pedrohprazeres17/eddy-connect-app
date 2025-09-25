import { Link } from 'react-router-dom';
import { Users, Crown, Calendar, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Grupo } from '@/types/mentor';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GroupCardProps {
  grupo: Grupo;
}

export function GroupCard({ grupo }: GroupCardProps) {
  const { user } = useAuth();
  const isOwner = user?.id === grupo.owner_user_id;

  const truncateText = (text: string | undefined, maxLength: number = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return '';
    }
  };

  return (
    <Card className="gradient-surface shadow-card hover:shadow-glow transition-all duration-300 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-tight flex-1 mr-2">
            {grupo.nome}
          </CardTitle>
          {isOwner && (
            <Badge variant="default" className="flex items-center gap-1 text-xs">
              <Crown className="w-3 h-3" />
              Owner
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Descrição */}
        {grupo.descricao && (
          <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
            {truncateText(grupo.descricao)}
          </p>
        )}

        {/* Informações do grupo */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>
              {grupo.membros.length} membro{grupo.membros.length !== 1 ? 's' : ''}
            </span>
          </div>

          {grupo.criado_em && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Criado em {formatDate(grupo.criado_em)}</span>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="pt-2 space-y-2">
          <Button asChild className="w-full" variant="outline">
            <Link to={`/grupo/${grupo.id}`}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Abrir Grupo
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}