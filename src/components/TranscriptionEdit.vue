<template>
  <div class="transcription-edit">
    <div class="header">
      <span class="section-label">视频转写文本</span>
      <div class="header-actions">
        <span v-if="isTranscribing" class="status-badge recording">
          <span class="pulse"></span>
          识别中...
        </span>
        <button
          v-if="hasVideo && !isTranscribing"
          class="btn-action"
          @click="$emit('transcribe')"
        >
          🎤 语音识别
        </button>
        <button
          v-if="text"
          class="btn-action btn-clear"
          @click="$emit('update:text', '')"
        >
          清空
        </button>
      </div>
    </div>

    <!-- 识别进度条 -->
    <div v-if="isTranscribing && progress > 0" class="progress-bar">
      <div class="progress-fill" :style="{ width: (progress * 100) + '%' }"></div>
    </div>

    <textarea
      :value="text"
      :placeholder="
        isTranscribing
          ? interim || '正在听写...'
          : '输入或语音识别视频中的文案内容，生成将基于此文本...'
      "
      class="trans-textarea"
      rows="4"
      @input="$emit('update:text', $event.target.value)"
    ></textarea>

    <div class="char-count" v-if="text">{{ text.length }} 字</div>
  </div>
</template>

<script setup>
defineProps({
  text: { type: String, default: '' },
  interim: { type: String, default: '' },
  isTranscribing: Boolean,
  progress: { type: Number, default: 0 },
  hasVideo: Boolean,
})

defineEmits(['transcribe', 'update:text'])
</script>

<style scoped>
.transcription-edit {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.header {
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-badge {
  font-size: 11px;
  color: var(--primary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-badge.recording .pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.btn-action {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  cursor: pointer;
  white-space: nowrap;
}

.btn-action:hover {
  border-color: var(--primary);
}

.btn-clear {
  color: var(--text-muted);
}

.progress-bar {
  height: 3px;
  background: var(--border);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 2px;
  transition: width 0.3s;
}

.trans-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
  font-family: inherit;
  background: var(--bg);
  color: var(--text);
  min-height: 80px;
  box-sizing: border-box;
}

.trans-textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.trans-textarea::placeholder {
  color: var(--text-muted);
}

.char-count {
  font-size: 11px;
  color: var(--text-muted);
  text-align: right;
}
</style>
