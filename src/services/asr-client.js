/**
 * 火山引擎 ASR 客户端 — 一句话识别
 *
 * POST https://openspeech.bytedance.com/api/v1/asr
 * Content-Type: application/json
 * Body: { app: {appid, token, cluster}, audio: {format, data: base64} }
 *
 * 开通: https://console.volcengine.com/speech/service/8
 */

const ASR_ENDPOINT = 'https://openspeech.bytedance.com/api/v1/asr'

/**
 * ArrayBuffer → base64 字符串
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * @param {Blob} audioWavBlob - WAV 音频
 * @param {Object} config - { appId, accessToken }
 * @returns {Promise<string>}
 */
export async function transcribeAudio(audioWavBlob, config) {
  const { appId, accessToken } = config

  if (!appId || !accessToken) {
    throw new Error('请先在设置中配置火山引擎 App ID 和 Access Token')
  }

  const audioBuffer = await audioWavBlob.arrayBuffer()
  const audioBase64 = arrayBufferToBase64(audioBuffer)

  const body = JSON.stringify({
    app: {
      appid: appId,
      token: accessToken,
      cluster: 'volcengine_input_common',
    },
    user: {
      uid: 'video-copy-extension',
    },
    audio: {
      format: 'wav',
      data: audioBase64,
    },
  })

  let response
  try {
    response = await fetch(ASR_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    })
  } catch (e) {
    throw new Error('网络请求失败: ' + e.message)
  }

  const respText = await response.text()

  if (!response.ok) {
    let msg = `语音识别请求失败 (${response.status})`
    try {
      const err = JSON.parse(respText)
      msg = err.message || err.result?.message || msg
    } catch {}
    throw new Error(msg)
  }

  try {
    const result = JSON.parse(respText)
    const text = result?.result?.[0]?.text || result?.text || result?.result?.text || ''

    if (!text) {
      throw new Error(
        '未识别到语音内容。请确认：\n1. 视频包含清晰人声\n2. 视频时长 ≤ 60 秒\n3. 火山引擎账户余额充足'
      )
    }

    return text
  } catch (e) {
    if (e.message.startsWith('未识别')) throw e
    throw new Error('解析识别结果失败')
  }
}
