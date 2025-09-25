export type Role = 'aluno' | 'mentor';

export interface Mentor {
  id: string;            // record_id (quando for Airtable)
  nome: string;
  foto_url?: string;
  areas: string[];       // Multiple select
  preco_hora?: number;   // BRL
  bio?: string;
}

export interface AgendamentoInput {
  mentorId: string;
  alunoId: string;       // do AuthContext
  inicio: string;        // ISO: 2025-09-25T19:00
  fim: string;           // ISO
  observacoes?: string;
}

export interface Grupo {
  id: string;              // record_id (Airtable)
  airtable_id?: string;    // ID interno do Airtable para operações
  nome: string;
  descricao?: string;
  owner_user_id: string;   // record_id do usuário
  membros: string[];       // array de record_id de Users
  criado_em?: string;      // ISO opcional
}

export interface CreateGrupoInput {
  nome: string;
  descricao?: string;
}

export interface DataProvider {
  listMentores(params: {
    q?: string;
    areas?: string[];
    precoMin?: number;
    precoMax?: number;
    order?: 'preco_asc' | 'preco_desc';
    page?: number;       // 1-based
    pageSize?: number;   // default 12
  }): Promise<{ items: Mentor[]; total: number }>;

  getMentorById(id: string): Promise<Mentor | null>;

  createSessao(input: AgendamentoInput): Promise<{ ok: boolean; id?: string }>;

  listGrupos(params?: { 
    q?: string; 
    pageSize?: number;
    offset?: string;
  }): Promise<{ items: Grupo[]; total: number; offset?: string }>;

  createGrupo(input: CreateGrupoInput, ownerUserId: string): Promise<{ ok: boolean; id?: string }>;

  entrarNoGrupo(grupoAirtableId: string, currentUserRecId: string): Promise<{ ok: boolean }>;

  getMeuMembership(grupo: any, currentUserRecId: string): Promise<{ 
    isMember: boolean; 
    isOwner: boolean; 
  }>;

  getGrupoById(id: string): Promise<Grupo | null>;
}