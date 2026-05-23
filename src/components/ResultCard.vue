<template>
  <div class="result-card" :class="{ 'has-error': result._error }">
    <!-- 平台头部 -->
    <div class="card-header">
      <span class="platform-title">{{ platform.icon }} {{ platform.name }}</span>
      <CopyButton
        :text="fullContent"
        :label="'📋 一键复制全部'"
      />
    </div>

    <!-- 错误提示 -->
    <div v-if="result._error" class="error-msg">
      ⚠️ {{ result._error }}
    </div>

    <!-- 标题列表 -->
    <div v-if="result.titles?.length" class="section">
      <div class="section-title">标题（{{ platform.titleLimit }}字以内）</div>
      <div v-for="(title, i) in result.titles" :key="i" class="title-row">
        <span class="title-index">{{ i + 1 }}</span>
        <span class="title-text">{{ title }}</span>
        <CopyButton :text="title" />
      </div>
    </div>

    <!-- 描述 -->
    <div v-if="result.description" class="section">
      <div class="section-title">描述</div>
      <div class="desc-text">{{ result.description }}</div>
      <CopyButton :text="result.description" style="margin-top: 6px" />
    </div>

    <!-- 标签 -->
    <div v-if="result.tags?.length" class="section">
      <div class="section-title">标签</div>
      <div class="tags-row">
        <span v-for="tag in result.tags" :key="tag" class="tag">
          {{ tag.startsWith('#') ? tag : '#' + tag }}
        </span>
      </div>
      <CopyButton
        :text="result.tags.map(t => t.startsWith('#') ? t : '#' + t).join(' ')"
        style="margin-top: 6px"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getPlatform } from '../config/platforms.js'
import CopyButton from './CopyButton.vue'

const props = defineProps({
  platformId: String,
  result: Object,
})

const platform = computed(() => getPlatform(props.platformId) || {})

const fullContent = computed(() => {
  const r = props.result
  if (!r) return ''
  const lines = []
  if (r.titles?.length) {
    lines.push(`【${platform.value.name}标题】`)
    r.titles.forEach((t, i) => lines.push(`${i + 1}. ${t}`))
    lines.push('')
  }
  if (r.description) {
    lines.push(`【描述】`)
    lines.push(r.description)
    lines.push('')
  }
  if (r.tags?.length) {
    lines.push(`【标签】`)
    lines.push(r.tags.map((t) => (t.startsWith('#') ? t : `#${t}`)).join(' '))
  }
  return lines.join('\n')
})
</script>

<style scoped>
.result-card {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--card-bg);
}

.result-card.has-error {
  border-color: #fca5a5;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.platform-title {
  font-weight: 700;
  font-size: 14px;
}

.error-msg {
  font-size: 12px;
  color: #dc2626;
  padding: 6px 8px;
  background: #fef2f2;
  border-radius: 6px;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.title-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 8px;
  background: var(--bg);
  border-radius: 6px;
}

.title-index {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  min-width: 16px;
}

.title-text {
  flex: 1;
  font-size: 13px;
  line-height: 1.4;
}

.desc-text {
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
  color: var(--text);
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--primary-bg);
  color: var(--primary);
}
</style>
