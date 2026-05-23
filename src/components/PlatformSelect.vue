<template>
  <div class="platform-select">
    <div class="section-label">目标平台</div>
    <div class="platform-grid">
      <label
        v-for="p in platforms"
        :key="p.id"
        class="platform-chip"
        :class="{ active: selected.includes(p.id) }"
      >
        <input
          type="checkbox"
          :checked="selected.includes(p.id)"
          @change="toggle(p.id)"
          class="chip-input"
        />
        <span class="chip-icon">{{ p.icon }}</span>
        <span class="chip-name">{{ p.name }}</span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { platforms } from '../config/platforms.js'

const props = defineProps({
  selected: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:selected'])

function toggle(id) {
  const newSelected = props.selected.includes(id)
    ? props.selected.filter((s) => s !== id)
    : [...props.selected, id]
  emit('update:selected', newSelected)
}
</script>

<style scoped>
.platform-select {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.platform-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.platform-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s;
  user-select: none;
  background: var(--bg);
}

.platform-chip:hover {
  border-color: var(--primary);
}

.platform-chip.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.chip-input { display: none; }
.chip-icon { font-size: 14px; }
.chip-name { font-weight: 500; }
</style>
