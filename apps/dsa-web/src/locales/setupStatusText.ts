import type { UiLanguage } from '../i18n/uiText';
import type { SetupStatusCheck } from '../types/systemConfig';

// The setup-status payload only carries a stable `key`/`status`; titles, messages and next steps
// are Chinese backend text. English is mapped here by key (titles) or by exact backend text
// (messages / next steps), falling back to the backend text when the wording is unknown.

const SETUP_CHECK_TITLES_EN: Record<string, string> = {
  llm_primary: 'LLM primary channel',
  llm_agent: 'Agent channel',
  stock_list: 'Watchlist',
  notification: 'Notification channels',
  storage: 'Database / local storage',
};

const SETUP_CHECK_TEXT_EN: Record<string, string> = {
  // llm_primary
  '主模型未出现在当前 LiteLLM YAML model_list 中': 'The primary model is not listed in the current LiteLLM YAML model_list',
  '主模型未出现在当前启用渠道模型列表中': 'The primary model is not in the model list of any enabled channel',
  '主模型缺少可用渠道或匹配的 API Key': 'The primary model has no available channel or matching API key',
  '尚未检测到主模型配置': 'No primary model configuration detected yet',
  '已选择 codex_cli，但 DSA 后端进程当前 PATH 中找不到 codex 可执行文件。':
    'codex_cli is selected, but the codex executable is not on the DSA backend process PATH.',
  '请确认 Codex CLI 已安装到后端 PATH 可见目录；桌面端请完全退出并重开。打开 Codex CLI 交互窗口不会改变已运行后端的 PATH；若找到后仍失败，再检查 Codex CLI 登录态，或将 GENERATION_BACKEND 设回 litellm。':
    'Make sure Codex CLI is installed in a directory on the backend PATH; on desktop, fully quit and reopen the app. Opening an interactive Codex CLI window does not change the PATH of a running backend. If it is found but still fails, check the Codex CLI login state, or set GENERATION_BACKEND back to litellm.',
  '请先安装并登录对应 CLI，或将 GENERATION_BACKEND 设回 litellm。':
    'Install and log in to the corresponding CLI first, or set GENERATION_BACKEND back to litellm.',
  '请配置 LITELLM_MODEL、LLM_CHANNELS、LITELLM_CONFIG 或 legacy provider API Key。':
    'Configure LITELLM_MODEL, LLM_CHANNELS, LITELLM_CONFIG, or a legacy provider API key.',
  // llm_agent
  '请将 AGENT_GENERATION_BACKEND 设为 auto 或 litellm，并配置 LiteLLM 工具调用渠道。':
    'Set AGENT_GENERATION_BACKEND to auto or litellm and configure a LiteLLM tool-calling channel.',
  '普通分析使用 Codex CLI；但当前 LiteLLM Agent 路径继承的是 Hermes-only 模型，Hermes Phase 3 不支持 Agent 工具调用。':
    'Regular analysis uses Codex CLI, but the LiteLLM Agent path inherits a Hermes-only model, and Hermes Phase 3 does not support Agent tool calling.',
  '如需使用 Ask-Stock Agent，请配置非 Hermes 的 AGENT_LITELLM_MODEL，或配置包含非 Hermes deployment 的 mixed Agent route。':
    'To use the Ask-Stock Agent, configure a non-Hermes AGENT_LITELLM_MODEL, or a mixed Agent route that includes a non-Hermes deployment.',
  'AGENT_GENERATION_BACKEND 已选择 litellm，但未检测到可用 LiteLLM 模型配置。':
    'AGENT_GENERATION_BACKEND is set to litellm, but no usable LiteLLM model configuration was detected.',
  '如需使用 Ask-Stock Agent，请配置 AGENT_LITELLM_MODEL、LITELLM_MODEL、LLM_CHANNELS 或 LITELLM_CONFIG。':
    'To use the Ask-Stock Agent, configure AGENT_LITELLM_MODEL, LITELLM_MODEL, LLM_CHANNELS, or LITELLM_CONFIG.',
  'Agent 工具调用需要 LiteLLM 模型配置；local CLI 主生成方式不会被自动继承。':
    'Agent tool calling requires a LiteLLM model configuration; the local CLI generation backend is not inherited automatically.',
  '如需使用 Ask-Stock Agent，请配置 LiteLLM 模型，或将 AGENT_GENERATION_BACKEND 固定为 litellm 后补齐模型配置。':
    'To use the Ask-Stock Agent, configure a LiteLLM model, or pin AGENT_GENERATION_BACKEND to litellm and complete the model configuration.',
  'Hermes Phase 3 不支持 Agent 工具调用，且当前继承的主模型没有非 Hermes deployment。':
    'Hermes Phase 3 does not support Agent tool calling, and the inherited primary model has no non-Hermes deployment.',
  '请选择非 Hermes Agent 模型，或配置包含非 Hermes deployment 的 mixed Agent route。':
    'Choose a non-Hermes Agent model, or configure a mixed Agent route that includes a non-Hermes deployment.',
  '未单独配置 Agent 主模型，将继承 LLM 主渠道。':
    'No dedicated Agent primary model is configured; the LLM primary channel will be inherited.',
  'Agent 未配置独立模型，且 LLM 主渠道尚不可用。':
    'The Agent has no dedicated model, and the LLM primary channel is not available yet.',
  '请先补齐 LLM 主渠道配置。': 'Complete the LLM primary channel configuration first.',
  '请选择非 Hermes Agent 模型，或配置 mixed route 中的非 Hermes deployment。':
    'Choose a non-Hermes Agent model, or configure a non-Hermes deployment in the mixed route.',
  '请调整 AGENT_LITELLM_MODEL 或补齐对应渠道配置。':
    'Adjust AGENT_LITELLM_MODEL or complete the corresponding channel configuration.',
  // stock_list
  '当前 STOCK_LIST 为空。': 'STOCK_LIST is currently empty.',
  '请至少添加 1 只股票用于首次试跑。': 'Add at least one stock for the first trial run.',
  // notification
  '已检测到至少一个通知渠道配置。': 'At least one notification channel is configured.',
  '通知为可选项，未配置也不影响首次跑通。': 'Notifications are optional and not required for the first run.',
  '需要推送时可稍后配置飞书、钉钉、Telegram、邮件或其他通知渠道。':
    'When you need push notifications, configure Feishu, DingTalk, Telegram, email, or another channel later.',
  // storage
  '请检查 DATABASE_PATH 或上级目录权限。': 'Check DATABASE_PATH or the permissions of its parent directory.',
  '请调整 DATABASE_PATH 或目录权限。': 'Adjust DATABASE_PATH or the directory permissions.',
};

