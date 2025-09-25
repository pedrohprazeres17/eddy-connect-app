import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { airtableClient, createRecord } from '@/services/airtableClient';
import { sha256, verifyPassword } from '@/utils/crypto';
import { useToast } from '@/hooks/use-toast';
import { safeStorage } from '@/utils/safeStorage';
import { useAppNavigation } from '@/contexts/NavigationContext';

interface User {
  airRecId: string;        // ID REAL do Airtable (recXXXX) — usar em links!
  record_id?: string;      // opcional, só exibição
  email: string;
  nome: string;
  role: 'aluno' | 'mentor';
  foto_url?: string;
  areas?: string[];
  preco_hora?: number;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
}

interface SignupData {
  nome: string;
  email: string;
  password: string;
  role: 'aluno' | 'mentor';
  areas?: string[];
  preco_hora?: number;
  bio?: string;
  foto_url?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'educonnect_auth';
const USERS_TABLE = import.meta.env.VITE_AIRTABLE_USERS || 'Users';

interface StoredAuth {
  user: User;
  token: string;
}

// Função para mapear usuário do Airtable
function mapUser(rec: any): User {
  const f = rec.fields;
  return {
    airRecId: rec.id,           // ID REAL do Airtable (recXXXX) — usar em links!
    record_id: f.record_id,     // opcional, só exibição
    email: f.email,
    nome: f.nome,
    role: f.role,
    foto_url: f.foto_url ?? null,
    areas: f.areas || [],
    preco_hora: f.preco_hora,
    bio: f.bio,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { navigate, isReady: navigationReady } = useAppNavigation();
  const { toast } = useToast();

  // Carregar dados do localStorage na inicialização (sem validação assíncrona)
  useEffect(() => {
    // Limpeza de dados mock/seed antigos
    const keysToRemove = Object.keys(localStorage).filter(key => 
      key.startsWith('demo_user') || 
      key.startsWith('seed_data') || 
      key.startsWith('mock_')
    );
    keysToRemove.forEach(key => localStorage.removeItem(key));

    const storedAuth = safeStorage.get<StoredAuth>(STORAGE_KEY);
    if (storedAuth) {
      setUser(storedAuth.user);
      setToken(storedAuth.token);
    }
    setLoading(false);
  }, []);

  // Salvar no localStorage quando o estado mudar
  const saveToStorage = (userData: User, tokenData: string) => {
    const authData: StoredAuth = { user: userData, token: tokenData };
    safeStorage.set(STORAGE_KEY, authData);
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Buscar usuário por email (case insensitive)
      const emailLc = email.trim().toLowerCase();
      const rec = await airtableClient.findOne(USERS_TABLE, `LOWER({email})='${emailLc}'`);
      
      if (!rec) {
        throw new Error('E-mail não encontrado');
      }

      // Verificar senha
      const ok = (await sha256(password)) === (rec.fields?.password_hash ?? '');
      if (!ok) {
        throw new Error('Senha incorreta');
      }

      // Mapear usuário
      const user = {
        airRecId: rec.id,
        record_id: rec.fields?.record_id,
        email: rec.fields?.email,
        nome: rec.fields?.nome,
        role: rec.fields?.role,
        foto_url: rec.fields?.foto_url ?? null,
      };

      setUser(user);
      setToken('local');
      saveToStorage(user, 'local');
      
      // Evitar redirect recursivo - só redirecionar se navegação estiver pronta e não estiver já na rota de destino
      if (navigationReady) {
        const targetPath = user.role === 'aluno' ? '/home-aluno' : '/home-mentor';
        if (window.location.pathname !== targetPath) {
          navigate(targetPath);
        }
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível entrar.';
      console.error('Login error:', error);
      toast({
        title: "Erro no login",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (payload: SignupData) => {
    try {
      setLoading(true);

      const emailLc = payload.email.trim().toLowerCase();
      
      // 1) bloquear duplicidade por e-mail
      const dup = await airtableClient.findOne(USERS_TABLE, `LOWER({email})='${emailLc}'`);
      if (dup) throw new Error('E-mail já cadastrado');

      // 2) montar campos
      const password_hash = await sha256(payload.password);
      const fields: any = {
        email: payload.email,
        email_lc: emailLc, // se existir na base
        password_hash,
        role: payload.role,
        nome: payload.nome,
      };
      
      if (payload.role === 'mentor') {
        if (payload.areas?.length) fields.areas = payload.areas;
        if (payload.preco_hora != null) fields.preco_hora = Number(payload.preco_hora);
        if (payload.bio) fields.bio = payload.bio;
        if (payload.foto_url) fields.foto_url = payload.foto_url;
      }

      // 3) criar no Airtable (retorna um record)
      const created = await createRecord(USERS_TABLE, fields);
      if (!created?.id) throw new Error('Usuário criado sem ID válido');

      // 4) sucesso: mensagem e redirect para login (SEM auto-login)
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Faça login para continuar.",
      });
      
      // Navegar para login sem auto-login (só se navegação estiver pronta)
      if (navigationReady) {
        navigate('/login');
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível concluir o cadastro.';
      console.error('Signup error:', error);
      toast({
        title: "Erro no cadastro",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    safeStorage.del(STORAGE_KEY);
    
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export type { User, SignupData };