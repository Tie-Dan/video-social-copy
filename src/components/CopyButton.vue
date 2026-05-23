<template>
  <button
    class="copy-btn"
    :class="{ copied }"
    @click="handleCopy"
    :title="copied ? '已复制' : '点击复制'"
  >
    <span v-if="copied">✓ 已复制</span>
    <span v-else>{{ label || '📋 复制' }}</span>
  </button>
</template>

<script setup>
import { ref } from 'vue'
import { copyToClipboard } from '../services/clipboard.js'

const props = defineProps({
  text: { type: String, required: true },
  label: { type: String, default: '' },
})

const copied = ref(false)
let timer = null

async function handleCopy() {
  const ok = await copyToClipboard(props.text)
  if (ok) {
    copied.value = true
    clearTimeout(timer)
    timer = setTimeout(() => {
      copied.value = false
    }, 1500)
  }
}
</script>

<style scoped>
.copy-btn {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
  font-family: inherit;
}

.copy-btn:hover {
  border-color: var(--primary);
  background: var(--primary-bg);
}

.copy-btn.copied {
  border-color: #22c55e;
  color: #22c55e;
  background: #f0fdf4;
}
</style>
