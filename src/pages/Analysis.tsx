
import { useEffect, useMemo, useState } from 'react';
import { useSectorStore } from '../store/sectorStore';
import { Sector } from '../../shared/types';

function calculateCorrelation(data1: number[], data2: number[]): number {
  if (data1.length !== data2.length) return 0;
  
  const n = data1.length;
  const mean1 = data1.reduce((a, b) =&gt; a + b, 0) / n;
  const mean2 = data2.reduce((a, b) =&gt; a + b, 0) / n;
  
  let numerator = 0;
  let denom1 = 0;
  let denom2 = 0;
  
  for (let i = 0; i &lt; n; i++) {
    const diff1 = data1[i] - mean1;
    const diff2 = data2[i] - mean2;
    numerator += diff1 * diff2;
    denom1 += diff1 * diff1;
    denom2 += diff2 * diff2;
  }
  
  const denominator = Math.sqrt(denom1 * denom2);
  return denominator === 0 ? 0 : numerator / denominator;
}

function getCorrelationColor(corr: number): string {
  const absCorr = Math.abs(corr);
  if (corr &gt; 0) {
    if (absCorr &gt;= 0.7) return 'bg-green-600';
    if (absCorr &gt;= 0.4) return 'bg-green-400';
    if (absCorr &gt;= 0.2) return 'bg-green-200';
    return 'bg-green-50';
  } else {
    if (absCorr &gt;= 0.7) return 'bg-red-600';
    if (absCorr &gt;= 0.4) return 'bg-red-400';
    if (absCorr &gt;= 0.2) return 'bg-red-200';
    return 'bg-red-50';
  }
}

