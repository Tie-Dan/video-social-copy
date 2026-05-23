/**
 * 百度语音识别 ASR 客户端
 *
 * 1. 用 API Key + Secret Key 换 access_token
 * 2. 用 access_token 调 ASR 接口
 *
 * 开通: https://console.bce.baidu.com/ai/#/ai/speech/overview
 *   领免费额度 → 创建应用 → 获取 API Key 和 Secret Key
 */

const TOKEN_URL = 'https://aip.baidubce.com/oauth/2.0/token'
const ASR_URL = 'https://vop.baidu.com/server_api'

/** 缓存 token，避免每次请求都换 */
let cachedToken = ''
let tokenExpiry = 0

async function getAccessToken(apiKey, secretKey) {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken
  }

  const url = `${TOKEN_URL}?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`
  const resp = await fetch(url, { method: 'POST' })
  const data = await resp.json()

  if (data.error) {
    throw new Error(`获取百度 token 失败: ${data.error_description || data.error}`)
  }

  cachedToken = data.access_token
  // token 有效期通常 30 天，提前 1 天刷新
  tokenExpiry = Date.now() + (data.expires_in - 86400) * 1000
  return cachedToken
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * @param {Blob} audioWavBlob
 * @param {Object} config - { apiKey, secretKey }
 * @returns {Promise<string>}
 */
export async function transcribeAudio(audioWavBlob, config) {
  const { apiKey, secretKey } = config

  if (!apiKey || !secretKey) {
    throw new Error('请先在设置中配置百度语音 API Key 和 Secret Key')
  }

  const token = await getAccessToken(apiKey, secretKey)
  const audioBuffer = await audioWavBlob.arrayBuffer()
  const speechBase64 = arrayBufferToBase64(audioBuffer)

  const body = JSON.stringify({
    format: 'wav',
    rate: 16000,
    channel: 1,
    cuid: 'video-copy-ext',
    token,
    speech: speechBase64,
    len: audioBuffer.byteLength,
  })

  const resp = await fetch(ASR_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })

  const result = await resp.json()

  if (result.err_no !== 0) {
    const errors = {
      3301: '音频质量过差或格式错误',
      3302: '鉴权失败，请检查 API Key 和 Secret Key',
      3304: '请求次数超限，请稍后再试',
      3307: '音频文件过大（不超过 60 秒）',
    }
    const msg = errors[result.err_no] || result.err_msg || `错误码: ${result.err_no}`
    throw new Error(msg)
  }

  const text = result?.result?.[0] || ''
  if (!text) {
    throw new Error('未识别到语音内容，请确认视频包含清晰人声')
  }

  return text
}
