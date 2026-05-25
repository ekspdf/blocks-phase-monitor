
import express, { Request, Response } from 'express';
import { dataRepository } from '../repository/store.js';
import { scraperService } from '../services/scraper.js';

const router = express.Router();

router.get('/', async (req: Request, res: Response) =&gt; {
  try {
    const sectors = await dataRepository.getAllSectors();
    
    // 如果没有数据，先获取一次
    if (sectors.length === 0) {
      const { sectors: newSectors, history } = await scraperService.scrapeData();
      await dataRepository.saveAllData(newSectors, history);
      return res.json({ success: true, data: newSectors });
    }
    
    res.json({ success: true, data: sectors });
  } catch (error) {
    console.error('获取板块列表失败:', error);
    res.status(500).json({ success: false, error: '获取板块列表失败' });
  }
});

router.get('/:id', async (req: Request, res: Response) =&gt; {
  try {
    const { id } = req.params;
    const sector = await dataRepository.getSectorById(id);
    
    if (!sector) {
      return res.status(404).json({ success: false, error: '板块不存在' });
    }
    
    res.json({ success: true, data: sector });
  } catch (error) {
    console.error('获取板块详情失败:', error);
    res.status(500).json({ success: false, error: '获取板块详情失败' });
  }
});

router.get('/:id/history', async (req: Request, res: Response) =&gt; {
  try {
    const { id } = req.params;
    const history = await dataRepository.getSectorHistory(id);
    
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('获取板块历史数据失败:', error);
    res.status(500).json({ success: false, error: '获取板块历史数据失败' });
  }
});

router.post('/scrape', async (req: Request, res: Response) =&gt; {
  try {
    const { sectors, history } = await scraperService.scrapeData();
    await dataRepository.saveAllData(sectors, history);
    
    res.json({ success: true, message: '数据更新成功', data: { sectorCount: sectors.length } });
  } catch (error) {
    console.error('数据更新失败:', error);
    res.status(500).json({ success: false, error: '数据更新失败' });
  }
});

export default router;
