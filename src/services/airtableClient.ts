const API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}/`;
const HEADERS = { 
  'Authorization': `Bearer ${API_KEY}`, 
  'Content-Type': 'application/json' 
};

interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  createdTime: string;
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

interface ListParams {
  pageSize?: number;
  view?: string;
  filterByFormula?: string;
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  offset?: string;
}

async function fetchJson(path: string, init?: RequestInit) {
  try {
    const response = await fetch(BASE_URL + path, { 
      ...init, 
      headers: { ...HEADERS, ...init?.headers } 
    });
    
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Erro ao parsear JSON da resposta:', jsonError);
      data = null;
    }
    
    if (!response.ok) {
      console.error(`Airtable error ${response.status}:`, data);
      const errorMessage = data?.error?.message || 
                          data?.error || 
                          `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }
    
    return data;
  } catch (error) {
    if (error instanceof Error && error.message.includes('fetch')) {
      throw new Error('Erro de conexão: Verifique sua internet e configurações do Airtable');
    }
    throw error;
  }
}

class AirtableClient {
  private headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  };

  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    return fetchJson(url, options);
  }

  async list(table: string, params: ListParams = {}): Promise<AirtableResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString());
    if (params.view) searchParams.set('view', params.view);
    if (params.filterByFormula) searchParams.set('filterByFormula', params.filterByFormula);
    if (params.offset) searchParams.set('offset', params.offset);
    
    if (params.sort) {
      params.sort.forEach((sort, index) => {
        searchParams.set(`sort[${index}][field]`, sort.field);
        searchParams.set(`sort[${index}][direction]`, sort.direction);
      });
    }

    const queryString = searchParams.toString();
    const url = `/${table}${queryString ? `?${queryString}` : ''}`;
    
    return this.request<AirtableResponse>(url);
  }

  async create(table: string, fields: Record<string, any>): Promise<AirtableRecord> {
    const response = await this.request<{ records: AirtableRecord[] }>(`/${table}`, {
      method: 'POST',
      body: JSON.stringify({ fields }),
    });
    
    return response.records[0];
  }

  async update(table: string, id: string, fields: Record<string, any>): Promise<AirtableRecord> {
    const response = await this.request<AirtableRecord>(`/${table}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ fields }),
    });
    
    return response;
  }

  async findByFilter(table: string, formula: string): Promise<AirtableRecord[]> {
    const response = await this.list(table, { 
      filterByFormula: formula,
      pageSize: 100 
    });
    
    return response.records;
  }

  async findOne(table: string, formula: string): Promise<AirtableRecord | null> {
    const records = await this.findByFilter(table, formula);
    return records.length > 0 ? records[0] : null;
  }

  async getByRecordId(table: string, recordId: string): Promise<AirtableRecord | null> {
    return this.findOne(table, `RECORD_ID() = '${recordId}'`);
  }

  async getAllRecords(table: string, params: Omit<ListParams, 'offset'> = {}): Promise<AirtableRecord[]> {
    let allRecords: AirtableRecord[] = [];
    let offset: string | undefined;

    do {
      const response = await this.list(table, { ...params, offset, pageSize: 100 });
      allRecords = [...allRecords, ...response.records];
      offset = response.offset;
    } while (offset && allRecords.length < 1000); // Limite de segurança

    return allRecords;
  }
}

// Helper único para criação no Airtable - retorna um único record (não array)
export async function createRecord(table: string, fields: any) {
  const response = await fetchJson(`${encodeURIComponent(table)}`, {
    method: 'POST',
    body: JSON.stringify({ fields })
  });
  
  // Airtable POST retorna: { id, fields, createdTime } - um único record
  // Não { records: [...] }
  return response;
}

// Nova API mais robusta
export const airtable = {
  list: (table: string, params: any = {}) => {
    const q = new URLSearchParams();
    if (params.view) q.set('view', params.view);
    if (params.filterByFormula) q.set('filterByFormula', params.filterByFormula);
    if (params.pageSize) q.set('pageSize', String(params.pageSize));
    if (params.sort) params.sort.forEach((s: any, i: number) => { 
      q.set(`sort[${i}][field]`, s.field); 
      q.set(`sort[${i}][direction]`, s.direction || 'asc'); 
    });
    if (params.offset) q.set('offset', params.offset);
    return fetchJson(`${encodeURIComponent(table)}?${q.toString()}`);
  },
  create: (table: string, fields: any) => fetchJson(encodeURIComponent(table), { 
    method: 'POST', 
    body: JSON.stringify({ fields }) 
  }),
  update: (table: string, id: string, fields: any) => fetchJson(`${encodeURIComponent(table)}/${id}`, { 
    method: 'PATCH', 
    body: JSON.stringify({ fields }) 
  }),
  findOne: (table: string, formula: string) => fetchJson(`${encodeURIComponent(table)}?filterByFormula=${encodeURIComponent(formula)}&pageSize=1`)
    .then((d: any) => d?.records?.[0]),
  getById: (table: string, id: string) => fetchJson(`${encodeURIComponent(table)}/${id}`),
};

export const airtableClient = new AirtableClient();
export type { AirtableRecord, AirtableResponse, ListParams };