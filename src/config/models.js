/**
 * LLM 模型定义
 * 统一接口格式，方便扩展多模型
 */
export const llmProviders = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    baseURL: 'https://api.deepseek.com/v1',
    models: ['deepseek-chat'],
    defaultModel: 'deepseek-chat',
    requiresAuth: true,
    authHeader: 'Authorization',
    authPrefix: 'Bearer ',
  },
  {
    id: 'doubao',
    name: '豆包 (Doubao)',
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
    models: ['doubao-1.5-pro-256k'],
    defaultModel: 'doubao-1.5-pro-256k',
    requiresAuth: true,
    authHeader: 'Authorization',
    authPrefix: 'Bearer ',
  },
  {
    id: 'kimi',
    name: 'Kimi (月之暗面)',
    baseURL: 'https://api.moonshot.cn/v1',
    models: ['moonshot-v1-8k'],
    defaultModel: 'moonshot-v1-8k',
    requiresAuth: true,
    authHeader: 'Authorization',
    authPrefix: 'Bearer ',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini'],
    defaultModel: 'gpt-4o',
    requiresAuth: true,
    authHeader: 'Authorization',
    authPrefix: 'Bearer ',
  },
  {
    id: 'custom',
    name: '自定义',
    baseURL: '',
    models: [],
    defaultModel: '',
    requiresAuth: true,
    authHeader: 'Authorization',
    authPrefix: 'Bearer ',
  },
]

export function getProvider(id) {
  return llmProviders.find((p) => p.id === id)
}
