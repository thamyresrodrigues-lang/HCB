
import { DailyMetric, TrafficDataRaw } from '../types';
import { GOOGLE_SHEET_BASE_URL } from '../constants';

export interface FetchResult {
  data: DailyMetric[];
  debugInfo?: {
    headersFound: string[];
    rawFirstRow: string[];
    sheetName: string;
    missingCriticalFields: string[];
  };
}

const normalizeHeader = (header: string) => header.toLowerCase().trim();

const parseCurrency = (value: any): number => {
  if (value === null || value === undefined) return 0;
  let str = value.toString().replace(/[R$\s]/g, '').trim();
  if (!str || str === '-' || str === 'null') return 0;
  str = str.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
};

const parseIntString = (value: any): number => {
  if (value === null || value === undefined) return 0;
  let str = value.toString().trim();
  if (!str || str === '-' || str === 'null') return 0;
  str = str.replace(/\./g, '').replace(/\s/g, '').replace(',', '.');
  const num = parseFloat(str);
  return isNaN(num) ? Math.floor(num) : Math.floor(num);
};

const parseDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const cleanDate = dateStr.trim();
  
  if (cleanDate.includes('/')) {
    const parts = cleanDate.split('/');
    if (parts.length === 3) {
      let day = parseInt(parts[0]);
      let month = parseInt(parts[1]) - 1;
      let year = parseInt(parts[2]);
      if (year < 100) year += 2000;
      return new Date(year, month, day, 12, 0, 0);
    }
  }
  
  const d = new Date(cleanDate);
  if (!isNaN(d.getTime())) {
    d.setHours(12, 0, 0, 0);
    return d;
  }
  return new Date();
};

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let start = 0;
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') inQuotes = !inQuotes;
    else if (line[i] === ',' && !inQuotes) {
      let val = line.substring(start, i);
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1).replace(/""/g, '"');
      result.push(val.trim());
      start = i + 1;
    }
  }
  let lastVal = line.substring(start);
  if (lastVal.startsWith('"') && lastVal.endsWith('"')) lastVal = lastVal.slice(1, -1).replace(/""/g, '"');
  result.push(lastVal.trim());
  return result;
};

const KEYWORDS = {
  date: ['data', 'date', 'dia'],
  spend: ['investimento', 'valor gasto', 'spend'],
  impressions: ['impressoes', 'impressões', 'impressions'],
  clicks: ['cliques', 'clicks'],
  installs: ['instalações', 'instalacoes', 'installs'],
  purchases: ['compras', 'purchases', 'vendas'],
  cpm: ['cpm'],
  ctr: ['ctr'],
  cpa: ['cpa'],
  cpi: ['cpi'],
  conversionRate: ['tx de conversão', 'tx de conversao', 'taxa de conversao', 'conv rate'],
  installRate: ['tx de instalações', 'tx de instalacoes', 'taxa de instalacoes', 'install rate'],
  titleCost: ['custo título', 'custo titulo', 'custo do titulo', 'titulo cost'],
  revenue: ['receita', 'revenue', 'faturamento'],
  promo: ['promo', 'promoção', 'promocao'],
  clients: ['clientes', 'clientes únicos', 'unique users', 'usuarios']
};

const findColumnIndex = (headers: string[], keywordKey: keyof typeof KEYWORDS): number => {
  const normalizedHeaders = headers.map(normalizeHeader);
  const searchTerms = KEYWORDS[keywordKey].map(normalizeHeader);
  
  let index = normalizedHeaders.findIndex(h => searchTerms.some(k => h === k));
  if (index === -1) {
    index = normalizedHeaders.findIndex(h => searchTerms.some(k => h.includes(k)));
  }
  return index;
};

