/**
 * 火山引擎 ASR 客户端 — 一句话识别
 *
 * 开通: https://console.volcengine.com/speech/service/8
 */

const ASR_ENDPOINT = 'https://openspeech.bytedance.com/api/v1/asr'

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

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
      throw new Error('未识别到语音内容。请确认：1. 视频包含清晰人声 2. 时长 ≤ 60 秒')
    }

    return text
  } catch (e) {
    if (e.message.startsWith('未识别')) throw e
    throw new Error('解析识别结果失败')
  }
}
