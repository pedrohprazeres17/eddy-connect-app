import { Mentor, AgendamentoInput, DataProvider, Grupo, CreateGrupoInput } from '@/types/mentor';
import { airtableClient, airtableCreate } from './airtableClient';

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

  async createSessao(input: { 
    mentorAirRecId: string; 
    alunoAirRecId: string; 
    inicioISO: string; 
    fimISO: string; 
    observacoes?: string; 
  }): Promise<{ ok: boolean; id?: string }> {
    try {
      const sessaoData = {
        mentor: [input.mentorAirRecId],
        aluno: [input.alunoAirRecId],
        inicio: input.inicioISO,
        fim: input.fimISO,
        status: 'solicitada',
        ...(input.observacoes ? { observacoes: input.observacoes } : {})
      };

      const response = await airtableClient.create(SESSOES_TABLE, sessaoData);
      
      return { 
        ok: true, 
        id: response.fields.record_id || response.id 
      };

    } catch (error) {
      const err = error instanceof Error ? error.message : 'Falha na operação. Tente novamente.';
      console.error('Airtable error:', err);
      return { ok: false };
    }
  }

  async listMinhasSessoes(currentUser: { airRecId: string; role: 'aluno' | 'mentor' }, status?: string): Promise<{ items: any[]; total: number }> {
    try {
      const isMentor = currentUser.role === 'mentor';
      const linkField = isMentor ? 'mentor' : 'aluno';
      
      const parts = [`FIND("${currentUser.airRecId}", ARRAYJOIN(${linkField}))`];
      if (status) parts.push(`{status}='${status}'`);
      const formula = parts.length > 1 ? `AND(${parts.join(',')})` : parts[0];
      
      const response = await airtableClient.list(SESSOES_TABLE, { 
        filterByFormula: formula, 
        sort: [{ field: 'inicio', direction: 'asc' }], 
        pageSize: 50 
      });

      return { 
        items: response.records,
        total: response.records.length 
      };

    } catch (error) {
      console.error('Erro ao buscar sessões:', error);
      throw error;
    }
  }

  async updateSessaoStatus(sessaoAirId: string, novoStatus: 'confirmada' | 'concluida' | 'cancelada'): Promise<{ ok: boolean }> {
    try {
      await airtableClient.update(SESSOES_TABLE, sessaoAirId, { status: novoStatus });
      return { ok: true };
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Falha na operação. Tente novamente.';
      console.error('Airtable error:', err);
      return { ok: false };
    }
  }

  async listGrupos(params?: { 
    q?: string; 
    pageSize?: number; 
    offset?: string;
  }): Promise<{ items: Grupo[]; total: number; offset?: string }> {
    const {
      q,
      pageSize = 20,
      offset
    } = params || {};

    const queryParams: any = { 
      pageSize, 
      sort: [{ field: 'nome', direction: 'asc' }] 
    };
    
    if (q) {
      queryParams.filterByFormula = `FIND(LOWER("${q}"), LOWER({nome} & ' ' & IF({descricao},{descricao},'')))`;
    }

    try {
      const response = await airtableClient.list(GRUPOS_TABLE, queryParams);

      const items: Grupo[] = response.records.map(record => ({
        id: record.fields.record_id || record.id,
        airtable_id: record.id, // ID interno do Airtable para operações
        nome: record.fields.nome,
        descricao: record.fields.descricao,
        owner_user_id: record.fields.owner_user?.[0] || '',
        membros: record.fields.membros || [],
        criado_em: record.fields.criado_em,
      }));

      return { 
        items, 
        total: items.length,
        offset: response.offset 
      };

    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      throw error;
    }
  }

  async createGrupo(input: CreateGrupoInput, currentUserAirRecId: string): Promise<{ ok: boolean; id?: string }> {
    const response = await airtableCreate(GRUPOS_TABLE, {
      nome: input.nome,
      ...(input.descricao ? { descricao: input.descricao } : {}),
      owner_user: [currentUserAirRecId], // recXXXX do usuário logado
      membros: [currentUserAirRecId],
    });
    
    return { 
      ok: true, 
      id: response.fields?.record_id || response.id 
    };
  }

  async entrarNoGrupo(grupoAirId: string, currentUserAirRecId: string): Promise<{ ok: boolean }> {
    try {
      const g = await airtableClient.getByRecordId(GRUPOS_TABLE, grupoAirId);
      
      if (!g) {
        throw new Error('Grupo não encontrado');
      }

      const membros = new Set((g.fields.membros || []).map((m: any) => m.id ?? m));
      membros.add(currentUserAirRecId);
      
      await airtableClient.update(GRUPOS_TABLE, grupoAirId, { 
        membros: Array.from(membros) 
      });

      return { ok: true };

    } catch (error) {
      const err = error instanceof Error ? error.message : 'Falha na operação. Tente novamente.';
      console.error('Airtable error:', err);
      return { ok: false };
    }
  }

  async getMeuMembership(grupo: any, currentUserRecId: string): Promise<{ 
    isMember: boolean; 
    isOwner: boolean; 
  }> {
    const membros = grupo.membros || [];
    const owner = grupo.owner_user_id;

    return {
      isMember: membros.includes(currentUserRecId),
      isOwner: owner === currentUserRecId
    };
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