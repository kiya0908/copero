import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { Country, PlayingRole, Position, CareerStage, SeasonObjective, TraitId, AttributeKey, OfferPathReason } from '../engine/types'
import { t as spanishBase } from './es'
import { extraResources, localeMeta, SUPPORTED_LOCALES, type Locale, type TranslationVars } from './resources'

export type Translator = (key: string, vars?: TranslationVars) => string

function interpolate(text: string, vars?: TranslationVars): string {
  if (!vars) return text
  let result = text
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{${key}}`, String(value))
  }
  return result
}

export function isLocale(value: string | undefined | null): value is Locale {
  return Boolean(value && SUPPORTED_LOCALES.includes(value as Locale))
}

export function translate(locale: Locale, key: string, vars?: TranslationVars): string {
  const extra = extraResources[locale][key]
  if (extra != null) return interpolate(extra, vars)
  if (locale === 'es') return spanishBase(key, Object.fromEntries(Object.entries(vars ?? {}).map(([k, v]) => [k, String(v)])))
  // A legacy save can contain already-rendered Spanish instead of a translation key.
  // Return it verbatim instead of exposing a missing-key token.
  if (!key.includes('.') || /\s/.test(key)) return interpolate(key, vars)
  const spanish = extraResources.es[key] ?? spanishBase(key, Object.fromEntries(Object.entries(vars ?? {}).map(([k, v]) => [k, String(v)])))
  return spanish === key ? key : spanish
}

const I18nContext = createContext<{ locale: Locale; t: Translator }>({
  locale: 'es',
  t: (key, vars) => translate('es', key, vars),
})

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo(() => ({ locale, t: (key: string, vars?: TranslationVars) => translate(locale, key, vars) }), [locale])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}

export function localePath(locale: Locale, page: 'home' | 'game' = 'home'): string {
  return page === 'home' ? `/${locale}/` : `/${locale}/game`
}

export function replaceLocaleInPath(pathname: string, locale: Locale): string {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length && isLocale(segments[0])) segments[0] = locale
  else segments.unshift(locale)
  const result = `/${segments.join('/')}`
  if (segments.length === 1) return `${result}/`
  return result
}

export function intlLocale(locale: Locale): string {
  return localeMeta[locale].intl
}

export function formatNumber(value: number, locale: Locale, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(intlLocale(locale), options).format(value)
}

export function formatMoney(value: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function countryName(country: Country | undefined, locale: Locale): string {
  if (!country) return ''
  if (locale === 'es') return country.name_es
  if (locale === 'en') return country.name_en
  try {
    const displayNames = new Intl.DisplayNames([intlLocale(locale)], { type: 'region' })
    return displayNames.of(country.iso_alpha2.toUpperCase()) || country.name_en
  } catch {
    return country.name_en
  }
}

export function positionText(position: Position, t: Translator, short = false): string {
  return t(`${short ? 'position.short' : 'position'}.${position}`)
}

export function roleText(role: PlayingRole, t: Translator): string {
  return t(`role.${role}`)
}

export function stageText(stage: CareerStage, t: Translator): string {
  return t(`stage.${stage}`)
}

export function traitText(id: TraitId, t: Translator): { label: string; desc: string } {
  return { label: t(`trait.${id}`), desc: t(`trait.${id}.desc`) }
}

export function attributeText(key: AttributeKey, t: Translator): string {
  return t(`attribute.${key}`)
}

export function objectiveText(objective: Pick<SeasonObjective, 'kind' | 'target' | 'label'> | null | undefined, t: Translator): string {
  if (!objective) return ''
  const key = `objective.${objective.kind}`
  const translated = t(key, { target: objective.target })
  if (translated !== key) return translated
  return t(objective.label, { target: objective.target })
}

export function pathReasonText(reason: OfferPathReason | undefined, t: Translator): string {
  return reason ? t(`career.path.${reason}`) : ''
}

export function resolveStoredText(value: string | undefined, t: Translator, vars?: TranslationVars): string {
  if (!value) return ''
  return t(value, vars)
}
