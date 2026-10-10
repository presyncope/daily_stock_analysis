import axios from 'axios';
import { formatUiText, type UiLanguage } from '../i18n/uiText';

export type ApiErrorCategory =
  | 'agent_disabled'
  | 'missing_params'
  | 'llm_not_configured'
  | 'model_tool_incompatible'
  | 'invalid_tool_call'
  | 'portfolio_oversell'
  | 'portfolio_busy'
  | 'upstream_llm_400'
  | 'upstream_timeout'
  | 'upstream_network'
  | 'local_connection_failed'
  | 'http_error'
  | 'unknown';

export interface ParsedApiError {
  title: string;
  message: string;
  rawMessage: string;
  status?: number;
  category: ApiErrorCategory;
}

type ResponseLike = {
  status?: number;
  data?: unknown;
  statusText?: string;
};

type ErrorCarrier = {
  response?: ResponseLike;
  code?: string;
  message?: string;
  parsedError?: ParsedApiError;
  cause?: unknown;
};

type CreateParsedApiErrorOptions = {
  title: string;
  message: string;
  rawMessage?: string;
  status?: number;
  category?: ApiErrorCategory;
};

type ApiErrorText = { title: string; message: string };
type ApiErrorTextKey =
  | 'agentDisabled'
  | 'missingParams'
  | 'portfolioOversell'
  | 'portfolioBusy'
  | 'screeningUnavailable'
  | 'screeningTaskNotFound'
  | 'screeningFailed'
  | 'llmNotConfigured'
  | 'modelToolIncompatible'
  | 'invalidToolCall'
  | 'upstreamTimeout'
  | 'upstreamNetwork'
  | 'upstreamLlm400'
  | 'localConnectionFailed'
  | 'loginRateLimited'
  | 'requestFailed';

