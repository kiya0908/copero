type AssetFetcher = {
  fetch(request: Request): Promise<Response>
}

type Env = {
  ASSETS: AssetFetcher
}

const GAME_PATHS = new Set(['/game', '/en/game', '/zh-cn/game'])

function legacySpanishRedirect(request: Request): Response | null {
  const url = new URL(request.url)
  if (url.pathname !== '/es' && !url.pathname.startsWith('/es/')) return null

  const stripped = url.pathname.slice(3)
  url.pathname = stripped || '/'
  return Response.redirect(url.toString(), 301)
}

function isGamePath(pathname: string): boolean {
  const normalized = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname
  return GAME_PATHS.has(normalized)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const redirect = legacySpanishRedirect(request)
    if (redirect) return redirect

    const response = await env.ASSETS.fetch(request)
    if (!isGamePath(new URL(request.url).pathname)) return response

    const headers = new Headers(response.headers)
    headers.set('X-Robots-Tag', 'noindex, nofollow')

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  },
}
