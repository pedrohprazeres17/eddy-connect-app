const API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}`;

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

class AirtableClient {
  private headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  };

  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        ...this.headers,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error?.message || error.error || 'Erro na requisição');
    }

    return response.json();
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

export const airtableClient = new AirtableClient();
export type { AirtableRecord, AirtableResponse, ListParams };