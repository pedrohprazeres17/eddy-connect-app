import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const getHomeLink = () => {
    if (user) {
      return user.role === 'aluno' ? '/home-aluno' : '/home-mentor';
    }
    return '/login';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="gradient-surface shadow-card max-w-md w-full text-center">
        <CardHeader>
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-4xl font-bold text-gradient-brand">404</CardTitle>
          <CardDescription className="text-lg">
            Página não encontrada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            A página que você está procurando não existe ou pode ter sido movida.
          </p>
          
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full" variant="hero">
              <a href={getHomeLink()}>
                <Home className="w-4 h-4 mr-2" />
                {user ? 'Voltar ao Início' : 'Fazer Login'}
              </a>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <a href={user ? (user.role === 'aluno' ? '/mentores' : '/grupos') : '/login'}>
                {user 
                  ? (user.role === 'aluno' ? 'Ver Mentores' : 'Ver Grupos')
                  : 'Acessar Plataforma'
                }
              </a>
            </Button>
          </div>
          
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Caminho acessado: <code className="bg-muted/30 px-1 rounded">{location.pathname}</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
