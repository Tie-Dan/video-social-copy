/**
 * 全局应用状态
 * 管理视频上传 → 转写 → 生成 → 复制 全流程状态
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getDefaultPlatformIds } from '../config/platforms.js'
import { getProvider } from '../config/models.js'
import { getVideoInfo, getVideoThumbnail } from '../services/video-processor.js'
import { transcribeVideo } from '../services/speech-recognition.js'
import { generateContent } from '../services/deepseek-client.js'
import { buildAllPlatformMessages, buildMessages } from '../services/prompt-engine.js'

export const useAppStore = defineStore('app', () => {
  // ====== 视频相关 ======
  const videoFile = ref(null)
  const videoUrl = ref(null)
  const videoInfo = ref(null) // { duration, width, height, durationFormatted }
  const thumbnail = ref(null) // base64 thumbnail

  // ====== 转写相关 ======
  const transcription = ref('')
  const interimTranscription = ref('')
  const isTranscribing = ref(false)
  const transcribeProgress = ref(0)

  // ====== 平台选择 ======
  const selectedPlatforms = ref(getDefaultPlatformIds())

  // ====== 生成相关 ======
  const results = ref({}) // { [platformId]: { titles, description, tags } }
  const isGenerating = ref(false)
  const currentStep = ref('') // 'idle' | 'transcribing' | 'generating' | 'done'
  const error = ref('')

  // ====== 设置（从 settings store 同步） ======
  const apiKey = ref('')
  const model = ref('deepseek-chat')

  // ====== 计算属性 ======
  const hasVideo = computed(() => !!videoFile.value)
  const hasTranscription = computed(() => transcription.value.length > 0)
  const hasResults = computed(() => Object.keys(results.value).length > 0)
  const canGenerate = computed(
    () => hasVideo.value && !isGenerating.value
  )

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

  /** 开始语音转写 */
  async function startTranscription() {
    if (!videoFile.value) return
    isTranscribing.value = true
    currentStep.value = 'transcribing'
    error.value = ''
    transcription.value = ''
    transcribeProgress.value = 0

    try {
      const text = await transcribeVideo(videoFile.value, {
        onInterim: (t) => {
          interimTranscription.value = t
        },
        onProgress: (p) => {
          transcribeProgress.value = p
        },
      })

      transcription.value = text || ''
      interimTranscription.value = ''
    } catch (e) {
      error.value = `语音识别失败: ${e.message}`
      // 转写失败不阻塞流程，用户可以手动输入
    } finally {
      isTranscribing.value = false
      transcribeProgress.value = 1
    }
  }

  /** 手动设置转写文本 */
  function setTranscription(text) {
    transcription.value = text
  }

  /** 生成文案 */
  async function generateCopy() {
    if (!canGenerate.value) return

    isGenerating.value = true
    currentStep.value = 'generating'
    error.value = ''
    results.value = {}

    if (!apiKey.value) {
      error.value = '请先在设置中配置 DeepSeek API Key'
      isGenerating.value = false
      currentStep.value = 'idle'
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

    // 并发请求所有平台
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
    currentStep.value = 'done'
  }

  /** 重置所有状态 */
  function resetAll() {
    videoFile.value = null
    videoUrl.value = null
    videoInfo.value = null
    thumbnail.value = null
    transcription.value = ''
    interimTranscription.value = ''
    isTranscribing.value = false
    transcribeProgress.value = 0
    results.value = {}
    isGenerating.value = false
    currentStep.value = 'idle'
    error.value = ''
  }

  /** 同步设置 */
  function syncSettings(settings) {
    apiKey.value = settings.deepseekApiKey || ''
    model.value = settings.deepseekModel || 'deepseek-chat'
  }

  return {
    // state
    videoFile,
    videoUrl,
    videoInfo,
    thumbnail,
    transcription,
    interimTranscription,
    isTranscribing,
    transcribeProgress,
    selectedPlatforms,
    results,
    isGenerating,
    currentStep,
    error,
    // computed
    hasVideo,
    hasTranscription,
    hasResults,
    canGenerate,
    // actions
    setVideo,
    removeVideo,
    startTranscription,
    setTranscription,
    generateCopy,
    resetAll,
    syncSettings,
  }
})