// Frontend-authored error copy. Parsing always produces zh; localizeParsedApiError maps it for display.
const API_ERROR_TEXT: Record<UiLanguage, Record<ApiErrorTextKey, ApiErrorText>> = {
  zh: {
    agentDisabled: { title: 'Agent 模式未开启', message: '当前功能依赖 Agent 模式，请先开启后再重试。' },
    missingParams: { title: '请求缺少必要参数', message: '请先补充股票代码或必要输入后再试。' },
    portfolioOversell: { title: '卖出数量超过可用持仓', message: '卖出数量超过当前可用持仓，请删除或修正对应卖出流水后重试。' },
    portfolioBusy: { title: '持仓账本正忙', message: '持仓账本正在处理另一笔变更，请稍后重试。' },
    screeningUnavailable: { title: '选股功能未就绪', message: '选股功能暂不可用，请检查策略配置、数据依赖和服务日志。' },
    screeningTaskNotFound: { title: '选股任务不可恢复', message: '服务端没有找到这次选股任务，可能后端已重启或任务记录已清理，请重新运行选股。' },
    screeningFailed: { title: '选股失败', message: '选股访问行情、快照或模型服务失败，请稍后重试，或检查网络与代理设置。' },
    llmNotConfigured: { title: '系统没有配置可用的 LLM 模型', message: '请先在系统设置中配置主模型、可用渠道或相关 API Key 后再重试。' },
    modelToolIncompatible: { title: '当前模型不兼容工具调用', message: '当前模型不适合 Agent / 工具调用场景，请更换支持工具调用的模型后重试。' },
    invalidToolCall: { title: '上游模型返回的数据结构不完整', message: '上游模型返回的工具调用结构不符合要求，请更换模型或关闭相关推理模式后重试。' },
    upstreamTimeout: { title: '连接上游服务超时', message: '服务端访问外部依赖时超时，请稍后重试，或检查当前网络与代理设置。' },
    upstreamNetwork: { title: '服务端无法访问外部依赖', message: '页面已连接到本地服务，但本地服务访问外部模型或数据接口失败，请检查代理、DNS 或出网配置。' },
    upstreamLlm400: { title: '上游模型接口拒绝了当前请求', message: '本地服务正常，但上游模型接口拒绝了请求，请检查模型名称、参数格式或工具调用兼容性。' },
    localConnectionFailed: { title: '无法连接到本地服务', message: '浏览器当前无法连接到本地 Web 服务，请检查服务是否启动、监听地址是否正确、端口是否开放。' },
    loginRateLimited: { title: '登录尝试过于频繁', message: '尝试次数过多，请稍后再试。' },
    requestFailed: { title: '请求失败', message: '请求未成功完成，请稍后重试。' },
  },
  en: {
    agentDisabled: { title: 'Agent mode is disabled', message: 'This feature requires Agent mode. Enable it and try again.' },
    missingParams: { title: 'Missing required parameters', message: 'Provide a stock code or the required input and try again.' },
    portfolioOversell: { title: 'Sell quantity exceeds available holdings', message: 'The sell quantity exceeds current available holdings. Delete or fix the related sell entry and try again.' },
    portfolioBusy: { title: 'Portfolio ledger is busy', message: 'The portfolio ledger is processing another change. Try again later.' },
    screeningUnavailable: { title: 'Screening is not ready', message: 'Screening is unavailable. Check the strategy configuration, data dependencies, and server logs.' },
    screeningTaskNotFound: { title: 'Screening task cannot be recovered', message: 'The server could not find this screening task. The backend may have restarted or the task record was cleaned up. Run the screening again.' },
    screeningFailed: { title: 'Screening failed', message: 'Screening could not reach quote, snapshot, or model services. Try again later, or check your network and proxy settings.' },
    llmNotConfigured: { title: 'No usable LLM model is configured', message: 'Configure a primary model, an available channel, or the related API key in Settings and try again.' },
    modelToolIncompatible: { title: 'Current model does not support tool calls', message: 'The current model is not suitable for Agent / tool-call scenarios. Switch to a model that supports tool calls and try again.' },
    invalidToolCall: { title: 'Upstream model returned incomplete data', message: 'The upstream model returned an invalid tool-call structure. Switch models or disable the related reasoning mode and try again.' },
    upstreamTimeout: { title: 'Upstream service timed out', message: 'The server timed out while calling an external dependency. Try again later, or check your network and proxy settings.' },
    upstreamNetwork: { title: 'Server cannot reach external dependencies', message: 'The page is connected to the local service, but the local service failed to reach external model or data APIs. Check proxy, DNS, or outbound network settings.' },
    upstreamLlm400: { title: 'Upstream model API rejected the request', message: 'The local service is fine, but the upstream model API rejected the request. Check the model name, parameter format, or tool-call compatibility.' },
    localConnectionFailed: { title: 'Cannot connect to the local service', message: 'The browser cannot connect to the local web service. Check that the service is running, the listen address is correct, and the port is open.' },
    loginRateLimited: { title: 'Too many login attempts', message: 'Too many attempts. Please try again later.' },
    requestFailed: { title: 'Request failed', message: 'The request did not complete. Please try again later.' },
  },
};

