import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { airtableClient } from '@/services/airtableClient';
import { sha256, verifyPassword } from '@/utils/crypto';
import { useToast } from '@/hooks/use-toast';

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

// Helper para converter qualquer coisa para string
function asString(x: any): string {
  return typeof x === 'string' ? x : Array.isArray(x) ? String(x[0] ?? '') : x ? String(x) : '';
}

// Função para mapear usuário do Airtable
function mapUser(rec: any): User {
  const f = rec?.fields ?? {};
  return {
    airRecId: rec?.id,                    // recXXXX — usar para links
    record_id: asString(f.record_id),     // opcional (fórmula)
    email: asString(f.email),
    nome: asString(f.nome),
    role: asString(f.role) as 'aluno' | 'mentor',  // Single select -> string
    foto_url: asString(f.foto_url) || null,
    areas: f.areas || [],
    preco_hora: f.preco_hora,
    bio: f.bio,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Carregar dados do localStorage na inicialização com validação Airtable
  useEffect(() => {
    const initializeAuth = async () => {
      // Limpeza de dados mock/seed antigos
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.startsWith('demo_user') || 
        key.startsWith('seed_data') || 
        key.startsWith('mock_')
      );
      keysToRemove.forEach(key => localStorage.removeItem(key));

      const storedAuth = localStorage.getItem(STORAGE_KEY);
      if (storedAuth) {
        try {
          const { user: storedUser, token: storedToken }: StoredAuth = JSON.parse(storedAuth);
          
            // Validar se o usuário ainda existe no Airtable
            try {
              const userExists = await airtableClient.findOne(
                USERS_TABLE, 
                `RECORD_ID() = '${storedUser.airRecId}'`
              );
              
              if (userExists) {
                setUser(storedUser);
                setToken(storedToken);
              } else {
                // Usuário não existe mais, fazer logout
                localStorage.removeItem(STORAGE_KEY);
                toast({
                  title: "Sessão expirada",
                  description: "Sua conta não foi encontrada. Faça login novamente.",
                  variant: "destructive",
                });
              }
          } catch (validationError) {
            console.error('Erro ao validar usuário:', validationError);
            // Em caso de erro na validação, manter o usuário logado mas avisar
            setUser(storedUser);
            setToken(storedToken);
          }
        } catch (error) {
          console.error('Erro ao carregar dados de autenticação:', error);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [toast]);

  // Salvar no localStorage quando o estado mudar
  const saveToStorage = (userData: User, tokenData: string) => {
    const authData: StoredAuth = { user: userData, token: tokenData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
  };

  const login = async (email: string, senha: string) => {
    setLoading(true);
    try {
      const emailLc = email.trim().toLowerCase();
      const rec = await airtableClient.findOne(USERS_TABLE, `LOWER({email})='${emailLc}'`);
      
      if (!rec) throw new Error('E-mail não encontrado');
      
      const ok = (await sha256(senha)) === (rec.fields?.password_hash ?? '');
      if (!ok) throw new Error('Senha incorreta');
      
      const user = mapUser(rec);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token: 'local' }));
      setUser(user);
      setToken('local');

      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${user.nome}!`,
      });

      // Navegação por role
      navigate(user.role === 'aluno' ? '/home-aluno' : '/home-mentor');

    } catch (e: any) {
      console.error('Login error:', e);
      toast({
        title: "Erro no login",
        description: e?.message || 'Não foi possível entrar.',
        variant: "destructive",
      });
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (payload: SignupData) => {
    setLoading(true);
    try {
      const emailLc = payload.email.trim().toLowerCase();
      // Bloqueia duplicidade
      const dup = await airtableClient.findOne(USERS_TABLE, `LOWER({email})='${emailLc}'`);
      if (dup) throw new Error('E-mail já cadastrado');

      const password_hash = await sha256(payload.password);
      const fields: any = {
        email: payload.email,
        email_lc: emailLc,      // se existir na base
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

      const created = await airtableClient.create(USERS_TABLE, fields);  // <- 1 record
      const user = mapUser(created);                                     // <- mapeia direto

      if (!user?.airRecId) throw new Error('Usuário criado, mas sem id válido');

      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token: 'local' }));
      setUser(user);
      setToken('local');
      
      toast({
        title: "Conta criada! Você já está logado.",
        description: `Bem-vindo, ${user.nome}!`,
      });

      // Navegação por role
      navigate(user.role === 'aluno' ? '/home-aluno' : '/home-mentor');

    } catch (e: any) {
      console.error('Signup/auto-login error:', e);
      toast({
        title: "Erro no cadastro",
        description: e?.message || 'Não foi possível criar sua conta.',
        variant: "destructive",
      });
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
    
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