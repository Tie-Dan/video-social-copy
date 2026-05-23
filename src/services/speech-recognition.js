/**
 * 语音识别服务
 * 封装 Web Speech API (webkitSpeechRecognition)
 * 通过播放视频音频 + 实时监听麦克风实现转写
 */

// 检查 Web Speech API 是否可用
export function isSpeechRecognitionSupported() {
  return !!(
    window.SpeechRecognition ||
    window.webkitSpeechRecognition
  )
}

/**
 * 创建语音识别实例
 */
function createRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = new SpeechRecognition()

  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = 'zh-CN'
  recognition.maxAlternatives = 1

  return recognition
}

/**
 * 根据音频时长估算最大识别时间
 * 实际识别时间 = 音频时长 + buffer
 */
function estimateRecognitionTime(audioDuration) {
  return Math.ceil(audioDuration) + 10 // 秒
}

/**
 * 对视频文件进行语音识别
 *
 * 流程：播放视频音频 → Web Speech API 监听麦克风 → 收集转写结果
 *
 * @param {File} videoFile - 视频文件
 * @param {Object} options
 * @param {function} options.onInterim - 临时结果回调 (text)
 * @param {function} options.onProgress - 播放进度回调 (percent)
 * @returns {Promise<string>} 完整转写文本
 */
export async function transcribeVideo(videoFile, options = {}) {
  const { onInterim, onProgress } = options

  if (!isSpeechRecognitionSupported()) {
    throw new Error('当前浏览器不支持语音识别，请使用 Chrome 浏览器')
  }

  // 获取视频时长
  const duration = await getVideoDuration(videoFile)
  const maxTime = estimateRecognitionTime(duration)

  return new Promise((resolve, reject) => {
    const recognition = createRecognition()
    const video = document.createElement('video')
    const chunks = []
    let lastResult = ''
    let timeoutId = null
    let finished = false

    const cleanup = () => {
      finished = true
      clearTimeout(timeoutId)
      recognition.stop()
      video.pause()
      URL.revokeObjectURL(video.src)
    }

    // 超时保护
    timeoutId = setTimeout(() => {
      cleanup()
      // 返回已收集的结果
      const final = mergeResults(chunks) || lastResult
      resolve(final || '')
    }, maxTime * 1000)

    recognition.onresult = (event) => {
      let interim = ''
      let finalText = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalText += result[0].transcript
          chunks.push(result[0].transcript)
        } else {
          interim += result[0].transcript
        }
      }

      lastResult = finalText || interim
      if (onInterim) {
        onInterim(mergeResults(chunks) + interim)
      }
    }

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        // 静音不是致命错误，继续等待
        return
      }
      if (event.error === 'aborted') {
        return
      }
      cleanup()
      const final = mergeResults(chunks)
      if (final) {
        resolve(final)
      } else {
        reject(new Error(`语音识别失败: ${event.error}`))
      }
    }

    recognition.onend = () => {
      if (!finished) {
        const final = mergeResults(chunks)
        resolve(final)
      }
      cleanup()
    }

    // 开始识别
    recognition.start()

    // 播放视频（用户需要确保麦克风能收到声音）
    video.src = URL.createObjectURL(videoFile)
    video.muted = false
    video.volume = 1.0
    video.play().catch((e) => {
      cleanup()
      reject(new Error(`视频播放失败: ${e.message}`))
    })

    // 进度更新
    video.ontimeupdate = () => {
      if (onProgress && video.duration) {
        onProgress(video.currentTime / video.duration)
      }
    }

    video.onended = () => {
      // 视频播完后等待一小段时间收集最后的结果
      setTimeout(() => {
        const final = mergeResults(chunks)
        resolve(final)
        cleanup()
      }, 1000)
    }
  })
}

/** 合并识别结果片段 */
function mergeResults(chunks) {
  return chunks.join('')
}

/** 获取视频时长 */
function getVideoDuration(videoFile) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      const d = video.duration
      URL.revokeObjectURL(video.src)
      resolve(d)
    }
    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      reject(new Error('无法读取视频'))
    }
    video.src = URL.createObjectURL(videoFile)
  })
}

/**
 * 快速转写：仅使用麦克风（不播放视频）
 * 适用于用户对着麦克风口述的场景
 */
export function quickTranscribe(options = {}) {
  const { onInterim } = options

  if (!isSpeechRecognitionSupported()) {
    throw new Error('当前浏览器不支持语音识别')
  }

  return new Promise((resolve, reject) => {
    const recognition = createRecognition()
    let finalTranscript = ''

    recognition.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interim += result[0].transcript
        }
      }
      if (onInterim) {
        onInterim(finalTranscript + interim)
      }
    }

    recognition.onerror = (event) => {
      if (event.error === 'aborted') return
      reject(new Error(`语音识别失败: ${event.error}`))
    }

    recognition.onend = () => {
      resolve(finalTranscript)
    }

    recognition.start()

    // 15秒后自动停止
    setTimeout(() => {
      recognition.stop()
    }, 15000)
  })
}
