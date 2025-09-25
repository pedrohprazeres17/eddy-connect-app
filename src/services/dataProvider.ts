import { Mentor, AgendamentoInput, DataProvider, Grupo, CreateGrupoInput } from '@/types/mentor';
import { airtableClient } from './airtableClient';

const USERS_TABLE = import.meta.env.VITE_AIRTABLE_USERS || 'Users';
const SESSOES_TABLE = import.meta.env.VITE_AIRTABLE_SESSOES || 'Sessoes';
const GRUPOS_TABLE = import.meta.env.VITE_AIRTABLE_GRUPOS || 'Grupos';

class AirtableProvider implements DataProvider {
  async listMentores(params: {
    q?: string;
    areas?: string[];
    precoMin?: number;
    precoMax?: number;
    order?: 'preco_asc' | 'preco_desc';
    page?: number;
    pageSize?: number;
  }): Promise<{ items: Mentor[]; total: number }> {
    const {
      q = '',
      areas = [],
      precoMin,
      precoMax,
      order,
      page = 1,
      pageSize = 12
    } = params;

    let filters: string[] = ['{role} = "mentor"'];

    // Filtro por busca (nome ou bio)
    if (q.trim()) {
      const searchTerm = q.toLowerCase();
      filters.push(`FIND('${searchTerm}', LOWER({nome} & ' ' & IF({bio}, {bio}, '')))`);
    }

    // Filtro por áreas
    if (areas.length > 0) {
      const areaFilters = areas.map(area => `FIND('${area}', ARRAYJOIN({areas}, ','))`);
      filters.push(`OR(${areaFilters.join(', ')})`);
    }

    // Filtro por preço
    if (precoMin !== undefined) {
      filters.push(`{preco_hora} >= ${precoMin}`);
    }
    if (precoMax !== undefined) {
      filters.push(`{preco_hora} <= ${precoMax}`);
    }

    const filterByFormula = `AND(${filters.join(', ')})`;

    // Ordenação
    const sort = order === 'preco_asc' 
      ? [{ field: 'preco_hora', direction: 'asc' as const }]
      : order === 'preco_desc'
      ? [{ field: 'preco_hora', direction: 'desc' as const }]
      : [{ field: 'nome', direction: 'asc' as const }];

    try {
      const response = await airtableClient.list(USERS_TABLE, {
        filterByFormula,
        sort,
        pageSize,
      });

      const items: Mentor[] = response.records.map(record => ({
        id: record.fields.record_id || record.id,
        nome: record.fields.nome,
        foto_url: record.fields.foto_url,
        areas: record.fields.areas || [],
        preco_hora: record.fields.preco_hora,
        bio: record.fields.bio,
      }));

      return { items, total: items.length };

    } catch (error) {
      console.error('Erro ao buscar mentores:', error);
      throw error;
    }
  }

  async getMentorById(id: string): Promise<Mentor | null> {
    try {
      const response = await airtableClient.findByFilter(
        USERS_TABLE,
        `AND({role} = "mentor", OR({record_id} = '${id}', RECORD_ID() = '${id}'))`
      );

      if (response.length === 0) return null;

      const record = response[0];
      return {
        id: record.fields.record_id || record.id,
        nome: record.fields.nome,
        foto_url: record.fields.foto_url,
        areas: record.fields.areas || [],
        preco_hora: record.fields.preco_hora,
        bio: record.fields.bio,
      };

    } catch (error) {
      console.error('Erro ao buscar mentor:', error);
      return null;
    }
  }

  async createSessao(input: AgendamentoInput): Promise<{ ok: boolean; id?: string }> {
    try {
      const sessaoData = {
        mentor: [input.mentorId],
        aluno: [input.alunoId],
        inicio: input.inicio,
        fim: input.fim,
        status: 'solicitada',
        observacoes: input.observacoes || '',
      };

      const response = await airtableClient.create(SESSOES_TABLE, sessaoData);
      
      return { 
        ok: true, 
        id: response.fields.record_id || response.id 
      };

    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      return { ok: false };
    }
  }

  async listGrupos(params?: { 
    q?: string; 
    page?: number; 
    pageSize?: number 
  }): Promise<{ items: Grupo[]; total: number }> {
    const {
      q,
      page = 1,
      pageSize = 12
    } = params || {};

    // Construir filterByFormula
    let filters: string[] = [];
    
    if (q?.trim()) {
      const searchTerm = q.toLowerCase();
      filters.push(`FIND('${searchTerm}', LOWER({nome} & ' ' & IF({descricao}, {descricao}, '')))`);
    }

    const filterByFormula = filters.length > 0 ? filters.join(' AND ') : undefined;

    try {
      const response = await airtableClient.list(GRUPOS_TABLE, {
        filterByFormula,
        sort: [{ field: 'nome', direction: 'asc' }],
        pageSize,
      });

      const items: Grupo[] = response.records.map(record => ({
        id: record.fields.record_id || record.id,
        nome: record.fields.nome,
        descricao: record.fields.descricao,
        owner_user_id: record.fields.owner_user?.[0] || '',
        membros: record.fields.membros || [],
        criado_em: record.fields.criado_em,
      }));

      return { items, total: items.length };

    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      throw error;
    }
  }

  async createGrupo(input: CreateGrupoInput, ownerUserId: string): Promise<{ ok: boolean; id?: string }> {
    try {
      const grupoData = {
        nome: input.nome.trim(),
        descricao: input.descricao?.trim() || '',
        owner_user: [ownerUserId],
        membros: [ownerUserId],
      };

      const response = await airtableClient.create(GRUPOS_TABLE, grupoData);
      
      return { 
        ok: true, 
        id: response.fields.record_id || response.id 
      };

    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      return { ok: false };
    }
  }

  async getGrupoById(id: string): Promise<Grupo | null> {
    try {
      const response = await airtableClient.findByFilter(
        GRUPOS_TABLE,
        `OR({record_id} = '${id}', RECORD_ID() = '${id}')`
      );

      if (response.length === 0) return null;

      const record = response[0];
      return {
        id: record.fields.record_id || record.id,
        nome: record.fields.nome,
        descricao: record.fields.descricao,
        owner_user_id: record.fields.owner_user?.[0] || '',
        membros: record.fields.membros || [],
        criado_em: record.fields.criado_em,
      };

    } catch (error) {
      console.error('Erro ao buscar grupo:', error);
      return null;
    }
  }
}

// Factory function - apenas Airtable
export function getDataProvider(): DataProvider {
  return new AirtableProvider();
}

// Export constants
export const AREAS_DISPONIVEIS = [
  'Front-end',
  'Back-end', 
  'UX/UI',
  'Dados',
  'Inglês',
  'DevOps'
] as const;