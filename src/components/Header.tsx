import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavigationItems = () => {
    if (!user) return [];

    if (user.role === 'aluno') {
      return [
        { name: 'Início', href: '/home-aluno' },
        { name: 'Grupos', href: '/grupos' },
        { name: 'Mentores', href: '/mentores' },
      ];
    } else {
      return [
        { name: 'Início', href: '/home-mentor' },
        { name: 'Grupos', href: '/grupos' },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  const getUserInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="gradient-surface border-b border-border/50 sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to={user ? (user.role === 'aluno' ? '/home-aluno' : '/home-mentor') : '/'}
            className="flex items-center gap-2 text-xl font-bold text-gradient-brand focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
          >
            <GraduationCap className="w-8 h-8 text-primary" />
            EduConnect
          </Link>

          {/* Navegação Desktop */}
          {user && (
            <nav className="hidden md:flex items-center gap-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-2 py-1"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          )}

          {/* Avatar e Menu de Usuário / Botão Login */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Menu Mobile */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-menu"
                  aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>

                {/* Dropdown do Usuário */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="relative h-10 w-10 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      aria-label={`Menu do usuário ${user.nome}`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={user.foto_url} 
                          alt={`Foto de ${user.nome}`}
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getUserInitials(user.nome)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">{user.nome}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-primary/10 text-primary">
                        {user.role === 'aluno' ? 'Aluno' : 'Mentor'}
                      </span>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil (em breve)</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button asChild variant="default">
                <Link to="/login">Entrar</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Menu Mobile */}
        {user && mobileMenuOpen && (
          <nav 
            id="mobile-menu"
            className="md:hidden border-t border-border/50"
            aria-label="Menu de navegação móvel"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}