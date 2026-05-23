/**
 * Prompt 引擎
 * 构建发送给 LLM 的消息数组
 * 支持自定义模板覆盖默认 Prompt
 */
import { buildSystemPrompt, buildUserPrompt } from '../config/prompts.js'
import { getPlatform } from '../config/platforms.js'

/**
 * 为单个平台构建消息
 * @param {string} platformId - 平台ID
 * @param {Object} videoData - { transcription, visualDescription, duration }
 * @param {Object} customPrompt - 可选的自定义 prompt { system, user }
 * @returns {{ system: string, user: string }}
 */
export function buildMessagesForPlatform(platformId, videoData, customPrompt) {
  const platform = getPlatform(platformId)
  if (!platform) {
    throw new Error(`未知平台: ${platformId}`)
  }

  const { transcription, visualDescription, duration } = videoData

  const systemPrompt =
    customPrompt?.system || buildSystemPrompt(platform)

  const userPrompt =
    customPrompt?.user ||
    buildUserPrompt(platform, transcription, visualDescription, duration)

  return {
    system: systemPrompt,
    user: userPrompt,
  }
}

/**
 * 构建完整的 messages 数组
 */
export function buildMessages(systemPrompt, userPrompt) {
  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]
}

/**
 * 并发为多个平台构建 Prompt
 * @returns {Map<string, {system: string, user: string}>}
 */
export function buildAllPlatformMessages(
  platformIds,
  videoData,
  customPrompts = {}
) {
  const map = new Map()
  for (const id of platformIds) {
    map.set(
      id,
      buildMessagesForPlatform(id, videoData, customPrompts[id])
    )
  }
  return map
}
