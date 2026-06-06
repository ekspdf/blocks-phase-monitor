import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
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
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';

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

export default function SectorDetail() {
  const { id } = useParams();
  const { sectors, historyData, fetchSectors, fetchSectorHistory, loading } = useSectorStore();

  useEffect(() => {
    if (sectors.length === 0) {
      fetchSectors();
    }
  }, [sectors.length, fetchSectors]);

  useEffect(() => {
    if (id && !historyData[id]) {
      fetchSectorHistory(id);
    }
  }, [id, historyData, fetchSectorHistory]);

  const sector = useMemo(() => sectors.find(s => s.id === id), [sectors, id]);
  const history = id ? historyData[id] : undefined;

  const chartData = useMemo(() => {
    if (!history) return null;
    
    return {
      labels: history.map(d => d.date),
      datasets: [
        {
          label: '换手率',
          data: history.map(d => d.turnover),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  }, [history]);

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: '换手率历史趋势'
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

  const stats = useMemo(() => {
    if (!history) return null;
    
    const turnovers = history.map(d => d.turnover);
    return {
      max: Math.max(...turnovers),
      min: Math.min(...turnovers),
      avg: turnovers.reduce((a, b) => a + b, 0) / turnovers.length
    };
  }, [history]);

  if (loading && !sector) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-slate-600">加载中...</div>
      </div>
    );
  }

  if (!sector) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-slate-600">板块不存在</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          返回数据看板
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {sector.name}
            </h1>
            <p className="text-slate-600">代码: {sector.code}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm text-slate-500">最新换手率</span>
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {sector.latestTurnover.toFixed(2)}%
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${sector.latestChange >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {sector.latestChange >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
            </div>
            <span className="text-sm text-slate-500">最新涨跌幅</span>
          </div>
          <div className={`text-3xl font-bold ${sector.latestChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {sector.latestChange >= 0 ? '+' : ''}{sector.latestChange.toFixed(2)}%
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-sm text-slate-500">数据更新时间</span>
          </div>
          <div className="text-sm text-slate-700">
            {new Date(sector.updatedAt).toLocaleString('zh-CN')}
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-slate-500 mb-1">最高换手率</div>
            <div className="text-2xl font-bold text-green-600">
              {stats.max.toFixed(2)}%
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-slate-500 mb-1">最低换手率</div>
            <div className="text-2xl font-bold text-red-600">
              {stats.min.toFixed(2)}%
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-sm text-slate-500 mb-1">平均换手率</div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.avg.toFixed(2)}%
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">历史趋势</h2>
        <div className="h-[500px]">
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
  );
}
