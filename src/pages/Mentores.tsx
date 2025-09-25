import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Users, RefreshCw } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { FiltersBar, FiltersValue } from '@/components/FiltersBar';
import { MentorCard } from '@/components/MentorCard';
import { AgendarModal } from '@/components/AgendarModal';
import { MentorCardSkeleton } from '@/components/Skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getDataProvider } from '@/services/dataProvider';
import { Mentor } from '@/types/mentor';

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

export default function Mentores() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [mentores, setMentores] = useState<Mentor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [filters, setFilters] = useState<FiltersValue>({
    q: '',
    areas: [],
    precoMin: '',
    precoMax: '',
    order: ''
  });

  // Modal de agendamento
  const [agendarModal, setAgendarModal] = useState<{
    isOpen: boolean;
    mentor: Mentor | null;
  }>({
    isOpen: false,
    mentor: null
  });

  // Debounce nos filtros para não fazer muitas requisições
  const debouncedFilters = useDebounce(filters, 300);

  // Função para buscar mentores
  const fetchMentores = useCallback(async (currentPage: number, resetList: boolean = false) => {
    try {
      if (resetList) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const params = {
        q: debouncedFilters.q.trim() || undefined,
        areas: debouncedFilters.areas.length > 0 ? debouncedFilters.areas : undefined,
        precoMin: debouncedFilters.precoMin ? parseFloat(debouncedFilters.precoMin) : undefined,
        precoMax: debouncedFilters.precoMax ? parseFloat(debouncedFilters.precoMax) : undefined,
        order: debouncedFilters.order || undefined,
        page: currentPage,
        pageSize,
      };

      const response = await dataProvider.listMentores(params);

      if (resetList) {
        setMentores(response.items);
      } else {
        setMentores(prev => [...prev, ...response.items]);
      }
      
      setTotal(response.total);
      setPage(currentPage);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar mentores';
      setError(errorMessage);
      toast({
        title: "Erro ao carregar mentores",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [debouncedFilters, toast]);

  // Buscar mentores quando filtros mudarem (reset list)
  useEffect(() => {
    fetchMentores(1, true);
  }, [fetchMentores]);

  // Handler para carregar mais
  const handleLoadMore = () => {
    if (!loadingMore && mentores.length < total) {
      fetchMentores(page + 1, false);
    }
  };

  // Handler para retry em caso de erro
  const handleRetry = () => {
    setError(null);
    fetchMentores(1, true);
  };

  // Handler para abrir modal de agendamento
  const handleAgendar = async (mentorId: string) => {
    // Verificar se usuário está logado
    if (!user) {
      toast({
        title: "Faça login para agendar",
        description: "Você precisa estar logado para solicitar uma mentoria.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    // Verificar se é aluno
    if (user.role !== 'aluno') {
      toast({
        title: "Apenas alunos podem agendar",
        description: "Mentores não podem agendar sessões com outros mentores.",
        variant: "destructive",
      });
      return;
    }

    // Buscar dados completos do mentor
    try {
      const mentor = await dataProvider.getMentorById(mentorId);
      if (mentor) {
        setAgendarModal({
          isOpen: true,
          mentor
        });
      } else {
        toast({
          title: "Mentor não encontrado",
          description: "Não foi possível encontrar os dados do mentor.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar mentor",
        description: "Não foi possível carregar os dados do mentor.",
        variant: "destructive",
      });
    }
  };

  // Handler para fechar modal
  const handleCloseModal = () => {
    setAgendarModal({
      isOpen: false,
      mentor: null
    });
  };

  const hasMoreItems = mentores.length < total;
  const showEmptyState = !loading && mentores.length === 0 && !error;

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient-brand mb-2">
            Encontre seu Mentor
          </h1>
          <p className="text-lg text-muted-foreground">
            Conecte-se com especialistas e acelere seu aprendizado
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-8">
          <FiltersBar 
            value={filters} 
            onChange={setFilters}
            aria-label="Filtros de busca de mentores"
          />
        </div>

        {/* Resultados */}
        <div className="space-y-6">
          {/* Contador de resultados */}
          {!loading && !error && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {total === 0 
                  ? "Nenhum mentor encontrado"
                  : `${total} mentor${total !== 1 ? 'es' : ''} encontrado${total !== 1 ? 's' : ''}${
                      debouncedFilters.q || debouncedFilters.areas.length > 0 || debouncedFilters.precoMin || debouncedFilters.precoMax
                        ? ' com os filtros aplicados'
                        : ''
                    }`
                }
              </p>
              
              {mentores.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Mostrando {mentores.length} de {total}
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

          {/* Grid de mentores */}
          {loading ? (
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              aria-label="Carregando mentores..."
            >
              {Array.from({ length: pageSize }).map((_, index) => (
                <MentorCardSkeleton key={index} />
              ))}
            </div>
          ) : mentores.length > 0 ? (
            <>
              <div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                role="grid"
                aria-label="Lista de mentores"
              >
                {mentores.map((mentor) => (
                  <div key={mentor.id} role="gridcell">
                    <MentorCard 
                      mentor={mentor} 
                      onAgendar={handleAgendar}
                    />
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
                        Carregar mais mentores
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({mentores.length}/{total})
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
                  Nenhum mentor encontrado
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {debouncedFilters.q || debouncedFilters.areas.length > 0 || debouncedFilters.precoMin || debouncedFilters.precoMax
                    ? "Não encontramos mentores com os filtros aplicados. Tente ajustar os critérios de busca."
                    : "Ainda não há mentores cadastrados na plataforma."
                  }
                </p>
                {(debouncedFilters.q || debouncedFilters.areas.length > 0 || debouncedFilters.precoMin || debouncedFilters.precoMax) && (
                  <Button 
                    variant="outline"
                    onClick={() => setFilters({
                      q: '',
                      areas: [],
                      precoMin: '',
                      precoMax: '',
                      order: ''
                    })}
                  >
                    Limpar filtros
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Modal de Agendamento */}
        <AgendarModal
          isOpen={agendarModal.isOpen}
          onClose={handleCloseModal}
          mentor={agendarModal.mentor}
        />
      </div>
    </AppShell>
  );
}