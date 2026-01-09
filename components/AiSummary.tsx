
import React from 'react';
import { SummaryResponse } from '../types';
import { Sparkles, AlertTriangle, CheckSquare, Target, Activity, Zap } from 'lucide-react';

interface Props {
  data: SummaryResponse | null;
  loading: boolean;
}

export const AiSummary: React.FC<Props> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="glass-panel p-8 rounded-3xl border border-neon/10 shadow-2xl animate-pulse space-y-6">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-neon/10 rounded-full"></div>
           <div className="h-6 w-48 bg-slate-800 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-slate-800/50 rounded-2xl"></div>
          <div className="h-32 bg-slate-800/50 rounded-2xl"></div>
          <div className="h-32 bg-slate-800/50 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="glass-panel rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative group">
      {/* Glow Effect */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon to-transparent opacity-50"></div>
      
      {/* Header */}
      <div className="bg-dark-surface/50 px-8 py-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neon/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-neon" />
          </div>
          <h3 className="font-black text-lg text-white tracking-tight uppercase">Insights Estratégicos <span className="text-neon/50 ml-1 font-light italic text-sm">by Gemini</span></h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-neon/5 border border-neon/20 rounded-full">
           <Zap className="w-3 h-3 text-neon" />
           <span className="text-neon text-[10px] font-black uppercase tracking-widest">Análise Ativa</span>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
        
        {/* Executive Summary (Main Column) */}
        <div className="md:col-span-12 lg:col-span-5 space-y-5">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
            <Activity className="w-4 h-4 mr-2 text-neon" />
            Performance Geral
          </h4>
          <ul className="space-y-4">
            {data.executive_summary.map((item, i) => (
              <li key={i} className="text-slate-200 text-sm leading-relaxed border-l-2 border-neon/30 pl-4 py-1 hover:border-neon transition-colors">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Action Plan */}
        <div className="md:col-span-6 lg:col-span-4 space-y-5">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
            <Target className="w-4 h-4 mr-2 text-[#22d3ee]" />
            Plano de Ataque
          </h4>
          <ul className="space-y-3">
            {data.action_plan.map((item, i) => (
              <li key={i} className="flex items-start bg-white/5 p-4 rounded-2xl border border-white/5 group-hover:border-[#22d3ee]/20 transition-all">
                <CheckSquare className="w-4 h-4 text-[#22d3ee] mr-3 mt-0.5 shrink-0" />
                <span className="text-xs text-slate-200 font-semibold leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Risks/Alerts */}
        <div className="md:col-span-6 lg:col-span-3 space-y-5">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 text-[#fb7185]" />
            Riscos & Alertas
          </h4>
          <div className="space-y-3">
            {data.risks.length > 0 ? (
              data.risks.map((item, i) => (
                <div key={i} className={`p-4 rounded-2xl border text-xs font-medium leading-relaxed ${
                  item.toLowerCase().includes('estáveis') 
                    ? 'bg-green-500/5 border-green-500/20 text-green-400' 
                    : 'bg-[#fb7185]/5 border-[#fb7185]/20 text-[#fb7185]'
                }`}>
                  {item}
                </div>
              ))
            ) : (
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-xs text-slate-500 italic">
                Nenhum risco crítico detectado no momento.
              </div>
            )}
          </div>
        </div>

      </div>
      
      {/* Background decoration */}
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-neon/5 blur-[60px] rounded-full pointer-events-none"></div>
    </div>
  );
};
