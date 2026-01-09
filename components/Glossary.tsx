import React from 'react';
import { BookOpen } from 'lucide-react';

export const Glossary: React.FC = () => {
  const terms = [
    { 
      term: 'CPM', 
      full: 'Custo por Mil Impressões', 
      def: 'Quanto custa para o anúncio aparecer 1.000 vezes. Indica se o leilão está caro.' 
    },
    { 
      term: 'CTR', 
      full: 'Taxa de Cliques', 
      def: 'Porcentagem de pessoas que viram o anúncio e clicaram. Mede o interesse no criativo.' 
    },
    { 
      term: 'CPI', 
      full: 'Custo por Instalação', 
      def: 'Quanto você gasta para conseguir 1 nova instalação do app.' 
    },
    { 
      term: 'CPA', 
      full: 'Custo por Ação/Aquisição', 
      def: 'Quanto custa para realizar uma venda. É a métrica mais importante de eficiência.' 
    },
    { 
      term: 'Tx de Conversão', 
      full: 'Taxa de Conversão', 
      def: 'De cada 100 cliques, quantos viraram compras reais.' 
    }
  ];

  return (
    <div className="mt-12 border-t border-dark-border pt-8">
      <div className="flex items-center mb-6 text-slate-500">
        <BookOpen className="w-5 h-5 mr-2" />
        <h3 className="text-xs font-bold uppercase tracking-widest">Dicionário de Métricas</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {terms.map((item) => (
          <div key={item.term} className="glass-panel p-4 rounded-xl border-t border-t-white/10 hover:border-neon/30 transition-colors">
            <div className="flex items-baseline justify-between mb-2">
              <span className="font-bold text-neon tracking-tight">{item.term}</span>
            </div>
            <p className="text-[11px] font-semibold text-slate-200 mb-1.5 uppercase tracking-wide">{item.full}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{item.def}</p>
          </div>
        ))}
      </div>
    </div>
  );
};