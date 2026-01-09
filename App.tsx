
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Loader2, ArrowRightLeft, CalendarDays, RefreshCw, LayoutDashboard, Search, Video, Megaphone, Sparkles, ChevronRight, Tag, Users, Layers, TrendingUp } from 'lucide-react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { COMPARISON_OPTIONS, DASHBOARD_TABS } from './constants';
import { fetchGoogleSheetData, aggregateData, filterByDateRange } from './services/dataService';
import { generateAiSummary } from './services/geminiService';
import { DailyMetric, SummaryResponse } from './types';
import { KPICard } from './components/KPICard';
import { MainTrendChart, SecondaryChart, DayOfWeekHeatmap, ConversionFunnel } from './components/Charts';
import { TopDaysTable } from './components/TopDaysTable';
import { Glossary } from './components/Glossary';
import { AiSummary } from './components/AiSummary';

const App: React.FC = () => {
  const [data, setData] = useState<DailyMetric[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const [aiSummary, setAiSummary] = useState<SummaryResponse | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showAi, setShowAi] = useState(false);

  const [activeTab, setActiveTab] = useState(DASHBOARD_TABS[0].id);

  // Filtros de Visualização Atual
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedPromo, setSelectedPromo] = useState<string>('all');

  // Filtros de Comparação
  const [comparisonMode, setComparisonMode] = useState<string>('previous_period');
  const [manualCompareStart, setManualCompareStart] = useState<string>('');
  const [manualCompareEnd, setManualCompareEnd] = useState<string>('');
  const [comparePromo, setComparePromo] = useState<string>('');

  const isSiteView = activeTab === 'tp-site';

  const parseInputDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  };

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setLoadingData(true);
      const currentTabConfig = DASHBOARD_TABS.find(t => t.id === activeTab) || DASHBOARD_TABS[0];
      const result = await fetchGoogleSheetData(currentTabConfig.sheetName);
      
      setData(result.data);
      setError(null);
      
      if (result.data.length > 0 && !startDate) {
        const sorted = [...result.data].sort((a, b) => a.date.getTime() - b.date.getTime());
        const lastDate = sorted[sorted.length - 1].date;
        const firstDate = new Date(lastDate);
        firstDate.setDate(lastDate.getDate() - 13);
        
        const endStr = lastDate.toISOString().split('T')[0];
        const startStr = firstDate.toISOString().split('T')[0];
        
        setEndDate(endStr);
        setStartDate(startStr);
        
        const prevEnd = new Date(firstDate);
        prevEnd.setDate(prevEnd.getDate() - 1);
        const prevStart = new Date(prevEnd);
        prevStart.setDate(prevStart.getDate() - 13);
        
        setManualCompareEnd(prevEnd.toISOString().split('T')[0]);
        setManualCompareStart(prevStart.toISOString().split('T')[0]);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError(`Erro ao carregar dados.`);
    } finally {
      setLoadingData(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData(true);
  }, [activeTab, loadData]);

  const uniquePromos = useMemo(() => {
    const promos = Array.from(new Set(data.map(d => d.promo).filter(p => p && p !== 'Sem Promo')));
    const sorted = promos.sort();
    if (sorted.length > 0 && !comparePromo) setComparePromo(sorted[0]);
    return sorted;
  }, [data]);

  // LÓGICA DE FILTRAGEM: Promoção isola os dias em que ocorreu
  const filteredData = useMemo(() => {
    if (data.length === 0) return [];
    
    // Se selecionou uma promo, filtramos por ela em todo o dataset primeiro
    if (selectedPromo !== 'all') {
      return data.filter(d => d.promo === selectedPromo);
    }
    
    // Se não selecionou promo, usa o filtro de data
    if (!startDate || !endDate) return [];
    return filterByDateRange(data, parseInputDate(startDate), parseInputDate(endDate));
  }, [data, startDate, endDate, selectedPromo]);
  
  const previousData = useMemo(() => {
    if (comparisonMode === 'none' || data.length === 0) return [];
    
    // COMPARAÇÃO POR PROMOÇÃO: Compara a Promoção selecionada com outra Promoção (independente de data)
    if (comparisonMode === 'promotion') {
        if (!comparePromo) return [];
        return data.filter(d => d.promo === comparePromo);
    }

    // COMPARAÇÃO POR PERÍODO
    if (comparisonMode === 'manual') {
      if (!manualCompareStart || !manualCompareEnd) return [];
      return filterByDateRange(data, parseInputDate(manualCompareStart), parseInputDate(manualCompareEnd));
    }

    // Se estivermos vendo uma promoção específica, o período anterior é baseado nos mesmos dias atrás da duração da promo
    let start, end;
    if (selectedPromo !== 'all' && filteredData.length > 0) {
       const sorted = [...filteredData].sort((a,b) => a.date.getTime() - b.date.getTime());
       start = sorted[0].date;
       end = sorted[sorted.length - 1].date;
    } else {
       if (!startDate || !endDate) return [];
       start = parseInputDate(startDate);
       end = parseInputDate(endDate);
    }

    const duration = end.getTime() - start.getTime();
    let prevStart = new Date(start);
    let prevEnd = new Date(end);

    if (comparisonMode === 'previous_period') {
      const daysDiff = Math.ceil(duration / (1000 * 60 * 60 * 24)) + 1;
      prevStart.setDate(prevStart.getDate() - daysDiff);
      prevEnd.setDate(prevEnd.getDate() - daysDiff);
    } else if (comparisonMode === 'previous_week') {
      prevStart.setDate(prevStart.getDate() - 7);
      prevEnd.setDate(prevEnd.getDate() - 7);
    } else if (comparisonMode === 'previous_month') {
      prevStart.setMonth(prevStart.getMonth() - 1);
      prevEnd.setMonth(prevEnd.getMonth() - 1);
    }

    return filterByDateRange(data, prevStart, prevEnd);
  }, [data, startDate, endDate, comparisonMode, manualCompareStart, manualCompareEnd, selectedPromo, comparePromo, filteredData]);

  const currentMetrics = useMemo(() => aggregateData(filteredData), [filteredData]);
  const prevMetrics = useMemo(() => aggregateData(previousData), [previousData]);

  const handleGenerateAi = async () => {
    if (filteredData.length === 0) return;
    setLoadingAi(true);
    setShowAi(true);
    const result = await generateAiSummary(filteredData, previousData);
    setAiSummary(result);
    setLoadingAi(false);
  };

  const TabIcon = ({ name }: { name: string }) => {
    if (name === 'LayoutDashboard') return <LayoutDashboard className="w-4 h-4" />;
    if (name === 'Search') return <Search className="w-4 h-4" />;
    if (name === 'Video') return <Video className="w-4 h-4" />;
    if (name === 'Megaphone') return <Megaphone className="w-4 h-4" />;
    return <LayoutDashboard className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans text-slate-200 bg-dark-bg selection:bg-neon selection:text-black pb-20">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        <header className="flex flex-col gap-6 border-b border-dark-border pb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center tracking-tight">
                <img src="https://i.imgur.com/whffOb7.png" alt="Logo" className="w-12 h-12 mr-4 object-contain" />
                Relatório Performance
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-slate-400 text-sm font-light uppercase tracking-widest">Hipercap Brasil</p>
                <span className="text-slate-600 text-xs">•</span>
                <p className="text-slate-500 text-xs font-mono">Última Sinc: {lastUpdated.toLocaleTimeString('pt-BR')}</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 w-full lg:w-auto">
               <div className="flex flex-wrap items-center gap-2 mb-2 justify-end">
                   <button onClick={handleGenerateAi} disabled={loadingAi || filteredData.length === 0} className="flex items-center gap-1.5 text-xs font-bold text-black bg-neon hover:bg-neon-dim px-4 py-1.5 rounded-full transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(230,255,0,0.2)]">
                    <Sparkles className="w-3.5 h-3.5" />
                    {loadingAi ? 'Analisando...' : 'IA Insights'}
                  </button>
                  <button onClick={() => loadData(true)} disabled={loadingData} className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-full transition-colors">
                    <RefreshCw className={`w-3 h-3 ${loadingData ? 'animate-spin' : ''}`} />
                  </button>
               </div>

               <div className="flex flex-col gap-2">
                  <div className="glass-panel p-3 rounded-2xl flex flex-col gap-2 shadow-2xl border-white/5">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                      {/* Filtro Principal */}
                      <div className="flex items-center gap-2 px-2 bg-dark-surface/50 rounded-lg border border-white/5 p-1.5">
                        <Tag className="w-4 h-4 text-neon" />
                        <select className="bg-transparent text-xs text-white font-bold focus:ring-0 outline-none cursor-pointer [&>option]:bg-dark-bg" value={selectedPromo} onChange={(e) => setSelectedPromo(e.target.value)}>
                          <option value="all">Filtro: Todos os Períodos</option>
                          {uniquePromos.map(promo => <option key={promo} value={promo}>Promo: {promo}</option>)}
                        </select>
                      </div>

                      {/* Seletor de Data (Só ativo se não houver promo selecionada) */}
                      {selectedPromo === 'all' && (
                        <div className="flex items-center gap-2 px-2 bg-dark-surface/50 rounded-lg border border-white/5 p-1.5">
                          <CalendarDays className="w-4 h-4 text-slate-400" />
                          <input type="date" className="py-0 px-0 text-xs bg-transparent border-none focus:ring-0 outline-none w-28 text-slate-200" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                          <span className="text-slate-600 text-[10px] uppercase font-bold">Até</span>
                          <input type="date" className="py-0 px-0 text-xs bg-transparent border-none focus:ring-0 outline-none w-28 text-slate-200" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                      )}

                      <div className="h-6 w-px bg-dark-border hidden md:block"></div>

                      {/* Seletor de Comparação */}
                      <div className="flex items-center gap-2 px-2 bg-dark-surface/50 rounded-lg border border-white/5 p-1.5">
                        <ArrowRightLeft className="w-4 h-4 text-slate-400" />
                        <select className="bg-transparent text-xs text-slate-300 font-bold focus:ring-0 outline-none cursor-pointer [&>option]:bg-dark-bg" value={comparisonMode} onChange={(e) => setComparisonMode(e.target.value)}>
                          {COMPARISON_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Detalhes da Comparação */}
                  {(comparisonMode === 'manual' || comparisonMode === 'promotion') && (
                    <div className="glass-panel p-2.5 rounded-xl flex items-center gap-2 shadow-xl animate-in slide-in-from-top-2 duration-300 border-neon/20">
                      <span className="text-[9px] uppercase font-black text-neon ml-2">Benchmark:</span>
                      
                      {comparisonMode === 'manual' ? (
                        <div className="flex items-center gap-2">
                          <input type="date" className="py-1 px-1.5 text-xs bg-transparent border-none focus:ring-0 outline-none w-32 text-neon/80 font-bold" value={manualCompareStart} onChange={(e) => setManualCompareStart(e.target.value)} />
                          <span className="text-slate-600 text-xs">até</span>
                          <input type="date" className="py-1 px-1.5 text-xs bg-transparent border-none focus:ring-0 outline-none w-32 text-neon/80 font-bold" value={manualCompareEnd} onChange={(e) => setManualCompareEnd(e.target.value)} />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-2">
                            <Layers className="w-3.5 h-3.5 text-neon" />
                            <select className="bg-transparent text-xs text-neon font-bold focus:ring-0 outline-none cursor-pointer [&>option]:bg-dark-bg" value={comparePromo} onChange={(e) => setComparePromo(e.target.value)}>
                                {uniquePromos.map(promo => <option key={promo} value={promo}>{promo}</option>)}
                            </select>
                        </div>
                      )}
                    </div>
                  )}
               </div>
            </div>
          </div>

          <div className="flex space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
            {DASHBOARD_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative flex items-center gap-2.5 px-6 py-4 rounded-t-xl transition-all duration-300 border-b-2 ${isActive ? 'bg-gradient-to-t from-neon/5 to-transparent border-neon text-white' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>
                  <TabIcon name={tab.icon} />
                  <span className={`text-sm font-bold tracking-tight ${isActive ? 'text-neon' : ''}`}>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </header>

        {loadingData ? (
          <div className="h-96 flex items-center justify-center flex-col text-slate-400">
            <Loader2 className="w-12 h-12 text-neon animate-spin mb-6" />
            <p className="font-medium tracking-widest text-xs uppercase opacity-70">Sincronizando Dados...</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* Resumo da Seleção */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 glass-panel px-5 py-4 rounded-2xl border-l-4 border-l-neon shadow-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                   <div className="w-2 h-2 rounded-full bg-neon"></div>
                   Análise: <strong className="text-white uppercase ml-1">{selectedPromo === 'all' ? 'Período Cronológico' : `Promoção: ${selectedPromo}`}</strong>
                </div>
                {comparisonMode !== 'none' && (
                  <div className="flex items-center gap-1.5 border-l border-white/10 pl-4">
                     <ArrowRightLeft className="w-3.5 h-3.5 text-rose-400" />
                     VS: <b className="text-rose-400 ml-1">{comparisonMode === 'promotion' ? `Benchmark: ${comparePromo}` : 'Período Anterior'}</b>
                  </div>
                )}
              </div>
              <div className="text-slate-400 font-mono">
                 Amostra: <b className="text-slate-200">{filteredData.length}</b> dias | 
                 Benchmark: <b className="text-slate-200">{previousData.length}</b> dias
              </div>
            </div>

            {showAi && <AiSummary data={aiSummary} loading={loadingAi} />}

            {/* Grid de Métricas - 7 colunas em LG para as novas métricas */}
            <section className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <KPICard label="Investimento" value={currentMetrics.totals.spend} prevValue={prevMetrics.totals.spend} isCurrency />
                <KPICard label="CPM" value={currentMetrics.averages.cpm} prevValue={prevMetrics.averages.cpm} isCurrency inverseTrend />
                <KPICard label="CTR" value={currentMetrics.averages.ctr} prevValue={prevMetrics.averages.ctr} isPercentage />
                <KPICard label="CPC" value={currentMetrics.averages.cpc} prevValue={prevMetrics.averages.cpc} isCurrency inverseTrend />
                {!isSiteView ? (
                  <KPICard label="CPI" value={currentMetrics.averages.cpi} prevValue={prevMetrics.averages.cpi} isCurrency inverseTrend />
                ) : (
                  <KPICard label="Clientes" value={currentMetrics.totals.clients} prevValue={prevMetrics.totals.clients} />
                )}
                <KPICard label="CPA" value={currentMetrics.averages.cpa} prevValue={prevMetrics.averages.cpa} isCurrency inverseTrend />
                {!isSiteView && <KPICard label="Clientes" value={currentMetrics.totals.clients} prevValue={prevMetrics.totals.clients} />}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {!isSiteView && <KPICard label="Instalações" value={currentMetrics.totals.installs} prevValue={prevMetrics.totals.installs} />}
                <KPICard label="Compras" value={currentMetrics.totals.purchases} prevValue={prevMetrics.totals.purchases} />
                <KPICard label="Taxa Conv." value={currentMetrics.averages.conversionRate} prevValue={prevMetrics.averages.conversionRate} isPercentage />
                <KPICard label="Custo Título" value={currentMetrics.averages.avgTitleCost} prevValue={prevMetrics.averages.avgTitleCost} isCurrency inverseTrend />
                <KPICard label="Receita" value={currentMetrics.totals.revenue} prevValue={prevMetrics.totals.revenue} isCurrency />
                <KPICard label="ROAS" value={currentMetrics.averages.roas} prevValue={prevMetrics.averages.roas} />
                <KPICard label="Média Títulos/Cli." value={currentMetrics.averages.titlesPerClient} prevValue={prevMetrics.averages.titlesPerClient} />
              </div>
            </section>

            <TopDaysTable data={filteredData} />

            <section className="flex flex-col gap-8 w-full">
                <MainTrendChart 
                  data={filteredData} 
                  previousData={comparisonMode !== 'none' ? previousData : undefined}
                  comparisonLabel={comparisonMode === 'promotion' ? `Bench: ${comparePromo}` : 'Periodo Ant.'}
                />
                <ConversionFunnel data={filteredData} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                   <DayOfWeekHeatmap data={filteredData} />
                   <SecondaryChart data={filteredData} />
                </div>
            </section>
          </div>
        )}

        <Glossary />
      </div>
      <SpeedInsights />
    </div>
  );
};

export default App;
