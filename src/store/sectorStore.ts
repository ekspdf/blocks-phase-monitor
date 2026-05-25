import { create } from 'zustand';
import { Sector, SectorHistoryData } from '../../shared/types';
import { api } from '../lib/api';

interface SectorStore {
  sectors: Sector[];
  selectedSectors: string[];
  historyData: Record<string, SectorHistoryData[]>;
  loading: boolean;
  error: string | null;
  
  fetchSectors: () => Promise<void>;
  fetchSectorHistory: (id: string) => Promise<void>;
  toggleSectorSelection: (id: string) => void;
  clearSelection: () => void;
  refreshData: () => Promise<void>;
}

export const useSectorStore = create<SectorStore>((set, get) => ({
  sectors: [],
  selectedSectors: [],
  historyData: {},
  loading: false,
  error: null,

  fetchSectors: async () => {
    set({ loading: true, error: null });
    try {
      const sectors = await api.getSectors();
      set({ sectors, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchSectorHistory: async (id: string) => {
    try {
      const history = await api.getSectorHistory(id);
      set(state => ({
        historyData: {
          ...state.historyData,
          [id]: history
        }
      }));
    } catch (error) {
      console.error('获取历史数据失败:', error);
    }
  },

  toggleSectorSelection: (id: string) => {
    set(state => {
      const isSelected = state.selectedSectors.includes(id);
      return {
        selectedSectors: isSelected
          ? state.selectedSectors.filter(s => s !== id)
          : [...state.selectedSectors, id]
      };
    });
  },

  clearSelection: () => {
    set({ selectedSectors: [] });
  },

  refreshData: async () => {
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
