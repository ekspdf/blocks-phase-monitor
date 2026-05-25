
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { DataStore, Sector, SectorHistoryData } from '../../shared/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../../data/store.json');

const DEFAULT_STORE: DataStore = {
  sectors: [],
  history: {}
};

export class DataRepository {
  private async ensureDataFile(): Promise&lt;void&gt; {
    try {
      await fs.access(DATA_FILE);
    } catch {
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
      await this.saveStore(DEFAULT_STORE);
    }
  }

  private async loadStore(): Promise&lt;DataStore&gt; {
    await this.ensureDataFile();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  }

  private async saveStore(store: DataStore): Promise&lt;void&gt; {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2));
  }

  async getAllSectors(): Promise&lt;Sector[]&gt; {
    const store = await this.loadStore();
    return store.sectors;
  }

  async getSectorById(id: string): Promise&lt;Sector | null&gt; {
    const store = await this.loadStore();
    return store.sectors.find(s =&gt; s.id === id) || null;
  }

  async getSectorHistory(id: string): Promise&lt;SectorHistoryData[]&gt; {
    const store = await this.loadStore();
    return store.history[id] || [];
  }

  async saveSectors(sectors: Sector[]): Promise&lt;void&gt; {
    const store = await this.loadStore();
    store.sectors = sectors;
    await this.saveStore(store);
  }

  async saveSectorHistory(sectorId: string, history: SectorHistoryData[]): Promise&lt;void&gt; {
    const store = await this.loadStore();
    store.history[sectorId] = history;
    await this.saveStore(store);
  }

  async saveAllData(sectors: Sector[], history: Record&lt;string, SectorHistoryData[]&gt;): Promise&lt;void&gt; {
    await this.saveStore({
      sectors,
      history
    });
  }
}

export const dataRepository = new DataRepository();
