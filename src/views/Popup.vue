<template>
  <div class="popup">
    <!-- 头部 -->
    <header class="popup-header">
      <h1 class="app-title">短视频文案生成器</h1>
      <button class="settings-btn" @click="openSettings" title="设置">⚙️</button>
    </header>

    <!-- 视频上传 -->
    <VideoUpload
      :thumbnail="store.thumbnail"
      :video-info="store.videoInfo"
      @upload="store.setVideo"
      @remove="store.removeVideo"
      @play="showPreview = true"
    />

    <!-- 平台选择 -->
    <PlatformSelect
      v-model:selected="store.selectedPlatforms"
    />

    <!-- 转写区域 -->
    <TranscriptionEdit
      :text="store.transcription"
      :is-transcribing="store.isTranscribing"
      :progress="store.transcribeProgress"
      :is-recording="store.isRecording"
      :has-video="store.hasVideo"
      @auto-transcribe="store.startAutoTranscribe"
      @start-record="store.startRecording"
      @stop-record="store.stopRecording"
      @update:text="store.setTranscription"
    />

    <!-- 生成按钮 -->
    <button
      class="generate-btn"
      :disabled="!store.hasVideo || store.isGenerating"
      @click="handleGenerate"
    >
      <template v-if="store.isGenerating">
        <span class="spinner"></span>
        生成中...
      </template>
      <template v-else>
        🚀 生成文案
      </template>
    </button>

    <!-- 错误信息 -->
    <div v-if="store.error" class="global-error">
      {{ store.error }}
      <button @click="store.error = ''">✕</button>
    </div>

    <!-- 生成结果 -->
    <div v-if="store.hasResults" class="results-section">
      <div class="results-header">
        <span class="section-label">生成结果</span>
      </div>
      <div class="results-list">
        <ResultCard
          v-for="pid in store.selectedPlatforms.filter(p => store.results[p])"
          :key="pid"
          :platform-id="pid"
          :result="store.results[pid]"
        />
      </div>
    </div>

    <!-- 视频预览弹窗 -->
    <VideoPreview
      :show="showPreview"
      :video-url="store.videoUrl"
      @close="showPreview = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAppStore } from '../stores/app.js'
import { useSettingsStore } from '../stores/settings.js'
import VideoUpload from '../components/VideoUpload.vue'
import PlatformSelect from '../components/PlatformSelect.vue'
import TranscriptionEdit from '../components/TranscriptionEdit.vue'
import ResultCard from '../components/ResultCard.vue'
import VideoPreview from '../components/VideoPreview.vue'

const store = useAppStore()
const settingsStore = useSettingsStore()
const showPreview = ref(false)

onMounted(async () => {
  await settingsStore.load()
  store.syncSettings({
    deepseekApiKey: settingsStore.deepseekApiKey,
    deepseekModel: settingsStore.deepseekModel,
    asrAppId: settingsStore.asrAppId,
    asrToken: settingsStore.asrToken,
  })
})

async function handleGenerate() {
  await store.generateCopy()
}

function openSettings() {
  chrome.runtime.openOptionsPage()
}
</script>

<style scoped>
.popup {
  width: 420px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: var(--bg);
  color: var(--text);
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-title {
  font-size: 15px;
  font-weight: 700;
  margin: 0;
}

.settings-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.generate-btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 10px;
  background: var(--primary);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: opacity 0.15s;
  font-family: inherit;
}

.generate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.global-error {
  font-size: 12px;
  color: #dc2626;
  padding: 8px 10px;
  background: #fef2f2;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.global-error button {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 14px;
}

.results-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
