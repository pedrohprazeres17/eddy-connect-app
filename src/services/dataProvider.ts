import { Mentor, AgendamentoInput, DataProvider } from '@/types/mentor';

// Mock data - 30 mentores para testes
const MOCK_MENTORES: Mentor[] = [
  {
    id: 'mentor-1',
    nome: 'Ana Silva',
    foto_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    areas: ['Front-end', 'UX/UI'],
    preco_hora: 80,
    bio: 'Desenvolvedora front-end com 8 anos de experiência em React, Vue e design systems. Especialista em criar interfaces acessíveis e experiências de usuário excepcionais.'
  },
  {
    id: 'mentor-2', 
    nome: 'Carlos Mendes',
    foto_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    areas: ['Back-end', 'DevOps'],
    preco_hora: 120,
    bio: 'Arquiteto de software sênior especializado em Node.js, Python e infraestrutura em nuvem. 10+ anos construindo sistemas escaláveis.'
  },
  {
    id: 'mentor-3',
    nome: 'Maria Santos',
    areas: ['UX/UI', 'Front-end'],
    preco_hora: 95,
    bio: 'Designer UX/UI com background em psicologia. Foco em pesquisa de usuário, prototipagem e design inclusivo.'
  },
  {
    id: 'mentor-4',
    nome: 'João Oliveira',
    foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    areas: ['Dados', 'Back-end'],
    preco_hora: 110,
    bio: 'Cientista de dados com expertise em machine learning, análise estatística e big data. PhD em Estatística Aplicada.'
  },
  {
    id: 'mentor-5',
    nome: 'Fernanda Costa',
    areas: ['Front-end', 'UX/UI'],
    preco_hora: 75,
    bio: 'Full-stack developer apaixonada por React e design. Mentora ativa na comunidade tech feminina.'
  },
  {
    id: 'mentor-6',
    nome: 'Ricardo Lima',
    foto_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    areas: ['DevOps', 'Back-end'],
    preco_hora: 130,
    bio: 'DevOps engineer com 12 anos de experiência. Especialista em AWS, Docker, Kubernetes e automação de infraestrutura.'
  },
  {
    id: 'mentor-7',
    nome: 'Juliana Ferreira',
    areas: ['Inglês', 'UX/UI'],
    preco_hora: 60,
    bio: 'Professora de inglês técnico para desenvolvedores. Fluente em 4 idiomas, com foco em comunicação para equipes internacionais.'
  },
  {
    id: 'mentor-8',
    nome: 'Pedro Rocha',
    foto_url: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150',
    areas: ['Front-end', 'Back-end'],
    preco_hora: 100,
    bio: 'Desenvolvedor full-stack com 7 anos de experiência. Especializado em JavaScript, TypeScript e arquiteturas modernas.'
  },
  {
    id: 'mentor-9',
    nome: 'Camila Rodrigues',
    areas: ['Dados', 'Back-end'],
    preco_hora: 85,
    bio: 'Engenheira de dados especializada em Python, SQL e pipelines de processamento. Experiência com Apache Spark e Kafka.'
  },
  {
    id: 'mentor-10',
    nome: 'Thiago Alves',
    foto_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    areas: ['DevOps', 'Back-end'],
    preco_hora: 115,
    bio: 'SRE (Site Reliability Engineer) com expertise em monitoramento, observabilidade e sistemas distribuídos.'
  },
  {
    id: 'mentor-11',
    nome: 'Beatriz Martins',
    areas: ['UX/UI'],
    preco_hora: 70,
    bio: 'Designer de produto com 6 anos de experiência. Foco em design systems, acessibilidade e research.'
  },
  {
    id: 'mentor-12',
    nome: 'Lucas Barbosa',
    foto_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150',
    areas: ['Front-end'],
    preco_hora: 90,
    bio: 'Especialista em React, Next.js e performance web. Contributor de projetos open source.'
  },
  {
    id: 'mentor-13',
    nome: 'Aline Campos',
    areas: ['Dados', 'Back-end'],
    preco_hora: 105,
    bio: 'Data scientist com background em matemática. Especializada em deep learning e visão computacional.'
  },
  {
    id: 'mentor-14',
    nome: 'Gabriel Santos',
    foto_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    areas: ['Back-end', 'DevOps'],
    preco_hora: 125,
    bio: 'Tech lead com experiência em arquiteturas de microserviços, APIs REST e GraphQL.'
  },
  {
    id: 'mentor-15',
    nome: 'Sofia Pereira',
    areas: ['Inglês'],
    preco_hora: 50,
    bio: 'Professora certificada TEFL/TESOL. Especializada em inglês para negócios e apresentações técnicas.'
  },
  {
    id: 'mentor-16',
    nome: 'Rodrigo Nunes',
    foto_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    areas: ['Front-end', 'UX/UI'],
    preco_hora: 95,
    bio: 'Frontend architect com foco em performance e acessibilidade. Palestrante em conferências internacionais.'
  },
  {
    id: 'mentor-17',
    nome: 'Larissa Dias',
    areas: ['Dados'],
    preco_hora: 80,
    bio: 'Analista de dados especializada em visualização e storytelling com dados. Expertise em Tableau e Power BI.'
  },
  {
    id: 'mentor-18',
    nome: 'André Sousa',
    foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    areas: ['DevOps'],
    preco_hora: 110,
    bio: 'Cloud architect certificado em AWS e Azure. Especialista em migração para nuvem e otimização de custos.'
  },
  {
    id: 'mentor-19',
    nome: 'Natália Lima',
    areas: ['UX/UI', 'Front-end'],
    preco_hora: 85,
    bio: 'Product designer com experiência em startups e grandes corporações. Foco em design centrado no usuário.'
  },
  {
    id: 'mentor-20',
    nome: 'Felipe Castro',
    foto_url: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150',
    areas: ['Back-end'],
    preco_hora: 100,
    bio: 'Backend developer especializado em Java, Spring Boot e arquiteturas event-driven.'
  },
  {
    id: 'mentor-21',
    nome: 'Isabela Moreira',
    areas: ['Front-end'],
    preco_hora: 75,
    bio: 'Desenvolvedora front-end apaixonada por CSS, animações e micro-interações. Especialista em Vue.js.'
  },
  {
    id: 'mentor-22',
    nome: 'Daniel Carvalho',
    foto_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    areas: ['Dados', 'Back-end'],
    preco_hora: 115,
    bio: 'ML engineer com experiência em MLOps, deployment de modelos e sistemas de recomendação.'
  },
  {
    id: 'mentor-23',
    nome: 'Carolina Freitas',
    areas: ['Inglês', 'UX/UI'],
    preco_hora: 65,
    bio: 'UX writer e professora de inglês técnico. Especializada em microcopy e comunicação clara.'
  },
  {
    id: 'mentor-24',
    nome: 'Bruno Silva',
    foto_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    areas: ['DevOps', 'Back-end'],
    preco_hora: 120,
    bio: 'Platform engineer com expertise em Terraform, GitOps e security. Evangelista de práticas DevSecOps.'
  },
  {
    id: 'mentor-25',
    nome: 'Vanessa Oliveira',
    areas: ['UX/UI'],
    preco_hora: 90,
    bio: 'Service designer com MBA em Innovation. Especializada em design thinking e transformação digital.'
  },
  {
    id: 'mentor-26',
    nome: 'Marcos Ribeiro',
    foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    areas: ['Front-end', 'Back-end'],
    preco_hora: 105,
    bio: 'CTO de startup fintech. Expertise em arquiteturas escaláveis, blockchain e sistemas de pagamento.'
  },
  {
    id: 'mentor-27',
    nome: 'Priscila Santos',
    areas: ['Dados'],
    preco_hora: 95,
    bio: 'Head of Data com 10+ anos de experiência. Especializada em estratégia de dados e gestão de equipes técnicas.'
  },
  {
    id: 'mentor-28',
    nome: 'Roberto Costa',
    foto_url: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150',
    areas: ['DevOps'],
    preco_hora: 135,
    bio: 'Principal engineer especializado em alta disponibilidade, disaster recovery e arquiteturas resilientes.'
  },
  {
    id: 'mentor-29',
    nome: 'Amanda Ferreira',
    areas: ['Front-end', 'UX/UI'],
    preco_hora: 80,
    bio: 'Creative developer com background em artes visuais. Especializada em WebGL, animações e experiências imersivas.'
  },
  {
    id: 'mentor-30',
    nome: 'Leonardo Machado',
    foto_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    areas: ['Back-end', 'Dados'],
    preco_hora: 110,
    bio: 'Software architect com PhD em Ciência da Computação. Especialista em algoritmos, estruturas de dados e otimização.'
  }
];

