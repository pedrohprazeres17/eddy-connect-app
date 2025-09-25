import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { SignupData } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface LoginFormData {
  email: string;
  password: string;
}

interface SignupFormData {
  nome: string;
  email: string;
  password: string;
  role: 'aluno' | 'mentor';
  areas: string[];
  preco_hora: string;
  bio: string;
  foto_url: string;
}

const AREAS_OPCOES = [
  'Matemática', 'Física', 'Química', 'Biologia', 'História', 'Geografia',
  'Português', 'Inglês', 'Filosofia', 'Sociologia', 'Programação', 'Design',
  'Marketing', 'Administração', 'Contabilidade', 'Economia', 'Psicologia'
];

export default function Login() {
  const { user, login, signup, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [loginForm, setLoginForm] = useState<LoginFormData>({
    email: '',
    password: ''
  });

  const [signupForm, setSignupForm] = useState<SignupFormData>({
    nome: '',
    email: '',
    password: '',
    role: 'aluno',
    areas: [],
    preco_hora: '',
    bio: '',
    foto_url: ''
  });

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate(user.role === 'aluno' ? '/home-aluno' : '/home-mentor', { replace: true });
      }
    }
  }, [user, navigate, location.state]);

  const validateLoginForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!loginForm.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!loginForm.password) {
      newErrors.password = 'Senha é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignupForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!signupForm.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!signupForm.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupForm.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!signupForm.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (signupForm.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (signupForm.role === 'mentor') {
      if (signupForm.areas.length === 0) {
        newErrors.areas = 'Selecione pelo menos uma área de conhecimento';
      }

      const precoHora = parseFloat(signupForm.preco_hora);
      if (!signupForm.preco_hora || isNaN(precoHora) || precoHora <= 0) {
        newErrors.preco_hora = 'Preço por hora deve ser maior que zero';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm()) return;

    try {
      setFormLoading(true);
      await login(loginForm.email, loginForm.password);
    } catch (error) {
      // Erro já tratado no contexto com toast
    } finally {
      setFormLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSignupForm()) return;

    try {
      setFormLoading(true);
      
      const signupData: SignupData = {
        nome: signupForm.nome.trim(),
        email: signupForm.email.trim(),
        password: signupForm.password,
        role: signupForm.role,
      };

      if (signupForm.role === 'mentor') {
        signupData.areas = signupForm.areas;
        signupData.preco_hora = parseFloat(signupForm.preco_hora);
        if (signupForm.bio.trim()) signupData.bio = signupForm.bio.trim();
        if (signupForm.foto_url.trim()) signupData.foto_url = signupForm.foto_url.trim();
      }

      await signup(signupData);
    } catch (error) {
      // Erro já tratado no contexto com toast
    } finally {
      setFormLoading(false);
    }
  };

  const toggleArea = (area: string) => {
    setSignupForm(prev => ({
      ...prev,
      areas: prev.areas.includes(area)
        ? prev.areas.filter(a => a !== area)
        : [...prev.areas, area]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 text-2xl font-bold text-gradient-brand mb-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
          >
            <GraduationCap className="w-8 h-8 text-primary" />
            EduConnect
          </Link>
          <p className="text-muted-foreground">
            Conectando alunos e mentores para o aprendizado
          </p>
        </div>

        {/* Formulários */}
        <Card className="gradient-surface shadow-card">
          <CardHeader className="text-center pb-4">
            <CardTitle>Acesse sua conta</CardTitle>
            <CardDescription>
              Entre com suas credenciais ou crie uma conta nova
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar conta</TabsTrigger>
              </TabsList>

              {/* Tab de Login */}
              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-mail</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                      className={cn(errors.email && "border-destructive")}
                      autoComplete="email"
                      autoFocus
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive" role="alert" aria-live="polite">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        className={cn(errors.password && "border-destructive", "pr-10")}
                        autoComplete="current-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive" role="alert" aria-live="polite">
                        {errors.password}
                      </p>
                    )}
                  </div>

            <Button 
              type="submit" 
              className="w-full"
              variant="hero"
              disabled={formLoading}
            >
                    {formLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Tab de Cadastro */}
              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-nome">Nome completo</Label>
                    <Input
                      id="signup-nome"
                      type="text"
                      value={signupForm.nome}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, nome: e.target.value }))}
                      className={cn(errors.nome && "border-destructive")}
                      autoComplete="name"
                    />
                    {errors.nome && (
                      <p className="text-sm text-destructive" role="alert" aria-live="polite">
                        {errors.nome}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">E-mail</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                      className={cn(errors.email && "border-destructive")}
                      autoComplete="email"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive" role="alert" aria-live="polite">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        value={signupForm.password}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                        className={cn(errors.password && "border-destructive", "pr-10")}
                        autoComplete="new-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive" role="alert" aria-live="polite">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label>Tipo de conta</Label>
                    <RadioGroup
                      value={signupForm.role}
                      onValueChange={(value: 'aluno' | 'mentor') => 
                        setSignupForm(prev => ({ ...prev, role: value }))
                      }
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="aluno" id="role-aluno" />
                        <Label htmlFor="role-aluno">Aluno</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mentor" id="role-mentor" />
                        <Label htmlFor="role-mentor">Mentor</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Campos específicos para mentores */}
                  {signupForm.role === 'mentor' && (
                    <>
                      <div className="space-y-2">
                        <Label>Áreas de conhecimento</Label>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                          {AREAS_OPCOES.map((area) => (
                            <Badge
                              key={area}
                              variant={signupForm.areas.includes(area) ? "default" : "outline"}
                              className="cursor-pointer transition-colors"
                              onClick={() => toggleArea(area)}
                            >
                              {area}
                            </Badge>
                          ))}
                        </div>
                        {errors.areas && (
                          <p className="text-sm text-destructive" role="alert" aria-live="polite">
                            {errors.areas}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="preco-hora">Preço por hora (R$)</Label>
                        <Input
                          id="preco-hora"
                          type="number"
                          min="0"
                          step="0.01"
                          value={signupForm.preco_hora}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, preco_hora: e.target.value }))}
                          className={cn(errors.preco_hora && "border-destructive")}
                        />
                        {errors.preco_hora && (
                          <p className="text-sm text-destructive" role="alert" aria-live="polite">
                            {errors.preco_hora}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Biografia (opcional)</Label>
                        <Textarea
                          id="bio"
                          value={signupForm.bio}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, bio: e.target.value }))}
                          placeholder="Conte um pouco sobre sua experiência e método de ensino..."
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="foto-url">URL da foto (opcional)</Label>
                        <Input
                          id="foto-url"
                          type="url"
                          value={signupForm.foto_url}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, foto_url: e.target.value }))}
                          placeholder="https://exemplo.com/foto.jpg"
                        />
                      </div>
                    </>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full"
                    variant="hero"
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Criando conta...
                      </>
                    ) : (
                      'Criar conta'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}