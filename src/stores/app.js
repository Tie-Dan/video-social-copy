/**
 * 全局应用状态
 * 管理视频上传 → 转写/口述 → 生成 → 复制 全流程状态
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getDefaultPlatformIds } from '../config/platforms.js'
import { getProvider } from '../config/models.js'
import { getVideoInfo, getVideoThumbnail } from '../services/video-processor.js'
import { startDictation } from '../services/speech-recognition.js'
import { generateContent } from '../services/deepseek-client.js'
import { buildAllPlatformMessages, buildMessages } from '../services/prompt-engine.js'

export const useAppStore = defineStore('app', () => {
  // ====== 视频相关 ======
  const videoFile = ref(null)
  const videoUrl = ref(null)
  const videoInfo = ref(null)
  const thumbnail = ref(null)

  // ====== 口述/转写 ======
  const transcription = ref('')
  const isRecording = ref(false)
  const dictation = ref(null) // { stop: fn } 口述控制器

  // ====== 平台选择 ======
  const selectedPlatforms = ref(getDefaultPlatformIds())

  // ====== 生成相关 ======
  const results = ref({})
  const isGenerating = ref(false)
  const error = ref('')

  // ====== 设置 ======
  const apiKey = ref('')
  const model = ref('deepseek-chat')

  // ====== 计算属性 ======
  const hasVideo = computed(() => !!videoFile.value)
  const hasTranscription = computed(() => transcription.value.length > 0)
  const hasResults = computed(() => Object.keys(results.value).length > 0)
  const canGenerate = computed(() => hasVideo.value && !isGenerating.value)

  // ====== 动作 ======

  /** 设置视频文件 */
  async function setVideo(file) {
    resetAll()
    videoFile.value = file
    videoUrl.value = URL.createObjectURL(file)

    try {
      const [info, thumb] = await Promise.all([
        getVideoInfo(file),
        getVideoThumbnail(file),
      ])
      videoInfo.value = info
      thumbnail.value = thumb
    } catch (e) {
      error.value = `视频读取失败: ${e.message}`
    }
  }

  /** 移除视频 */
  function removeVideo() {
    if (videoUrl.value) {
      URL.revokeObjectURL(videoUrl.value)
    }
    resetAll()
  }

  /** 开始口述识别 */
  function startRecording() {
    isRecording.value = true
    error.value = ''
    transcription.value = ''

    dictation.value = startDictation({
      onResult: (text) => {
        transcription.value = text
      },
      onDone: (text) => {
        transcription.value = text
        isRecording.value = false
        dictation.value = null
      },
      onError: (msg) => {
        error.value = msg
        isRecording.value = false
        dictation.value = null
      },
    })
  }

  /** 停止口述 */
  function stopRecording() {
    dictation.value?.stop()
    isRecording.value = false
    dictation.value = null
  }

  /** 手动设置文本 */
  function setTranscription(text) {
    transcription.value = text
  }

  /** 生成文案 */
  async function generateCopy() {
    if (!canGenerate.value) return

    isGenerating.value = true
    error.value = ''
    results.value = {}

    if (!apiKey.value) {
      error.value = '请先在右上角 ⚙️ 设置中配置 DeepSeek API Key'
      isGenerating.value = false
      return
    }

    const provider = getProvider('deepseek')
    const config = {
      apiKey: apiKey.value,
      baseURL: provider.baseURL,
      model: model.value || provider.defaultModel,
    }

    const videoData = {
      transcription: transcription.value,
      visualDescription: '',
      duration: videoInfo.value?.durationFormatted || '',
    }

    const platformMessages = buildAllPlatformMessages(
      selectedPlatforms.value,
      videoData
    )

    const promises = selectedPlatforms.value.map(async (platformId) => {
      const msg = platformMessages.get(platformId)
      const messages = buildMessages(msg.system, msg.user)

      try {
        const result = await generateContent(config, messages)
        return { platformId, result, error: null }
      } catch (e) {
        return { platformId, result: null, error: e.message }
      }
    })

    const allResults = await Promise.all(promises)

    for (const { platformId, result, error: err } of allResults) {
      if (result) {
        results.value[platformId] = result
      } else if (err) {
        results.value[platformId] = {
          titles: [],
          description: '',
          tags: [],
          _error: err,
        }
      }
    }

    isGenerating.value = false
  }

  /** 重置 */
  function resetAll() {
    stopRecording()
    videoFile.value = null
    videoUrl.value = null
    videoInfo.value = null
    thumbnail.value = null
    transcription.value = ''
    results.value = {}
    isGenerating.value = false
    error.value = ''
  }

  /** 同步设置 */
  function syncSettings(settings) {
    apiKey.value = settings.deepseekApiKey || ''
    model.value = settings.deepseekModel || 'deepseek-chat'
  }

  return {
    videoFile,
    videoUrl,
    videoInfo,
    thumbnail,
    transcription,
    isRecording,
    selectedPlatforms,
    results,
    isGenerating,
    error,
    hasVideo,
    hasTranscription,
    hasResults,
    canGenerate,
    setVideo,
    removeVideo,
    startRecording,
    stopRecording,
    setTranscription,
    generateCopy,
    resetAll,
    syncSettings,
  }
})
