<template>
  <div
    class="video-upload"
    :class="{ 'has-video': !!thumbnail, dragging }"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
  >
    <!-- 无视频：上传区 -->
    <div v-if="!thumbnail" class="upload-zone" @click="openFilePicker">
      <div class="upload-icon">📁</div>
      <div class="upload-text">拖拽视频到此处</div>
      <div class="upload-hint">或点击上传 · mp4 / mov / webm · 最大 500MB</div>
    </div>

    <!-- 有视频：预览区 -->
    <div v-else class="preview-zone">
      <img :src="thumbnail" class="thumb" alt="视频缩略图" />
      <div class="overlay">
        <button class="play-btn" @click.stop="$emit('play')">▶</button>
        <span v-if="videoInfo" class="duration">{{ videoInfo.durationFormatted }}</span>
      </div>
      <button class="remove-btn" @click.stop="$emit('remove')" title="移除视频">✕</button>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="video/mp4,video/mov,video/webm"
      class="hidden-input"
      @change="onFileSelected"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  thumbnail: { type: String, default: '' },
  videoInfo: { type: Object, default: null },
})

const emit = defineEmits(['upload', 'remove', 'play'])

const fileInput = ref(null)
const dragging = ref(false)

function openFilePicker() {
  fileInput.value?.click()
}

function onFileSelected(e) {
  const file = e.target.files?.[0]
  if (file) {
    if (file.size > 500 * 1024 * 1024) {
      alert('文件大小不能超过 500MB')
      return
    }
    emit('upload', file)
  }
  // 重置以支持重复选同一文件
  e.target.value = ''
}

function onDragOver() {
  dragging.value = true
}

function onDragLeave() {
  dragging.value = false
}

function onDrop(e) {
  dragging.value = false
  const file = e.dataTransfer.files?.[0]
  if (file && file.type.startsWith('video/')) {
    emit('upload', file)
  }
}
</script>

<style scoped>
.video-upload {
  border: 2px dashed var(--border);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.2s, background-color 0.2s;
  cursor: pointer;
}

.video-upload.dragging {
  border-color: var(--primary);
  background-color: var(--primary-bg);
}

.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  gap: 8px;
  min-height: 140px;
}

.upload-icon { font-size: 36px; }
.upload-text { font-size: 14px; font-weight: 600; color: var(--text); }
.upload-hint { font-size: 11px; color: var(--text-muted); }

.preview-zone {
  position: relative;
  aspect-ratio: 16 / 9;
  max-height: 200px;
}

.thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.preview-zone:hover .overlay { opacity: 1; }

.play-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: var(--text);
}

.duration {
  background: rgba(0,0,0,0.7);
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.remove-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0,0,0,0.6);
  color: #fff;
  border: none;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hidden-input { display: none; }
</style>
