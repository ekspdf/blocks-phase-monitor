
import { create } from 'zustand';
import { Sector, SectorHistoryData } from '../../shared/types';
import { api } from '../lib/api';

interface SectorStore {
  sectors: Sector[];
  selectedSectors: string[];
  historyData: Record&lt;string, SectorHistoryData[]&gt;;
  loading: boolean;
  error: string | null;
  
  fetchSectors: () =&gt; Promise&lt;void&gt;;
  fetchSectorHistory: (id: string) =&gt; Promise&lt;void&gt;;
  toggleSectorSelection: (id: string) =&gt; void;
  clearSelection: () =&gt; void;
  refreshData: () =&gt; Promise&lt;void&gt;;
}

export const useSectorStore = create&lt;SectorStore&gt;((set, get) =&gt; ({
  sectors: [],
  selectedSectors: [],
  historyData: {},
  loading: false,
  error: null,

  fetchSectors: async () =&gt; {
    set({ loading: true, error: null });
    try {
      const sectors = await api.getSectors();
      set({ sectors, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchSectorHistory: async (id: string) =&gt; {
    try {
      const history = await api.getSectorHistory(id);
      set(state =&gt; ({
        historyData: {
          ...state.historyData,
          [id]: history
        }
      }));
    } catch (error) {
      console.error('获取历史数据失败:', error);
    }
  },

  toggleSectorSelection: (id: string) =&gt; {
    set(state =&gt; {
      const isSelected = state.selectedSectors.includes(id);
      return {
        selectedSectors: isSelected
          ? state.selectedSectors.filter(s =&gt; s !== id)
          : [...state.selectedSectors, id]
      };
    });
  },

  clearSelection: () =&gt; {
    set({ selectedSectors: [] });
  },

  refreshData: async () =&gt; {
    set({ loading: true, error: null });
    try {
      await api.scrapeData();
      const sectors = await api.getSectors();
      set({ sectors, loading: false, historyData: {} });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  }
}));