export const fetchGoogleSheetData = async (sheetName: string = 'Geral Tráfego'): Promise<FetchResult> => {
  try {
    const timestamp = new Date().getTime();
    const urlWithSheet = `${GOOGLE_SHEET_BASE_URL}&sheet=${encodeURIComponent(sheetName)}&t=${timestamp}`;
    const response = await fetch(urlWithSheet);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.statusText}`);
    const text = await response.text();
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    let headerRowIndex = 0;
    let headers: string[] = [];

    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const row = parseCSVLine(lines[i]).map(normalizeHeader);
      if (row.some(c => c.includes('data') || c.includes('date'))) {
        headerRowIndex = i;
        headers = parseCSVLine(lines[i]);
        break;
      }
    }

    const map = {
      date: findColumnIndex(headers, 'date'),
      spend: findColumnIndex(headers, 'spend'),
      impressions: findColumnIndex(headers, 'impressions'),
      clicks: findColumnIndex(headers, 'clicks'),
      installs: findColumnIndex(headers, 'installs'),
      purchases: findColumnIndex(headers, 'purchases'),
      cpm: findColumnIndex(headers, 'cpm'),
      ctr: findColumnIndex(headers, 'ctr'),
      cpa: findColumnIndex(headers, 'cpa'),
      cpi: findColumnIndex(headers, 'cpi'),
      conversionRate: findColumnIndex(headers, 'conversionRate'),
      installRate: findColumnIndex(headers, 'installRate'),
      titleCost: findColumnIndex(headers, 'titleCost'),
      revenue: findColumnIndex(headers, 'revenue'),
      promo: findColumnIndex(headers, 'promo'),
      clients: findColumnIndex(headers, 'clients')
    };

    const result = lines.slice(headerRowIndex + 1).map(line => {
      const cols = parseCSVLine(line);
      if (map.date === -1 || !cols[map.date] || /total|resumo/i.test(cols[map.date])) return null;
      
      const parsedDate = parseDate(cols[map.date]);
      const spend = parseCurrency(cols[map.spend]);
      if (spend === 0 && !cols[map.purchases] && !cols[map.clicks]) return null;

      const clicks = map.clicks > -1 ? parseIntString(cols[map.clicks]) : 0;
      const purchases = map.purchases > -1 ? parseIntString(cols[map.purchases]) : 0;
      const installs = map.installs > -1 ? parseIntString(cols[map.installs]) : 0;
      const impressions = map.impressions > -1 ? parseIntString(cols[map.impressions]) : 0;
      const titleCost = map.titleCost > -1 ? parseCurrency(cols[map.titleCost]) : 0;
      const revenueFromSheet = map.revenue > -1 ? parseCurrency(cols[map.revenue]) : 0;
      const promo = map.promo > -1 ? cols[map.promo] : 'Sem Promo';
      const clients = map.clients > -1 ? parseIntString(cols[map.clients]) : 0;

      return {
        date: parsedDate,
        dateStr: cols[map.date],
        originalDateStr: parsedDate.toLocaleDateString('pt-BR'),
        weekday: parsedDate.toLocaleDateString('pt-BR', { weekday: 'long' }),
        spend, 
        impressions, 
        clicks, 
        installs, 
        purchases, 
        titleCost,
        revenue: revenueFromSheet || (purchases * titleCost),
        promo,
        clients,
        titlesPerClient: clients > 0 ? purchases / clients : 0,
        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
        cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
        cpa: purchases > 0 ? spend / purchases : 0,
        cpc: clicks > 0 ? spend / clicks : 0,
        cpi: installs > 0 ? spend / installs : 0,
        installRate: clicks > 0 ? (installs / clicks) * 100 : 0,
        conversionRate: clicks > 0 ? (purchases / clicks) * 100 : 0,
        roas: spend > 0 ? (revenueFromSheet || (purchases * titleCost)) / spend : 0
      } as DailyMetric;
    })
    .filter((d): d is DailyMetric => d !== null)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

    return { data: result, debugInfo: { headersFound: headers, rawFirstRow: [], sheetName, missingCriticalFields: [] } };
  } catch (error) {
    console.error("Error loading Google Sheet:", error);
    throw error;
  }
};

export const aggregateData = (data: DailyMetric[]) => {
  const totals = data.reduce((acc, day) => ({
    spend: acc.spend + day.spend,
    impressions: acc.impressions + day.impressions,
    clicks: acc.clicks + day.clicks,
    installs: acc.installs + day.installs,
    purchases: acc.purchases + day.purchases,
    titleCost: acc.titleCost + day.titleCost,
    revenue: acc.revenue + day.revenue,
    clients: acc.clients + day.clients
  }), { spend: 0, impressions: 0, clicks: 0, installs: 0, purchases: 0, titleCost: 0, revenue: 0, clients: 0 });

  const averages = {
    cpm: totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0,
    ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
    cpc: totals.clicks > 0 ? totals.spend / totals.clicks : 0,
    cpi: totals.installs > 0 ? totals.spend / totals.installs : 0,
    cpa: totals.purchases > 0 ? totals.spend / totals.purchases : 0,
    conversionRate: totals.clicks > 0 ? (totals.purchases / totals.clicks) * 100 : 0,
    installRate: totals.clicks > 0 ? (totals.installs / totals.clicks) * 100 : 0,
    roas: totals.spend > 0 ? totals.revenue / totals.spend : 0,
    avgTitleCost: data.length > 0 ? totals.titleCost / data.length : 0,
    titlesPerClient: totals.clients > 0 ? totals.purchases / totals.clients : 0
  };
  
  return { totals, averages };
};

export const filterByDateRange = (data: DailyMetric[], startDate: Date, endDate: Date) => {
  const s = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0);
  const e = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59);
  
  return data.filter(d => {
    const dTime = d.date.getTime();
    return dTime >= s.getTime() && dTime <= e.getTime();
  });
};
