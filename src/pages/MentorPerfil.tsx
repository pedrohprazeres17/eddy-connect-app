import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Star, MapPin, Clock, ArrowLeft, Users, Award, BookOpen } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { AgendarModal } from '@/components/AgendarModal';
import { MentorPerfilSkeleton } from '@/components/Skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getDataProvider } from '@/services/dataProvider';
import { Mentor } from '@/types/mentor';

const dataProvider = getDataProvider();

export default function MentorPerfil() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agendarModalOpen, setAgendarModalOpen] = useState(false);

  // Carregar dados do mentor
  useEffect(() => {
    const fetchMentor = async () => {
      if (!id) {
        setError('ID do mentor não fornecido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const mentorData = await dataProvider.getMentorById(id);
        
        if (mentorData) {
          setMentor(mentorData);
        } else {
          setError('Mentor não encontrado');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar perfil do mentor';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchMentor();
  }, [id]);

  // Handler para abrir modal de agendamento
  const handleAgendar = () => {
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

    setAgendarModalOpen(true);
  };

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

  // Loading state
  if (loading) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-8">
          <MentorPerfilSkeleton />
        </div>
      </AppShell>
    );
  }

  // Error state
  if (error || !mentor) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-8">
          <Card className="gradient-surface shadow-card max-w-md mx-auto text-center">
            <CardContent className="pt-6">
              <h1 className="text-2xl font-bold mb-4">
                {error === 'Mentor não encontrado' ? 'Mentor não encontrado' : 'Erro ao carregar'}
              </h1>
              <p className="text-muted-foreground mb-6">
                {error === 'Mentor não encontrado' 
                  ? 'O mentor que você está procurando não existe ou foi removido.'
                  : 'Não foi possível carregar o perfil do mentor. Tente novamente.'
                }
              </p>
              <div className="flex flex-col gap-3">
                <Button onClick={() => navigate('/mentores')} variant="hero">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar para Mentores
                </Button>
                {error !== 'Mentor não encontrado' && (
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

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
        {/* Botão Voltar */}
        <div className="mb-6">
          <Button 
            onClick={() => navigate('/mentores')} 
            variant="ghost" 
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para mentores
          </Button>
        </div>

        <div className="space-y-8">
          {/* Hero Section */}
          <section>
            <Card className="gradient-surface shadow-glow rounded-2xl overflow-hidden">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-6">
                  <Avatar className="w-32 h-32 border-4 border-primary/20">
                    <AvatarImage 
                      src={mentor.foto_url} 
                      alt={`Foto de ${mentor.nome}`}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                      {getInitials(mentor.nome)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <h1 className="text-4xl font-bold text-gradient-brand mb-2">
                  {mentor.nome}
                </h1>

                {/* Áreas de especialidade */}
                {mentor.areas.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {mentor.areas.map((area) => (
                      <Badge key={area} variant="secondary" className="text-sm">
                        {area}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Preço e avaliação */}
                <div className="flex items-center justify-center gap-6 mb-6 text-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-accent" />
                    <span className="font-semibold text-accent">
                      {formatPrice(mentor.preco_hora)}/hora
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-accent text-accent" />
                    <span className="font-semibold">4.8</span>
                    <span className="text-muted-foreground">(23)</span>
                  </div>
                </div>

                {/* Botão de agendamento */}
                <Button 
                  onClick={handleAgendar}
                  size="lg"
                  variant="hero"
                  className="text-lg px-8 py-3"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Agendar Mentoria
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Sobre o Mentor */}
          {mentor.bio && (
            <section>
              <Card className="gradient-surface shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Sobre o mentor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {mentor.bio}
                  </p>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Estatísticas do Mentor */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Estatísticas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="gradient-surface shadow-card text-center">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">47</div>
                  <p className="text-sm text-muted-foreground">Alunos mentorados</p>
                </CardContent>
              </Card>

              <Card className="gradient-surface shadow-card text-center">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-accent/10 rounded-full">
                      <Clock className="w-6 h-6 text-accent" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-accent mb-2">120+</div>
                  <p className="text-sm text-muted-foreground">Horas de mentoria</p>
                </CardContent>
              </Card>

        <Card className="gradient-surface shadow-card text-center">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-secondary/10 rounded-full">
                <Award className="w-6 h-6 text-secondary-foreground" />
              </div>
            </div>
            <div className="text-3xl font-bold text-secondary-foreground mb-2">4.8</div>
            <p className="text-sm text-muted-foreground">Avaliação média</p>
          </CardContent>
        </Card>
            </div>
          </section>

          {/* Áreas de Especialidade Detalhadas */}
          {mentor.areas.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-6">Áreas de especialidade</h2>
              <Card className="gradient-surface shadow-card">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mentor.areas.map((area, index) => (
                      <div 
                        key={area}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/50"
                      >
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {index + 1}
                          </span>
                        </div>
                        <span className="font-medium">{area}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Call to Action Final */}
          <section>
            <Card className="gradient-brand text-primary-foreground shadow-glow">
              <CardContent className="text-center p-8">
                <h2 className="text-2xl font-bold mb-2">
                  Pronto para acelerar seu aprendizado?
                </h2>
                <p className="text-primary-foreground/80 mb-6 text-lg">
                  Agende uma sessão com {mentor.nome} e dê o próximo passo na sua carreira.
                </p>
                <Button 
                  onClick={handleAgendar}
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-3"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Agendar Agora
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Modal de Agendamento */}
        <AgendarModal
          isOpen={agendarModalOpen}
          onClose={() => setAgendarModalOpen(false)}
          mentor={mentor}
        />
      </div>
    </AppShell>
  );
}