const PRIMARY_MODEL_SOURCE_LABELS_EN: Record<string, string> = {
  显式主模型: 'explicit primary model',
  'LiteLLM YAML': 'LiteLLM YAML',
  'LLM 渠道': 'LLM channel',
  'legacy provider': 'legacy provider',
};

// Backend messages with dynamic parts (model, count, path). Patterns are anchored so that
// unknown wording falls through to the backend text instead of a partial translation.
const SETUP_CHECK_PATTERNS_EN: Array<{ pattern: RegExp; render: (match: RegExpExecArray) => string }> = [
  {
    pattern: /^已启用 (.+) 本地生成 Backend（experimental\/limited）。$/,
    render: (m) => `${m[1]} local generation backend is enabled (experimental/limited).`,
  },
  {
    pattern: /^已选择 (.+)，但未找到 (.+) 可执行文件。$/,
    render: (m) => `${m[1]} is selected, but the ${m[2]} executable was not found.`,
  },
  {
    pattern: /^已检测到 (显式主模型|LiteLLM YAML|LLM 渠道|legacy provider): (.+)$/,
    render: (m) => `Detected ${PRIMARY_MODEL_SOURCE_LABELS_EN[m[1]]}: ${m[2]}`,
  },
  {
    pattern: /^Agent 工具调用暂不支持 (.+) text-only backend。$/,
    render: (m) => `Agent tool calling does not support the ${m[1]} text-only backend yet.`,
  },
  {
    pattern: /^普通分析使用 Codex CLI；Agent 工具调用仍使用 LiteLLM 主模型: (.+)$/,
    render: (m) => `Regular analysis uses Codex CLI; Agent tool calling still uses the LiteLLM primary model: ${m[1]}`,
  },
  {
    pattern: /^Agent 主模型 (.+) 只有 Hermes deployment，Phase 3 不支持 Agent 工具调用。$/,
    render: (m) => `Agent primary model ${m[1]} only has a Hermes deployment; Phase 3 does not support Agent tool calling.`,
  },
  {
    pattern: /^已配置 Agent 主模型: (.+)$/,
    render: (m) => `Agent primary model configured: ${m[1]}`,
  },
  {
    pattern: /^Agent 主模型 (.+) 缺少可用渠道或匹配的 API Key。$/,
    render: (m) => `Agent primary model ${m[1]} has no available channel or matching API key.`,
  },
  {
    pattern: /^已配置 (\d+) 只股票。$/,
    render: (m) => (m[1] === '1' ? '1 stock configured.' : `${m[1]} stocks configured.`),
  },
  {
    pattern: /^数据库路径父目录不可用: (.+)$/,
    render: (m) => `Database parent directory is unavailable: ${m[1]}`,
  },
  {
    pattern: /^数据库路径可用: (.+)$/,
    render: (m) => `Database path is available: ${m[1]}`,
  },
  {
    pattern: /^数据库上级目录可创建: (.+)$/,
    render: (m) => `Database parent directory can be created: ${m[1]}`,
  },
  {
    pattern: /^数据库路径上级目录不可写: (.+)$/,
    render: (m) => `Database parent directory is not writable: ${m[1]}`,
  },
];

function translateSetupText(value: string): string {
  const exact = SETUP_CHECK_TEXT_EN[value];
  if (exact) {
    return exact;
  }
  for (const { pattern, render } of SETUP_CHECK_PATTERNS_EN) {
    const match = pattern.exec(value);
    if (match) {
      return render(match);
    }
  }
  return value;
}

export function getSetupCheckTitle(check: Pick<SetupStatusCheck, 'key' | 'title'>, language: UiLanguage = 'zh'): string {
  if (language !== 'en') {
    return check.title;
  }
  return SETUP_CHECK_TITLES_EN[check.key] ?? check.title;
}

export function getSetupCheckMessage(message: string, language: UiLanguage = 'zh'): string {
  return language === 'en' ? translateSetupText(message) : message;
}

export function getSetupCheckNextStep(
  nextStep: string | null | undefined,
  language: UiLanguage = 'zh',
): string | null | undefined {
  return language === 'en' && nextStep ? translateSetupText(nextStep) : nextStep;
}
