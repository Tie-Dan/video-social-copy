/**
 * Service Worker
 * 处理扩展生命周期和离屏文档
 */

// 扩展安装 / 更新
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      video_copy_settings: {
        deepseekApiKey: '',
        deepseekModel: 'deepseek-chat',
        history: [],
        maxHistory: 20,
      },
    })
  }
})

// 点击扩展图标 → 打开 popup（默认行为，无须额外处理）

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_API_KEY') {
    chrome.storage.local.get('video_copy_settings', (result) => {
      const settings = result.video_copy_settings || {}
      sendResponse({ apiKey: settings.deepseekApiKey || '' })
    })
    return true // 异步响应
  }

  if (message.type === 'SAVE_HISTORY') {
    chrome.storage.local.get('video_copy_settings', (result) => {
      const settings = result.video_copy_settings || {}
      const history = settings.history || []
      history.unshift({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...message.data,
      })
      if (history.length > (settings.maxHistory || 20)) {
        history.splice(settings.maxHistory || 20)
      }
      settings.history = history
      chrome.storage.local.set({ video_copy_settings: settings })
      sendResponse({ ok: true })
    })
    return true
  }
})
