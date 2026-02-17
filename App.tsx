
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, Label
} from 'recharts';
import { 
  Users, ShoppingBag, Target, TrendingUp, DollarSign, Package, 
  ChevronRight, Award, AlertCircle, RotateCw, Clock, Sparkles, BrainCircuit
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import FilterBar from './components/FilterBar';
import KPICard from './components/KPICard';
import { ProductivityData, PerformanceData, CategoryBilledData, Filters } from './types';
import { fetchDashboardData } from './services/dataService';

const App: React.FC = () => {
  const [data, setData] = useState<{
    productivity: ProductivityData[],
    performance: PerformanceData[],
    categoryBilled: CategoryBilledData[]
  }>({
    productivity: [],
    performance: [],
    categoryBilled: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    month: 'All',
    week: 'All',
    team: 'All',
    routeNo: 'All',
    salesman: 'All',
    category: 'TOTAL'
  });

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    setError(null);
    try {
      const result = await fetchDashboardData();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Could not load data. Please ensure the Google Sheet is accessible.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const options = useMemo(() => {
    const rawProd = data.productivity;
    const months = Array.from(new Set(rawProd.map(d => d.Month))).filter(Boolean).sort();
    const weeks = Array.from(new Set(rawProd.map(d => d.Week))).filter(Boolean).sort();
    const teams = Array.from(new Set(rawProd.map(d => d.Team))).filter(Boolean).sort();
    
    const routes = Array.from(new Set(
      rawProd
        .filter(d => filters.team === 'All' || d.Team === filters.team)
        .map(d => d.RouteNo)
    )).filter(Boolean).sort();

    const salesmen = Array.from(new Set(
      rawProd
        .filter(d => (filters.team === 'All' || d.Team === filters.team) && 
                     (filters.routeNo === 'All' || d.RouteNo === filters.routeNo))
        .map(d => d.SalesmanName)
    )).filter(Boolean).sort();

    return {
      months,
      weeks,
      teams,
      routes,
      salesmen,
      categories: ['TOTAL', 'FLOUR', 'OIL', 'FOCUS', 'RICE']
    };
  }, [data.productivity, filters.team, filters.routeNo]);

  const { filteredProd, filteredPerf, filteredCatBilled, metrics } = useMemo(() => {
    const fProd = data.productivity.filter(d => {
      return (filters.month === 'All' || d.Month === filters.month) &&
             (filters.week === 'All' || d.Week === filters.week) &&
             (filters.team === 'All' || d.Team === filters.team) &&
             (filters.routeNo === 'All' || d.RouteNo === filters.routeNo) &&
             (filters.salesman === 'All' || d.SalesmanName === filters.salesman);
    });

    const fPerf = data.performance.filter(d => {
      return (filters.month === 'All' || d.Month === filters.month) &&
             (filters.week === 'All' || d.Week === filters.week) &&
             (filters.team === 'All' || d.Team === filters.team) &&
             (filters.routeNo === 'All' || d.RouteNo === filters.routeNo) &&
             (filters.salesman === 'All' || d.SalesmanName === filters.salesman);
    });

    const fCatBilled = data.categoryBilled.filter(d => {
      return (filters.month === 'All' || d.Month === filters.month) &&
             (filters.week === 'All' || d.Week === filters.week) &&
             (filters.team === 'All' || d.Team === filters.team) &&
             (filters.routeNo === 'All' || d.RouteNo === filters.routeNo) &&
             (filters.salesman === 'All' || d.SalesmanName === filters.salesman);
    });

    const totalAssigned = fProd.reduce((sum, d) => sum + (d.OutletsAssigned || 0), 0);
    const totalBilled = fProd.reduce((sum, d) => sum + (d.OutletsBilled || 0), 0);
    const billedPct = totalAssigned > 0 ? (totalBilled / totalAssigned) * 100 : 0;
    
    const pjpPlanned = fProd.reduce((sum, d) => sum + (d.PJPPlanned || 0), 0);
    const pjpFollowed = fProd.reduce((sum, d) => sum + (d.PJPFollowed || 0), 0);
    const pjpPct = pjpPlanned > 0 ? (pjpFollowed / pjpPlanned) * 100 : 0;

    const avgCallProd = fProd.length > 0 ? fProd.reduce((sum, d) => sum + (d.CallProductivity || 0), 0) / fProd.length : 0;
    const avgLineProd = fProd.length > 0 ? fProd.reduce((sum, d) => sum + (d.LineProductivity || 0), 0) / fProd.length : 0;
    const avgBillVal = fProd.length > 0 ? fProd.reduce((sum, d) => sum + (d.AverageBillValue || 0), 0) / fProd.length : 0;
    const avgDailySales = fProd.length > 0 ? fProd.reduce((sum, d) => sum + (d.AverageDailySales || 0), 0) / fProd.length : 0;

    const perfForCat = fPerf.filter(d => d.Category === filters.category);
    const actualSales = perfForCat.reduce((sum, d) => sum + (d.SalesValue || 0), 0);
    const targetSales = perfForCat.reduce((sum, d) => sum + (d.MonthlyTarget || 0), 0);
    const salesAchievementPct = targetSales > 0 ? (actualSales / targetSales) * 100 : 0;

    return {
      filteredProd: fProd,
      filteredPerf: fPerf,
      filteredCatBilled: fCatBilled,
      metrics: {
        totalAssigned, totalBilled, billedPct, pjpPct, pjpPlanned, pjpFollowed,
        avgCallProd, avgLineProd, avgBillVal, avgDailySales,
        actualSales, targetSales, salesAchievementPct,
        pendingOutlets: totalAssigned - totalBilled
      }
    };
  }, [data, filters]);

  const generateInsight = useCallback(async () => {
    if (loading || data.productivity.length === 0) return;
    setInsightLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const prompt = `Act as a world-class executive sales analyst for BP-TT. Based on these metrics: 
      Sales Achievement: ${metrics.salesAchievementPct.toFixed(1)}%, 
      PJP Adherence: ${metrics.pjpPct.toFixed(1)}%, 
      Billed Outlets: ${metrics.billedPct.toFixed(1)}%, 
      Pending Outlets: ${metrics.pendingOutlets}, 
      Avg Daily Sales: QAR ${metrics.avgDailySales.toFixed(0)}.
      
      Provide a concise 3-sentence executive insight following this exact structure:
      Sentence 1 (Observation): What's happening - state the key metric and its current value.
      Sentence 2 (Impact): Why it matters - explain the business consequence.
      Sentence 3 (Action): What to do - provide clear, directive action.
      
      Keep it highly professional, corporate, and sharp. Do not use conversational filler.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      setAiInsight(response.text || "No insights available at this moment.");
    } catch (err) {
      setAiInsight("Unable to generate AI insights. Please check performance metrics manually.");
    } finally {
      setInsightLoading(false);
    }
  }, [metrics, loading, data.productivity.length]);

  useEffect(() => {
    const timer = setTimeout(generateInsight, 1000);
    return () => clearTimeout(timer);
  }, [filters.team, filters.month, filters.category]);

  const weeklyTrends = useMemo(() => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const currentMonth = filters.month === 'All' ? options.months[options.months.length - 1] : filters.month;
    const prevMonthIdx = options.months.indexOf(currentMonth) - 1;
    const prevMonth = prevMonthIdx >= 0 ? options.months[prevMonthIdx] : null;

    return weeks.map(w => {
      const wNum = w.split(' ')[1];
      const currItems = data.productivity.filter(d => d.Month === currentMonth && d.Week.toString() === wNum);
      const prevItems = data.productivity.filter(d => d.Month === prevMonth && d.Week.toString() === wNum);

      const calculateWeeklyAvg = (items: ProductivityData[], key: keyof ProductivityData) => {
        if (items.length === 0) return 0;
        return items.reduce((sum, d) => sum + (Number(d[key]) || 0), 0) / items.length;
      };

      const calculateWeeklyPct = (items: ProductivityData[], num: keyof ProductivityData, den: keyof ProductivityData) => {
        const sumNum = items.reduce((sum, d) => sum + (Number(d[num]) || 0), 0);
        const sumDen = items.reduce((sum, d) => sum + (Number(d[den]) || 0), 0);
        return sumDen > 0 ? (sumNum / sumDen) * 100 : 0;
      };

      return {
        name: w,
        currSales: calculateWeeklyAvg(currItems, 'AverageDailySales'),
        prevSales: calculateWeeklyAvg(prevItems, 'AverageDailySales'),
        currPJP: calculateWeeklyPct(currItems, 'PJPFollowed', 'PJPPlanned'),
        prevPJP: calculateWeeklyPct(prevItems, 'PJPFollowed', 'PJPPlanned'),
        currBilled: calculateWeeklyPct(currItems, 'OutletsBilled', 'OutletsAssigned'),
        prevBilled: calculateWeeklyPct(prevItems, 'OutletsBilled', 'OutletsAssigned'),
      };
    });
  }, [data.productivity, filters.month, options.months]);

  const pieData = useMemo(() => {
    const categories = ['Flour', 'Edible Oil', 'Chakki Atta', 'Pulses', 'Rice'];
    return categories.map(cat => ({
      name: cat,
      value: filteredCatBilled.filter(d => d.Category.toLowerCase() === cat.toLowerCase()).reduce((sum, d) => sum + (d.OutletsBilled || 0), 0)
    })).filter(d => d.value > 0);
  }, [filteredCatBilled]);

  const PIE_COLORS = ['#1e293b', '#f59e0b', '#10b981', '#0ea5e9', '#8b5cf6'];
  const totalPieValue = useMemo(() => pieData.reduce((sum, entry) => sum + entry.value, 0), [pieData]);

  const performers = useMemo(() => {
    const salesmenNames = Array.from(new Set(filteredProd.map(d => d.SalesmanName)));
    const scores = salesmenNames.map(name => {
      const sProd = filteredProd.filter(d => d.SalesmanName === name);
      const pjpFollowed = sProd.reduce((sum, d) => sum + (d.PJPFollowed || 0), 0);
      const pjpPlanned = sProd.reduce((sum, d) => sum + (d.PJPPlanned || 0), 0);
      const pjpPct = pjpPlanned > 0 ? (pjpFollowed / pjpPlanned) * 100 : 0;

      const billed = sProd.reduce((sum, d) => sum + (d.OutletsBilled || 0), 0);
      const assigned = sProd.reduce((sum, d) => sum + (d.OutletsAssigned || 0), 0);
      const billedPct = assigned > 0 ? (billed / assigned) * 100 : 0;

      const sales = sProd.reduce((sum, d) => sum + (d.AverageDailySales || 0), 0) / (sProd.length || 1);
      const normalizedSales = sales / 1000;
      const totalScore = pjpPct + billedPct + normalizedSales;

      return { name, pjpPct, billedPct, sales, score: totalScore };
    }).sort((a, b) => b.score - a.score);

    return { top: scores.slice(0, 5), bottom: scores.slice(-5).reverse() };
  }, [filteredProd]);

  const routeSummary = useMemo(() => {
    const routes = Array.from(new Set(filteredProd.map(d => d.RouteNo))).sort();
    return routes.map(r => {
      const rProd = filteredProd.filter(d => d.RouteNo === r);
      const rPerf = filteredPerf.filter(d => d.RouteNo === r && d.Category === 'TOTAL');

      const assigned = rProd.reduce((sum, d) => sum + (d.OutletsAssigned || 0), 0);
      const billed = rProd.reduce((sum, d) => sum + (d.OutletsBilled || 0), 0);
      const pjpP = rProd.reduce((sum, d) => sum + (d.PJPPlanned || 0), 0);
      const pjpF = rProd.reduce((sum, d) => sum + (d.PJPFollowed || 0), 0);
      
      const salesValue = rPerf.reduce((sum, d) => sum + (d.SalesValue || 0), 0);
      const targetValue = rPerf.reduce((sum, d) => sum + (d.MonthlyTarget || 0), 0);

      return {
        routeNo: r,
        team: rProd[0]?.Team || '-',
        salesman: rProd[0]?.SalesmanName || '-',
        assigned,
        billedPct: assigned > 0 ? (billed / assigned) * 100 : 0,
        pjpPct: pjpP > 0 ? (pjpF / pjpP) * 100 : 0,
        callProd: rProd.length > 0 ? rProd.reduce((sum, d) => sum + (d.CallProductivity || 0), 0) / rProd.length : 0,
        lineProd: rProd.length > 0 ? rProd.reduce((sum, d) => sum + (d.LineProductivity || 0), 0) / rProd.length : 0,
        avgBill: rProd.length > 0 ? rProd.reduce((sum, d) => sum + (d.AverageBillValue || 0), 0) / rProd.length : 0,
        achievement: targetValue > 0 ? (salesValue / targetValue) * 100 : 0
      };
    });
  }, [filteredProd, filteredPerf]);

  const handleRefresh = () => loadData(true);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-amber-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 font-medium">Loading BP-TT Sales Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h1 className="text-xl font-bold text-slate-800 mb-2">Error Loading Dashboard</h1>
        <p className="text-slate-600 text-center max-w-md">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-colors">Retry</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <header className="bg-slate-900 text-white px-8 py-6 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white border-l-4 border-amber-500 pl-4 uppercase">
              BP-TT <span className="text-slate-400 font-light">Sales Productivity Dashboard</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 ml-5">Corporate Performance Analytics Platform</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 text-[10px] bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50 uppercase tracking-wider font-bold">
              <Clock size={12} className="text-amber-500" />
              <span className="text-slate-300">
                Last Updated: {lastUpdated ? lastUpdated.toLocaleDateString() + ' ' + lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
              </span>
            </div>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full border border-amber-500/30 transition-all hover:bg-amber-500/10 active:scale-95 ${refreshing ? 'opacity-50 cursor-not-allowed' : 'text-amber-500 hover:border-amber-500'}`}
            >
              <RotateCw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'REFRESHING...' : 'REFRESH'}
            </button>
          </div>
        </div>
      </header>

      <FilterBar filters={filters} setFilters={setFilters} options={options} />

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        
        {/* AI Executive Insights Box */}
        <div className="mb-8 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 shadow-xl border border-slate-700 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <BrainCircuit size={120} className="text-amber-500" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-amber-500/10 p-2 rounded-lg">
                <Sparkles size={18} className="text-amber-500 animate-pulse" />
              </div>
              <h2 className="text-white text-xs font-black uppercase tracking-[0.2em]">AI Executive Insights</h2>
              {insightLoading && <div className="ml-2 w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></div>}
            </div>
            <div className="min-h-[60px] flex items-center">
              {insightLoading ? (
                <div className="space-y-2 w-full">
                  <div className="h-4 bg-slate-700/50 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-slate-700/50 rounded animate-pulse w-1/2"></div>
                </div>
              ) : (
                <div className="text-slate-200 text-base font-medium leading-relaxed max-w-4xl">
                  {aiInsight ? (
                    aiInsight.split('. ').map((sentence, idx) => (
                      <span key={idx} className="block mb-1 last:mb-0">
                        {sentence}{idx < 2 ? '.' : ''}
                      </span>
                    ))
                  ) : (
                    <span className="italic text-slate-500">Analyzing performance data...</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Team Metric Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-5 shadow-sm border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Active Team</span>
              <Users size={16} className="text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-white truncate">
              {filters.team === 'All' ? 'All Teams' : filters.team}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Sales Achievement</span>
              <Award size={16} className="text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-slate-800 font-mono">
              {metrics.salesAchievementPct.toFixed(1)}%
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">PJP Adherence</span>
              <TrendingUp size={16} className="text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-slate-800 font-mono">
              {metrics.pjpPct.toFixed(1)}%
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Billed Outlets</span>
              <ShoppingBag size={16} className="text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-slate-800 font-mono">
              {metrics.billedPct.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
          <KPICard label="Assigned Outlets" value={metrics.totalAssigned} icon={<Users size={16}/>} />
          <KPICard label="Billed Outlets %" value={metrics.billedPct} suffix="%" icon={<ShoppingBag size={16}/>} />
          <KPICard label="PJP Adherence %" value={metrics.pjpPct} suffix="%" icon={<Target size={16}/>} />
          <KPICard label="Call Productivity" value={metrics.avgCallProd} icon={<ChevronRight size={16}/>} />
          <KPICard label="Line Productivity" value={metrics.avgLineProd} icon={<Package size={16}/>} />
          <KPICard label="Avg Bill Value" value={metrics.avgBillVal} prefix="QAR" icon={<DollarSign size={16}/>} />
          <KPICard label="Avg Daily Sales" value={metrics.avgDailySales} prefix="QAR" icon={<TrendingUp size={16}/>} />
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-800 font-bold uppercase text-xs tracking-widest mb-6 flex items-center gap-2"><TrendingUp size={14} className="text-amber-600" />Weekly Average Daily Sales (QAR)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend iconType="circle" wrapperStyle={{fontSize: '11px', paddingTop: '20px'}} />
                  <Line type="monotone" dataKey="currSales" name="Current Month" stroke="#0f172a" strokeWidth={3} dot={{r: 4, fill: '#0f172a'}} />
                  <Line type="monotone" dataKey="prevSales" name="Previous Month" stroke="#d1d5db" strokeWidth={2} strokeDasharray="5 5" dot={{r: 4, fill: '#d1d5db'}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-800 font-bold uppercase text-xs tracking-widest mb-6 flex items-center gap-2"><Target size={14} className="text-amber-600" />Weekly PJP Adherence %</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} domain={[0, 100]} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend iconType="circle" wrapperStyle={{fontSize: '11px', paddingTop: '20px'}} />
                  <Line type="monotone" dataKey="currPJP" name="Current Month" stroke="#d97706" strokeWidth={3} dot={{r: 4, fill: '#d97706'}} />
                  <Line type="monotone" dataKey="prevPJP" name="Previous Month" stroke="#fed7aa" strokeWidth={2} strokeDasharray="5 5" dot={{r: 4, fill: '#fed7aa'}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
            <h3 className="text-slate-800 font-bold uppercase text-xs tracking-widest mb-6 flex items-center gap-2"><Package size={14} className="text-amber-600" />Category Billed Summary</h3>
            <div className="h-80 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={75} outerRadius={105} paddingAngle={3} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                    <Label value={totalPieValue} position="center" className="font-mono text-3xl font-black fill-slate-800" />
                    <Label value="Total Billed" position="center" dy={24} className="text-[10px] font-bold fill-slate-400 uppercase tracking-widest" />
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="px-6 py-4 bg-slate-900 border-b border-slate-700 flex items-center justify-between"><h3 className="text-white font-bold uppercase text-xs tracking-widest">Route-wise Performance Summary</h3><div className="text-[10px] text-slate-400 font-bold uppercase">Total Routes: {routeSummary.length}</div></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                <tr><th className="px-6 py-4">Route No</th><th className="px-6 py-4">Team</th><th className="px-6 py-4">Salesman</th><th className="px-6 py-4 text-center">Assigned</th><th className="px-6 py-4 text-center">Billed %</th><th className="px-6 py-4 text-center">PJP %</th><th className="px-6 py-4 text-center">Call Prod</th><th className="px-6 py-4 text-center">LP</th><th className="px-6 py-4 text-right">Avg Bill (QAR)</th><th className="px-6 py-4 text-right">Achievement %</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {routeSummary.map((r, i) => (
                  <tr key={r.routeNo} className={`transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'} hover:bg-slate-100/50`}>
                    <td className="px-6 py-4 font-bold text-slate-800 font-mono text-xs">{r.routeNo}</td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-medium">{r.team}</td>
                    <td className="px-6 py-4 text-xs text-slate-700 font-semibold">{r.salesman}</td>
                    <td className="px-6 py-4 text-xs text-center font-mono">{r.assigned}</td>
                    <td className="px-6 py-4 text-center"><span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${r.billedPct >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>{r.billedPct.toFixed(1)}%</span></td>
                    <td className="px-6 py-4 text-center"><span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${r.pjpPct >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>{r.pjpPct.toFixed(1)}%</span></td>
                    <td className="px-6 py-4 text-center text-xs font-mono">{r.callProd.toFixed(1)}</td>
                    <td className="px-6 py-4 text-center text-xs font-mono">{r.lineProd.toFixed(1)}</td>
                    <td className="px-6 py-4 text-right text-xs font-bold text-slate-700 font-mono">{r.avgBill.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                    <td className="px-6 py-4 text-right"><span className={`text-[11px] font-black px-2 py-0.5 rounded ${r.achievement >= 100 ? 'text-emerald-600' : 'text-slate-800'}`}>{r.achievement.toFixed(1)}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <footer className="mt-12 py-8 bg-slate-50 border-t border-slate-200 text-center"><p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">BP-TT Sales Intelligence &copy; {new Date().getFullYear()}</p></footer>
    </div>
  );
};

export default App;
