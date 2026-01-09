import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: number;
  prevValue: number;
  isCurrency?: boolean;
  isPercentage?: boolean;
  inverseTrend?: boolean; // True if "Lower is Better" (e.g., CPA)
}

export const KPICard: React.FC<KPICardProps> = ({ 
  label, 
  value, 
  prevValue, 
  isCurrency, 
  isPercentage, 
  inverseTrend 
}) => {
  
  const formatValue = (val: number) => {
    if (isCurrency) return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    if (isPercentage) return `${val.toFixed(2)}%`;
    if (Number.isInteger(val)) return new Intl.NumberFormat('pt-BR').format(val);
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(val);
  };

  const percentChange = prevValue !== 0 ? ((value - prevValue) / prevValue) * 100 : 0;
  const formattedPrev = formatValue(prevValue);
  
  // Logic for color in Dark Mode
  let isPositive = percentChange > 0;
  let isGood = inverseTrend ? !isPositive : isPositive;
  if (Math.abs(percentChange) < 0.5) isGood = true; // Neutral

  // Use slightly desaturated/brighter colors for dark mode visibility
  const trendColor = Math.abs(percentChange) < 0.5 
    ? "text-slate-500" 
    : isGood 
      ? "text-green-400" 
      : "text-red-400";

  const BgIcon = Math.abs(percentChange) < 0.5 
    ? Minus 
    : isPositive 
      ? ArrowUpRight 
      : ArrowDownRight;

  return (
    <div className="glass-panel p-5 rounded-2xl hover:bg-dark-surface/80 transition-all duration-300 group">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-neon transition-colors">{label}</p>
      <div className="mt-2 flex items-baseline justify-between">
        <h3 className="text-2xl font-bold text-white tracking-tight">{formatValue(value)}</h3>
      </div>
      <div className={`mt-3 flex flex-wrap items-center text-xs font-medium ${trendColor}`}>
        <div className={`flex items-center px-1.5 py-0.5 rounded ${Math.abs(percentChange) < 0.5 ? 'bg-slate-800' : isGood ? 'bg-green-400/10' : 'bg-red-400/10'}`}>
          <BgIcon className="w-3 h-3 mr-1" />
          {Math.abs(percentChange).toFixed(1)}%
        </div>
        <span className="text-slate-500 ml-2 font-normal whitespace-nowrap text-[11px]">
          vs anterior <span className="mx-1 text-slate-700">|</span> <span className="text-slate-400">{formattedPrev}</span>
        </span>
      </div>
    </div>
  );
};