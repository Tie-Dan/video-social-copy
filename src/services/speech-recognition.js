/**
 * 语音识别服务 — 用户口述模式
 * 用户看视频后自己口述内容，比自动从视频音频提取可靠得多
 */

export function isSpeechRecognitionSupported() {
  return !!(
    window.SpeechRecognition ||
    window.webkitSpeechRecognition
  )
}

/**
 * 开始口述识别
 * 用户对着麦克风描述视频内容，实时显示识别结果
 *
 * @param {Object} options
 * @param {function} options.onResult - 实时结果回调 (fullText)
 * @param {function} options.onDone - 完成回调 (finalText)
 * @param {function} options.onError - 错误回调 (errorMessage)
 * @returns {{ stop: function }} 返回停止方法
 */
export function startDictation(options = {}) {
  const { onResult, onDone, onError } = options

  if (!isSpeechRecognitionSupported()) {
    onError?.('当前浏览器不支持语音识别，请使用 Chrome')
    return { stop: () => {} }
  }

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = new SpeechRecognition()

  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = 'zh-CN'
  recognition.maxAlternatives = 1

  let finalText = ''
  let stopped = false

  recognition.onresult = (event) => {
    let interim = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]
      if (result.isFinal) {
        finalText += result[0].transcript
      } else {
        interim += result[0].transcript
      }
    }
    onResult?.(finalText + interim)
  }

  recognition.onerror = (event) => {
    if (stopped) return

    if (event.error === 'no-speech') {
      // 没检测到语音，不是致命错误，继续等
      return
    }
    if (event.error === 'aborted') return

    const errors = {
      'not-allowed': '麦克风权限被拒绝，请在浏览器设置中允许麦克风访问',
      'audio-capture': '未找到麦克风设备',
      'network': '语音识别需要网络连接，请检查网络',
      'service-not-allowed': '语音识别服务不可用',
    }
    const msg = errors[event.error] || `语音识别错误: ${event.error}`
    onError?.(msg)
  }

  recognition.onend = () => {
    if (!stopped) {
      onDone?.(finalText)
    }
  }

  recognition.start()

  return {
    stop: () => {
      stopped = true
      recognition.stop()
      onDone?.(finalText)
    },
  }
}
