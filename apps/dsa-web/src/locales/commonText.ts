import type { UiLanguage } from '../i18n/uiText';

export const NOT_FOUND_TEXT = {
  zh: { documentTitle: '页面未找到 - DSA', title: '页面未找到', description: '抱歉，您访问的页面不存在或已被移动', backHome: '返回首页' },
  en: { documentTitle: 'Page Not Found - DSA', title: 'Page not found', description: 'The page you are looking for does not exist or has been moved.', backHome: 'Back to home' },
} as const;

export const STOCK_AUTOCOMPLETE_TEXT = {
  zh: {
    placeholder: '输入股票代码或名称',
    market: { CN: 'A股', HK: '港股', US: '美股', JP: '日股', KR: '韩股', INDEX: '指数', ETF: 'ETF', BSE: '北交所' },
    matchType: { exact: '精确', prefix: '前缀', contains: '包含', fuzzy: '模糊' },
  },
  en: {
    placeholder: 'Enter stock code or name',
    market: { CN: 'A-share', HK: 'HK', US: 'US', JP: 'JP', KR: 'KR', INDEX: 'Index', ETF: 'ETF', BSE: 'BSE' },
    matchType: { exact: 'Exact', prefix: 'Prefix', contains: 'Contains', fuzzy: 'Fuzzy' },
  },
} as const;

export const WATCHLIST_ACTION_TEXT = {
  zh: { added: '已加入自选 {code}', removed: '已从自选移除 {code}', failed: '操作失败' },
  en: { added: 'Added {code} to watchlist', removed: 'Removed {code} from watchlist', failed: 'Action failed' },
} as const;

export const STOCK_INPUT_TEXT = {
  zh: {
    emptyCode: '请输入股票代码',
    invalidCode: '股票代码格式不正确',
    invalidQuery: '请输入有效的股票代码或股票名称',
    duplicateTask: '股票 {code} 正在分析中，请等待完成',
  },
  en: {
    emptyCode: 'Enter a stock code',
    invalidCode: 'Invalid stock code format',
    invalidQuery: 'Enter a valid stock code or name',
    duplicateTask: '{code} is already being analyzed. Please wait for it to finish.',
  },
} as const satisfies Record<UiLanguage, Record<string, string>>;

export const REPORT_TYPE_LABELS: Record<UiLanguage, Record<string, string>> = {
  zh: { simple: '普通', detailed: '标准', full: '完整', brief: '简版', market_review: '大盘' },
  en: { simple: 'Simple', detailed: 'Standard', full: 'Full', brief: 'Brief', market_review: 'Market' },
};
