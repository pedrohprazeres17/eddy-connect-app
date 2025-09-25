import { Users, Calendar, ChevronRight, Crown, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Grupo } from '@/types/mentor';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GroupCardProps {
  grupo: Grupo;
  isOwner: boolean;
  isMember: boolean;
  onAbrir: (grupoId: string) => void;
  onEntrar: (grupoAirtableId: string) => void;
  isJoining?: boolean;
}

export function GroupCard({ 
  grupo, 
  isOwner, 
  isMember, 
  onAbrir, 
  onEntrar, 
  isJoining = false 
}: GroupCardProps) {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Data não disponível';
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const truncateDescription = (description: string | undefined, maxLength: number = 120) => {
    if (!description) return '';
    if (description.length <= maxLength) return description;
    return description.slice(0, maxLength).trim() + '...';
  };

  return (
    <Card className="gradient-surface shadow-card hover:shadow-glow transition-all duration-300 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg leading-tight truncate">
                {grupo.nome}
              </CardTitle>
              {isOwner && (
                <Badge variant="default" className="flex items-center gap-1 text-xs">
                  <Crown className="w-3 h-3" />
                  Owner
                </Badge>
              )}
            </div>
            {grupo.descricao && (
              <CardDescription className="line-clamp-3">
                {truncateDescription(grupo.descricao)}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between pt-0">
        {/* Informações do grupo */}
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{grupo.membros.length} membro{grupo.membros.length !== 1 ? 's' : ''}</span>
            </div>
            
            {grupo.criado_em && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span className="truncate">{formatDate(grupo.criado_em)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Botão de ação */}
        <div className="mt-4">
          {isMember ? (
            <Button 
              className="w-full gap-2" 
              variant="hero"
              onClick={() => onAbrir(grupo.id)}
              aria-label={`Abrir grupo ${grupo.nome}`}
            >
              Abrir
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              className="w-full gap-2" 
              variant="outline"
              onClick={() => onEntrar(grupo.airtable_id || grupo.id)}
              disabled={isJoining}
              aria-label={`Entrar no grupo ${grupo.nome}`}
              aria-busy={isJoining}
            >
              {isJoining ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Entrando...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Entrar
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}