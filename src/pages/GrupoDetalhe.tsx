import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Users, Crown, Calendar, MessageCircle, BookOpen, UserPlus } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { ChatBox } from '@/components/ChatBox';
import { GroupDetailSkeleton } from '@/components/Skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getDataProvider } from '@/services/dataProvider';
import { Grupo } from '@/types/mentor';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const dataProvider = getDataProvider('mock');

export default function GrupoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const isOwner = user && grupo ? user.id === grupo.owner_user_id : false;
  const isMember = user && grupo ? grupo.membros.includes(user.id) : false;

  // Verificar autenticação
  useEffect(() => {
    if (!user) {
      toast({
        title: "Faça login para acessar grupos",
        description: "Você precisa estar logado para ver os detalhes do grupo.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
  }, [user, navigate, toast]);

  // Carregar dados do grupo
  useEffect(() => {
    const fetchGrupo = async () => {
      if (!id || !user) {
        setError('ID do grupo não fornecido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const grupoData = await dataProvider.getGrupoById(id);
        
        if (grupoData) {
          setGrupo(grupoData);
        } else {
          setError('Grupo não encontrado');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar grupo';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchGrupo();
  }, [id, user]);

  // Handler para entrar no grupo
  const handleJoinGroup = async () => {
    if (!user || !grupo) return;

    try {
      setJoining(true);

      const result = await dataProvider.entrarNoGrupo({ grupoId: grupo.id }, user.id);

      if (result.ok) {
        // Atualizar estado local
        setGrupo(prev => prev ? {
          ...prev,
          membros: [...prev.membros, user.id]
        } : null);

        toast({
          title: "Você entrou no grupo!",
          description: `Bem-vindo ao grupo "${grupo.nome}". Agora você pode participar das discussões.`,
        });
      } else {
        throw new Error('Falha ao entrar no grupo');
      }

    } catch (error) {
      console.error('Erro ao entrar no grupo:', error);
      toast({
        title: "Erro ao entrar no grupo",
        description: "Não foi possível entrar no grupo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return '';
    }
  };

  const scrollToChat = () => {
    const chatElement = document.getElementById('chat-section');
    if (chatElement) {
      chatElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Loading state
  if (loading) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-8">
          <GroupDetailSkeleton />
        </div>
      </AppShell>
    );
  }

  // Error state
  if (error || !grupo) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-8">
          <Card className="gradient-surface shadow-card max-w-md mx-auto text-center">
            <CardContent className="pt-6">
              <h1 className="text-2xl font-bold mb-4">
                {error === 'Grupo não encontrado' ? 'Grupo não encontrado' : 'Erro ao carregar'}
              </h1>
              <p className="text-muted-foreground mb-6">
                {error === 'Grupo não encontrado' 
                  ? 'O grupo que você está procurando não existe ou foi removido.'
                  : 'Não foi possível carregar os detalhes do grupo. Tente novamente.'
                }
              </p>
              <div className="flex flex-col gap-3">
                <Button onClick={() => navigate('/grupos')} variant="hero">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar para Grupos
                </Button>
                {error !== 'Grupo não encontrado' && (
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline"
                  >
                    Tentar novamente
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  // Verificar se é membro
  if (!isMember) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button 
              onClick={() => navigate('/grupos')} 
              variant="ghost" 
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para grupos
            </Button>
          </div>

          <Card className="gradient-surface shadow-card max-w-md mx-auto text-center">
            <CardHeader>
              <CardTitle className="text-xl">{grupo.nome}</CardTitle>
              {grupo.descricao && (
                <CardDescription>{grupo.descricao}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-primary/20 bg-primary/5">
                <Users className="h-4 w-4 text-primary" />
                <AlertDescription>
                  Você não participa deste grupo. Entre para acessar as discussões e conteúdos.
                </AlertDescription>
              </Alert>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{grupo.membros.length} membro{grupo.membros.length !== 1 ? 's' : ''}</span>
                </div>
                {grupo.criado_em && (
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Criado em {formatDate(grupo.criado_em)}</span>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleJoinGroup}
                disabled={joining}
                className="w-full"
                variant="hero"
              >
                {joining ? (
                  <>Entrando...</>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Entrar no Grupo
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
        {/* Botão Voltar */}
        <div className="mb-6">
          <Button 
            onClick={() => navigate('/grupos')} 
            variant="ghost" 
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para grupos
          </Button>
        </div>

        <div className="space-y-8">
          {/* Informações do Grupo */}
          <section>
            <Card className="gradient-surface shadow-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2 flex items-center gap-3">
                      <h1>{grupo.nome}</h1>
                      {isOwner && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          Você é o owner
                        </Badge>
                      )}
                    </CardTitle>
                    {grupo.descricao && (
                      <CardDescription className="text-base leading-relaxed">
                        {grupo.descricao}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Estatísticas do grupo */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {grupo.membros.length} membro{grupo.membros.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {grupo.criado_em && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Criado em {formatDate(grupo.criado_em)}</span>
                    </div>
                  )}
                </div>

                {/* ID do grupo para compartilhar */}
                <div className="p-3 rounded-lg bg-muted/20 border border-border/50">
                  <p className="text-sm font-medium mb-1">ID do grupo para convites:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-2 py-1 bg-background rounded text-sm font-mono">
                      {grupo.id}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(grupo.id);
                        toast({
                          title: "ID copiado!",
                          description: "O ID do grupo foi copiado para a área de transferência.",
                        });
                      }}
                    >
                      Copiar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Compartilhe este ID para que outros possam entrar no grupo
                  </p>
                </div>

                {/* Ações */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button asChild variant="outline" className="gap-2">
                    <Link to="/mentores">
                      <BookOpen className="w-4 h-4" />
                      Encontrar Mentores
                    </Link>
                  </Button>
                  
                  <Button 
                    onClick={scrollToChat}
                    className="gap-2"
                    variant="hero"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Ir para o Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Chat do Grupo */}
          <section id="chat-section">
            <ChatBox 
              grupoId={grupo.id} 
              grupoNome={grupo.nome}
            />
          </section>

          {/* Informações sobre membros (placeholder) */}
          <section>
            <Card className="gradient-surface shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Membros do Grupo
                </CardTitle>
                <CardDescription>
                  Lista de participantes ativos neste grupo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    <strong>{grupo.membros.length}</strong> membro{grupo.membros.length !== 1 ? 's' : ''} no total
                  </p>
                  
                  {/* TODO: Implementar lista de membros com nomes e fotos */}
                  <div className="p-4 rounded-lg bg-muted/20 border border-border/50 text-center">
                    <p className="text-sm text-muted-foreground">
                      🚧 Lista detalhada de membros em desenvolvimento
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Por enquanto, você pode ver a quantidade de membros e interagir no chat
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </AppShell>
  );
}