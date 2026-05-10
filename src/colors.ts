// 钢筋按"角色"配色（与方案确认一致）
export const RoleColors = {
  topThrough: '#ff6b6b',        // 上部通长筋 - 红
  bottomThrough: '#4ecdc4',     // 下部通长筋 - 青
  supportNegative1: '#ffa94d',  // 支座负筋第一排 - 橙
  supportNegative2: '#ffd43b',  // 支座负筋第二排 - 黄
  erectionBar: '#b197fc',       // 架立筋 - 紫
  waistBarG: '#74c0fc',         // 构造腰筋(G) - 浅蓝
  waistBarN: '#3b82f6',         // 抗扭腰筋(N) - 蓝
  stirrup: '#cbd5e1',           // 箍筋 - 浅灰
  tieBar: '#20c997',            // 拉结筋 - 绿
  bottomNoSupport: '#0ea5e9',   // 下部不伸入支座筋 - 天蓝
} as const;

export type RebarRole = keyof typeof RoleColors;

export const RoleLabels: Record<RebarRole, string> = {
  topThrough: '上部通长筋',
  bottomThrough: '下部通长筋',
  supportNegative1: '支座负筋(一排)',
  supportNegative2: '支座负筋(二排)',
  erectionBar: '架立筋',
  waistBarG: '构造腰筋(G)',
  waistBarN: '抗扭腰筋(N)',
  stirrup: '箍筋',
  tieBar: '拉结筋',
  bottomNoSupport: '下部不伸入支座筋',
};
