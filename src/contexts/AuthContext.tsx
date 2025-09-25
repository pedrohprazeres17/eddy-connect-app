import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { airtableClient } from '@/services/airtableClient';
import { sha256, verifyPassword } from '@/utils/crypto';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  record_id: string;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const storedAuth = localStorage.getItem(STORAGE_KEY);
    if (storedAuth) {
      try {
        const { user: storedUser, token: storedToken }: StoredAuth = JSON.parse(storedAuth);
        setUser(storedUser);
        setToken(storedToken);
      } catch (error) {
        console.error('Erro ao carregar dados de autenticação:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  // Salvar no localStorage quando o estado mudar
  const saveToStorage = (userData: User, tokenData: string) => {
    const authData: StoredAuth = { user: userData, token: tokenData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Buscar usuário por email (case insensitive)
      const emailLower = email.toLowerCase();
      const filterFormula = `LOWER({email}) = '${emailLower}'`;
      
      const users = await airtableClient.findByFilter(USERS_TABLE, filterFormula);
      
      if (users.length === 0) {
        throw new Error('E-mail não encontrado ou senha incorreta');
      }

      const userRecord = users[0];
      const { fields } = userRecord;

      // Verificar senha
      const passwordMatch = await verifyPassword(password, fields.password_hash);
      if (!passwordMatch) {
        throw new Error('E-mail não encontrado ou senha incorreta');
      }

      // Criar objeto de usuário
      const userData: User = {
        id: userRecord.id,
        record_id: fields.record_id || userRecord.id,
        email: fields.email,
        nome: fields.nome,
        role: fields.role,
        foto_url: fields.foto_url,
        areas: fields.areas || [],
        preco_hora: fields.preco_hora,
        bio: fields.bio,
      };

      // Gerar token simples (em produção usar JWT)
      const authToken = `auth_${userRecord.id}_${Date.now()}`;

      setUser(userData);
      setToken(authToken);
      saveToStorage(userData, authToken);

      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${userData.nome}!`,
      });

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro no login';
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

  const signup = async (userData: SignupData) => {
    try {
      setLoading(true);

      // Verificar se email já existe
      const emailLower = userData.email.toLowerCase();
      const existingUsers = await airtableClient.findByFilter(
        USERS_TABLE, 
        `LOWER({email}) = '${emailLower}'`
      );

      if (existingUsers.length > 0) {
        throw new Error('Este e-mail já está cadastrado');
      }

      // Hash da senha
      const passwordHash = await sha256(userData.password);

      // Preparar campos para criação
      const fields: Record<string, any> = {
        email: userData.email,
        password_hash: passwordHash,
        role: userData.role,
        nome: userData.nome,
      };

      // Campos específicos para mentores
      if (userData.role === 'mentor') {
        if (userData.areas && userData.areas.length > 0) {
          fields.areas = userData.areas;
        }
        if (userData.preco_hora && userData.preco_hora > 0) {
          fields.preco_hora = userData.preco_hora;
        }
        if (userData.bio) fields.bio = userData.bio;
        if (userData.foto_url) fields.foto_url = userData.foto_url;
      }

      // Criar usuário no Airtable
      const newUserRecord = await airtableClient.create(USERS_TABLE, fields);

      // Criar objeto de usuário completo
      const newUser: User = {
        id: newUserRecord.id,
        record_id: newUserRecord.fields.record_id || newUserRecord.id,
        email: newUserRecord.fields.email,
        nome: newUserRecord.fields.nome,
        role: newUserRecord.fields.role,
        foto_url: newUserRecord.fields.foto_url,
        areas: newUserRecord.fields.areas || [],
        preco_hora: newUserRecord.fields.preco_hora,
        bio: newUserRecord.fields.bio,
      };

      // Gerar token e fazer login automaticamente
      const authToken = `auth_${newUserRecord.id}_${Date.now()}`;
      
      setUser(newUser);
      setToken(authToken);
      saveToStorage(newUser, authToken);

      toast({
        title: "Conta criada com sucesso!",
        description: `Bem-vindo, ${newUser.nome}! Você já está logado.`,
      });

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro no cadastro';
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