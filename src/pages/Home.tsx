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
  const [sortBy, setSortBy] = useState('turnover');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchSectors();
  }, [fetchSectors]);

  useEffect(() => {
    selectedSectors.forEach(id => {
      if (!historyData[id]) {
        fetchSectorHistory(id);
      }
    });
  }, [selectedSectors, historyData, fetchSectorHistory]);

  const filteredAndSortedSectors = useMemo(() => {
    let filtered = sectors.filter(sector =>
      sector.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    filtered.sort((a, b) => {
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

  const chartData = useMemo(() => {
    if (selectedSectors.length === 0) return null;

    const firstHistory = historyData[selectedSectors[0]];
    if (!firstHistory) return null;

    const labels = firstHistory.map(d => d.date);
    
    const datasets = selectedSectors.map((id, index) => {
      const sector = sectors.find(s => s.id === id);
      const history = historyData[id];
      
      return {
        label: sector?.name || id,
        data: history?.map(d => d.turnover) || [],
        borderColor: COLORS[index % COLORS.length],
        backgroundColor: COLORS[index % COLORS.length] + '20',
        tension: 0.4,
        fill: false
      };
    });

    return { labels, datasets };
  }, [selectedSectors, historyData, sectors]);

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const
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

  if (loading && sectors.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-slate-600">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-red-600">错误: {error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">数据看板</h1>
        <p className="text-slate-600">查看和分析板块换手率数据</p>
      </div>

      {selectedSectors.length > 0 && (
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800">换手率趋势</h2>
              <button
                onClick={clearSelection}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                清除选择
              </button>
            </div>
            <div className="h-[400px]">
              {chartData ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  加载图表数据中...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md">
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">板块列表</h2>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索板块..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">名称</option>
                <option value="turnover">换手率</option>
                <option value="change">涨跌幅</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                {sortOrder === 'asc' ? '升序' : '降序'}
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  选择
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  板块名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  代码
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  最新换手率
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  涨跌幅
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredAndSortedSectors.map((sector) => (
                <tr 
                  key={sector.id}
                  className={`hover:bg-slate-50 transition-colors ${selectedSectors.includes(sector.id) ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedSectors.includes(sector.id)}
                      onChange={() => toggleSectorSelection(sector.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {sector.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {sector.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {sector.latestTurnover.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-medium ${sector.latestChange >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {sector.latestChange >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {sector.latestChange >= 0 ? '+' : ''}{sector.latestChange.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/sector/${sector.id}`}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-4 w-4" />
                      详情
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
