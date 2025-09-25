import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppShell } from '@/components/AppShell';
import { useAuth } from '@/contexts/AuthContext';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export default function PlaceholderPage({ 
  title, 
  description, 
  icon = <Construction className="w-12 h-12 text-primary" />
}: PlaceholderPageProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    const homePath = user?.role === 'aluno' ? '/home-aluno' : '/home-mentor';
    navigate(homePath);
  };

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <Card className="gradient-surface shadow-card">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {icon}
              </div>
              <CardTitle className="text-2xl">{title}</CardTitle>
              <CardDescription className="text-base">
                {description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
              </p>
              
              <div className="flex flex-col gap-3">
                <Button onClick={handleGoBack} className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Início
                </Button>
                
                <Button variant="outline" className="w-full" disabled>
                  Notificar quando disponível
                </Button>
              </div>
              
              <div className="pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  💡 Sugestão? Entre em contato conosco para priorizar funcionalidades.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}