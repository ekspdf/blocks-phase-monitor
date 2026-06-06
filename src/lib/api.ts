import { Sector, SectorHistoryData } from '../../shared/types';

const API_BASE = '/api';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || '请求失败');
  }

  return result.data;
}

export const api = {
  async getSectors(): Promise<Sector[]> {
    return fetchAPI<Sector[]>('/sectors');
  },

  async getSector(id: string): Promise<Sector> {
    return fetchAPI<Sector>(`/sectors/${id}`);
  },

  async getSectorHistory(id: string): Promise<SectorHistoryData[]> {
    return fetchAPI<SectorHistoryData[]>(`/sectors/${id}/history`);
  },

  async scrapeData(): Promise<{ sectorCount: number }> {
    return fetchAPI<{ sectorCount: number }>('/sectors/scrape', {
      method: 'POST'
    });
  }
};
