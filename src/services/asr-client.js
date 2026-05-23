/**
 * 讯飞语音识别客户端
 *
 * 开通: https://www.xfyun.cn/ → 控制台 → 语音听写 → 创建应用
 *   免费 500次/天，获取 APPID、APIKey、APISecret
 */

// 计算 MD5，无外部依赖
async function md5(str) {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hash = await crypto.subtle.digest('SHA-256', data)
  // 讯飞实际使用 MD5，但 Web Crypto 不支持 MD5
  // 用简单实现
  return _md5(str)
}

// 简单 MD5 实现 (RFC 1321)
function _md5(string) {
  function md5cycle(x, k) {
    let a = x[0], b = x[1], c = x[2], d = x[3]
    a = ff(a, b, c, d, k[0], 7, -680876936)
    d = ff(d, a, b, c, k[1], 12, -389564586)
    c = ff(c, d, a, b, k[2], 17, 606105819)
    b = ff(b, c, d, a, k[3], 22, -1044525330)
    a = ff(a, b, c, d, k[4], 7, -176418897)
    d = ff(d, a, b, c, k[5], 12, 1200080426)
    c = ff(c, d, a, b, k[6], 17, -1473231341)
    b = ff(b, c, d, a, k[7], 22, -45705983)
    a = ff(a, b, c, d, k[8], 7, 1770035416)
    d = ff(d, a, b, c, k[9], 12, -1958414417)
    c = ff(c, d, a, b, k[10], 17, -42063)
    b = ff(b, c, d, a, k[11], 22, -1990404162)
    a = ff(a, b, c, d, k[12], 7, 1804603682)
    d = ff(d, a, b, c, k[13], 12, -40341101)
    c = ff(c, d, a, b, k[14], 17, -1502002290)
    b = ff(b, c, d, a, k[15], 22, 1236535329)
    a = gg(a, b, c, d, k[1], 5, -165796510)
    d = gg(d, a, b, c, k[6], 9, -1069501632)
    c = gg(c, d, a, b, k[11], 14, 643717713)
    b = gg(b, c, d, a, k[0], 20, -373897302)
    a = gg(a, b, c, d, k[5], 5, -701558691)
    d = gg(d, a, b, c, k[10], 9, 38016083)
    c = gg(c, d, a, b, k[15], 14, -660478335)
    b = gg(b, c, d, a, k[4], 20, -405537848)
    a = gg(a, b, c, d, k[9], 5, 568446438)
    d = gg(d, a, b, c, k[14], 9, -1019803690)
    c = gg(c, d, a, b, k[3], 14, -187363961)
    b = gg(b, c, d, a, k[8], 20, 1163531501)
    a = gg(a, b, c, d, k[13], 5, -1444681467)
    d = gg(d, a, b, c, k[2], 9, -51403784)
    c = gg(c, d, a, b, k[7], 14, 1735328473)
    b = gg(b, c, d, a, k[12], 20, -1926607734)
    a = hh(a, b, c, d, k[5], 4, -378558)
    d = hh(d, a, b, c, k[8], 11, -2022574463)
    c = hh(c, d, a, b, k[11], 16, 1839030562)
    b = hh(b, c, d, a, k[14], 23, -35309556)
    a = hh(a, b, c, d, k[1], 4, -1530992060)
    d = hh(d, a, b, c, k[4], 11, 1272893353)
    c = hh(c, d, a, b, k[7], 16, -155497632)
    b = hh(b, c, d, a, k[10], 23, -1094730640)
    a = hh(a, b, c, d, k[13], 4, 681279174)
    d = hh(d, a, b, c, k[0], 11, -358537222)
    c = hh(c, d, a, b, k[3], 16, -722521979)
    b = hh(b, c, d, a, k[6], 23, 76029189)
    a = hh(a, b, c, d, k[9], 4, -640364487)
    d = hh(d, a, b, c, k[12], 11, -421815835)
    c = hh(c, d, a, b, k[15], 16, 530742520)
    b = hh(b, c, d, a, k[2], 23, -995338651)
    a = ii(a, b, c, d, k[0], 6, -198630844)
    d = ii(d, a, b, c, k[7], 10, 1126891415)
    c = ii(c, d, a, b, k[14], 15, -1416354905)
    b = ii(b, c, d, a, k[5], 21, -57434055)
    a = ii(a, b, c, d, k[12], 6, 1700485571)
    d = ii(d, a, b, c, k[3], 10, -1894986606)
    c = ii(c, d, a, b, k[10], 15, -1051523)
    b = ii(b, c, d, a, k[1], 21, -2054922799)
    a = ii(a, b, c, d, k[8], 6, 1873313359)
    d = ii(d, a, b, c, k[15], 10, -30611744)
    c = ii(c, d, a, b, k[6], 15, -1560198380)
    b = ii(b, c, d, a, k[13], 21, 1309151649)
    a = ii(a, b, c, d, k[4], 6, -145523070)
    d = ii(d, a, b, c, k[11], 10, -1120210379)
    c = ii(c, d, a, b, k[2], 15, 718787259)
    b = ii(b, c, d, a, k[9], 21, -343485551)
    x[0] = (a + x[0]) | 0
    x[1] = (b + x[1]) | 0
    x[2] = (c + x[2]) | 0
    x[3] = (d + x[3]) | 0
  }

  function ff(a, b, c, d, x, s, t) {
    const n = a + (b & c | ~b & d) + (x >>> 0) + t
    return ((n << s) | (n >>> (32 - s))) + b
  }
  function gg(a, b, c, d, x, s, t) {
    const n = a + (b & d | c & ~d) + (x >>> 0) + t
    return ((n << s) | (n >>> (32 - s))) + b
  }
  function hh(a, b, c, d, x, s, t) {
    const n = a + (b ^ c ^ d) + (x >>> 0) + t
    return ((n << s) | (n >>> (32 - s))) + b
  }
  function ii(a, b, c, d, x, s, t) {
    const n = a + (c ^ (b | ~d)) + (x >>> 0) + t
    return ((n << s) | (n >>> (32 - s))) + b
  }

  const msg = unescape(encodeURIComponent(string))
  const len = msg.length
  const words = []
  for (let i = 0; i < len; i += 1) {
    words[i >> 2] |= (msg.charCodeAt(i) & 0xff) << ((i % 4) << 3)
  }
  words[len >> 2] |= 0x80 << ((len % 4) << 3)
  words[(((len + 8) >> 6) << 4) + 14] = len * 8

  let lo = 0, hi = 0
  // process in blocks of 16
  const x = [1732584193, -271733879, -1732584194, 271733878]
  for (let i = 0; i < words.length; i += 16) {
    md5cycle(x, words.slice(i, i + 16))
  }

  const hex = '0123456789abcdef'
  let result = ''
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      result += hex.charAt((x[i] >> (j * 8 + 4)) & 0x0f) + hex.charAt((x[i] >> (j * 8)) & 0x0f)
    }
  }
  return result
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

