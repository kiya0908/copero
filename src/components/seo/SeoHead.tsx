import { useEffect } from 'react'
import { localeMeta, SUPPORTED_LOCALES } from '../../i18n/resources'
import { localePath, useI18n } from '../../i18n/config'

const SITE_URL = 'https://copero.top'

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }
  for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value)
}

function upsertLink(key: string, rel: string, href: string, hreflang?: string) {
  let link = document.head.querySelector<HTMLLinkElement>(`link[data-seo-key="${key}"]`)
  if (!link) {
    link = document.createElement('link')
    link.dataset.seoKey = key
    document.head.appendChild(link)
  }
  link.rel = rel
  link.href = href
  if (hreflang) link.hreflang = hreflang
}

export function SeoHead({ page }: { page: 'home' | 'game' }) {
  const { locale, t } = useI18n()
  useEffect(() => {
    const title = t(`seo.${page}.title`)
    const description = t(`seo.${page}.description`)
    const pathname = localePath(locale, page)
    const canonical = `${SITE_URL}${pathname}`
    document.title = title
    document.documentElement.lang = localeMeta[locale].htmlLang
    upsertMeta('meta[name="description"]', { name: 'description', content: description })
    upsertMeta('meta[name="robots"]', { name: 'robots', content: page === 'home' ? 'index, follow' : 'noindex, follow' })
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: 'Copero' })
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: localeMeta[locale].og })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonical })
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary' })
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
    upsertLink('canonical', 'canonical', canonical)
    for (const target of SUPPORTED_LOCALES) {
      upsertLink(`alt-${target}`, 'alternate', `${SITE_URL}${localePath(target, page)}`, localeMeta[target].htmlLang)
    }
    upsertLink('alt-default', 'alternate', `${SITE_URL}${localePath('es', page)}`, 'x-default')

    let script = document.head.querySelector<HTMLScriptElement>('script[data-copero-structured-data]')
    if (!script) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.dataset.coperoStructuredData = 'true'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': page === 'home' ? 'WebApplication' : 'VideoGame',
      name: 'Copero',
      url: canonical,
      inLanguage: localeMeta[locale].htmlLang,
      applicationCategory: 'GameApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      isAccessibleForFree: true,
      description,
    })
  }, [locale, page, t])
  return null
}
