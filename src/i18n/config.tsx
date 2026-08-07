import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import enCommon from './locales/en/common.json'
import enHome from './locales/en/home.json'
import esCommon from './locales/es/common.json'
import esHome from './locales/es/home.json'
import zhCommon from './locales/zh-cn/common.json'
import zhHome from './locales/zh-cn/home.json'

export const SUPPORTED_LOCALES = ['es', 'en', 'zh-cn'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
export type TranslationNamespace = 'common' | 'home'

export const DEFAULT_LOCALE: Locale = 'es'
export const LOCALE_PREFERENCE_KEY = 'copero:locale'

export const LOCALE_META: Record<Locale, { label: string; short: string; htmlLang: string; hrefLang: string }> = {
  es: { label: 'Español', short: 'ES', htmlLang: 'es', hrefLang: 'es' },
  en: { label: 'English', short: 'EN', htmlLang: 'en', hrefLang: 'en' },
  'zh-cn': { label: '中文', short: '中文', htmlLang: 'zh-CN', hrefLang: 'zh-CN' },
}

type Dictionary = Record<string, unknown>
type Resources = Record<Locale, Record<TranslationNamespace, Dictionary>>

const resources: Resources = {
  es: { common: esCommon, home: esHome },
  en: { common: enCommon, home: enHome },
  'zh-cn': { common: zhCommon, home: zhHome },
}

export function isSupportedLocale(value: string | undefined | null): value is Locale {
  return Boolean(value && SUPPORTED_LOCALES.includes(value as Locale))
}

export function localeFromPathname(pathname: string): Locale | null {
  const firstSegment = pathname.split('/').filter(Boolean)[0]
  return isSupportedLocale(firstSegment) ? firstSegment : null
}

export function localizePath(pathname: string, locale: Locale): string {
  const segments = pathname.split('/').filter(Boolean)
  if (isSupportedLocale(segments[0])) segments.shift()
  const suffix = segments.length ? `/${segments.join('/')}` : '/'
  return `/${locale}${suffix}`
}

function readPath(dictionary: Dictionary, key: string): unknown {
  return key.split('.').reduce<unknown>((value, part) => {
    if (!value || typeof value !== 'object') return undefined
    return (value as Dictionary)[part]
  }, dictionary)
}

function interpolate(value: string, params?: Record<string, string | number>): string {
  if (!params) return value
  return value.replace(/{{\s*([\w.-]+)\s*}}/g, (match, key: string) => {
    const replacement = params[key]
    return replacement == null ? match : String(replacement)
  })
}

export function translate(
  locale: Locale,
  namespace: TranslationNamespace,
  key: string,
  params?: Record<string, string | number>,
): string {
  const value = readPath(resources[locale][namespace], key)
  if (typeof value === 'string') return interpolate(value, params)
  if (locale !== DEFAULT_LOCALE) {
    const fallback = readPath(resources[DEFAULT_LOCALE][namespace], key)
    if (typeof fallback === 'string') return interpolate(fallback, params)
  }
  return key
}

type I18nContextValue = {
  locale: Locale
  t: (namespace: TranslationNamespace, key: string, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = LOCALE_META[locale].htmlLang
    try {
      localStorage.setItem(LOCALE_PREFERENCE_KEY, locale)
    } catch {
      // URL remains the source of truth even when preference storage is unavailable.
    }
  }, [locale])

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      t: (namespace, key, params) => translate(locale, namespace, key, params),
    }),
    [locale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used within I18nProvider')
  return context
}
