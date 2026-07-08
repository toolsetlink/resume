// 图片代理 API - 解决跨域与防盗链问题
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = (query.url as string || '').trim()

  // 校验 URL
  if (!url) {
    setResponseStatus(event, 400)
    return { error: '缺少 url 参数' }
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    setResponseStatus(event, 400)
    return { error: 'url 参数格式不正确' }
  }

  // 仅允许 http/https 协议
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    setResponseStatus(event, 400)
    return { error: '仅支持 http/https 协议' }
  }

  try {
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'image/*,*/*;q=0.8',
        Referer: `${parsedUrl.protocol}//${parsedUrl.host}/`,
      },
    })

    if (!response.ok) {
      setResponseStatus(event, response.status)
      return { error: `上游图片请求失败 (${response.status})` }
    }

    const contentType =
      response.headers.get('Content-Type') || 'image/*'
    const buffer = await response.arrayBuffer()

    // 设置响应头
    setHeader(event, 'Content-Type', contentType)
    setHeader(event, 'Cache-Control', 'public, max-age=86400')
    setHeader(event, 'Access-Control-Allow-Origin', '*')
    setHeader(event, 'Access-Control-Allow-Methods', 'GET, OPTIONS')
    setHeader(event, 'Access-Control-Allow-Headers', '*')

    return buffer
  } catch (error) {
    setResponseStatus(event, 500)
    return {
      error:
        error instanceof Error ? error.message : '图片代理请求失败',
    }
  }
})
