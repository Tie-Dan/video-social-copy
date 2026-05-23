/**
 * 本地语音识别 — 使用 Whisper 模型在浏览器内运行
 *
 * 模型首次加载从 hf-mirror.com 下载（约 40MB），之后缓存到浏览器中
 * 完全离线可用，不依赖任何外部 API
 */

import { pipeline, env } from '@xenova/transformers'

// HF 国内镜像
env.remoteHost = 'https://hf-mirror.com'
env.allowLocalModels = false
// ONNX WASM 从 jsdelivr 加载（国内可访问）
env.backends.onnx.wasm.wasmPaths =
  'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/'
// Whisper 模型（tiny ~39MB，首次下载后 IndexedDB 缓存）
const MODEL = 'Xenova/whisper-tiny'

let transcriber = null

async function getPipeline() {
  if (transcriber) return transcriber

  const p = await pipeline('automatic-speech-recognition', MODEL, {
    // 中文 + 返回时间戳
    language: 'zh',
    task: 'transcribe',
    chunk_length_s: 30,
    stride_length_s: 5,
  })

  transcriber = p
  return p
}

/**
 * 将 WAV Blob 转为 Float32Array（16kHz 单声道）
 * WAV 是 44 字节头 + PCM 数据
 */
async function wavToFloat32(wavBlob) {
  const arrayBuffer = await wavBlob.arrayBuffer()
  const view = new DataView(arrayBuffer)

  // 跳过 WAV 头
  const pcmOffset = 44
  const pcmLength = (arrayBuffer.byteLength - pcmOffset) / 2 // 16-bit samples
  const samples = new Float32Array(pcmLength)

  for (let i = 0; i < pcmLength; i++) {
    const int16 = view.getInt16(pcmOffset + i * 2, true)
    samples[i] = int16 / 32768
  }

  return samples
}

/**
 * @param {Blob} audioWavBlob
 * @param {Object} _config - 本地模式无需配置，保留接口兼容
 * @returns {Promise<string>}
 */
export async function transcribeAudio(audioWavBlob, _config) {
  const audioData = await wavToFloat32(audioWavBlob)

  const transcriber = await getPipeline()

  const result = await transcriber(audioData, {
    // 回调显示进度（可选）
    callback_function: null,
  })

  const text = result?.text || ''

  if (!text) {
    throw new Error('未识别到语音内容，请确认：\n1. 视频包含清晰人声\n2. 视频时长不超过 60 秒')
  }

  return text.trim()
}