const ASR_URL = 'https://api.xfyun.cn/v1/service/v1/iat'

export async function transcribeAudio(audioWavBlob, config) {
  const { appId, apiKey } = config

  if (!appId || !apiKey) {
    throw new Error('请先在设置中配置讯飞 App ID 和 API Key')
  }

  const audioBuffer = await audioWavBlob.arrayBuffer()
  const audioBase64 = arrayBufferToBase64(audioBuffer)

  const curTime = String(Math.floor(Date.now() / 1000))
  const param = btoa(JSON.stringify({
    engine_type: 'sms16k',
    aue: 'raw',
    language: 'zh_cn',
  }))
  const checksum = _md5(apiKey + curTime + param)

  const body = new URLSearchParams()
  body.append('audio', audioBase64)

  const resp = await fetch(ASR_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Appid': appId,
      'X-CurTime': curTime,
      'X-Param': param,
      'X-CheckSum': checksum,
    },
    body: body.toString(),
  })

  const result = await resp.json()

  if (result.code !== '0') {
    throw new Error(result.desc || result.message || `讯飞错误: ${result.code}`)
  }

  const text = result?.data?.result?.reduce((acc, item) => acc + (item.w || ''), '') || ''

  if (!text.trim()) {
    throw new Error('未识别到语音内容')
  }

  return text.trim()
}
