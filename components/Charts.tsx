
import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, ComposedChart, Line, Legend, Cell
} from 'recharts';
import { DailyMetric } from '../types';
import { ArrowRight, Filter, MousePointerClick, Download, ShoppingBag, Eye, ArrowDown } from 'lucide-react';

interface ChartProps {
  data: DailyMetric[];
  previousData?: DailyMetric[];
  comparisonLabel?: string;
}

// Definições de Gradientes Reutilizáveis
const ChartGradients = () => (
  <defs>
    <linearGradient id="gradientNeon" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#E6FF00" stopOpacity={0.3}/>
      <stop offset="95%" stopColor="#E6FF00" stopOpacity={0}/>
    </linearGradient>
    <linearGradient id="gradientCyan" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
    </linearGradient>
    <linearGradient id="gradientRose" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#fb7185" stopOpacity={0.3}/>
      <stop offset="95%" stopColor="#fb7185" stopOpacity={0}/>
    </linearGradient>
    {/* Gradient for Bars */}
    <linearGradient id="gradientBarNeon" x1="0" y1="0" x2="0" y2="1">
       <stop offset="0%" stopColor="#E6FF00" stopOpacity={0.9}/>
       <stop offset="100%" stopColor="#E6FF00" stopOpacity={0.4}/>
    </linearGradient>
     <linearGradient id="gradientBarRose" x1="0" y1="0" x2="0" y2="1">
       <stop offset="0%" stopColor="#fb7185" stopOpacity={0.9}/>
       <stop offset="100%" stopColor="#fb7185" stopOpacity={0.4}/>
    </linearGradient>
  </defs>
);

