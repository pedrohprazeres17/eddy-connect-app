import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Calendar, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { airtableClient, AirtableRecord } from '@/services/airtableClient';
import { AppShell } from '@/components/AppShell';
import { MentorCardSkeleton } from '@/components/Skeleton';
import { useToast } from '@/hooks/use-toast';

interface Mentor {
  id: string;
  nome: string;
  areas: string[];
  preco_hora: number;
  bio?: string;
  foto_url?: string;
}

export default function HomeAluno() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mentores, setMentores] = useState<Mentor[]>([]);
  const [loadingMentores, setLoadingMentores] = useState(true);

  useEffect(() => {
    loadMentoresDestaque();
  }, []);

  const loadMentoresDestaque = async () => {
    try {
      setLoadingMentores(true);
      
      const usersTable = import.meta.env.VITE_AIRTABLE_USERS || 'Users';
      const response = await airtableClient.list(usersTable, {
        filterByFormula: "{role} = 'mentor'",
        sort: [{ field: 'nome', direction: 'asc' }],
        pageSize: 4
      });

      const mentoresData: Mentor[] = response.records.map((record: AirtableRecord) => ({
        id: record.id,
        nome: record.fields.nome,
        areas: record.fields.areas || [],
        preco_hora: record.fields.preco_hora || 0,
        bio: record.fields.bio,
        foto_url: record.fields.foto_url,
      }));

      setMentores(mentoresData);
    } catch (error) {
      console.error('Erro ao carregar mentores:', error);
      toast({
        title: "Erro ao carregar mentores",
        description: "Não foi possível carregar os mentores em destaque.",
        variant: "destructive",
      });
    } finally {
      setLoadingMentores(false);
    }
  };

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="gradient-surface rounded-2xl p-8 shadow-card">
            <h1 className="text-4xl font-bold text-gradient-brand mb-4">
              Bem-vindo, {user?.nome}! 👋
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Continue sua jornada de aprendizado. Explore novos mentores, 
              participe de grupos de estudo e acompanhe seu progresso.
            </p>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Acesso rápido</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card Mentores */}
            <Card className="gradient-surface shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Mentores</CardTitle>
                <CardDescription>
                  Encontre mentores especializados nas áreas que você quer aprender
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/mentores">
                    Explorar Mentores
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Card Grupos */}
            <Card className="gradient-surface shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/20 transition-colors">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Grupos</CardTitle>
                <CardDescription>
                  Participe de grupos de estudo e aprenda colaborativamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/grupos">
                    Ver Grupos
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Card Sessões */}
            <Card className="gradient-surface shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-secondary/20 transition-colors">
                  <Calendar className="w-6 h-6 text-secondary-foreground" />
                </div>
                <CardTitle>Minhas Sessões</CardTitle>
                <CardDescription>
                  Acompanhe suas sessões de mentoria agendadas e histórico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full" disabled>
                  <Link to="/sessoes">
                    Ver Sessões
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Mentores em Destaque */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Mentores em destaque</h2>
            <Button asChild variant="ghost">
              <Link to="/mentores">
                Ver todos
              </Link>
            </Button>
          </div>

          {loadingMentores ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <MentorCardSkeleton key={index} />
              ))}
            </div>
          ) : mentores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mentores.map((mentor) => (
                <Card key={mentor.id} className="gradient-surface shadow-card hover:shadow-glow transition-all duration-300">
                  <CardHeader className="text-center pb-3">
                    <Avatar className="w-16 h-16 mx-auto mb-3">
                      <AvatarImage 
                        src={mentor.foto_url} 
                        alt={`Foto de ${mentor.nome}`} 
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                        {getInitials(mentor.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-lg">{mentor.nome}</CardTitle>
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {formatPrice(mentor.preco_hora)}/hora
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mentor.areas.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {mentor.areas.slice(0, 3).map((area) => (
                          <Badge key={area} variant="secondary" className="text-xs">
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
                    
                    {mentor.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {mentor.bio}
                      </p>
                    )}

                    <Button variant="outline" size="sm" className="w-full" disabled>
                      Ver Perfil
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="gradient-surface shadow-card">
              <CardContent className="text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum mentor disponível</h3>
                <p className="text-muted-foreground">
                  Ainda não há mentores cadastrados na plataforma.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Placeholder - Em breve notice */}
        <div className="mt-12 text-center">
          <Card className="gradient-surface shadow-card max-w-md mx-auto">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                📚 Mais funcionalidades em breve: chat com mentores, agendamento de sessões, 
                grupos de estudo e muito mais!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}