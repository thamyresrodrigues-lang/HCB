import React from 'react';
import { SummaryResponse } from '../types';
import { Sparkles, AlertTriangle, CheckSquare, Target, Activity } from 'lucide-react';

interface Props {
  data: SummaryResponse | null;
  loading: boolean;
}

export const AiSummary: React.FC<Props> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-pulse space-y-4">
        <div className="h-6 w-48 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-24 bg-gray-100 rounded"></div>
          <div className="h-24 bg-gray-100 rounded"></div>
          <div className="h-24 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center text-white">
          <Sparkles className="w-5 h-5 mr-2" />
          <h3 className="font-bold text-lg">Análise Inteligente</h3>
        </div>
        <span className="text-brand-100 text-xs font-medium uppercase tracking-wider bg-brand-900/30 px-2 py-1 rounded">
          Gerado por IA
        </span>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Executive Summary (Main Column) */}
        <div className="md:col-span-12 lg:col-span-5 space-y-4">
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center">
            <Activity className="w-4 h-4 mr-2 text-brand-600" />
            Resumo Executivo
          </h4>
          <ul className="space-y-3">
            {data.executive_summary.map((item, i) => (
              <li key={i} className="text-gray-700 text-sm leading-relaxed border-l-2 border-brand-200 pl-3">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Action Plan */}
        <div className="md:col-span-6 lg:col-span-4 space-y-4">
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center">
            <Target className="w-4 h-4 mr-2 text-green-600" />
            O que fazer agora (Prioridade)
          </h4>
          <ul className="space-y-2">
            {data.action_plan.map((item, i) => (
              <li key={i} className="flex items-start bg-green-50 p-3 rounded-lg border border-green-100">
                <CheckSquare className="w-4 h-4 text-green-600 mr-2 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-800 font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Risks/Alerts */}
        <div className="md:col-span-6 lg:col-span-3 space-y-4">
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
            Riscos & Alertas
          </h4>
          <div className="space-y-2">
            {data.risks.length > 0 ? (
              data.risks.map((item, i) => (
                <div key={i} className="bg-orange-50 p-3 rounded-lg border border-orange-100 text-sm text-orange-800">
                  {item}
                </div>
              ))
            ) : (
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-500 italic">
                Nenhum risco crítico detectado no momento.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};