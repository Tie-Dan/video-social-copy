<template>
  <div class="transcription-edit">
    <div class="header">
      <span class="section-label">视频转写文本</span>
      <div class="header-actions">
        <span v-if="isTranscribing" class="status-badge">
          <span class="spinner-sm"></span>
          正在识别语音...
        </span>
        <button
          v-if="!isTranscribing && hasVideo"
          class="btn-record"
          @click="$emit('auto-transcribe')"
        >
          自动识别
        </button>
        <button v-if="text" class="btn-clear" @click="$emit('update:text', '')">清空</button>
      </div>
    </div>

    <div v-if="isTranscribing" class="progress-section">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: (progress * 100) + '%' }"></div>
      </div>
      <span class="progress-text">{{ progressText }}</span>
    </div>

    <textarea
      :value="text"
      :placeholder="isTranscribing ? '正在从视频中提取语音内容...' : '点击自动识别提取视频语音，或直接输入视频内容…'"
      class="trans-textarea"
      rows="4"
      @input="$emit('update:text', $event.target.value)"
    ></textarea>

    <div class="footer">
      <span v-if="text" class="char-count">{{ text.length }} 字</span>
      <span class="hint">内容越详细，生成的标题越精准</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: { type: String, default: '' },
  isTranscribing: Boolean,
  progress: { type: Number, default: 0 },
  hasVideo: Boolean,
})

defineEmits(['auto-transcribe', 'update:text'])

const progressText = computed(() => {
  const p = props.progress
  if (p < 0.4) return '提取音频中...'
  if (p < 0.7) return '识别中...'
  if (p < 1) return '处理中...'
  return '完成'
})
</script>

<style scoped>
.transcription-edit { display: flex; flex-direction: column; gap: 8px; }
.header { display: flex; justify-content: space-between; align-items: center; }
.section-label { font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
.header-actions { display: flex; align-items: center; gap: 6px; }

.status-badge { font-size: 11px; color: var(--primary); display: flex; align-items: center; gap: 4px; }

.spinner-sm {
  width: 10px; height: 10px;
  border: 2px solid var(--border); border-top-color: var(--primary);
  border-radius: 50%; animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.btn-record {
  font-size: 12px; padding: 5px 14px; border-radius: 6px;
  border: none; background: var(--primary); color: #fff;
  cursor: pointer; font-weight: 600; font-family: inherit;
}
.btn-record:hover { opacity: 0.85; }

.btn-clear {
  font-size: 11px; padding: 4px 10px; border-radius: 6px;
  border: 1px solid var(--border); background: var(--bg);
  color: var(--text-muted); cursor: pointer; font-family: inherit;
}
.btn-clear:hover { color: #dc2626; border-color: #dc2626; }

.progress-section { display: flex; align-items: center; gap: 8px; }
.progress-bar { flex: 1; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--primary); border-radius: 2px; transition: width 0.5s; }
.progress-text { font-size: 11px; color: var(--text-muted); white-space: nowrap; }

.trans-textarea {
  width: 100%; padding: 10px 12px; border: 1.5px solid var(--border);
  border-radius: 8px; font-size: 13px; line-height: 1.6; resize: vertical;
  font-family: inherit; background: var(--bg); color: var(--text);
  min-height: 80px; box-sizing: border-box;
}
.trans-textarea:focus { outline: none; border-color: var(--primary); }
.trans-textarea::placeholder { color: var(--text-muted); font-size: 12px; }

.footer { display: flex; justify-content: space-between; align-items: center; }
.char-count { font-size: 11px; color: var(--text-muted); }
.hint { font-size: 11px; color: var(--text-muted); }
</style>
