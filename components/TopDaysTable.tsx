import React, { useMemo } from 'react';
import { DailyMetric } from '../types';
import { ArrowDown, ArrowUp, Minus, AlertCircle } from 'lucide-react';

export const TopDaysTable: React.FC<{ data: DailyMetric[] }> = ({ data }) => {
  // 1. Calculate Averages for Heatmap Logic
  const periodStats = useMemo(() => {
    if (data.length === 0) return { avgCpa: 0, avgSpend: 0, avgPurchases: 0, avgCtr: 0 };
    
    const totals = data.reduce((acc, curr) => ({
      spend: acc.spend + curr.spend,
      purchases: acc.purchases + curr.purchases,
      ctr: acc.ctr + curr.ctr
    }), { spend: 0, purchases: 0, ctr: 0 });

    const avgSpend = totals.spend / data.length;
    const avgPurchases = totals.purchases / data.length;
    const avgCtr = totals.ctr / data.length;
    // CPA global (Total Spend / Total Purchases) is usually better than avg of daily CPAs for reference
    const avgCpa = totals.purchases > 0 ? totals.spend / totals.purchases : 0;

    return { avgCpa, avgSpend, avgPurchases, avgCtr };
  }, [data]);

  // 2. Sort by Date Descending (Newest first)
  const sortedDays = [...data].sort((a, b) => b.date.getTime() - a.date.getTime());

  // Helper to determine Heatmap styling
  // inverse = true for CPA (Lower is Better/Green)
  const getHeatmapStyle = (value: number, average: number, inverse: boolean = false, isVolume: boolean = false) => {
    if (value === 0) return { color: 'text-slate-500', bg: 'bg-transparent', icon: Minus };
    
    const diff = ((value - average) / average) * 100;
    
    // Volume metrics (Spend) - Just indicate magnitude visually, white/bright for high, dim for low
    if (isVolume) {
        if (diff > 20) return { color: 'text-white font-bold', bg: 'bg-white/10', icon: ArrowUp };
        if (diff < -20) return { color: 'text-slate-500', bg: 'bg-transparent', icon: ArrowDown };
        return { color: 'text-slate-300', bg: 'bg-transparent', icon: Minus };
    }

    // Performance Metrics
    const isGood = inverse ? diff < 0 : diff > 0;
    const isNeutral = Math.abs(diff) < 5; // 5% margin

    if (isNeutral) return { color: 'text-slate-300', bg: 'bg-slate-500/5', icon: Minus };
    
    if (isGood) {
        return { 
            color: 'text-neon font-bold', 
            bg: 'bg-neon/10 border border-neon/20', 
            icon: inverse ? ArrowDown : ArrowUp 
        };
    } else {
        return { 
            color: 'text-red-400 font-bold', 
            bg: 'bg-red-500/10 border border-red-500/20', 
            icon: inverse ? ArrowUp : ArrowDown 
        };
    }
  };

  return (
    <div className="glass-panel overflow-hidden rounded-2xl flex flex-col h-full max-h-[600px] border border-dark-border/50 shadow-2xl">
      <div className="px-6 py-5 border-b border-dark-border flex flex-col md:flex-row items-start md:items-center justify-between bg-dark-glass shrink-0 gap-4">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-neon mr-3 shadow-[0_0_8px_#E6FF00]"></div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Detalhamento Diário & Mapa de Calor</h3>
            <p className="text-xs text-slate-400 font-light mt-0.5">
              Comparativo dia-a-dia vs Média do Período selecionado
            </p>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-wider bg-black/20 p-2 rounded-lg border border-white/5">
           <div className="flex items-center gap-1.5 text-neon">
              <span className="w-2 h-2 rounded bg-neon/20 border border-neon"></span>
              Melhor que a média
           </div>
           <div className="flex items-center gap-1.5 text-red-400">
              <span className="w-2 h-2 rounded bg-red-400/20 border border-red-400"></span>
              Pior que a média
           </div>
        </div>
      </div>

      <div className="overflow-y-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-dark-border relative">
          <thead className="bg-dark-surface sticky top-0 z-10 shadow-lg">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  CPA (Custo/Venda)
                  <span className="block text-[9px] text-slate-600 font-normal normal-case">Média: R$ {periodStats.avgCpa.toFixed(2)}</span>
              </th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Compras
                  <span className="block text-[9px] text-slate-600 font-normal normal-case">Média: {periodStats.avgPurchases.toFixed(0)}</span>
              </th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Investimento
                  <span className="block text-[9px] text-slate-600 font-normal normal-case">Média: R$ {periodStats.avgSpend.toLocaleString('pt-BR', {maximumFractionDigits:0})}</span>
              </th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  CTR
                  <span className="block text-[9px] text-slate-600 font-normal normal-case">Média: {periodStats.avgCtr.toFixed(2)}%</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border bg-transparent">
            {sortedDays.map((day, idx) => {
              // Calculate Styles
              const cpaStyle = getHeatmapStyle(day.cpa, periodStats.avgCpa, true); // True = Lower is better
              const purchStyle = getHeatmapStyle(day.purchases, periodStats.avgPurchases, false);
              const spendStyle = getHeatmapStyle(day.spend, periodStats.avgSpend, false, true); // Volume only
              const ctrStyle = getHeatmapStyle(day.ctr, periodStats.avgCtr, false);

              return (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                  {/* Date Column */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200 font-medium border-l-2 border-transparent group-hover:border-neon/30">
                    <div className="flex flex-col">
                      <span className="font-bold tracking-tight">{day.originalDateStr.slice(0, 5)}</span>
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{day.weekday.split('-')[0]}</span>
                    </div>
                  </td>

                  {/* CPA Column */}
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md w-fit ${cpaStyle.bg} ${cpaStyle.color}`}>
                       <cpaStyle.icon className="w-3 h-3" />
                       <span className="font-mono text-xs">R$ {day.cpa.toFixed(2)}</span>
                    </div>
                  </td>

                  {/* Purchases Column */}
                  <td className="px-6 py-3 whitespace-nowrap">
                     <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md w-fit ${purchStyle.bg} ${purchStyle.color}`}>
                       <purchStyle.icon className="w-3 h-3" />
                       <span className="font-mono text-xs">{day.purchases}</span>
                    </div>
                  </td>

                  {/* Spend Column */}
                  <td className="px-6 py-3 whitespace-nowrap">
                     <div className={`flex items-center gap-2 ${spendStyle.color}`}>
                       <span className="font-mono text-xs">R$ {day.spend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </td>

                  {/* CTR Column */}
                  <td className="px-6 py-3 whitespace-nowrap">
                     <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md w-fit ${ctrStyle.bg} ${ctrStyle.color}`}>
                       <ctrStyle.icon className="w-3 h-3" />
                       <span className="font-mono text-xs">{day.ctr.toFixed(2)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {data.length === 0 && (
          <div className="p-12 flex flex-col items-center justify-center text-slate-500 space-y-3">
            <AlertCircle className="w-8 h-8 opacity-50" />
            <p className="text-sm font-medium">Nenhum dado encontrado para o período selecionado.</p>
          </div>
        )}
      </div>
    </div>
  );
};