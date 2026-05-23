/**
 * DeepSeek API 客户端
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
      temperature: 0.9,
      max_tokens: 2048,
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

function parseResponse(content) {
  let jsonStr = content.trim()

  // 去除 markdown 代码块
  jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```$/, '')

  try {
    const parsed = JSON.parse(jsonStr)
    return {
      titles: (parsed.titles || []).filter(Boolean).slice(0, 3),
      description: parsed.description || '',
      tags: (parsed.tags || []).filter(Boolean).slice(0, 8),
    }
  } catch {
    // JSON 解析失败，尝试正则提取
    const titles = []
    const titleMatches = content.match(/"?titles"?\s*:\s*\[([\s\S]*?)\]/)
    if (titleMatches) {
      const titleStr = titleMatches[1]
      const tMatches = titleStr.match(/"([^"]+)"/g)
      if (tMatches) titles.push(...tMatches.map((t) => t.replace(/"/g, '')))
    }
    const descMatch = content.match(/"description"\s*:\s*"([\s\S]*?)(?:"\s*[,}]|"$)/)
    const tagsMatch = content.match(/"tags"\s*:\s*\[([\s\S]*?)\]/)

    return {
      titles: titles.slice(0, 3),
      description: descMatch?.[1]?.replace(/\\n/g, '\n') || '',
      tags: tagsMatch
        ? tagsMatch[1].match(/"([^"]+)"/g)?.map((t) => t.replace(/"/g, '')) || []
        : [],
    }
  }
}
