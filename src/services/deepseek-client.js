/**
 * DeepSeek API 客户端
 * 兼容 OpenAI Chat Completions 接口格式
 */

/**
 * 调用 DeepSeek Chat API 生成文案
 * @param {Object} config - { apiKey, baseURL, model }
 * @param {Array} messages - [{role, content}]
 * @returns {Promise<Object>} 解析后的 JSON 结果
 */
export async function generateContent(config, messages) {
  const { apiKey, baseURL = 'https://api.deepseek.com/v1', model = 'deepseek-chat' } = config

  const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.8,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    let errorMsg = `API 请求失败 (${response.status})`
    try {
      const err = JSON.parse(errorBody)
      errorMsg = err.error?.message || errorMsg
    } catch {}
    throw new Error(errorMsg)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('API 返回内容为空')
  }

  return parseResponse(content)
}

/**
 * 解析 LLM 返回的 JSON
 */
function parseResponse(content) {
  // 去除可能的 markdown 代码块标记
  let jsonStr = content.trim()
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  }

  try {
    const parsed = JSON.parse(jsonStr)
    return normalizeResult(parsed)
  } catch {
    // JSON 解析失败时，尝试从文本中提取
    return fallbackParse(jsonStr)
  }
}

/** 标准化结果格式 */
function normalizeResult(parsed) {
  const result = {
    titles: [],
    description: '',
    tags: [],
  }

  if (Array.isArray(parsed.titles)) {
    result.titles = parsed.titles.filter((t) => typeof t === 'string' && t.trim())
  }
  if (typeof parsed.description === 'string') {
    result.description = parsed.description.trim()
  }
  if (Array.isArray(parsed.tags)) {
    result.tags = parsed.tags.filter((t) => typeof t === 'string' && t.trim())
  }

  return result
}

/** 容错解析：从非标准JSON中提取字段 */
function fallbackParse(text) {
  const result = { titles: [], description: '', tags: [] }

  // 尝试提取标题
  const titleMatch = text.match(/(?:标题[：:]\s*)(.+?)(?:\n|$)/gi)
  if (titleMatch) {
    result.titles = titleMatch.map((t) =>
      t.replace(/(?:标题[：:]\s*)/i, '').trim()
    ).filter(Boolean)
  }

  // 尝试提取描述
  const descMatch = text.match(/(?:描述[：:]\s*)([\s\S]+?)(?:\n(?:标签|tags)|$)/i)
  if (descMatch) {
    result.description = descMatch[1].trim()
  }

  // 尝试提取标签
  const tagMatch = text.match(/(?:标签|tags)[：:]\s*(.+?)$/im)
  if (tagMatch) {
    result.tags = tagMatch[1]
      .split(/[#,，\s]+/)
      .map((t) => t.trim())
      .filter(Boolean)
  }

  return result
}
