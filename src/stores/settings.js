/**
 * 设置存储 — API Keys, ASR配置, 历史记录
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'video_copy_settings'

export const useSettingsStore = defineStore('settings', () => {
  const deepseekApiKey = ref('')
  const deepseekModel = ref('deepseek-chat')
  const asrApiKey = ref('')
  const asrSecretKey = ref('')
  const history = ref([])
  const maxHistory = ref(20)
  const initialized = ref(false)

  async function load() {
    if (initialized.value) return
    try {
      const result = await chrome.storage.local.get(STORAGE_KEY)
      const data = result[STORAGE_KEY]
      if (data) {
        deepseekApiKey.value = data.deepseekApiKey || ''
        deepseekModel.value = data.deepseekModel || 'deepseek-chat'
        asrApiKey.value = data.asrApiKey || ''
        asrSecretKey.value = data.asrSecretKey || ''
        history.value = data.history || []
        maxHistory.value = data.maxHistory || 20
      }
    } catch {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const data = JSON.parse(raw)
          deepseekApiKey.value = data.deepseekApiKey || ''
          deepseekModel.value = data.deepseekModel || 'deepseek-chat'
          asrApiKey.value = data.asrApiKey || ''
          asrSecretKey.value = data.asrSecretKey || ''
          history.value = data.history || []
          maxHistory.value = data.maxHistory || 20
        }
      } catch {}
    }
    initialized.value = true
  }

  async function save() {
    const data = {
      deepseekApiKey: deepseekApiKey.value,
      deepseekModel: deepseekModel.value,
      asrApiKey: asrApiKey.value,
      asrSecretKey: asrSecretKey.value,
      history: history.value,
      maxHistory: maxHistory.value,
    }
    try {
      await chrome.storage.local.set({ [STORAGE_KEY]: data })
    } catch {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
    }
  }

  async function setApiKey(key) { deepseekApiKey.value = key; await save() }
  async function setModel(model) { deepseekModel.value = model; await save() }
  async function setAsrConfig(apiKey, secretKey) { asrApiKey.value = apiKey; asrSecretKey.value = secretKey; await save() }

  async function addHistory(entry) {
    history.value.unshift({ id: Date.now(), timestamp: new Date().toISOString(), ...entry })
    if (history.value.length > maxHistory.value) history.value = history.value.slice(0, maxHistory.value)
    await save()
  }

  async function removeHistory(id) { history.value = history.value.filter((h) => h.id !== id); await save() }
  async function clearHistory() { history.value = []; await save() }

  function exportData() {
    return {
      deepseekApiKey: deepseekApiKey.value,
      deepseekModel: deepseekModel.value,
      asrApiKey: asrApiKey.value,
      asrSecretKey: asrSecretKey.value,
      history: history.value,
      maxHistory: maxHistory.value,
      exportTime: new Date().toISOString(),
      version: '1.0.0',
    }
  }

  async function importData(data) {
    if (data.deepseekApiKey) deepseekApiKey.value = data.deepseekApiKey
    if (data.deepseekModel) deepseekModel.value = data.deepseekModel
    if (data.asrApiKey) asrApiKey.value = data.asrApiKey
    if (data.asrSecretKey) asrSecretKey.value = data.asrSecretKey
    if (data.history) history.value = data.history
    if (data.maxHistory) maxHistory.value = data.maxHistory
    await save()
  }

  return {
    deepseekApiKey, deepseekModel, asrApiKey, asrSecretKey,
    history, maxHistory, initialized,
    load, save, setApiKey, setModel, setAsrConfig,
    addHistory, removeHistory, clearHistory,
    exportData, importData,
  }
})
