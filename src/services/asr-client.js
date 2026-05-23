/**
 * 本地语音识别 — Whisper 浏览器端运行
 */
import { pipeline, env } from '@xenova/transformers'

env.remoteHost = 'https://huggingface.co'
env.backends.onnx.wasm.wasmPaths =
  'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/'

const MODEL = 'Xenova/whisper-tiny'
let transcriber = null

async function getTranscriber() {
  if (transcriber) return transcriber
  transcriber = await pipeline('automatic-speech-recognition', MODEL, {
    quantized: true,
  })
  return transcriber
}

async function wavToFloat32(wavBlob) {
  const buffer = await wavBlob.arrayBuffer()
  const view = new DataView(buffer)
  const count = (buffer.byteLength - 44) / 2
  const samples = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    samples[i] = view.getInt16(44 + i * 2, true) / 32768
  }
  return samples
}

export async function transcribeAudio(audioWavBlob) {
  const audio = await wavToFloat32(audioWavBlob)
  const t = await getTranscriber()
  const result = await t(audio, { language: 'zh' })
  const text = result?.text || ''
  if (!text.trim()) throw new Error('未识别到语音内容')
  return text.trim()
}
