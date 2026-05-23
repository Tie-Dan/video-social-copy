/**
 * 视频处理服务
 * - 提取音频轨道为 WAV Blob
 * - 提取关键帧图片
 * - 获取视频元信息（时长、尺寸等）
 */

/**
 * 从视频文件提取音频为 WAV Blob
 * 使用 AudioContext 解码后重新编码为 WAV
 */
export async function extractAudio(videoFile) {
  const audioContext = new AudioContext()
  const arrayBuffer = await videoFile.arrayBuffer()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
  const wavBlob = audioBufferToWav(audioBuffer)
  audioContext.close()
  return wavBlob
}

/**
 * 从视频中提取关键帧
 * @param {File} videoFile
 * @param {Object} options - { interval: 抽帧间隔(秒), maxFrames: 最大帧数, quality: JPEG质量 }
 * @returns {Promise<string[]>} base64 图片数组
 */
export async function extractKeyFrames(videoFile, options = {}) {
  const { interval = 5, maxFrames = 12, quality = 0.6 } = options

  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const frames = []

    video.preload = 'metadata'
    video.muted = true

    video.onloadedmetadata = () => {
      const duration = video.duration
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 360

      const frameCount = Math.min(
        Math.floor(duration / interval),
        maxFrames
      )

      if (frameCount === 0) {
        resolve([])
        URL.revokeObjectURL(video.src)
        return
      }

      let current = 0
      const seekToNext = () => {
        if (current >= frameCount) {
          URL.revokeObjectURL(video.src)
          resolve(frames)
          return
        }

        const time = (current + 0.5) * interval
        if (time >= duration) {
          URL.revokeObjectURL(video.src)
          resolve(frames)
          return
        }

        const handler = () => {
          video.removeEventListener('seeked', handler)
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          frames.push(canvas.toDataURL('image/jpeg', quality))
          current++
          seekToNext()
        }

        video.addEventListener('seeked', handler)
        video.currentTime = time
      }

      seekToNext()
    }

    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      reject(new Error('视频加载失败'))
    }

    video.src = URL.createObjectURL(videoFile)
  })
}

/**
 * 获取视频元信息
 */
export async function getVideoInfo(videoFile) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'

    video.onloadedmetadata = () => {
      const info = {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        durationFormatted: formatDuration(video.duration),
      }
      URL.revokeObjectURL(video.src)
      resolve(info)
    }

    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      reject(new Error('无法读取视频信息'))
    }

    video.src = URL.createObjectURL(videoFile)
  })
}

/**
 * 创建视频预览缩略图
 */
export async function getVideoThumbnail(videoFile) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    video.preload = 'metadata'
    video.muted = true

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 360
      video.currentTime = Math.min(1, video.duration / 3)
    }

    video.onseeked = () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const thumb = canvas.toDataURL('image/jpeg', 0.7)
      URL.revokeObjectURL(video.src)
      resolve(thumb)
    }

    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      reject(new Error('无法生成缩略图'))
    }

    video.src = URL.createObjectURL(videoFile)
  })
}

/** AudioBuffer → WAV Blob */
function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const format = 1 // PCM
  const bitsPerSample = 16

  const bytesPerSample = bitsPerSample / 8
  const blockAlign = numChannels * bytesPerSample
  const data = interleave(buffer)
  const dataSize = data.length * bytesPerSample
  const headerSize = 44
  const totalSize = headerSize + dataSize

  const arrayBuffer = new ArrayBuffer(totalSize)
  const view = new DataView(arrayBuffer)

  // RIFF header
  writeString(view, 0, 'RIFF')
  view.setUint32(4, totalSize - 8, true)
  writeString(view, 8, 'WAVE')
  // fmt chunk
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, format, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitsPerSample, true)
  // data chunk
  writeString(view, 36, 'data')
  view.setUint32(40, dataSize, true)

  // Write samples
  let offset = 44
  for (let i = 0; i < data.length; i++) {
    const sample = Math.max(-1, Math.min(1, data[i]))
    const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF
    view.setInt16(offset, intSample, true)
    offset += 2
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' })
}

function interleave(buffer) {
  const numChannels = buffer.numberOfChannels
  const length = buffer.length * numChannels
  const result = new Float32Array(length)

  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      result[i * numChannels + channel] = buffer.getChannelData(channel)[i]
    }
  }
  return result
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
