import { describe, expect, it } from 'vitest';
import { getSetupCheckMessage, getSetupCheckNextStep, getSetupCheckTitle } from './setupStatusText';

describe('setupStatusText', () => {
  it('keeps backend text unchanged for zh', () => {
    expect(getSetupCheckTitle({ key: 'stock_list', title: '自选股' }, 'zh')).toBe('自选股');
    expect(getSetupCheckMessage('已配置 3 只股票。', 'zh')).toBe('已配置 3 只股票。');
    expect(getSetupCheckNextStep('请先补齐 LLM 主渠道配置。', 'zh')).toBe('请先补齐 LLM 主渠道配置。');
  });

  it('maps titles by key and messages by known backend wording for en', () => {
    expect(getSetupCheckTitle({ key: 'llm_primary', title: 'LLM 主渠道' }, 'en')).toBe('LLM primary channel');
    expect(getSetupCheckMessage('尚未检测到主模型配置', 'en')).toBe('No primary model configuration detected yet');
    expect(getSetupCheckMessage('已配置 3 只股票。', 'en')).toBe('3 stocks configured.');
    expect(getSetupCheckMessage('数据库路径可用: /data/stock_analysis.db', 'en'))
      .toBe('Database path is available: /data/stock_analysis.db');
    expect(getSetupCheckMessage('已检测到 LLM 渠道: deepseek/deepseek-chat', 'en'))
      .toBe('Detected LLM channel: deepseek/deepseek-chat');
    expect(getSetupCheckNextStep('请至少添加 1 只股票用于首次试跑。', 'en'))
      .toBe('Add at least one stock for the first trial run.');
  });

  it('falls back to backend text for unknown keys or wording', () => {
    expect(getSetupCheckTitle({ key: 'future_check', title: '新检查' }, 'en')).toBe('新检查');
    expect(getSetupCheckMessage('未知的后端提示', 'en')).toBe('未知的后端提示');
    expect(getSetupCheckNextStep(null, 'en')).toBeNull();
  });
});
