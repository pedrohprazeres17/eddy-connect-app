import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'aluno' | 'mentor';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto carrega o estado de autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Redirecionar para login se não estiver autenticado
  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Verificar se o role é o requerido (se especificado)
  if (requiredRole && user.role !== requiredRole) {
    // Redirecionar para a página apropriada baseada no role do usuário
    const redirectPath = user.role === 'aluno' ? '/home-aluno' : '/home-mentor';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}