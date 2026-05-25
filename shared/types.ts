
export interface Sector {
  id: string;
  name: string;
  code: string;
  latestTurnover: number;
  latestChange: number;
  updatedAt: string;
}

export interface SectorHistoryData {
  date: string;
  turnover: number;
  change: number;
}

export interface SectorHistory {
  sectorId: string;
  data: SectorHistoryData[];
}

export interface DataStore {
  sectors: Sector[];
  history: Record&lt;string, SectorHistoryData[]&gt;;
}
