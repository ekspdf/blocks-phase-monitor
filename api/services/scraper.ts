import { Sector, SectorHistoryData } from '../../shared/types.js';

const MOCK_SECTORS = [
  { name: '银行', code: 'BK0465' },
  { name: '保险', code: 'BK0474' },
  { name: '证券', code: 'BK0473' },
  { name: '房地产', code: 'BK0451' },
  { name: '煤炭', code: 'BK0437' },
  { name: '石油', code: 'BK0464' },
  { name: '钢铁', code: 'BK0479' },
  { name: '有色金属', code: 'BK0478' },
  { name: '电力', code: 'BK0428' },
  { name: '汽车', code: 'BK0481' },
  { name: '医药', code: 'BK0465' },
  { name: '消费电子', code: 'BK1037' }
];

function generateRandomData(): {
  sectors: Sector[];
  history: Record<string, SectorHistoryData[]>;
} {
  const sectors: Sector[] = [];
  const history: Record<string, SectorHistoryData[]> = {};
  const now = new Date();

  MOCK_SECTORS.forEach((sector, index) => {
    const id = (index + 1).toString();
    const baseTurnover = 1 + Math.random() * 5;
    const historyData: SectorHistoryData[] = [];

    for (let i = 250; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const turnover = baseTurnover + (Math.random() - 0.5) * 2;
      const change = (Math.random() - 0.5) * 4;

      historyData.push({
        date: dateStr,
        turnover: Math.max(0.1, parseFloat(turnover.toFixed(2))),
        change: parseFloat(change.toFixed(2))
      });
    }

    const latest = historyData[historyData.length - 1];
    sectors.push({
      id,
      name: sector.name,
      code: sector.code,
      latestTurnover: latest.turnover,
      latestChange: latest.change,
      updatedAt: now.toISOString()
    });

    history[id] = historyData;
  });

  return { sectors, history };
}

export class ScraperService {
  async scrapeData(): Promise<{
    sectors: Sector[];
    history: Record<string, SectorHistoryData[]>;
  }> {
    console.log('开始获取板块数据...');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const data = generateRandomData();
    console.log(`成功获取 ${data.sectors.length} 个板块数据`);
    
    return data;
  }
}

export const scraperService = new ScraperService();
