/**
 * 火山引擎 ASR 客户端 — 一句话识别
 *
 * API: POST https://openspeech.bytedance.com/api/v1/asr
 * Auth: Authorization: Bearer;{access_token}
 *
 * 开通: https://console.volcengine.com/speech/service/8
 *   注册 → 实名 → 开通「一句话识别」→ 获取 App ID 和 Access Token
 */

const ASR_ENDPOINT = 'https://openspeech.bytedance.com/api/v1/asr'

/**
 * 调用火山引擎 ASR 转写音频
 * @param {Blob} audioWavBlob - WAV 音频 Blob
 * @param {Object} config - { appId, accessToken }
 * @returns {Promise<string>} 转写文本
 */
export async function transcribeAudio(audioWavBlob, config) {
  const { appId, accessToken } = config

  if (!appId || !accessToken) {
    throw new Error('请先在设置中配置火山引擎 App ID 和 Access Token')
  }

  const audioBytes = await audioWavBlob.arrayBuffer()

  // 一句话识别 API，传 WAV 格式
  const url = `${ASR_ENDPOINT}?appid=${encodeURIComponent(appId)}&format=wav`

  let response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer;${accessToken}`,
        'Content-Type': 'audio/wav',
      },
      body: audioBytes,
    })
  } catch (e) {
    throw new Error('网络请求失败，请检查网络连接: ' + e.message)
  }

  const respText = await response.text()

  if (!response.ok) {
    let msg = `语音识别请求失败 (${response.status})`
    try {
      const err = JSON.parse(respText)
      // 火山引擎错误格式: {code: xxx, message: "..."} 或 {result: {message: "..."}}
      msg = err.message || err.result?.message || msg
    } catch {}
    throw new Error(msg)
  }

  try {
    const result = JSON.parse(respText)

    // 火山引擎返回格式: {result: [{text: "识别文本"}], ...}
    const text = result?.result?.[0]?.text || result?.text || result?.result?.text || ''

    if (!text) {
      throw new Error('未识别到语音内容，请确认：\n1. 视频包含人声\n2. 视频时长不超过 60 秒\n3. 火山引擎账户余额充足')
    }

    return text
  } catch (e) {
    if (e.message.startsWith('未识别')) throw e
    throw new Error('解析语音识别结果失败，返回内容: ' + respText.slice(0, 200))
  }
}