// Mock Provider Implementation
class MockProvider implements DataProvider {
  private delay(ms: number = 800): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async listMentores(params: {
    q?: string;
    areas?: string[];
    precoMin?: number;
    precoMax?: number;
    order?: 'preco_asc' | 'preco_desc';
    page?: number;
    pageSize?: number;
  }): Promise<{ items: Mentor[]; total: number }> {
    await this.delay();

    const {
      q = '',
      areas = [],
      precoMin,
      precoMax,
      order,
      page = 1,
      pageSize = 12
    } = params;

    let filtered = [...MOCK_MENTORES];

    // Filtro por busca (nome ou bio)
    if (q.trim()) {
      const searchTerm = q.toLowerCase().trim();
      filtered = filtered.filter(mentor =>
        mentor.nome.toLowerCase().includes(searchTerm) ||
        (mentor.bio?.toLowerCase().includes(searchTerm) ?? false)
      );
    }

    // Filtro por áreas
    if (areas.length > 0) {
      filtered = filtered.filter(mentor =>
        areas.some(area => mentor.areas.includes(area))
      );
    }

    // Filtro por preço
    if (precoMin !== undefined) {
      filtered = filtered.filter(mentor =>
        mentor.preco_hora !== undefined && mentor.preco_hora >= precoMin
      );
    }

    if (precoMax !== undefined) {
      filtered = filtered.filter(mentor =>
        mentor.preco_hora !== undefined && mentor.preco_hora <= precoMax
      );
    }

    // Ordenação
    if (order === 'preco_asc') {
      filtered.sort((a, b) => (a.preco_hora || 0) - (b.preco_hora || 0));
    } else if (order === 'preco_desc') {
      filtered.sort((a, b) => (b.preco_hora || 0) - (a.preco_hora || 0));
    }

    const total = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const items = filtered.slice(startIndex, startIndex + pageSize);

    return { items, total };
  }

