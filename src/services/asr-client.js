/**
 * 火山引擎 ASR 客户端 — 语音转文字
 *
 * 火山引擎 一句话识别 API：
 *   POST https://openspeech.bytedance.com/api/v1/asr
 *   Header: Authorization: Bearer;{token}
 *   Body: raw audio (WAV/PCM)
 *
 * 用户需要：
 *   1. 注册火山引擎 https://console.volcengine.com/
 *   2. 开通「语音识别」服务
 *   3. 获取 App ID 和 Access Token
 */

const ASR_ENDPOINT = 'https://openspeech.bytedance.com/api/v1/asr'

/**
 * 将 WAV Blob 转为 PCM Int16 ArrayBuffer
 * WAV 格式 = 44字节头 + PCM数据
 */
async function wavToPcm(wavBlob) {
  const arrayBuffer = await wavBlob.arrayBuffer()
  // 跳过 44 字节 WAV 头，只取 PCM 数据
  return arrayBuffer.slice(44)
}

/**
 * 调用火山引擎 ASR 转写音频
 * @param {Blob} audioBlob - WAV 音频
 * @param {Object} config - { appId, accessToken, cluster? }
 * @returns {Promise<string>} 转写文本
 */
export async function transcribeAudio(audioBlob, config) {
  const { appId, accessToken, cluster = 'volcengine_input_edu' } = config

  if (!appId || !accessToken) {
    throw new Error('请先在设置中配置火山引擎 App ID 和 Access Token')
  }

  // WAV → PCM
  const pcmData = await wavToPcm(audioBlob)

  const url = `${ASR_ENDPOINT}?appid=${appId}&cluster=${cluster}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer;${accessToken}`,
      'Content-Type': 'audio/pcm',
      'Content-Length': String(pcmData.byteLength),
    },
    body: pcmData,
  })

  if (!response.ok) {
    const errText = await response.text()
    let msg = `语音识别请求失败 (${response.status})`
    try {
      const err = JSON.parse(errText)
      msg = err.message || err.result?.message || msg
    } catch {}
    throw new Error(msg)
  }

  const result = await response.json()
  const text = result?.result?.[0]?.text || result?.text || ''

  if (!text) {
    throw new Error('未识别到语音内容，请确认视频包含人声')
  }

  return text
}
