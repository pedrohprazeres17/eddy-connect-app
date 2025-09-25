import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, AlertCircle, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppShell } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getDataProvider } from '@/services/dataProvider';

const dataProvider = getDataProvider();

type StatusTab = 'solicitada' | 'confirmada' | 'concluida' | 'cancelada';

const TABS_CONFIG = {
  solicitada: { label: 'Solicitadas', color: 'bg-yellow-500' },
  confirmada: { label: 'Confirmadas', color: 'bg-blue-500' },
  concluida: { label: 'Concluídas', color: 'bg-green-500' },
  cancelada: { label: 'Canceladas', color: 'bg-red-500' },
};

export default function Sessoes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<StatusTab>('solicitada');
  const [sessoes, setSessoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Verificar autenticação
  useEffect(() => {
    if (!user) {
      toast({
        title: "Faça login para acessar suas sessões",
        description: "Você precisa estar logado para ver suas sessões de mentoria.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
  }, [user, navigate, toast]);

  // Função para buscar sessões
  const fetchSessoes = useCallback(async (status: StatusTab) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const response = await dataProvider.listMinhasSessoes(
        { airRecId: user.airRecId, role: user.role },
        status
      );

      setSessoes(response.items);

    } catch (error) {
      console.error('Erro ao buscar sessões:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar sessões';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Carregar sessões quando tab ou usuário mudar
  useEffect(() => {
    if (user) {
      fetchSessoes(activeTab);
    }
  }, [user, activeTab, fetchSessoes]);

  // Handler para retry em caso de erro
  const handleRetry = () => {
    fetchSessoes(activeTab);
  };

  // Handler para atualizar status da sessão
  const handleUpdateStatus = useCallback(async (sessaoId: string, novoStatus: 'confirmada' | 'concluida' | 'cancelada') => {
    if (!user) return;

    try {
      setActionLoading(sessaoId);
      
      const result = await dataProvider.updateSessaoStatus(sessaoId, novoStatus);
      
      if (result.ok) {
        toast({
          title: "Status atualizado!",
          description: `Sessão ${novoStatus === 'confirmada' ? 'confirmada' : novoStatus === 'concluida' ? 'concluída' : 'cancelada'} com sucesso.`,
        });
        
        // Recarregar sessões da aba atual
        fetchSessoes(activeTab);
      } else {
        throw new Error('Falha ao atualizar status');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  }, [user, activeTab, fetchSessoes, toast]);

  // Renderizar card de sessão
  const renderSessaoCard = (sessao: any) => {
    const isMentor = user?.role === 'mentor';
    const inicio = parseISO(sessao.fields.inicio);
    const fim = parseISO(sessao.fields.fim);
    
    // Buscar informações do mentor/aluno
    const mentorInfo = sessao.fields.mentor?.[0] || 'Mentor não encontrado';
    const alunoInfo = sessao.fields.aluno?.[0] || 'Aluno não encontrado';
    
    const canConfirm = isMentor && activeTab === 'solicitada';
    const canComplete = isMentor && activeTab === 'confirmada';
    const canCancel = activeTab === 'solicitada' || (isMentor && activeTab === 'confirmada');

    return (
      <Card key={sessao.id} className="gradient-surface">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {isMentor ? `Sessão com ${alunoInfo}` : `Mentoria com ${mentorInfo}`}
            </CardTitle>
            <Badge variant={activeTab === 'concluida' ? 'default' : 'secondary'}>
              {TABS_CONFIG[activeTab].label.slice(0, -1)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Data e hora */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{format(inicio, "PPP", { locale: ptBR })}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{format(inicio, "HH:mm")} - {format(fim, "HH:mm")}</span>
            </div>
          </div>

          {/* Observações */}
          {sessao.fields.observacoes && (
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-sm">
                <strong>Observações:</strong> {sessao.fields.observacoes}
              </p>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-2 pt-2">
            {canConfirm && (
              <Button
                size="sm"
                variant="default"
                onClick={() => handleUpdateStatus(sessao.id, 'confirmada')}
                disabled={actionLoading === sessao.id}
                className="gap-1"
              >
                {actionLoading === sessao.id ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Confirmar
              </Button>
            )}

            {canComplete && (
              <Button
                size="sm"
                variant="default"
                onClick={() => handleUpdateStatus(sessao.id, 'concluida')}
                disabled={actionLoading === sessao.id}
                className="gap-1"
              >
                {actionLoading === sessao.id ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Concluir
              </Button>
            )}

            {canCancel && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleUpdateStatus(sessao.id, 'cancelada')}
                disabled={actionLoading === sessao.id}
                className="gap-1"
              >
                {actionLoading === sessao.id ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Cancelar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const showEmptyState = !loading && sessoes.length === 0 && !error;

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient-brand mb-2">
            Minhas Sessões
          </h1>
          <p className="text-lg text-muted-foreground">
            Gerencie suas sessões de mentoria e acompanhe seu progresso
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as StatusTab)}>
          <TabsList className="grid w-full grid-cols-4">
            {Object.entries(TABS_CONFIG).map(([status, config]) => (
              <TabsTrigger key={status} value={status}>
                {config.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Conteúdo das tabs */}
          {Object.keys(TABS_CONFIG).map((status) => (
            <TabsContent key={status} value={status} className="mt-6">
              {/* Estado de erro */}
              {error && (
                <Alert className="border-destructive/50 bg-destructive/10 mb-6">
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

              {/* Loading */}
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index} className="animate-pulse">
                      <CardHeader>
                        <div className="h-4 bg-muted rounded w-1/3"></div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : sessoes.length > 0 ? (
                <div className="space-y-4">
                  {sessoes.map(renderSessaoCard)}
                </div>
              ) : showEmptyState ? (
                <Card className="gradient-surface shadow-card">
                  <CardContent className="text-center py-12">
                    <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      Nenhuma sessão encontrada
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Você não tem sessões {TABS_CONFIG[status as StatusTab].label.toLowerCase()} no momento.
                      {status === 'solicitada' && user?.role === 'aluno' && 
                        ' Navegue pelos mentores para agendar uma nova sessão!'
                      }
                    </p>

                    {status === 'solicitada' && user?.role === 'aluno' && (
                      <Button 
                        onClick={() => navigate('/mentores')}
                        variant="hero"
                        className="gap-2"
                      >
                        <User className="w-4 h-4" />
                        Ver Mentores
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : null}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppShell>
  );
}