  async getMentorById(id: string): Promise<Mentor | null> {
    await this.delay(400);
    return MOCK_MENTORES.find(mentor => mentor.id === id) || null;
  }

  async createSessao(input: AgendamentoInput): Promise<{ ok: boolean; id?: string }> {
    await this.delay(1000);
    
    // Mock: sempre retorna sucesso
    console.log('Mock: Criando sessão:', input);
    return { 
      ok: true, 
      id: `sessao-${Date.now()}` 
    };
  }
}

/* 
TODO: Implementação Airtable (ativar quando necessário)

import { airtableClient } from './airtableClient';

const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const USERS_TABLE = import.meta.env.VITE_AIRTABLE_USERS || 'Users';
const SESSOES_TABLE = import.meta.env.VITE_AIRTABLE_SESSOES || 'Sessoes';

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
      q,
      areas = [],
      precoMin,
      precoMax,
      order,
      page = 1,
      pageSize = 12
    } = params;

    // Construir filterByFormula
    let filters: string[] = ["{role} = 'mentor'"];
    
    if (q?.trim()) {
      const searchTerm = q.toLowerCase();
      filters.push(`FIND('${searchTerm}', LOWER({nome} & ' ' & IF({bio}, {bio}, '')))`);
    }

    if (areas.length > 0) {
      const areaFilters = areas.map(area => `FIND('${area}', ARRAYJOIN({areas}, ','))`);
      filters.push(`OR(${areaFilters.join(', ')})`);
    }

    if (precoMin !== undefined) {
      filters.push(`{preco_hora} >= ${precoMin}`);
    }

    if (precoMax !== undefined) {
      filters.push(`{preco_hora} <= ${precoMax}`);
    }

    const filterByFormula = filters.length > 1 ? `AND(${filters.join(', ')})` : filters[0];

    // Construir sort
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
        // TODO: Implementar offset real baseado na página
      });

      const items: Mentor[] = response.records.map(record => ({
        id: record.fields.record_id || record.id,
        nome: record.fields.nome,
        foto_url: record.fields.foto_url,
        areas: record.fields.areas || [],
        preco_hora: record.fields.preco_hora,
        bio: record.fields.bio,
      }));

      // TODO: Para paginação real, precisaríamos de multiple requests ou usar getAllRecords
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
        `AND({role} = 'mentor', OR({record_id} = '${id}', RECORD_ID() = '${id}'))`
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
        mentor: [input.mentorId], // Link field expects array of record IDs
        aluno: [input.alunoId],   // Link field expects array of record IDs
        inicio: input.inicio,     // ISO string -> DateTime
        fim: input.fim,          // ISO string -> DateTime
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
}
*/

// Factory function
export function getDataProvider(mode: 'mock' | 'airtable' = 'mock'): DataProvider {
  switch (mode) {
    case 'mock':
      return new MockProvider();
    case 'airtable':
      // TODO: Descomentar quando implementar AirtableProvider
      // return new AirtableProvider();
      throw new Error('AirtableProvider não implementado ainda. Use mode="mock".');
    default:
      return new MockProvider();
  }
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