const HTTP_STATUS_FALLBACK_MESSAGE: Record<UiLanguage, string> = {
  zh: '请求未成功完成（HTTP {status}）。',
  en: 'The request did not complete (HTTP {status}).',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function pickString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function stringifyValue(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string') {
    return value.trim() || null;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function getResponse(error: unknown): ResponseLike | undefined {
  if (!isRecord(error)) {
    return undefined;
  }

  const response = (error as ErrorCarrier).response;
  return response && typeof response === 'object' ? response : undefined;
}

function getErrorCode(error: unknown): string | undefined {
  return isRecord(error) && typeof (error as ErrorCarrier).code === 'string'
    ? (error as ErrorCarrier).code
    : undefined;
}

function getErrorMessage(error: unknown): string | null {
  if (typeof error === 'string') {
    return error.trim() || null;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  if (isRecord(error) && typeof (error as ErrorCarrier).message === 'string') {
    const message = (error as ErrorCarrier).message?.trim();
    return message || null;
  }

  return null;
}

function getCauseMessage(error: unknown): string | null {
  if (!isRecord(error)) {
    return null;
  }

  return getErrorMessage((error as ErrorCarrier).cause);
}

function buildMatchText(parts: Array<string | undefined | null>): string {
  return parts
    .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
    .join(' | ')
    .toLowerCase();
}

function includesAny(haystack: string, needles: string[]): boolean {
  return needles.some((needle) => haystack.includes(needle.toLowerCase()));
}

function extractValidationDetail(detail: unknown): string | null {
  if (!Array.isArray(detail)) {
    return null;
  }

  const parts = detail
    .map((item) => {
      if (!isRecord(item)) {
        return stringifyValue(item);
      }

      const location = Array.isArray(item.loc)
        ? item.loc.map((segment) => String(segment)).join('.')
        : null;
      const message = pickString(item.msg, item.message, item.error);
      if (!location && !message) {
        return stringifyValue(item);
      }
      return [location, message].filter(Boolean).join(': ');
    })
    .filter((entry): entry is string => Boolean(entry));

  return parts.length > 0 ? parts.join('; ') : null;
}

function extractErrorCode(data: unknown): string | null {
  if (!isRecord(data)) {
    return null;
  }

  const detail = data.detail;
  if (isRecord(detail)) {
    return pickString(detail.error, detail.code, data.error, data.code);
  }

  return pickString(data.error, data.code);
}

export function extractErrorPayloadText(data: unknown): string | null {
  if (typeof data === 'string') {
    return data.trim() || null;
  }

  if (Array.isArray(data)) {
    return extractValidationDetail(data) ?? stringifyValue(data);
  }

  if (!isRecord(data)) {
    return stringifyValue(data);
  }

  const detail = data.detail;
  if (isRecord(detail)) {
    return (
      pickString(detail.message, detail.error)
      ?? extractValidationDetail(detail.detail)
      ?? stringifyValue(detail)
    );
  }

  return (
    pickString(
      detail,
      data.message,
      data.error,
      data.title,
      data.reason,
      data.description,
      data.msg,
    )
    ?? extractValidationDetail(detail)
    ?? stringifyValue(data)
  );
}

export function createParsedApiError(options: CreateParsedApiErrorOptions): ParsedApiError {
  return {
    title: options.title,
    message: options.message,
    rawMessage: options.rawMessage?.trim() || options.message,
    status: options.status,
    category: options.category ?? 'unknown',
  };
}

export function isParsedApiError(value: unknown): value is ParsedApiError {
  return isRecord(value)
    && typeof value.title === 'string'
    && typeof value.message === 'string'
    && typeof value.rawMessage === 'string'
    && typeof value.category === 'string';
}

export function isApiRequestError(
  value: unknown,
): value is Error & ErrorCarrier & { parsedError: ParsedApiError } {
  return value instanceof Error
    && isRecord(value)
    && isParsedApiError((value as ErrorCarrier).parsedError);
}

export function formatParsedApiError(parsed: ParsedApiError, language: UiLanguage = 'zh'): string {
  if (!parsed.title.trim()) {
    return parsed.message;
  }
  if (parsed.title === parsed.message) {
    return parsed.title;
  }
  return language === 'en' ? `${parsed.title}: ${parsed.message}` : `${parsed.title}：${parsed.message}`;
}

/**
 * Map frontend-authored zh error copy to the UI language for display.
 * Backend-provided messages and rawMessage are passed through unchanged.
 */
export function localizeParsedApiError(parsed: ParsedApiError, language: UiLanguage = 'zh'): ParsedApiError {
  if (language === 'zh') {
    return parsed;
  }

  const zhText = API_ERROR_TEXT.zh;
  const key = (Object.keys(zhText) as ApiErrorTextKey[]).find((item) => zhText[item].title === parsed.title);
  if (!key) {
    return parsed;
  }

  const localized = API_ERROR_TEXT[language][key];
  let message = parsed.message;
  if (parsed.message === zhText[key].message) {
    message = localized.message;
  } else {
    const httpStatusMatch = /^请求未成功完成（HTTP (.+)）。$/.exec(parsed.message);
    if (httpStatusMatch) {
      message = formatUiText(HTTP_STATUS_FALLBACK_MESSAGE[language], { status: httpStatusMatch[1] });
    }
  }

  // rawMessage defaults to the zh frontend copy when no backend text exists; keep it in sync for display.
  let rawMessage = parsed.rawMessage;
  if (rawMessage === parsed.message) {
    rawMessage = message;
  } else if (rawMessage === zhText.requestFailed.message) {
    rawMessage = API_ERROR_TEXT[language].requestFailed.message;
  }

  return { ...parsed, title: localized.title, message, rawMessage };
}

export function getParsedApiError(error: unknown): ParsedApiError {
  if (isParsedApiError(error)) {
    return error;
  }
  if (isRecord(error) && isParsedApiError((error as ErrorCarrier).parsedError)) {
    return (error as ErrorCarrier).parsedError as ParsedApiError;
  }
  return parseApiError(error);
}

export function createApiError(
  parsed: ParsedApiError,
  extra: { response?: ResponseLike; code?: string; cause?: unknown } = {},
): Error & ErrorCarrier & { status?: number; category: ApiErrorCategory; rawMessage: string } {
  const apiError = new Error(formatParsedApiError(parsed)) as Error & ErrorCarrier & {
    status?: number;
    category: ApiErrorCategory;
    rawMessage: string;
  };
  apiError.name = 'ApiRequestError';
  apiError.parsedError = parsed;
  apiError.response = extra.response;
  apiError.code = extra.code;
  apiError.status = parsed.status;
  apiError.category = parsed.category;
  apiError.rawMessage = parsed.rawMessage;
  if (extra.cause !== undefined) {
    apiError.cause = extra.cause;
  }
  return apiError;
}

export function attachParsedApiError(error: unknown): ParsedApiError {
  const parsed = parseApiError(error);
  if (isRecord(error)) {
    const carrier = error as ErrorCarrier;
    carrier.parsedError = parsed;
  }
  if (error instanceof Error) {
    error.name = 'ApiRequestError';
    error.message = formatParsedApiError(parsed);
  }
  return parsed;
}

export function isLocalConnectionFailure(error: unknown): boolean {
  return parseApiError(error).category === 'local_connection_failed';
}

export function parseApiError(error: unknown): ParsedApiError {
  const response = getResponse(error);
  const status = response?.status;
  const payloadText = extractErrorPayloadText(response?.data);
  const errorCode = extractErrorCode(response?.data);
  const errorMessage = getErrorMessage(error);
  const causeMessage = getCauseMessage(error);
  const code = getErrorCode(error);
  const rawMessage = pickString(payloadText, response?.statusText, errorMessage, causeMessage, code)
    ?? API_ERROR_TEXT.zh.requestFailed.message;
  const matchText = buildMatchText([rawMessage, errorMessage, causeMessage, code, errorCode, response?.statusText]);

  if (includesAny(matchText, ['agent mode is not enabled', 'agent_mode'])) {
    return createParsedApiError({
      ...API_ERROR_TEXT.zh.agentDisabled,
      rawMessage,
      status,
      category: 'agent_disabled',
    });
  }

  const hasStockCodeField = includesAny(matchText, ['stock_code', 'stock_codes']);
  const hasMissingParamText = includesAny(matchText, ['必须提供 stock_code 或 stock_codes', 'missing', 'required']);
  if (hasStockCodeField && hasMissingParamText) {
    return createParsedApiError({
      ...API_ERROR_TEXT.zh.missingParams,
      rawMessage,
      status,
      category: 'missing_params',
    });
  }

  if (errorCode === 'portfolio_oversell' || includesAny(matchText, ['oversell detected'])) {
    return createParsedApiError({
      ...API_ERROR_TEXT.zh.portfolioOversell,
      rawMessage,
      status,
      category: 'portfolio_oversell',
    });
  }

  if (errorCode === 'portfolio_busy' || includesAny(matchText, ['portfolio ledger is busy'])) {
    return createParsedApiError({
      ...API_ERROR_TEXT.zh.portfolioBusy,
      rawMessage,
      status,
      category: 'portfolio_busy',
    });
  }

  if (errorCode === 'screening_unavailable' || includesAny(matchText, ['内建选股引擎初始化失败', '选股功能初始化失败'])) {
    return createParsedApiError({
      ...API_ERROR_TEXT.zh.screeningUnavailable,
      rawMessage,
      status,
      category: 'http_error',
    });
  }

  if (errorCode === 'screening_screen_task_not_found') {
    return createParsedApiError({
      ...API_ERROR_TEXT.zh.screeningTaskNotFound,
      rawMessage,
      status,
      category: 'http_error',
    });
  }

  if (errorCode === 'screening_screen_failed') {
    return createParsedApiError({
      ...API_ERROR_TEXT.zh.screeningFailed,
      rawMessage,
      status,
      category: 'upstream_network',
    });
  }

  const noConfiguredLlm = (
    includesAny(matchText, ['all llm models failed']) && includesAny(matchText, ['last error: none'])
  ) || includesAny(matchText, [
    'no llm configured',
    'no effective primary model configured',
    'litellm_model not configured',
    'ai analysis will be unavailable',
  ]);
  if (noConfiguredLlm) {
    return createParsedApiError({
      ...API_ERROR_TEXT.zh.llmNotConfigured,
      rawMessage,
      status,
      category: 'llm_not_configured',
    });
  }

  if (includesAny(matchText, [
    'tool call',
    'function call',
    'does not support tools',
    'tools is not supported',
    'reasoning',
  ])) {
    return createParsedApiError({
      ...API_ERROR_TEXT.zh.modelToolIncompatible,
      rawMessage,
      status,
      category: 'model_tool_incompatible',
    });
  }

  if (includesAny(matchText, [
    'thought_signature',
    'missing function',
    'missing tool',
    'invalid tool call',
    'invalid function call',
  ])) {
    return createParsedApiError({
      ...API_ERROR_TEXT.zh.invalidToolCall,
      rawMessage,
      status,
      category: 'invalid_tool_call',
    });
  }

  if (includesAny(matchText, ['timeout', 'timed out', 'read timeout', 'connect timeout']) || code === 'ECONNABORTED') {
    return createParsedApiError({
      ...API_ERROR_TEXT.zh.upstreamTimeout,
      rawMessage,
      status,
      category: 'upstream_timeout',
    });
  }

  if (
    status === 502
    || status === 503
    || includesAny(matchText, [
      'dns',
      'enotfound',
      'name or service not known',
      'temporary failure in name resolution',
      'proxy',
      'tunnel',
      '502',
      '503',
    ])
  ) {
    return createParsedApiError({
      ...API_ERROR_TEXT.zh.upstreamNetwork,
      rawMessage,
      status,
      category: 'upstream_network',
    });
  }

  const hasLlmProviderHint = includesAny(matchText, [
    'chat/completions',
    'generativelanguage',
    'openai',
    'gemini',
  ]);
  if (status === 400 && hasLlmProviderHint) {
    return createParsedApiError({
      ...API_ERROR_TEXT.zh.upstreamLlm400,
      rawMessage,
      status,
      category: 'upstream_llm_400',
    });
  }

  const localConnectionFailed = !response && (
    includesAny(matchText, ['fetch failed', 'failed to fetch', 'network error', 'connection refused', 'econnrefused'])
    || code === 'ERR_NETWORK'
    || code === 'ECONNREFUSED'
  );
  if (localConnectionFailed) {
    return createParsedApiError({
      ...API_ERROR_TEXT.zh.localConnectionFailed,
      rawMessage,
      status,
      category: 'local_connection_failed',
    });
  }

  if (payloadText || status) {
    return createParsedApiError({
      title: API_ERROR_TEXT.zh.requestFailed.title,
      message: payloadText ?? formatUiText(HTTP_STATUS_FALLBACK_MESSAGE.zh, { status: String(status) }),
      rawMessage,
      status,
      category: 'http_error',
    });
  }

  return createParsedApiError({
    title: API_ERROR_TEXT.zh.requestFailed.title,
    message: rawMessage,
    rawMessage,
    status,
    category: 'unknown',
  });
}

export function toApiErrorMessage(
  error: unknown,
  fallback?: string,
  language: UiLanguage = 'zh',
): string {
  const parsed = localizeParsedApiError(getParsedApiError(error), language);
  const message = formatParsedApiError(parsed, language);
  return message.trim() || fallback || API_ERROR_TEXT[language].requestFailed.message;
}

export function isAxiosApiError(error: unknown): boolean {
  return axios.isAxiosError(error);
}
