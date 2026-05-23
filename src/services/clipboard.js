/**
 * 剪贴板操作工具
 */

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @returns {Promise<boolean>} 是否成功
 */
export async function copyToClipboard(text) {
  if (!text) return false

  try {
    // 优先使用 Clipboard API
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback: execCommand
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      textarea.style.top = '-9999px'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      return true
    } catch {
      return false
    }
  }
}

/**
 * 复制平台的完整文案（标题 + 描述 + 标签）
 */
export async function copyPlatformContent(platformName, result) {
  const { titles, description, tags } = result
  const lines = []

  if (titles.length > 0) {
    lines.push(`【${platformName}标题】`)
    titles.forEach((t, i) => {
      lines.push(`  ${i + 1}. ${t}`)
    })
    lines.push('')
  }

  if (description) {
    lines.push(`【描述】`)
    lines.push(description)
    lines.push('')
  }

  if (tags.length > 0) {
    lines.push(`【标签】`)
    lines.push(tags.map((t) => (t.startsWith('#') ? t : `#${t}`)).join(' '))
  }

  return copyToClipboard(lines.join('\n'))
}

/**
 * 复制单个标题
 */
export async function copyTitle(text) {
  return copyToClipboard(text)
}

/**
 * 复制描述
 */
export async function copyDescription(text) {
  return copyToClipboard(text)
}

/**
 * 复制标签
 */
export async function copyTags(tags) {
  const tagStr = tags.map((t) => (t.startsWith('#') ? t : `#${t}`)).join(' ')
  return copyToClipboard(tagStr)
}
