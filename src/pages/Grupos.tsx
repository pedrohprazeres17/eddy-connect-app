import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { GroupCard } from '@/components/GroupCard';
import { CreateGroupModal } from '@/components/CreateGroupModal';
import { GroupCardSkeleton } from '@/components/Skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getDataProvider } from '@/services/dataProvider';
import { Grupo } from '@/types/mentor';

const dataProvider = getDataProvider();

// Hook para debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function Grupos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);

  // Modais
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Debounce na busca
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Verificar autenticação
  useEffect(() => {
    if (!user) {
      toast({
        title: "Faça login para acessar grupos",
        description: "Você precisa estar logado para ver e participar dos grupos de estudo.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
  }, [user, navigate, toast]);

  // Função para buscar grupos
  const fetchGrupos = useCallback(async (resetList: boolean = false) => {
    if (!user) return;

    try {
      if (resetList) {
        setLoading(true);
        setError(null);
      }

      const response = await dataProvider.listGrupos({
        q: debouncedSearch,
        pageSize: 50, // Buscar mais grupos por vez
      });

      setGrupos(response.items);
      setTotal(response.items.length);
      setError(null);

    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar grupos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, debouncedSearch]);

  // Carregar grupos quando usuário ou busca mudar
  useEffect(() => {
    if (user) {
      fetchGrupos(true);
    }
  }, [user, debouncedSearch, fetchGrupos]);

  // Handler para retry em caso de erro
  const handleRetry = () => {
    fetchGrupos(true);
  };

  // Handler para sucesso na criação
  const handleCreateSuccess = () => {
    // Recarregar a lista de grupos
    fetchGrupos(true);
    
    toast({
      title: "Grupo criado com sucesso!",
      description: "Você já é membro do novo grupo.",
    });
  };

  // Handler para abrir grupo
  const handleAbrirGrupo = useCallback((grupoId: string) => {
    navigate(`/grupo/${grupoId}`);
  }, [navigate]);

  // Handler para entrar em grupo
  const handleEntrarGrupo = useCallback(async (grupoAirtableId: string) => {
    if (!user) {
      toast({
        title: "Faça login para entrar no grupo",
        description: "Você precisa estar logado para participar de grupos.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    try {
      setJoiningGroupId(grupoAirtableId);
      
      const result = await dataProvider.entrarNoGrupo(grupoAirtableId, user.airRecId);
      
      if (result.ok) {
        toast({
          title: "Você entrou no grupo!",
          description: "Agora você pode participar das discussões e atividades.",
        });
        
        // Recarregar a lista para atualizar os estados
        fetchGrupos(true);
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
      setJoiningGroupId(null);
    }
  }, [user, dataProvider, toast, navigate, fetchGrupos]);

  const showEmptyState = !loading && grupos.length === 0 && !error;

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient-brand mb-2">
            Grupos de Estudo
          </h1>
          <p className="text-lg text-muted-foreground">
            Conecte-se com outros estudantes e aprenda em grupo
          </p>
        </div>

        {/* Barra de ações */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Campo de busca */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar grupos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                aria-label="Buscar grupos de estudo"
              />
            </div>

            {/* Botões de ação */}
            <div className="flex gap-2">
              <Button
                onClick={() => setCreateModalOpen(true)}
                className="gap-2"
                variant="hero"
                disabled={!user}
              >
                <Plus className="w-4 h-4" />
                Criar Grupo
              </Button>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="space-y-6">
          {/* Contador de resultados */}
          {!loading && !error && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {total === 0 
                  ? "Nenhum grupo encontrado"
                  : `${total} grupo${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}${
                      debouncedSearch 
                        ? ' com os filtros aplicados'
                        : ''
                    }`
                }
              </p>
            </div>
          )}

          {/* Estado de erro */}
          {error && (
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                <div className="flex items-center justify-between">
                  <span>{error}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRetry}
                    className="ml-4"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar novamente
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Grid de grupos */}
          {loading ? (
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              aria-label="Carregando grupos..."
            >
              {Array.from({ length: 8 }).map((_, index) => (
                <GroupCardSkeleton key={index} />
              ))}
            </div>
          ) : grupos.length > 0 ? (
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              role="grid"
              aria-label="Lista de grupos de estudo"
            >
              {grupos.map((grupo) => {
                if (!user) return null;
                
                const isOwner = grupo.owner_user_id === user.airRecId;
                const isMember = grupo.membros.includes(user.airRecId);
                const isJoining = joiningGroupId === (grupo.airtable_id || grupo.id);
                
                return (
                  <div key={grupo.id} role="gridcell">
                    <GroupCard 
                      grupo={grupo}
                      isOwner={isOwner}
                      isMember={isMember}
                      onAbrir={handleAbrirGrupo}
                      onEntrar={handleEntrarGrupo}
                      isJoining={isJoining}
                    />
                  </div>
                );
              })}
            </div>
          ) : showEmptyState ? (
            <Card className="gradient-surface shadow-card">
              <CardContent className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {debouncedSearch 
                    ? "Nenhum grupo encontrado"
                    : "Ainda não há grupos cadastrados"
                  }
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {debouncedSearch
                    ? "Não encontramos grupos com os termos buscados. Tente ajustar sua pesquisa ou criar um novo grupo."
                    : "Seja o primeiro a criar um grupo de estudos na plataforma!"
                  }
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {user ? (
                    <Button 
                      onClick={() => setCreateModalOpen(true)}
                      className="gap-2"
                      variant="hero"
                    >
                      <Plus className="w-4 h-4" />
                      Criar Primeiro Grupo
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => {
                        toast({
                          title: "Faça login para criar um grupo",
                          description: "Você precisa estar logado para criar grupos de estudo.",
                          variant: "destructive",
                        });
                        navigate('/login');
                      }}
                      className="gap-2"
                      variant="hero"
                    >
                      <Plus className="w-4 h-4" />
                      Fazer Login para Criar
                    </Button>
                  )}
                  
                  {debouncedSearch && (
                    <Button 
                      variant="outline"
                      onClick={() => setSearchQuery('')}
                    >
                      Limpar busca
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Modais */}
        <CreateGroupModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      </div>
    </AppShell>
  );
}