/**
 * 设置状态
 * 管理 API Key、模型配置、历史记录
 * 持久化到 chrome.storage.local
 */
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'video_copy_settings'

export const useSettingsStore = defineStore('settings', () => {
  const deepseekApiKey = ref('')
  const deepseekModel = ref('deepseek-chat')
  const history = ref([])
  const maxHistory = ref(20)
  const initialized = ref(false)

  /** 从 chrome.storage 加载设置 */
  async function load() {
    if (initialized.value) return

    try {
      const result = await chrome.storage.local.get(STORAGE_KEY)
      const data = result[STORAGE_KEY]
      if (data) {
        deepseekApiKey.value = data.deepseekApiKey || ''
        deepseekModel.value = data.deepseekModel || 'deepseek-chat'
        history.value = data.history || []
        maxHistory.value = data.maxHistory || 20
      }
    } catch (e) {
      // Fallback: 无 chrome API 环境（开发模式）
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const data = JSON.parse(raw)
          deepseekApiKey.value = data.deepseekApiKey || ''
          deepseekModel.value = data.deepseekModel || 'deepseek-chat'
          history.value = data.history || []
          maxHistory.value = data.maxHistory || 20
        }
      } catch {}
    }

    initialized.value = true
  }

  /** 持久化设置 */
  async function save() {
    const data = {
      deepseekApiKey: deepseekApiKey.value,
      deepseekModel: deepseekModel.value,
      history: history.value,
      maxHistory: maxHistory.value,
    }

    try {
      await chrome.storage.local.set({ [STORAGE_KEY]: data })
    } catch {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch {}
    }
  }

  /** 设置 API Key */
  async function setApiKey(key) {
    deepseekApiKey.value = key
    await save()
  }

  /** 设置模型 */
  async function setModel(model) {
    deepseekModel.value = model
    await save()
  }

  /** 添加历史记录 */
  async function addHistory(entry) {
    history.value.unshift({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...entry,
    })

    // 限制数量
    if (history.value.length > maxHistory.value) {
      history.value = history.value.slice(0, maxHistory.value)
    }

    await save()
  }

  /** 删除单条历史 */
  async function removeHistory(id) {
    history.value = history.value.filter((h) => h.id !== id)
    await save()
  }

  /** 清空历史 */
  async function clearHistory() {
    history.value = []
    await save()
  }

  /** 导出所有数据 */
  function exportData() {
    return {
      deepseekApiKey: deepseekApiKey.value,
      deepseekModel: deepseekModel.value,
      history: history.value,
      maxHistory: maxHistory.value,
      exportTime: new Date().toISOString(),
      version: '1.0.0',
    }
  }

  /** 导入数据 */
  async function importData(data) {
    if (data.deepseekApiKey) deepseekApiKey.value = data.deepseekApiKey
    if (data.deepseekModel) deepseekModel.value = data.deepseekModel
    if (data.history) history.value = data.history
    if (data.maxHistory) maxHistory.value = data.maxHistory
    await save()
  }

  return {
    deepseekApiKey,
    deepseekModel,
    history,
    maxHistory,
    initialized,
    load,
    save,
    setApiKey,
    setModel,
    addHistory,
    removeHistory,
    clearHistory,
    exportData,
    importData,
  }
})
