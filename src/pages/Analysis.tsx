import { useEffect, useMemo, useState } from 'react';
import { useSectorStore } from '../store/sectorStore';

function calculateCorrelation(data1: number[], data2: number[]): number {
  if (data1.length !== data2.length) return 0;
  
  const n = data1.length;
  const mean1 = data1.reduce((a, b) => a + b, 0) / n;
  const mean2 = data2.reduce((a, b) => a + b, 0) / n;
  
  let numerator = 0;
  let denom1 = 0;
  let denom2 = 0;
  
  for (let i = 0; i < n; i++) {
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
  if (corr > 0) {
    if (absCorr >= 0.7) return 'bg-green-600';
    if (absCorr >= 0.4) return 'bg-green-400';
    if (absCorr >= 0.2) return 'bg-green-200';
    return 'bg-green-50';
  } else {
    if (absCorr >= 0.7) return 'bg-red-600';
    if (absCorr >= 0.4) return 'bg-red-400';
    if (absCorr >= 0.2) return 'bg-red-200';
    return 'bg-red-50';
  }
}

export default function Analysis() {
  const { sectors, historyData, fetchSectors, fetchSectorHistory, loading } = useSectorStore();
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);

  useEffect(() => {
    fetchSectors();
  }, [fetchSectors]);

  useEffect(() => {
    if (selectedSectors.length === 0 && sectors.length > 0) {
      setSelectedSectors(sectors.slice(0, 6).map(s => s.id));
    }
  }, [sectors]);

  useEffect(() => {
    selectedSectors.forEach(id => {
      if (!historyData[id]) {
        fetchSectorHistory(id);
      }
    });
  }, [selectedSectors, historyData, fetchSectorHistory]);

  const correlationMatrix = useMemo(() => {
    if (selectedSectors.length < 2) return null;
    
    const matrix: number[][] = [];
    const availableData: { id: string; data: number[] }[] = [];
    
    selectedSectors.forEach(id => {
      const history = historyData[id];
      if (history && history.length > 0) {
        availableData.push({
          id,
          data: history.map(d => d.turnover)
        });
      }
    });
    
    for (let i = 0; i < availableData.length; i++) {
      const row: number[] = [];
      for (let j = 0; j < availableData.length; j++) {
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

  const toggleSector = (id: string) => {
    setSelectedSectors(prev => {
      if (prev.includes(id)) {
        return prev.filter(s => s !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  if (loading && sectors.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-slate-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">关系分析</h1>
        <p className="text-slate-600">分析板块之间的相关性和相位关系</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">选择板块</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {sectors.map(sector => (
                <label
                  key={sector.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedSectors.includes(sector.id)}
                    onChange={() => toggleSector(sector.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">{sector.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">相关性热力图</h2>
            
            <div className="mb-4 p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600 rounded"></div>
                  <span className="text-slate-600">强负相关</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-200 rounded"></div>
                  <span className="text-slate-600">弱负相关</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-200 rounded"></div>
                  <span className="text-slate-600">弱正相关</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600 rounded"></div>
                  <span className="text-slate-600">强正相关</span>
                </div>
              </div>
            </div>

            {correlationMatrix && correlationMatrix.sectors.length > 1 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="p-2 text-xs text-slate-500"></th>
                      {correlationMatrix.sectors.map(s => {
                        const sector = sectors.find(sec => sec.id === s.id);
                        return (
                          <th
                            key={s.id}
                            className="p-2 text-xs font-medium text-slate-700 text-center min-w-[80px]"
                          >
                            {sector?.name}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {correlationMatrix.sectors.map((s, i) => {
                      const sector = sectors.find(sec => sec.id === s.id);
                      return (
                        <tr key={s.id}>
                          <td className="p-2 text-xs font-medium text-slate-700">
                            {sector?.name}
                          </td>
                          {correlationMatrix.sectors.map((_, j) => {
                            const corr = correlationMatrix.matrix[i][j];
                            return (
                              <td key={j} className="p-1">
                                <div
                                  className={`w-full h-10 flex items-center justify-center rounded ${getCorrelationColor(corr)} ${i === j ? 'bg-slate-200' : ''}`}
                                >
                                  <span className={`text-xs font-medium ${Math.abs(corr) >= 0.7 ? 'text-white' : 'text-slate-700'}`}>
                                    {corr.toFixed(2)}
                                  </span>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-slate-400">
                请选择至少2个板块进行分析
              </div>
            )}
          </div>

          <div className="mt-8 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">关于相关性分析</h2>
            <div className="text-sm text-slate-600 space-y-2">
              <p>
                本页面使用皮尔逊相关系数来衡量板块之间的相关性：
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>相关系数范围：-1 到 +1</li>
                <li>+1 表示完全正相关：两个板块的变化完全同步</li>
                <li>-1 表示完全负相关：一个板块涨，另一个就跌</li>
                <li>0 表示无线性相关关系</li>
                <li>绝对值大于 0.7 为强相关，大于 0.4 为中等相关</li>
              </ul>
              <p className="mt-4 text-slate-500">
                注：当前使用模拟数据进行演示。在实际应用中，建议确保数据质量和时间范围对齐，考虑滞后相关性分析，结合其他指标综合判断。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
