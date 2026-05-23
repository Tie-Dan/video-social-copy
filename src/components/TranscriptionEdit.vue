<template>
  <div class="transcription-edit">
    <div class="header">
      <span class="section-label">视频内容描述</span>
      <div class="header-actions">
        <!-- 未录音时：显示开始口述按钮 -->
        <button
          v-if="!isRecording && hasVideo"
          class="btn-record"
          @click="$emit('start-record')"
        >
          🎤 口述内容
        </button>
        <!-- 录音中：显示停止按钮 -->
        <button
          v-if="isRecording"
          class="btn-record recording"
          @click="$emit('stop-record')"
        >
          <span class="pulse"></span>
          停止录音
        </button>
        <button
          v-if="text"
          class="btn-clear"
          @click="$emit('update:text', '')"
        >
          清空
        </button>
      </div>
    </div>

    <!-- 录音提示 -->
    <div v-if="isRecording" class="recording-hint">
      正在听取你的描述，用你自己的话描述视频内容即可...
    </div>

    <textarea
      :value="text"
      :placeholder="placeholder"
      class="trans-textarea"
      rows="5"
      @input="$emit('update:text', $event.target.value)"
    ></textarea>

    <div class="footer">
      <span v-if="text" class="char-count">{{ text.length }} 字</span>
      <span class="hint">描述越详细，生成的标题越精准</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  text: { type: String, default: '' },
  isRecording: Boolean,
  hasVideo: Boolean,
})

defineEmits(['start-record', 'stop-record', 'update:text'])

const placeholder = '输入或口述视频的主要内容，例如：「这个视频讲的是如何用剪映自动生成字幕，适合新手，操作特别简单...」'
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

.btn-record {
  font-size: 12px;
  padding: 5px 12px;
  border-radius: 16px;
  border: 1.5px solid var(--primary);
  background: var(--primary-bg);
  color: var(--primary);
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: inherit;
  transition: all 0.15s;
}

.btn-record:hover {
  background: var(--primary);
  color: #fff;
}

.btn-record.recording {
  background: #dc2626;
  border-color: #dc2626;
  color: #fff;
  animation: pulse-border 1.5s infinite;
}

@keyframes pulse-border {
  0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
  50% { box-shadow: 0 0 0 4px rgba(220, 38, 38, 0); }
}

.pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fff;
  animation: pulse-dot 0.8s infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.btn-clear {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text-muted);
  cursor: pointer;
  font-family: inherit;
}

.btn-clear:hover { color: #dc2626; border-color: #dc2626; }

.recording-hint {
  font-size: 12px;
  color: var(--primary);
  padding: 6px 10px;
  background: var(--primary-bg);
  border-radius: 6px;
  text-align: center;
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
  min-height: 90px;
  box-sizing: border-box;
}

.trans-textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.trans-textarea::placeholder {
  color: var(--text-muted);
  font-size: 12px;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  font-size: 11px;
  color: var(--text-muted);
}

.hint {
  font-size: 11px;
  color: var(--text-muted);
}
</style>
