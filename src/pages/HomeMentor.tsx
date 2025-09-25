import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, User, AlertTriangle, CheckCircle, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { AppShell } from '@/components/AppShell';

export default function HomeMentor() {
  const { user } = useAuth();
  const [perfilIncompleto, setPerfilIncompleto] = useState(false);

  useEffect(() => {
    // Verificar se o perfil está completo
    if (user) {
      const isIncomplete = !user.areas || 
                          user.areas.length === 0 || 
                          !user.preco_hora || 
                          user.preco_hora <= 0;
      setPerfilIncompleto(isIncomplete);
    }
  }, [user]);

  const formatPrice = (price: number | undefined) => {
    if (!price) return 'Não definido';
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
              Bem-vindo, {user?.nome}! 🎓
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sua plataforma para compartilhar conhecimento e transformar vidas. 
              Gerencie seus grupos, sessões e ajude mais alunos a alcançar seus objetivos.
            </p>
          </div>
        </section>

        {/* Alerta de Perfil Incompleto */}
        {perfilIncompleto && (
          <section className="mb-8">
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                <strong>Perfil incompleto:</strong> Complete suas áreas de conhecimento e preço por hora 
                para começar a receber alunos.
                <Button variant="outline" size="sm" className="ml-3" disabled>
                  Completar Perfil
                </Button>
              </AlertDescription>
            </Alert>
          </section>
        )}

        {/* Status do Perfil */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Status do seu perfil</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Informações Básicas */}
            <Card className="gradient-surface shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{user?.nome}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">E-mail</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de conta</p>
                  <Badge variant="secondary">Mentor</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Áreas de Conhecimento */}
            <Card className="gradient-surface shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-accent" />
                  Áreas de Conhecimento
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user?.areas && user.areas.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.areas.map((area) => (
                      <Badge key={area} variant="outline" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Nenhuma área definida
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preço e Disponibilidade */}
            <Card className="gradient-surface shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  Preço e Disponibilidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Preço por hora</p>
                  <p className="font-medium text-lg">
                    {formatPrice(user?.preco_hora)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={perfilIncompleto ? "destructive" : "default"}>
                    {perfilIncompleto ? "Perfil incompleto" : "Disponível"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Painel de controle</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card Grupos */}
            <Card className="gradient-surface shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Meus Grupos</CardTitle>
                <CardDescription>
                  Gerencie os grupos de estudo que você criou e administra
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/grupos">
                    Gerenciar Grupos
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Card Sessões */}
            <Card className="gradient-surface shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/20 transition-colors">
                  <Calendar className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Minhas Sessões</CardTitle>
                <CardDescription>
                  Acompanhe sessões de mentoria agendadas e seu histórico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full" disabled>
                  <Link to="/sessoes">
                    Ver Agenda
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Card Perfil */}
            <Card className="gradient-surface shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-secondary/20 transition-colors">
                  <User className="w-6 h-6 text-secondary-foreground" />
                </div>
                <CardTitle>Completar Perfil</CardTitle>
                <CardDescription>
                  {perfilIncompleto 
                    ? "Complete seu perfil para começar a receber alunos"
                    : "Atualize suas informações e disponibilidade"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  asChild 
                  variant={perfilIncompleto ? "default" : "outline"} 
                  className="w-full"
                  disabled
                >
                  <Link to="/perfil">
                    {perfilIncompleto ? "Completar Agora" : "Editar Perfil"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Biografia */}
        {user?.bio && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Sua biografia</h2>
            <Card className="gradient-surface shadow-card">
              <CardContent className="pt-6">
                <p className="text-muted-foreground leading-relaxed">
                  {user.bio}
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Estatísticas Placeholder */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Suas estatísticas</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="gradient-surface shadow-card text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">0</div>
                <p className="text-sm text-muted-foreground">Alunos ativos</p>
              </CardContent>
            </Card>
            
            <Card className="gradient-surface shadow-card text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-accent mb-2">0</div>
                <p className="text-sm text-muted-foreground">Sessões realizadas</p>
              </CardContent>
            </Card>
            
            <Card className="gradient-surface shadow-card text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-secondary-foreground mb-2">0</div>
                <p className="text-sm text-muted-foreground">Grupos criados</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Placeholder - Em breve notice */}
        <div className="mt-12 text-center">
          <Card className="gradient-surface shadow-card max-w-md mx-auto">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                🚀 Em breve: sistema de agendamento, chat com alunos, 
                relatórios detalhados e muito mais!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}