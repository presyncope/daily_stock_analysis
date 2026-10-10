import type {
  PortfolioCashDirection,
  PortfolioCorporateActionType,
  PortfolioFxRefreshResponse,
  PortfolioImportCommitResponse,
  PortfolioImportParseResponse,
  PortfolioPositionItem,
  PortfolioSide,
} from '../types/portfolio';
import type { UiLanguage } from '../i18n/uiText';
import { toDateInputValue } from './format';

export type FxRefreshFeedback = {
  tone: 'neutral' | 'success' | 'warning';
  text: string;
};

export type PortfolioAlertVariant = 'info' | 'success' | 'warning' | 'danger';

export function getTodayIso(): string {
  return toDateInputValue(new Date());
}

export function formatMoney(value: number | undefined | null, currency = 'CNY'): string {
  if (value == null || Number.isNaN(value)) return '--';
  return `${currency} ${Number(value).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPct(value: number | undefined | null): string {
  if (value == null || Number.isNaN(value)) return '--';
  return `${value.toFixed(2)}%`;
}

export function formatSignedPct(value: number | undefined | null): string {
  if (value == null || Number.isNaN(value)) return '--';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function hasPositionPrice(row: PortfolioPositionItem): boolean {
  return row.priceAvailable !== false && row.priceSource !== 'missing';
}

export function formatPositionPrice(row: PortfolioPositionItem): string {
  if (!hasPositionPrice(row)) return '--';
  return row.lastPrice.toFixed(4);
}

export function formatPositionMoney(value: number, row: PortfolioPositionItem): string {
  if (!hasPositionPrice(row)) return '--';
  return formatMoney(value, row.valuationCurrency);
}

export function getPositionPriceLabel(row: PortfolioPositionItem, language: UiLanguage = 'zh'): string {
  if (language === 'en') {
    if (!hasPositionPrice(row)) return 'Missing price';
    if (row.priceSource === 'realtime_quote') {
      return row.priceProvider ? `Realtime · ${row.priceProvider}` : 'Realtime';
    }
    if (row.priceSource === 'history_close') {
      return row.priceStale && row.priceDate ? `Close · ${row.priceDate}` : 'Close';
    }
    return row.priceSource || 'Unknown source';
  }
  if (!hasPositionPrice(row)) return '缺价';
  if (row.priceSource === 'realtime_quote') {
    return row.priceProvider ? `实时价 · ${row.priceProvider}` : '实时价';
  }
  if (row.priceSource === 'history_close') {
    return row.priceStale && row.priceDate ? `收盘价 · ${row.priceDate}` : '收盘价';
  }
  return row.priceSource || '未知来源';
}

export function formatSideLabel(value: PortfolioSide, language: UiLanguage = 'zh'): string {
  if (language === 'en') return value === 'buy' ? 'Buy' : 'Sell';
  return value === 'buy' ? '买入' : '卖出';
}

export function formatCashDirectionLabel(value: PortfolioCashDirection, language: UiLanguage = 'zh'): string {
  if (language === 'en') return value === 'in' ? 'Inflow' : 'Outflow';
  return value === 'in' ? '流入' : '流出';
}

export function formatCorporateActionLabel(value: PortfolioCorporateActionType, language: UiLanguage = 'zh'): string {
  if (language === 'en') return value === 'cash_dividend' ? 'Cash dividend' : 'Split adjustment';
  return value === 'cash_dividend' ? '现金分红' : '拆并股调整';
}

const BROKER_EN_NAMES: Record<string, string> = {
  huatai: 'Huatai',
  citic: 'CITIC',
  cmb: 'CMB',
};

export function formatBrokerLabel(value: string, displayName?: string, language: UiLanguage = 'zh'): string {
  if (language === 'en') {
    const name = BROKER_EN_NAMES[value] ?? displayName?.trim();
    return name ? `${value} (${name})` : value;
  }
  if (displayName && displayName.trim()) return `${value}（${displayName.trim()}）`;
  if (value === 'huatai') return 'huatai（华泰）';
  if (value === 'citic') return 'citic（中信）';
  if (value === 'cmb') return 'cmb（招商）';
  return value;
}

export function buildFxRefreshFeedback(data: PortfolioFxRefreshResponse, language: UiLanguage = 'zh'): FxRefreshFeedback {
  if (language === 'en') {
    if (data.refreshEnabled === false) {
      return { tone: 'neutral', text: 'Online FX refresh is disabled.' };
    }
    if (data.pairCount === 0) {
      return { tone: 'neutral', text: 'No FX pairs to refresh in the current scope.' };
    }
    if (data.updatedCount > 0 && data.staleCount === 0 && data.errorCount === 0) {
      return { tone: 'success', text: `FX rates refreshed: ${data.updatedCount} pairs updated.` };
    }
    const enSummary = `Updated ${data.updatedCount}, still stale ${data.staleCount}, failed ${data.errorCount}.`;
    if (data.staleCount > 0) {
      return {
        tone: 'warning',
        text: `Refresh attempted, but some pairs still use stale/fallback rates. ${enSummary}`,
      };
    }
    return { tone: 'warning', text: `Online refresh did not fully succeed. ${enSummary}` };
  }

  if (data.refreshEnabled === false) {
    return {
      tone: 'neutral',
      text: '汇率在线刷新已被禁用。',
    };
  }

  if (data.pairCount === 0) {
    return {
      tone: 'neutral',
      text: '当前范围无可刷新的汇率对。',
    };
  }

  if (data.updatedCount > 0 && data.staleCount === 0 && data.errorCount === 0) {
    return {
      tone: 'success',
      text: `汇率已刷新，共更新 ${data.updatedCount} 对。`,
    };
  }

  const summary = `更新 ${data.updatedCount} 对，仍过期 ${data.staleCount} 对，失败 ${data.errorCount} 对。`;
  if (data.staleCount > 0) {
    return {
      tone: 'warning',
      text: `已尝试刷新，但仍有部分货币对使用 stale/fallback 汇率。${summary}`,
    };
  }

  return {
    tone: 'warning',
    text: `在线刷新未完全成功。${summary}`,
  };
}

export function getFxRefreshFeedbackVariant(tone: FxRefreshFeedback['tone']): PortfolioAlertVariant {
  if (tone === 'success') return 'success';
  if (tone === 'warning') return 'warning';
  return 'info';
}

export function getCsvParseVariant(result: PortfolioImportParseResponse): PortfolioAlertVariant {
  return result.errorCount > 0 || result.skippedCount > 0 ? 'warning' : 'info';
}

export function getCsvCommitVariant(result: PortfolioImportCommitResponse, isDryRun: boolean): PortfolioAlertVariant {
  if (isDryRun) return 'info';
  return result.failedCount > 0 || result.duplicateCount > 0 ? 'warning' : 'success';
}
