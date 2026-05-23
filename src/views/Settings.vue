<template>
  <div class="settings">
    <header class="settings-header">
      <h1>⚙️ 设置</h1>
      <span class="version">v1.0.0</span>
    </header>

    <!-- API 配置 -->
    <section class="settings-section">
      <h2>DeepSeek API 配置</h2>
      <p class="desc">用于生成各平台文案，<a href="https://platform.deepseek.com/api_keys" target="_blank">获取 API Key</a></p>
      <div class="form-group">
        <label>API Key</label>
        <div class="input-row">
          <input
            :type="showKey ? 'text' : 'password'"
            v-model="apiKeyInput"
            placeholder="sk-..."
            class="input"
          />
          <button class="toggle-btn" @click="showKey = !showKey">
            {{ showKey ? '🙈' : '👁️' }}
          </button>
        </div>
      </div>
      <div class="form-group">
        <label>模型</label>
        <select v-model="modelInput" class="input">
          <option value="deepseek-chat">deepseek-chat</option>
        </select>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" @click="saveApiConfig" :disabled="saving">
          {{ saving ? '保存中...' : '保存' }}
        </button>
        <button class="btn btn-secondary" @click="testConnection" :disabled="testing">
          {{ testing ? '测试中...' : '测试连接' }}
        </button>
      </div>
      <div v-if="saveMsg" class="test-result" :class="saveMsg.ok ? 'ok' : 'fail'">
        {{ saveMsg.msg }}
      </div>
      <div v-if="testResult" class="test-result" :class="testResult.ok ? 'ok' : 'fail'">
        {{ testResult.msg }}
      </div>
    </section>

    <!-- ASR 配置 -->
    <section class="settings-section">
      <h2>语音识别配置（讯飞）</h2>
      <p class="desc">
        上传视频后自动提取语音转文字。
        <a href="https://www.xfyun.cn/" target="_blank">点此注册讯飞</a> → 控制台 → 语音听写 → 创建应用，免费 500次/天
      </p>
      <div class="form-group">
        <label>App ID</label>
        <input v-model="asrAppIdInput" placeholder="讯飞控制台获取" class="input" />
      </div>
      <div class="form-group">
        <label>API Key</label>
        <input
          :type="showAsrKey ? 'text' : 'password'"
          v-model="asrApiKeyInput"
          placeholder="讯飞控制台获取"
          class="input"
        />
      </div>
      <button class="btn btn-primary" @click="saveAsrConfig" :disabled="savingAsr">
        {{ savingAsr ? '保存中...' : '保存语音识别配置' }}
      </button>
      <div v-if="asrMsg" class="test-result" :class="asrMsg.ok ? 'ok' : 'fail'">
        {{ asrMsg.msg }}
      </div>
    </section>

    <!-- 历史记录 -->
    <section class="settings-section">
      <h2>历史记录</h2>
      <div v-if="store.history.length === 0" class="empty">暂无记录</div>
      <div v-else class="history-list">
        <div v-for="item in store.history" :key="item.id" class="history-item">
          <div class="history-meta">
            <span class="history-time">{{ formatTime(item.timestamp) }}</span>
            <span class="history-platforms">{{ item.platforms?.join(', ') }}</span>
          </div>
          <button class="btn-delete" @click="store.removeHistory(item.id)">删除</button>
        </div>
      </div>
      <button
        v-if="store.history.length > 0"
        class="btn btn-secondary"
        style="margin-top: 8px;"
        @click="store.clearHistory()"
      >
        清空所有历史
      </button>
    </section>

    <!-- 数据管理 -->
    <section class="settings-section">
      <h2>数据管理</h2>
      <div class="form-actions">
        <button class="btn btn-secondary" @click="exportData">导出数据</button>
        <label class="btn btn-secondary" style="cursor: pointer;">
          导入数据
          <input type="file" accept=".json" hidden @change="importData" />
        </label>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '../stores/settings.js'

const store = useSettingsStore()

const apiKeyInput = ref('')
const modelInput = ref('deepseek-chat')
const asrAppIdInput = ref('')
const asrApiKeyInput = ref('')
const showKey = ref(false)
const showAsrKey = ref(false)
const saving = ref(false)
const savingAsr = ref(false)
const testing = ref(false)
const testResult = ref(null)
const saveMsg = ref(null)
const asrMsg = ref(null)

