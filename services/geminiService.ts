import { GoogleGenAI } from "@google/genai";
import { DailyMetric, SummaryResponse } from '../types';

export const generateAiSummary = async (
  currentData: DailyMetric[],
  previousData: DailyMetric[]
): Promise<SummaryResponse> => {
  // 1. Prepare minimal context string to save tokens
  const formatNum = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  
  const summarizePeriod = (data: DailyMetric[]) => {
    const totalSpend = data.reduce((a, b) => a + b.spend, 0);
    const totalPurchases = data.reduce((a, b) => a + b.purchases, 0);
    const totalImpressions = data.reduce((a, b) => a + b.impressions, 0);
    const totalClicks = data.reduce((a, b) => a + b.clicks, 0);
    
    const avgCPA = totalPurchases ? totalSpend / totalPurchases : 0;
    const avgCTR = totalImpressions ? (totalClicks / totalImpressions) * 100 : 0;
    const avgCPM = totalImpressions ? (totalSpend / totalImpressions) * 1000 : 0;

    return { spend: totalSpend, purchases: totalPurchases, cpa: avgCPA, ctr: avgCTR, cpm: avgCPM };
  };

  const currentStats = summarizePeriod(currentData);
  const previousStats = summarizePeriod(previousData);

  // Identify outlier logic for context
  const outliers = currentData
    .filter(d => d.purchases > 0)
    .sort((a, b) => b.cpa - a.cpa)
    .slice(0, 2)
    .map(d => `${d.dateStr}: CPA R$${formatNum(d.cpa)}`)
    .join('; ');

  const prompt = `
    Atue como um Head de Performance reportando para um CEO. Seja extremamente direto, sem "bigodês" (jargão excessivo).
    
    DADOS DO PERÍODO ATUAL:
    - Investimento: R$ ${formatNum(currentStats.spend)}
    - Compras: ${currentStats.purchases}
    - CPA (Custo/Venda): R$ ${formatNum(currentStats.cpa)}
    - CTR: ${formatNum(currentStats.ctr)}%
    - CPM: R$ ${formatNum(currentStats.cpm)}
    
    COMPARAÇÃO (ANTERIOR):
    - Investimento: R$ ${formatNum(previousStats.spend)}
    - CPA Anterior: R$ ${formatNum(previousStats.cpa)}
    - CTR Anterior: ${formatNum(previousStats.ctr)}%
    
    OUTLIERS (Dias ruins): ${outliers}

    Gere um JSON estrito com estas chaves:
    {
      "executive_summary": [
        "3 bullet points curtos focados no resultado financeiro (gastou X, retornou Y, CPA melhorou/piorou)."
      ],
      "action_plan": [
        "3 ações táticas e priorizadas começando com verbos no imperativo (ex: Pause criativos com CTR < 1%, Aumente verba em dias de semana). Baseie-se nos dados."
      ],
      "risks": [
        "Liste alertas SOMENTE SE: CPA subiu, CTR caiu, CPM explodiu ou Vendas zeraram. Se estiver tudo bem, diga 'Métricas estáveis'."
      ]
    }
  `;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text) as SummaryResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      executive_summary: ["Sistema indisponível momentaneamente."],
      action_plan: ["Verifique a conexão ou a chave de API."],
      risks: []
    };
  }
};