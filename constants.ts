
import { TrafficDataRaw } from './types';

export const SHEET_ID = '1PzalyjV_OJZAhkk5L7Dk7lpScjDT3jxnnzQ8_mBCqcQ';

export const DASHBOARD_TABS = [
  { id: 'geral', label: 'Visão Geral', sheetName: 'Geral Tráfego', icon: 'LayoutDashboard' },
  { id: 'tp-site', label: 'TP-Site', sheetName: 'TP-Site', icon: 'Search' },
  { id: 'tp-app', label: 'TP-APP', sheetName: 'TP-APP', icon: 'LayoutDashboard' },
  { id: 'meta', label: 'Meta Ads', sheetName: 'Meta Ads', icon: 'Megaphone' },
  { id: 'google', label: 'Google Ads', sheetName: 'Google Ads', icon: 'Search' },
  { id: 'tiktok', label: 'Tiktok Ads', sheetName: 'Tiktok Ads', icon: 'Video' },
];

export const GOOGLE_SHEET_BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

export const COMPARISON_OPTIONS = [
  { value: 'previous_period', label: 'Período Anterior' },
  { value: 'previous_week', label: 'Semana Anterior' },
  { value: 'previous_month', label: 'Mês Anterior' },
  { value: 'manual', label: 'Personalizado (Manual)' },
  { value: 'promotion', label: 'Comparar Promoções' },
  { value: 'none', label: 'Sem Comparação' },
];
