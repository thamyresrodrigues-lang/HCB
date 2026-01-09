
export interface TrafficDataRaw {
  Date: string;
  "Dia da Semana": string;
  "Investimento (BRL)": string;
  "Impressões": string;
  "CPM (BRL)": string;
  "Cliques": string;
  "CTR (%)": string;
  "Instalações": string;
  "Tx de Instalações (%)": string;
  "CPI (BRL)": string;
  "Compras": string;
  "Tx de Conversão (%)": string;
  "CPA (BRL)": string;
  "Custo Título": string;
  "Receita": string;
  "Promo": string;
  "Clientes": string;
}

export interface DailyMetric {
  date: Date;
  dateStr: string;
  originalDateStr: string;
  weekday: string;
  spend: number;
  impressions: number;
  cpm: number;
  clicks: number;
  ctr: number;
  installs: number;
  installRate: number;
  cpi: number;
  purchases: number;
  conversionRate: number;
  cpa: number;
  cpc: number;
  titleCost: number;
  revenue: number;
  roas: number;
  promo: string;
  clients: number;
  titlesPerClient: number;
}

export enum MetricType {
  SPEND = 'Investimento',
  IMPRESSIONS = 'Impressões',
  CPM = 'CPM',
  CLICKS = 'Cliques',
  CTR = 'CTR',
  INSTALLS = 'Instalações',
  CPI = 'CPI',
  PURCHASES = 'Compras',
  CONVERSION_RATE = 'Tx de Conversão',
  CPA = 'CPA',
  TITLE_COST = 'Custo do Título',
  REVENUE = 'Receita',
  CLIENTS = 'Clientes',
  TITLES_PER_CLIENT = 'Média de Títulos por Cliente'
}

export interface KPIData {
  label: string;
  value: number;
  previousValue: number;
  isCurrency: boolean;
  isPercentage: boolean;
  inverseTrend: boolean;
}

export interface SummaryResponse {
  executive_summary: string[];
  action_plan: string[];
  risks: string[];
}