onMounted(async () => {
  await store.load()
  apiKeyInput.value = store.deepseekApiKey
  modelInput.value = store.deepseekModel
  asrAppIdInput.value = store.asrAppId
  asrApiKeyInput.value = store.asrApiKey
})

async function saveApiConfig() {
  saving.value = true
  saveMsg.value = null
  testResult.value = null
  try {
    await store.setApiKey(apiKeyInput.value)
    await store.setModel(modelInput.value)
    saveMsg.value = { ok: true, msg: '保存成功 ✓' }
    setTimeout(() => { saveMsg.value = null }, 2500)
  } catch (e) {
    saveMsg.value = { ok: false, msg: `保存失败: ${e.message}` }
  } finally {
    saving.value = false
  }
}

async function saveAsrConfig() {
  savingAsr.value = true; asrMsg.value = null
  try {
    await store.setAsrConfig(asrAppIdInput.value, asrApiKeyInput.value)
    asrMsg.value = { ok: true, msg: '保存成功 ✓' }
    setTimeout(() => { asrMsg.value = null }, 2500)
  } catch (e) {
    asrMsg.value = { ok: false, msg: `保存失败: ${e.message}` }
  } finally { savingAsr.value = false }
}

async function testConnection() {
  if (!apiKeyInput.value) {
    testResult.value = { ok: false, msg: '请先输入 API Key' }
    return
  }

  testing.value = true
  testResult.value = null

  try {
    const res = await fetch('https://api.deepseek.com/v1/models', {
      headers: { Authorization: `Bearer ${apiKeyInput.value}` },
    })

    if (res.ok) {
      const data = await res.json()
      testResult.value = {
        ok: true,
        msg: `连接成功！可用模型: ${data.data?.length || 0} 个`,
      }
    } else {
      const err = await res.json()
      testResult.value = {
        ok: false,
        msg: `连接失败: ${err.error?.message || res.status}`,
      }
    }
  } catch (e) {
    testResult.value = { ok: false, msg: `连接失败: ${e.message}` }
  } finally {
    testing.value = false
  }
}

function exportData() {
  const data = store.exportData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `video-copy-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function importData(e) {
  const file = e.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async () => {
    try {
      const data = JSON.parse(reader.result)
      await store.importData(data)
      apiKeyInput.value = store.deepseekApiKey
      modelInput.value = store.deepseekModel
      alert('导入成功')
    } catch (err) {
      alert('导入失败: 文件格式不正确')
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}

function formatTime(ts) {
  const d = new Date(ts)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
</script>

<style scoped>
.settings {
  max-width: 560px;
  margin: 0 auto;
  padding: 24px 20px;
  font-size: 14px;
  color: var(--text);
  background: var(--bg);
  min-height: 100vh;
}

.settings-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 24px;
}

.settings-header h1 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.version {
  font-size: 12px;
  color: var(--text-muted);
}

.settings-section {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
}

.settings-section h2 {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 6px;
}

.desc {
  margin: 0 0 12px;
  font-size: 12px;
  color: var(--text-muted);
}

.desc a {
  color: var(--primary);
}

.form-group {
  margin-bottom: 10px;
}

.form-group label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--text-muted);
}

.input-row {
  display: flex;
  gap: 6px;
}

.input {
  flex: 1;
  padding: 8px 10px;
  border: 1.5px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  background: var(--bg);
  color: var(--text);
  box-sizing: border-box;
}

.input:focus {
  outline: none;
  border-color: var(--primary);
}

.toggle-btn {
  padding: 8px 10px;
  border: 1.5px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  cursor: pointer;
  font-size: 14px;
}

select.input {
  -webkit-appearance: none;
  appearance: none;
}

.form-actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--primary);
  color: #fff;
}

.btn-secondary {
  background: var(--bg);
  color: var(--text);
  border: 1.5px solid var(--border);
}

.test-result {
  margin-top: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 12px;
}

.test-result.ok {
  background: #f0fdf4;
  color: #16a34a;
}

.test-result.fail {
  background: #fef2f2;
  color: #dc2626;
}

.empty {
  font-size: 13px;
  color: var(--text-muted);
  padding: 12px 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-radius: 6px;
  background: var(--bg);
}

.history-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.history-time {
  font-size: 12px;
  color: var(--text-muted);
}

.history-platforms {
  font-size: 12px;
  color: var(--text);
}

.btn-delete {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
}

.btn-delete:hover {
  color: #dc2626;
}
</style>
