
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, BarChart3, RefreshCw } from 'lucide-react';
import { useSectorStore } from '../store/sectorStore';

export function Navbar() {
  const location = useLocation();
  const { refreshData, loading } = useSectorStore();

  const isActive = (path: string) =&gt; location.pathname === path;

  return (
    &lt;nav className="bg-slate-900 text-white shadow-lg"&gt;
      &lt;div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"&gt;
        &lt;div className="flex items-center justify-between h-16"&gt;
          &lt;div className="flex items-center gap-3"&gt;
            &lt;TrendingUp className="h-8 w-8 text-blue-400" /&gt;
            &lt;span className="text-xl font-bold"&gt;板块观察系统&lt;/span&gt;
          &lt;/div&gt;
          
          &lt;div className="flex items-center gap-4"&gt;
            &lt;Link
              to="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${isActive('/') 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            &gt;
              &lt;BarChart3 className="h-4 w-4" /&gt;
              数据看板
            &lt;/Link&gt;
            
            &lt;Link
              to="/analysis"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${isActive('/analysis') 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            &gt;
              &lt;TrendingUp className="h-4 w-4" /&gt;
              关系分析
            &lt;/Link&gt;
            
            &lt;button
              onClick={refreshData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 
                       disabled:bg-slate-600 rounded-md text-sm font-medium transition-colors"
            &gt;
              &lt;RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /&gt;
              刷新数据
            &lt;/button&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/nav&gt;
  );
}
