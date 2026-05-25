
import { Sector, SectorHistoryData } from '../../shared/types';

// 板块模拟数据
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
  history: Record&lt;string, SectorHistoryData[]&gt;;
} {
  const sectors: Sector[] = [];
  const history: Record&lt;string, SectorHistoryData[]&gt; = {};
  const now = new Date();

  MOCK_SECTORS.forEach((sector, index) =&gt; {
    const id = (index + 1).toString();
    const baseTurnover = 1 + Math.random() * 5;
    const historyData: SectorHistoryData[] = [];

    // 生成过去一年的数据（约250个交易日）
    for (let i = 250; i &gt;= 0; i--) {
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
  async scrapeData(): Promise&lt;{
    sectors: Sector[];
    history: Record&lt;string, SectorHistoryData[]&gt;;
  }&gt; {
    console.log('开始获取板块数据...');
    
    // 真实场景这里会调用东方财富网API或爬取页面
    // 这里使用模拟数据替代
    await new Promise(resolve =&gt; setTimeout(resolve, 1000));
    
    const data = generateRandomData();
    console.log(`成功获取 ${data.sectors.length} 个板块数据`);
    
    return data;
  }
}

export const scraperService = new ScraperService();
