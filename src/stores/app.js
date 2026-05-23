/**
 * 全局应用状态
 * 视频上传 → ASR语音转文字 → DeepSeek生成文案 → 复制
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getDefaultPlatformIds } from '../config/platforms.js'
import { getProvider } from '../config/models.js'
import { getVideoInfo, getVideoThumbnail, extractAudio } from '../services/video-processor.js'
import { transcribeAudio } from '../services/asr-client.js'
import { generateContent } from '../services/deepseek-client.js'
import { buildAllPlatformMessages, buildMessages } from '../services/prompt-engine.js'

export const useAppStore = defineStore('app', () => {
  const videoFile = ref(null)
  const videoUrl = ref(null)
  const videoInfo = ref(null)
  const thumbnail = ref(null)

  const transcription = ref('')
  const isTranscribing = ref(false)
  const transcribeProgress = ref(0)
  const selectedPlatforms = ref(getDefaultPlatformIds())
  const results = ref({})
  const isGenerating = ref(false)
  const error = ref('')

  const apiKey = ref('')
  const model = ref('deepseek-chat')

  const hasVideo = computed(() => !!videoFile.value)
  const hasTranscription = computed(() => transcription.value.length > 0)
  const hasResults = computed(() => Object.keys(results.value).length > 0)
  const canGenerate = computed(() => hasVideo.value && !isGenerating.value)

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

  function removeVideo() {
    if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
    resetAll()
  }

  async function startAutoTranscribe() {
    if (!videoFile.value) return
    isTranscribing.value = true
    transcribeProgress.value = 0
    error.value = ''

    try {
      // 直接从 chrome.storage 读取，绕过 Pinia 跨页面同步问题
      let asrConfig = {}
      try {
        const result = await chrome.storage.local.get('video_copy_settings')
        const data = result?.video_copy_settings || {}
        asrConfig = { apiKey: data.asrApiKey || '', secretKey: data.asrSecretKey || '' }
      } catch {
        const raw = localStorage.getItem('video_copy_settings')
        if (raw) {
          const data = JSON.parse(raw)
          asrConfig = { apiKey: data.asrApiKey || '', secretKey: data.asrSecretKey || '' }
        }
      }

      transcribeProgress.value = 0.3
      const audioBlob = await extractAudio(videoFile.value)
      transcribeProgress.value = 0.5
      const text = await transcribeAudio(audioBlob, asrConfig)
      transcribeProgress.value = 1
      transcription.value = text
    } catch (e) {
      error.value = `识别失败: ${e.message}`
    } finally {
      isTranscribing.value = false
    }
  }

  function setTranscription(text) { transcription.value = text }

  async function generateCopy() {
    if (!canGenerate.value) return
    isGenerating.value = true
    error.value = ''
    results.value = {}

    if (!apiKey.value) {
      error.value = '请先在设置中配置 DeepSeek API Key'
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

    const platformMessages = buildAllPlatformMessages(selectedPlatforms.value, videoData)
    const promises = selectedPlatforms.value.map(async (platformId) => {
      const msg = platformMessages.get(platformId)
      try {
        const result = await generateContent(config, buildMessages(msg.system, msg.user))
        return { platformId, result, error: null }
      } catch (e) {
        return { platformId, result: null, error: e.message }
      }
    })

    const allResults = await Promise.all(promises)
    for (const { platformId, result, error: err } of allResults) {
      if (result) results.value[platformId] = result
      else if (err) results.value[platformId] = { titles: [], description: '', tags: [], _error: err }
    }
    isGenerating.value = false
  }

  function resetAll() {
    videoFile.value = null
    videoUrl.value = null
    videoInfo.value = null
    thumbnail.value = null
    transcription.value = ''
    isTranscribing.value = false
    transcribeProgress.value = 0
    results.value = {}
    isGenerating.value = false
    error.value = ''
  }

  function syncSettings(settings) {
    apiKey.value = settings.deepseekApiKey || ''
    model.value = settings.deepseekModel || 'deepseek-chat'
  }

  return {
    videoFile, videoUrl, videoInfo, thumbnail,
    transcription, isTranscribing, transcribeProgress,
    selectedPlatforms, results, isGenerating, error,
    hasVideo, hasTranscription, hasResults, canGenerate,
    setVideo, removeVideo,
    startAutoTranscribe, setTranscription, generateCopy,
    resetAll, syncSettings,
  }
})
