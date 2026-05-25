
import { Sector, SectorHistoryData } from '../../shared/types';

const API_BASE = '/api';

async function fetchAPI&lt;T&gt;(endpoint: string, options?: RequestInit): Promise&lt;T&gt; {
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
  async getSectors(): Promise&lt;Sector[]&gt; {
    return fetchAPI&lt;Sector[]&gt;('/sectors');
  },

  async getSector(id: string): Promise&lt;Sector&gt; {
    return fetchAPI&lt;Sector&gt;(`/sectors/${id}`);
  },

  async getSectorHistory(id: string): Promise&lt;SectorHistoryData[]&gt; {
    return fetchAPI&lt;SectorHistoryData[]&gt;(`/sectors/${id}/history`);
  },

  async scrapeData(): Promise&lt;{ sectorCount: number }&gt; {
    return fetchAPI&lt;{ sectorCount: number }&gt;('/sectors/scrape', {
      method: 'POST'
    });
  }
};
