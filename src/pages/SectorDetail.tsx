
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
  const { id } = useParams&lt;{ id: string }&gt;();
  const { sectors, historyData, fetchSectors, fetchSectorHistory, loading } = useSectorStore();

  useEffect(() =&gt; {
    if (sectors.length === 0) {
      fetchSectors();
    }
  }, [sectors.length, fetchSectors]);

  useEffect(() =&gt; {
    if (id &amp;&amp; !historyData[id]) {
      fetchSectorHistory(id);
    }
  }, [id, historyData, fetchSectorHistory]);

  const sector = useMemo(() =&gt; sectors.find(s =&gt; s.id === id), [sectors, id]);
  const history = id ? historyData[id] : undefined;

  const chartData = useMemo(() =&gt; {
    if (!history) return null;
    
    return {
      labels: history.map(d =&gt; d.date),
      datasets: [
        {
          label: '换手率',
          data: history.map(d =&gt; d.turnover),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  }, [history]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
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

  const stats = useMemo(() =&gt; {
    if (!history) return null;
    
    const turnovers = history.map(d =&gt; d.turnover);
    return {
      max: Math.max(...turnovers),
      min: Math.min(...turnovers),
      avg: turnovers.reduce((a, b) =&gt; a + b, 0) / turnovers.length
    };
  }, [history]);

  if (loading &amp;&amp; !sector) {
    return (
      &lt;div className="flex items-center justify-center min-h-[400px]"&gt;
        &lt;div className="text-lg text-slate-600"&gt;加载中...&lt;/div&gt;
      &lt;/div&gt;
    );
  }

  if (!sector) {
    return (
      &lt;div className="flex items-center justify-center min-h-[400px]"&gt;
        &lt;div className="text-lg text-slate-600"&gt;板块不存在&lt;/div&gt;
      &lt;/div&gt;
    );
  }

  return (
    &lt;div className="max-w-7xl mx-auto px-4 py-8"&gt;
      &lt;div className="mb-6"&gt;
        &lt;Link
          to="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        &gt;
          &lt;ArrowLeft className="h-4 w-4" /&gt;
          返回数据看板
        &lt;/Link&gt;
        
        &lt;div className="flex items-start justify-between"&gt;
          &lt;div&gt;
            &lt;h1 className="text-3xl font-bold text-slate-900 mb-2"&gt;
              {sector.name}
            &lt;/h1&gt;
            &lt;p className="text-slate-600"&gt;代码: {sector.code}&lt;/p&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      &lt;div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"&gt;
        &lt;div className="bg-white rounded-xl shadow-md p-6"&gt;
          &lt;div className="flex items-center gap-3 mb-2"&gt;
            &lt;div className="p-2 bg-blue-100 rounded-lg"&gt;
              &lt;BarChart3 className="h-5 w-5 text-blue-600" /&gt;
            &lt;/div&gt;
            &lt;span className="text-sm text-slate-500"&gt;最新换手率&lt;/span&gt;
          &lt;/div&gt;
          &lt;div className="text-3xl font-bold text-blue-600"&gt;
            {sector.latestTurnover.toFixed(2)}%
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;div className="bg-white rounded-xl shadow-md p-6"&gt;
          &lt;div className="flex items-center gap-3 mb-2"&gt;
            &lt;div className={`p-2 rounded-lg ${sector.latestChange &gt;= 0 ? 'bg-green-100' : 'bg-red-100'}`}&gt;
              {sector.latestChange &gt;= 0 ? (
                &lt;TrendingUp className="h-5 w-5 text-green-600" /&gt;
              ) : (
                &lt;TrendingDown className="h-5 w-5 text-red-600" /&gt;
              )}
            &lt;/div&gt;
            &lt;span className="text-sm text-slate-500"&gt;最新涨跌幅&lt;/span&gt;
          &lt;/div&gt;
          &lt;div className={`text-3xl font-bold ${sector.latestChange &gt;= 0 ? 'text-green-600' : 'text-red-600'}`}&gt;
            {sector.latestChange &gt;= 0 ? '+' : ''}{sector.latestChange.toFixed(2)}%
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;div className="bg-white rounded-xl shadow-md p-6"&gt;
          &lt;div className="flex items-center gap-3 mb-2"&gt;
            &lt;div className="p-2 bg-purple-100 rounded-lg"&gt;
              &lt;Calendar className="h-5 w-5 text-purple-600" /&gt;
            &lt;/div&gt;
            &lt;span className="text-sm text-slate-500"&gt;数据更新时间&lt;/span&gt;
          &lt;/div&gt;
          &lt;div className="text-sm text-slate-700"&gt;
            {new Date(sector.updatedAt).toLocaleString('zh-CN')}
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      {stats &amp;&amp; (
        &lt;div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"&gt;
          &lt;div className="bg-white rounded-xl shadow-md p-6"&gt;
            &lt;div className="text-sm text-slate-500 mb-1"&gt;最高换手率&lt;/div&gt;
            &lt;div className="text-2xl font-bold text-green-600"&gt;
              {stats.max.toFixed(2)}%
            &lt;/div&gt;
          &lt;/div&gt;
          &lt;div className="bg-white rounded-xl shadow-md p-6"&gt;
            &lt;div className="text-sm text-slate-500 mb-1"&gt;最低换手率&lt;/div&gt;
            &lt;div className="text-2xl font-bold text-red-600"&gt;
              {stats.min.toFixed(2)}%
            &lt;/div&gt;
          &lt;/div&gt;
          &lt;div className="bg-white rounded-xl shadow-md p-6"&gt;
            &lt;div className="text-sm text-slate-500 mb-1"&gt;平均换手率&lt;/div&gt;
            &lt;div className="text-2xl font-bold text-blue-600"&gt;
              {stats.avg.toFixed(2)}%
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      )}

      &lt;div className="bg-white rounded-xl shadow-md p-6"&gt;
        &lt;h2 className="text-xl font-semibold text-slate-800 mb-4"&gt;历史趋势&lt;/h2&gt;
        &lt;div className="h-[500px]"&gt;
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
  );
}