export default function Analysis() {
  const { sectors, historyData, fetchSectors, fetchSectorHistory, loading } = useSectorStore();
  const [selectedSectors, setSelectedSectors] = useState&lt;string[]&gt;([]);

  useEffect(() =&gt; {
    fetchSectors();
  }, [fetchSectors]);

  useEffect(() =&gt; {
    if (selectedSectors.length === 0 &amp;&amp; sectors.length &gt; 0) {
      setSelectedSectors(sectors.slice(0, 6).map(s =&gt; s.id));
    }
  }, [sectors]);

  useEffect(() =&gt; {
    selectedSectors.forEach(id =&gt; {
      if (!historyData[id]) {
        fetchSectorHistory(id);
      }
    });
  }, [selectedSectors, historyData, fetchSectorHistory]);

  const correlationMatrix = useMemo(() =&gt; {
    if (selectedSectors.length &lt; 2) return null;
    
    const matrix: number[][] = [];
    const availableData: { id: string; data: number[] }[] = [];
    
    selectedSectors.forEach(id =&gt; {
      const history = historyData[id];
      if (history &amp;&amp; history.length &gt; 0) {
        availableData.push({
          id,
          data: history.map(d =&gt; d.turnover)
        });
      }
    });
    
    for (let i = 0; i &lt; availableData.length; i++) {
      const row: number[] = [];
      for (let j = 0; j &lt; availableData.length; j++) {
        const corr = calculateCorrelation(
          availableData[i].data,
          availableData[j].data
        );
        row.push(corr);
      }
      matrix.push(row);
    }
    
    return { matrix, sectors: availableData };
  }, [selectedSectors, historyData]);

  const toggleSector = (id: string) =&gt; {
    setSelectedSectors(prev =&gt; {
      if (prev.includes(id)) {
        return prev.filter(s =&gt; s !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  if (loading &amp;&amp; sectors.length === 0) {
    return (
      &lt;div className="flex items-center justify-center min-h-[400px]"&gt;
        &lt;div className="text-lg text-slate-600"&gt;加载中...&lt;/div&gt;
      &lt;/div&gt;
    );
  }

  return (
    &lt;div className="max-w-7xl mx-auto px-4 py-8"&gt;
      &lt;div className="mb-8"&gt;
        &lt;h1 className="text-3xl font-bold text-slate-900 mb-2"&gt;关系分析&lt;/h1&gt;
        &lt;p className="text-slate-600"&gt;分析板块之间的相关性和相位关系&lt;/p&gt;
      &lt;/div&gt;

      &lt;div className="grid grid-cols-1 lg:grid-cols-4 gap-8"&gt;
        &lt;div className="lg:col-span-1"&gt;
          &lt;div className="bg-white rounded-xl shadow-md p-6"&gt;
            &lt;h2 className="text-lg font-semibold text-slate-800 mb-4"&gt;选择板块&lt;/h2&gt;
            &lt;div className="space-y-2 max-h-[600px] overflow-y-auto"&gt;
              {sectors.map(sector =&gt; (
                &lt;label
                  key={sector.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                &gt;
                  &lt;input
                    type="checkbox"
                    checked={selectedSectors.includes(sector.id)}
                    onChange={() =&gt; toggleSector(sector.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  /&gt;
                  &lt;span className="text-sm text-slate-700"&gt;{sector.name}&lt;/span&gt;
                &lt;/label&gt;
              ))}
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;div className="lg:col-span-3"&gt;
          &lt;div className="bg-white rounded-xl shadow-md p-6"&gt;
            &lt;h2 className="text-lg font-semibold text-slate-800 mb-4"&gt;相关性热力图&lt;/h2&gt;
            
            &lt;div className="mb-4 p-4 bg-slate-50 rounded-lg"&gt;
              &lt;div className="flex items-center gap-4 text-sm"&gt;
                &lt;div className="flex items-center gap-2"&gt;
                  &lt;div className="w-4 h-4 bg-red-600 rounded"&gt;&lt;/div&gt;
                  &lt;span className="text-slate-600"&gt;强负相关&lt;/span&gt;
                &lt;/div&gt;
                &lt;div className="flex items-center gap-2"&gt;
                  &lt;div className="w-4 h-4 bg-red-200 rounded"&gt;&lt;/div&gt;
                  &lt;span className="text-slate-600"&gt;弱负相关&lt;/span&gt;
                &lt;/div&gt;
                &lt;div className="flex items-center gap-2"&gt;
                  &lt;div className="w-4 h-4 bg-green-200 rounded"&gt;&lt;/div&gt;
                  &lt;span className="text-slate-600"&gt;弱正相关&lt;/span&gt;
                &lt;/div&gt;
                &lt;div className="flex items-center gap-2"&gt;
                  &lt;div className="w-4 h-4 bg-green-600 rounded"&gt;&lt;/div&gt;
                  &lt;span className="text-slate-600"&gt;强正相关&lt;/span&gt;
                &lt;/div&gt;
              &lt;/div&gt;
            &lt;/div&gt;

            {correlationMatrix &amp;&amp; correlationMatrix.sectors.length &gt; 1 ? (
              &lt;div className="overflow-x-auto"&gt;
                &lt;table className="w-full"&gt;
                  &lt;thead&gt;
                    &lt;tr&gt;
                      &lt;th className="p-2 text-xs text-slate-500"&gt;&lt;/th&gt;
                      {correlationMatrix.sectors.map(s =&gt; {
                        const sector = sectors.find(sec =&gt; sec.id === s.id);
                        return (
                          &lt;th
                            key={s.id}
                            className="p-2 text-xs font-medium text-slate-700 text-center min-w-[80px]"
                          &gt;
                            {sector?.name}
                          &lt;/th&gt;
                        );
                      })}
                    &lt;/tr&gt;
                  &lt;/thead&gt;
                  &lt;tbody&gt;
                    {correlationMatrix.sectors.map((s, i) =&gt; {
                      const sector = sectors.find(sec =&gt; sec.id === s.id);
                      return (
                        &lt;tr key={s.id}&gt;
                          &lt;td className="p-2 text-xs font-medium text-slate-700"&gt;
                            {sector?.name}
                          &lt;/td&gt;
                          {correlationMatrix.sectors.map((_, j) =&gt; {
                            const corr = correlationMatrix.matrix[i][j];
                            return (
                              &lt;td key={j} className="p-1"&gt;
                                &lt;div
                                  className={`w-full h-10 flex items-center justify-center rounded
                                    ${getCorrelationColor(corr)}
                                    ${i === j ? 'bg-slate-200' : ''}`}
                                &gt;
                                  &lt;span className={`text-xs font-medium
                                    ${Math.abs(corr) &gt;= 0.7 ? 'text-white' : 'text-slate-700'}`}&gt;
                                    {corr.toFixed(2)}
                                  &lt;/span&gt;
                                &lt;/div&gt;
                              &lt;/td&gt;
                            );
                          })}
                        &lt;/tr&gt;
                      );
                    })}
                  &lt;/tbody&gt;
                &lt;/table&gt;
              &lt;/div&gt;
            ) : (
              &lt;div className="flex items-center justify-center h-64 text-slate-400"&gt;
                请选择至少2个板块进行分析
              &lt;/div&gt;
            )}
          &lt;/div&gt;

          &lt;div className="mt-8 bg-white rounded-xl shadow-md p-6"&gt;
            &lt;h2 className="text-lg font-semibold text-slate-800 mb-4"&gt;关于相关性分析&lt;/h2&gt;
            &lt;div className="text-sm text-slate-600 space-y-2"&gt;
              &lt;p&gt;
                本页面使用皮尔逊相关系数来衡量板块之间的相关性：
              &lt;/p&gt;
              &lt;ul className="list-disc list-inside space-y-1 ml-2"&gt;
                &lt;li&gt;相关系数范围：-1 到 +1&lt;/li&gt;
                &lt;li&gt;+1 表示完全正相关：两个板块的变化完全同步&lt;/li&gt;
                &lt;li&gt;-1 表示完全负相关：一个板块涨，另一个就跌&lt;/li&gt;
                &lt;li&gt;0 表示无线性相关关系&lt;/li&gt;
                &lt;li&gt;绝对值 &gt; 0.7 为强相关，&gt; 0.4 为中等相关&lt;/li&gt;
              &lt;/ul&gt;
              &lt;p className="mt-4 text-slate-500"&gt;
                注：当前使用模拟数据进行演示。在实际应用中，建议：
                1) 确保数据质量和时间范围对齐
                2) 考虑滞后相关性分析
                3) 结合其他指标综合判断
              &lt;/p&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
}