// --- Custom Tooltip Component ---
const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-bg/95 border border-white/10 p-3 rounded-xl shadow-xl backdrop-blur-md z-50">
        <p className="text-slate-400 text-xs mb-2 font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
            <div 
              className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" 
              style={{ backgroundColor: entry.stroke || entry.fill, color: entry.stroke || entry.fill }}
            />
            <span className="text-slate-200 text-xs font-medium">{entry.name}:</span>
            <span className="text-white text-xs font-bold font-mono">
              {entry.name === 'CTR' ? '' : (entry.name === 'CPM' ? 'R$ ' : prefix)}
              {typeof entry.value === 'number' ? entry.value.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : entry.value}
              {entry.name === 'CTR' ? '%' : ''}
              {suffix}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const MainTrendChart: React.FC<ChartProps> = ({ data, previousData, comparisonLabel }) => {
  const [metric, setMetric] = useState<'spend' | 'purchases' | 'cpa'>('cpa');

  const configs = {
    spend: { color: '#22d3ee', gradient: 'url(#gradientCyan)', name: 'Investimento', prefix: 'R$ ' },
    purchases: { color: '#E6FF00', gradient: 'url(#gradientNeon)', name: 'Compras', prefix: '' },
    cpa: { color: '#fb7185', gradient: 'url(#gradientRose)', name: 'CPA', prefix: 'R$ ' }
  };

  const currentConfig = configs[metric];
  
  const chartData = data.map((d, i) => {
    const prev = previousData && previousData[i];
    return {
        ...d,
        [`prev_${metric}`]: prev ? prev[metric] : null,
        prevDateStr: prev ? prev.originalDateStr : null
    };
  });

  return (
    <div className="glass-panel p-6 rounded-2xl relative w-full h-[450px]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-neon/5 blur-[80px] rounded-full pointer-events-none -z-10"></div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 relative z-10 gap-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-3">
          <div className="flex items-center gap-2">
             <span className={`w-1 h-5 rounded-full shadow-[0_0_10px_currentColor]`} style={{ backgroundColor: currentConfig.color }}></span>
             Tendência Principal
          </div>
          {previousData && previousData.length > 0 && (
             <span className="text-[10px] font-medium text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/5">
                Comparando com: <span className="text-slate-300">{comparisonLabel?.split('(')[0] || 'Anterior'}</span>
             </span>
          )}
        </h3>
        <div className="flex space-x-1 bg-dark-bg/50 p-1 rounded-lg border border-dark-border backdrop-blur-md">
          {(Object.keys(configs) as Array<keyof typeof configs>).map((key) => (
            <button
              key={key}
              onClick={() => setMetric(key)}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-300 ${
                metric === key 
                  ? 'bg-slate-800 text-white shadow-lg border border-white/10' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              style={metric === key ? { color: configs[key].color, borderColor: `${configs[key].color}30` } : {}}
            >
              {configs[key].name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-[350px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <ChartGradients />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.2} />
            <XAxis 
              dataKey="originalDateStr" 
              tick={{fontSize: 10, fill: '#64748b'}} 
              tickLine={false}
              axisLine={false}
              minTickGap={30}
              dy={10}
            />
            <YAxis 
              tick={{fontSize: 10, fill: '#64748b'}} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${currentConfig.prefix}${val}`}
              domain={['auto', 'auto']}
              width={60}
            />
            <Tooltip content={<CustomTooltip prefix={currentConfig.prefix} />} cursor={{stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1}} />
            
            {previousData && (
                <Line
                    type="monotone"
                    dataKey={`prev_${metric}`}
                    name={`${currentConfig.name} (Anterior)`}
                    stroke={currentConfig.color}
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    strokeOpacity={0.4}
                    dot={false}
                    activeDot={{r: 4, fill: '#070A0F', stroke: currentConfig.color, strokeOpacity: 0.5}}
                />
            )}

            <Area 
              type="monotone" 
              dataKey={metric} 
              name={currentConfig.name}
              stroke={currentConfig.color} 
              strokeWidth={3} 
              fill={currentConfig.gradient}
              activeDot={{r: 6, fill: '#070A0F', stroke: currentConfig.color, strokeWidth: 3}}
              animationDuration={1500}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const SecondaryChart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div className="glass-panel p-6 rounded-2xl relative w-full h-[400px]">
       <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#22d3ee]/5 blur-[60px] rounded-full pointer-events-none -z-10"></div>

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center">
           Relação CTR x CPM
        </h3>
        <div className="flex items-center gap-3 text-[10px] font-medium bg-dark-bg/30 px-3 py-1.5 rounded-full border border-white/5">
           <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-neon shadow-[0_0_6px_rgba(230,255,0,0.5)]"></span>
              <span className="text-slate-300">CTR %</span>
           </div>
           <div className="w-px h-3 bg-white/10"></div>
           <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22d3ee] shadow-[0_0_6px_rgba(34,211,238,0.5)]"></span>
              <span className="text-slate-300">CPM R$</span>
           </div>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <ChartGradients />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.2} />
            <XAxis dataKey="originalDateStr" hide />
            <YAxis 
              yAxisId="left" 
              orientation="left" 
              tickFormatter={v => `${v.toFixed(1)}%`} 
              tick={{fontSize: 10, fill: '#94a3b8'}} 
              axisLine={false} 
              tickLine={false} 
              domain={['auto', 'auto']}
              width={40}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              tickFormatter={v => `R$${v}`} 
              tick={{fontSize: 10, fill: '#94a3b8'}} 
              axisLine={false} 
              tickLine={false} 
              domain={['auto', 'auto']}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} cursor={{stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1}} />
            <Area 
              yAxisId="left" 
              type="monotone" 
              dataKey="ctr" 
              name="CTR" 
              stroke="#E6FF00" 
              strokeWidth={2} 
              fill="url(#gradientNeon)" 
              fillOpacity={1}
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="cpm" 
              name="CPM" 
              stroke="#22d3ee" 
              strokeWidth={2} 
              dot={false}
              activeDot={{r: 4, fill: '#070A0F', stroke: '#22d3ee', strokeWidth: 2}}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const DayOfWeekHeatmap: React.FC<ChartProps> = ({ data }) => {
  const weekDays = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  
  const aggregated = weekDays.map(day => {
    const dayData = data.filter(d => d.weekday.toLowerCase() === day);
    const totalSpend = dayData.reduce((a, b) => a + b.spend, 0);
    const totalPurchases = dayData.reduce((a, b) => a + b.purchases, 0);
    return {
      name: day.split('-')[0].substring(0, 3).toUpperCase(),
      cpa: totalPurchases ? totalSpend / totalPurchases : 0,
      purchases: totalPurchases
    };
  });

  return (
    <div className="glass-panel p-6 rounded-2xl w-full h-[400px]">
      <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-6 flex items-center">
         Performance Semanal
      </h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={aggregated} barGap={0} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
             <ChartGradients />
             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.2} />
             <XAxis 
              dataKey="name" 
              tick={{fontSize: 10, fill: '#64748b'}} 
              axisLine={false} 
              tickLine={false} 
              dy={10}
             />
             <YAxis yAxisId="purchases" orientation="left" stroke="#E6FF00" hide />
             <YAxis yAxisId="cpa" orientation="right" stroke="#fb7185" hide />
             <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.03)'}} />
             <Bar 
              yAxisId="purchases" 
              dataKey="purchases" 
              name="Compras" 
              fill="url(#gradientBarNeon)" 
              radius={[4, 4, 0, 0]} 
              barSize={18} 
             />
             <Bar 
              yAxisId="cpa" 
              dataKey="cpa" 
              name="CPA" 
              fill="url(#gradientBarRose)" 
              radius={[4, 4, 0, 0]} 
              barSize={18} 
             />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// NEW VISUAL FUNNEL (HTML/CSS Based for Reliability)
export const ConversionFunnel: React.FC<ChartProps> = ({ data }) => {
  // Aggregate Totals
  const totals = data.reduce((acc, curr) => ({
    impressions: acc.impressions + curr.impressions,
    clicks: acc.clicks + curr.clicks,
    purchases: acc.purchases + curr.purchases
  }), { impressions: 0, clicks: 0, purchases: 0 });

  if (totals.impressions === 0 && totals.clicks === 0) return null;

  // Calculate Rates
  const ctr = totals.impressions ? ((totals.clicks / totals.impressions) * 100).toFixed(2) : '0.00';
  const conversionRate = totals.clicks ? ((totals.purchases / totals.clicks) * 100).toFixed(2) : '0.00';

  const FunnelStep = ({ 
    label, 
    value, 
    colorClass, 
    icon: Icon
  }: any) => (
    <div className={`relative flex-1 p-5 rounded-2xl border backdrop-blur-sm flex flex-col items-center justify-center min-w-[140px] transition-all duration-300 ${colorClass}`}>
      <div className="bg-black/20 p-2.5 rounded-full mb-2">
         <Icon className="w-5 h-5 opacity-80" />
      </div>
      <span className="text-[10px] uppercase font-bold tracking-widest opacity-70 mb-1 text-center">{label}</span>
      <span className="text-xl md:text-2xl font-bold tracking-tight text-center">{new Intl.NumberFormat('pt-BR', { notation: "compact" }).format(value)}</span>
    </div>
  );

  const Connector = ({ rate, label }: { rate: string, label: string }) => (
    <div className="flex md:flex-col items-center justify-center py-2 md:py-0 md:px-4 z-10 -my-3 md:my-0">
        <div className="bg-dark-bg border border-white/10 rounded-xl px-3 py-1.5 flex flex-row md:flex-col items-center shadow-lg z-10 gap-2 md:gap-0">
            <span className="text-[9px] text-slate-500 font-black uppercase whitespace-nowrap">{label}</span>
            <div className="flex items-center text-neon font-black text-sm">
                {rate}% <span className="hidden md:inline"><ArrowRight className="w-4 h-4 ml-0.5" /></span>
                <span className="md:hidden"><ArrowDown className="w-4 h-4 ml-0.5" /></span>
            </div>
        </div>
        {/* Line for Desktop (Horizontal) */}
        <div className="hidden md:block h-px w-full bg-white/10 absolute -z-0"></div>
        {/* Line for Mobile (Vertical) */}
        <div className="md:hidden w-px h-full bg-white/10 absolute -z-0"></div>
    </div>
  );

  return (
    <div className="glass-panel p-8 rounded-3xl w-full">
      <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-8 flex items-center gap-2">
         <Filter className="w-4 h-4 text-neon" />
         Jornada de Conversão
      </h3>
      
      <div className="flex flex-col md:flex-row gap-4 md:gap-0 justify-between relative items-center max-w-5xl mx-auto">
         {/* Background Line for Desktop Only */}
         <div className="hidden md:block absolute top-1/2 left-20 right-20 h-0.5 bg-gradient-to-r from-slate-800 via-neon/20 to-rose-900/40 -z-10 -translate-y-1/2"></div>

         <FunnelStep 
            label="Impressões" 
            value={totals.impressions} 
            icon={Eye}
            colorClass="bg-slate-800/50 border-white/5 text-slate-300 w-full md:w-auto"
         />
         
         <Connector rate={ctr} label="CTR" />
         
         <FunnelStep 
            label="Cliques" 
            value={totals.clicks} 
            icon={MousePointerClick}
            colorClass="bg-[#22d3ee]/10 border-[#22d3ee]/30 text-[#22d3ee] w-full md:w-auto"
         />

         <Connector rate={conversionRate} label="Taxa de Conv." />

         <FunnelStep 
            label="Compras" 
            value={totals.purchases} 
            icon={ShoppingBag}
            colorClass="bg-[#fb7185]/10 border-[#fb7185]/30 text-[#fb7185] w-full md:w-auto"
         />
      </div>
    </div>
  );
};
