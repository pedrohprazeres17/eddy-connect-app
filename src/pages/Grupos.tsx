import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, UserPlus, Search, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { GroupCard } from '@/components/GroupCard';
import { CreateGroupModal } from '@/components/CreateGroupModal';
import { JoinGroupModal } from '@/components/JoinGroupModal';
import { GroupCardSkeleton } from '@/components/Skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getDataProvider } from '@/services/dataProvider';
import { Grupo } from '@/types/mentor';

const dataProvider = getDataProvider('mock');

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
  const { toast } = useToast();
  const navigate = useNavigate();

  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = 12;

  // Modais
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);

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
  const fetchGrupos = useCallback(async (currentPage: number, resetList: boolean = false) => {
    if (!user) return;

    try {
      if (resetList) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const params = {
        q: debouncedSearch.trim() || undefined,
        page: currentPage,
        pageSize,
      };

      const response = await dataProvider.listGrupos(params);

      // Filtrar apenas grupos onde o usuário é membro
      const gruposDoUsuario = response.items.filter(grupo => 
        grupo.membros.includes(user.id)
      );

      if (resetList) {
        setGrupos(gruposDoUsuario);
      } else {
        setGrupos(prev => [...prev, ...gruposDoUsuario]);
      }
      
      setTotal(gruposDoUsuario.length);
      setPage(currentPage);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar grupos';
      setError(errorMessage);
      toast({
        title: "Erro ao carregar grupos",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [debouncedSearch, user, toast]);

  // Buscar grupos quando pesquisa mudar (reset list) 
  useEffect(() => {
    if (user) {
      fetchGrupos(1, true);
    }
  }, [fetchGrupos, user]);

  // Handler para carregar mais
  const handleLoadMore = () => {
    if (!loadingMore && grupos.length < total) {
      fetchGrupos(page + 1, false);
    }
  };

  // Handler para retry em caso de erro
  const handleRetry = () => {
    setError(null);
    fetchGrupos(1, true);
  };

  // Handler para sucesso na criação de grupo
  const handleCreateSuccess = () => {
    fetchGrupos(1, true); // Recarregar lista
  };

  const hasMoreItems = grupos.length < total;
  const showEmptyState = !loading && grupos.length === 0 && !error;

  if (!user) {
    return null; // Já redireciona no useEffect
  }

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient-brand mb-2">
            Grupos de Estudo
          </h1>
          <p className="text-lg text-muted-foreground">
            Participe de discussões e aprenda colaborativamente
          </p>
        </div>

        {/* Barra de ações */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar grupos por nome ou descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                aria-label="Buscar grupos"
              />
            </div>

            {/* Botões de ação */}
            <div className="flex gap-2">
              <Button
                onClick={() => setCreateModalOpen(true)}
                className="gap-2"
                variant="hero"
              >
                <Plus className="w-4 h-4" />
                Criar Grupo
              </Button>

              <Button
                onClick={() => setJoinModalOpen(true)}
                variant="outline"
                className="gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Entrar por ID
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
                  ? "Você ainda não participa de nenhum grupo"
                  : `${total} grupo${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}${
                      debouncedSearch 
                        ? ' com os filtros aplicados'
                        : ''
                    }`
                }
              </p>
              
              {grupos.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Mostrando {grupos.length} de {total}
                </p>
              )}
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
              {Array.from({ length: pageSize }).map((_, index) => (
                <GroupCardSkeleton key={index} />
              ))}
            </div>
          ) : grupos.length > 0 ? (
            <>
              <div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                role="grid"
                aria-label="Lista de grupos de estudo"
              >
                {grupos.map((grupo) => (
                  <div key={grupo.id} role="gridcell">
                    <GroupCard grupo={grupo} />
                  </div>
                ))}
              </div>

              {/* Botão Carregar Mais */}
              {hasMoreItems && (
                <div className="text-center">
                  <Button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    variant="outline"
                    size="lg"
                    className="min-w-48"
                  >
                    {loadingMore ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Carregando...
                      </>
                    ) : (
                      <>
                        Carregar mais grupos
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({grupos.length}/{total})
                        </span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : showEmptyState ? (
            <Card className="gradient-surface shadow-card">
              <CardContent className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {debouncedSearch 
                    ? "Nenhum grupo encontrado"
                    : "Você ainda não participa de nenhum grupo"
                  }
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {debouncedSearch
                    ? "Não encontramos grupos com os termos buscados. Tente ajustar sua pesquisa."
                    : "Que tal criar seu primeiro grupo de estudos ou entrar em um grupo existente?"
                  }
                </p>

                {!debouncedSearch ? (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={() => setCreateModalOpen(true)}
                      className="gap-2"
                      variant="hero"
                    >
                      <Plus className="w-4 h-4" />
                      Criar Meu Primeiro Grupo
                    </Button>
                    <Button 
                      onClick={() => setJoinModalOpen(true)}
                      variant="outline"
                      className="gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Entrar em um Grupo
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline"
                    onClick={() => setSearchQuery('')}
                  >
                    Limpar busca
                  </Button>
                )}
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

        <JoinGroupModal
          isOpen={joinModalOpen}
          onClose={() => setJoinModalOpen(false)}
        />
      </div>
    </AppShell>
  );
}