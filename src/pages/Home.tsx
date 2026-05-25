
import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useSectorStore } from '../store/sectorStore';
import { Sector } from '../../shared/types';
import { TrendingUp, TrendingDown, Search, Eye } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  '#14B8A6', '#A855F7'
];

export default function Home() {
  const { 
    sectors, 
    selectedSectors, 
    historyData, 
    loading, 
    error,
    fetchSectors, 
    fetchSectorHistory, 
    toggleSectorSelection,
    clearSelection
  } = useSectorStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState&lt;'name' | 'turnover' | 'change'&gt;('turnover');
  const [sortOrder, setSortOrder] = useState&lt;'asc' | 'desc'&gt;('desc');

  useEffect(() =&gt; {
    fetchSectors();
  }, [fetchSectors]);

  useEffect(() =&gt; {
    selectedSectors.forEach(id =&gt; {
      if (!historyData[id]) {
        fetchSectorHistory(id);
      }
    });
  }, [selectedSectors, historyData, fetchSectorHistory]);

  const filteredAndSortedSectors = useMemo(() =&gt; {
    let filtered = sectors.filter(sector =&gt;
      sector.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    filtered.sort((a, b) =&gt; {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'turnover') {
        comparison = a.latestTurnover - b.latestTurnover;
      } else {
        comparison = a.latestChange - b.latestChange;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    
    return filtered;
  }, [sectors, searchTerm, sortBy, sortOrder]);

  const chartData = useMemo(() =&gt; {
    if (selectedSectors.length === 0) return null;

    const firstHistory = historyData[selectedSectors[0]];
    if (!firstHistory) return null;

    const labels = firstHistory.map(d =&gt; d.date);
    
    const datasets = selectedSectors.map((id, index) =&gt; {
      const sector = sectors.find(s =&gt; s.id === id);
      const history = historyData[id];
      
      return {
        label: sector?.name || id,
        data: history?.map(d =&gt; d.turnover) || [],
        borderColor: COLORS[index % COLORS.length],
        backgroundColor: COLORS[index % COLORS.length] + '20',
        tension: 0.4,
        fill: false
      };
    });

    return { labels, datasets };
  }, [selectedSectors, historyData, sectors]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '板块换手率趋势'
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: '换手率 (%)'
        }
      },
      x: {
        title: {
          display: true,
          text: '日期'
        }
      }
    }
  };

  if (loading &amp;&amp; sectors.length === 0) {
    return (
      &lt;div className="flex items-center justify-center min-h-[400px]"&gt;
        &lt;div className="text-lg text-slate-600"&gt;加载中...&lt;/div&gt;
      &lt;/div&gt;
    );
  }

  if (error) {
    return (
      &lt;div className="flex items-center justify-center min-h-[400px]"&gt;
        &lt;div className="text-lg text-red-600"&gt;错误: {error}&lt;/div&gt;
      &lt;/div&gt;
    );
  }

  return (
    &lt;div className="max-w-7xl mx-auto px-4 py-8"&gt;
      &lt;div className="mb-8"&gt;
        &lt;h1 className="text-3xl font-bold text-slate-900 mb-2"&gt;数据看板&lt;/h1&gt;
        &lt;p className="text-slate-600"&gt;查看和分析板块换手率数据&lt;/p&gt;
      &lt;/div&gt;

      {selectedSectors.length &gt; 0 &amp;&amp; (
        &lt;div className="mb-8"&gt;
          &lt;div className="bg-white rounded-xl shadow-md p-6"&gt;
            &lt;div className="flex items-center justify-between mb-4"&gt;
              &lt;h2 className="text-xl font-semibold text-slate-800"&gt;换手率趋势&lt;/h2&gt;
              &lt;button
                onClick={clearSelection}
                className="text-sm text-blue-600 hover:text-blue-800"
              &gt;
                清除选择
              &lt;/button&gt;
            &lt;/div&gt;
            &lt;div className="h-[400px]"&gt;
              {chartData ? (
                &lt;Line data={chartData} options={chartOptions} /&gt;
              ) : (
                &lt;div className="flex items-center justify-center h-full text-slate-400"&gt;
                  加载图表数据中...
                &lt;/div&gt;
              )}
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      )}

      &lt;div className="bg-white rounded-xl shadow-md"&gt;
        &lt;div className="p-6 border-b border-slate-200"&gt;
          &lt;div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"&gt;
            &lt;h2 className="text-xl font-semibold text-slate-800"&gt;板块列表&lt;/h2&gt;
            &lt;div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"&gt;
              &lt;div className="relative"&gt;
                &lt;Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" /&gt;
                &lt;input
                  type="text"
                  placeholder="搜索板块..."
                  value={searchTerm}
                  onChange={(e) =&gt; setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                /&gt;
              &lt;/div&gt;
              &lt;select
                value={sortBy}
                onChange={(e) =&gt; setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-slate-300 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              &gt;
                &lt;option value="name"&gt;名称&lt;/option&gt;
                &lt;option value="turnover"&gt;换手率&lt;/option&gt;
                &lt;option value="change"&gt;涨跌幅&lt;/option&gt;
              &lt;/select&gt;
              &lt;button
                onClick={() =&gt; setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg"
              &gt;
                {sortOrder === 'asc' ? '↑ 升序' : '↓ 降序'}
              &lt;/button&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;div className="overflow-x-auto"&gt;
          &lt;table className="w-full"&gt;
            &lt;thead className="bg-slate-50"&gt;
              &lt;tr&gt;
                &lt;th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"&gt;
                  选择
                &lt;/th&gt;
                &lt;th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"&gt;
                  板块名称
                &lt;/th&gt;
                &lt;th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"&gt;
                  代码
                &lt;/th&gt;
                &lt;th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"&gt;
                  最新换手率
                &lt;/th&gt;
                &lt;th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"&gt;
                  涨跌幅
                &lt;/th&gt;
                &lt;th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"&gt;
                  操作
                &lt;/th&gt;
              &lt;/tr&gt;
            &lt;/thead&gt;
            &lt;tbody className="bg-white divide-y divide-slate-200"&gt;
              {filteredAndSortedSectors.map((sector) =&gt; (
                &lt;tr 
                  key={sector.id}
                  className={`hover:bg-slate-50 transition-colors
                    ${selectedSectors.includes(sector.id) ? 'bg-blue-50' : ''}`}
                &gt;
                  &lt;td className="px-6 py-4 whitespace-nowrap"&gt;
                    &lt;input
                      type="checkbox"
                      checked={selectedSectors.includes(sector.id)}
                      onChange={() =&gt; toggleSectorSelection(sector.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    /&gt;
                  &lt;/td&gt;
                  &lt;td className="px-6 py-4 whitespace-nowrap"&gt;
                    &lt;div className="text-sm font-medium text-slate-900"&gt;
                      {sector.name}
                    &lt;/div&gt;
                  &lt;/td&gt;
                  &lt;td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500"&gt;
                    {sector.code}
                  &lt;/td&gt;
                  &lt;td className="px-6 py-4 whitespace-nowrap"&gt;
                    &lt;span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"&gt;
                      {sector.latestTurnover.toFixed(2)}%
                    &lt;/span&gt;
                  &lt;/td&gt;
                  &lt;td className="px-6 py-4 whitespace-nowrap"&gt;
                    &lt;span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-medium
                      ${sector.latestChange &gt;= 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'}`}
                    &gt;
                      {sector.latestChange &gt;= 0 ? (
                        &lt;TrendingUp className="h-3 w-3" /&gt;
                      ) : (
                        &lt;TrendingDown className="h-3 w-3" /&gt;
                      )}
                      {sector.latestChange &gt;= 0 ? '+' : ''}{sector.latestChange.toFixed(2)}%
                    &lt;/span&gt;
                  &lt;/td&gt;
                  &lt;td className="px-6 py-4 whitespace-nowrap text-sm font-medium"&gt;
                    &lt;Link
                      to={`/sector/${sector.id}`}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-900"
                    &gt;
                      &lt;Eye className="h-4 w-4" /&gt;
                      详情
                    &lt;/Link&gt;
                  &lt;/td&gt;
                &lt;/tr&gt;
              ))}
            &lt;/tbody&gt;
          &lt;/table&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
}
