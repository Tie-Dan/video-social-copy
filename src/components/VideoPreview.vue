<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">视频预览</span>
          <button class="modal-close" @click="close">✕</button>
        </div>
        <video
          ref="videoEl"
          :src="videoUrl"
          class="preview-video"
          controls
          autoplay
        ></video>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  videoUrl: String,
})

const emit = defineEmits(['close'])

const videoEl = ref(null)

function close() {
  if (videoEl.value) {
    videoEl.value.pause()
  }
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: #1a1a1a;
  border-radius: 12px;
  width: 90vw;
  max-width: 720px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  color: #fff;
}

.modal-title { font-size: 14px; font-weight: 600; }

.modal-close {
  background: none;
  border: none;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
}

.preview-video {
  width: 100%;
  max-height: 70vh;
  display: block;
}
</style>
