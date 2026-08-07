import { useMemo, useState } from 'react'
import { allCountries } from '../../data/catalog'
import { flagUrl } from '../../data/flags'
import type { Position, PreferredFoot } from '../../engine/types'
import { countryName, positionText, useI18n } from '../../i18n/config'
import { Button } from '../ui/primitives'
import { KitPreview } from '../ui/KitPreview'
import { PitchPositionPicker } from '../ui/PitchPositionPicker'

const INITIAL_COUNTRIES = 24
const PRIORITY_FIFA = ['ARG', 'BRA', 'MEX', 'URU', 'COL', 'CHI', 'ESP', 'ENG', 'ITA', 'FRA', 'GER', 'POR', 'USA', 'NED', 'BEL']
const DEFAULT_NATIONALITY = PRIORITY_FIFA.find((code) => allCountries.some((country) => country.fifa_code === code)) ?? allCountries[0]?.fifa_code ?? null
const DEFAULT_POSITION: Position = 'ST'

export function IdentityPhase({ onSubmit, onBack }: { onSubmit: (input: { lastName: string; preferredNumber: number; preferredFoot: PreferredFoot; position: Position; nationalityFifa: string; heritageNationalityFifa: string | null }) => void; onBack?: () => void }) {
  const { locale, t } = useI18n()
  const [search, setSearch] = useState('')
  const [nationalityFifa, setNationalityFifa] = useState<string | null>(DEFAULT_NATIONALITY)
  const [heritageNationalityFifa, setHeritageNationalityFifa] = useState<string | null>(null)
  const [heritageSearch, setHeritageSearch] = useState('')
  const [showHeritage, setShowHeritage] = useState(false)
  const [position, setPosition] = useState<Position | null>(DEFAULT_POSITION)
  const [lastName, setLastName] = useState('')
  const [preferredNumber, setPreferredNumber] = useState(10)
  const [preferredFoot, setPreferredFoot] = useState<PreferredFoot>('right')
  const [showAll, setShowAll] = useState(false)
  const canConfirm = Boolean(nationalityFifa && position)
  const selectedCountry = useMemo(() => allCountries.find((c) => c.fifa_code === nationalityFifa) ?? null, [nationalityFifa])

  const matches = (c: (typeof allCountries)[number], query: string) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return c.name_es.toLowerCase().includes(q) || c.name_en.toLowerCase().includes(q) || countryName(c, locale).toLowerCase().includes(q) || c.fifa_code.toLowerCase().includes(q)
  }
  const list = useMemo(() => {
    const filtered = allCountries.filter((c) => matches(c, search))
    if (search.trim()) return filtered.slice(0, 80)
    const priority = PRIORITY_FIFA.map((code) => filtered.find((c) => c.fifa_code === code)).filter(Boolean) as typeof allCountries
    const rest = filtered.filter((c) => !PRIORITY_FIFA.includes(c.fifa_code))
    const ordered = [...priority, ...rest]
    return ordered.slice(0, showAll ? 80 : Math.max(INITIAL_COUNTRIES, priority.length))
  }, [search, showAll, locale])
  const heritageList = useMemo(() => allCountries.filter((c) => c.fifa_code !== nationalityFifa && matches(c, heritageSearch)).slice(0, 40), [heritageSearch, nationalityFifa, locale])
  const heritageCountry = useMemo(() => allCountries.find((c) => c.fifa_code === heritageNationalityFifa) ?? null, [heritageNationalityFifa])

  return (
    <section className="site-container py-6 sm:py-10">
      <div className="surface-card p-4 sm:p-7">
        <h2 className="font-display text-3xl font-black uppercase tracking-[-.03em]">{t('identity.title')}</h2>
        <p className="mb-7 mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{t('game.identity.help')}</p>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4">
            <h3 className="font-mono text-xs font-bold uppercase tracking-[.12em] text-[var(--muted)]">{t('game.identity.identity')}</h3>
            <KitPreview lastName={lastName} number={preferredNumber} primary={selectedCountry?.kit_primary_color ?? selectedCountry?.primary_color} secondary={selectedCountry?.kit_secondary_color} tertiary={selectedCountry?.kit_tertiary_color} />
            <div className="grid grid-cols-[1fr_76px] gap-2">
              <label className="space-y-1 text-sm"><span className="text-[var(--muted)]">{t('identity.lastName')}</span><input className="w-full rounded-xl border border-[var(--border)] bg-black/30 px-3 py-2.5 uppercase outline-none focus:border-[var(--accent)]" value={lastName} placeholder={t('game.identity.placeholder')} onChange={(e) => setLastName(e.target.value)} /></label>
              <label className="space-y-1 text-sm"><span className="text-[var(--muted)]">{t('identity.number')}</span><input type="number" min={1} max={99} className="w-full rounded-xl border border-[var(--border)] bg-black/30 px-3 py-2.5 outline-none focus:border-[var(--accent)]" value={preferredNumber} onChange={(e) => setPreferredNumber(Number(e.target.value) || 10)} /></label>
            </div>
            <div><p className="mb-2 text-sm text-[var(--muted)]">{t('identity.foot')}</p><div className="flex gap-2">{(['left','right'] as const).map((foot) => <button key={foot} type="button" onClick={() => setPreferredFoot(foot)} className={`flex-1 rounded-full border px-3 py-2 text-sm font-bold ${preferredFoot === foot ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)]' : 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--fg)]'}`}>{t(foot === 'left' ? 'identity.left' : 'identity.right')}</button>)}</div></div>
            <div className="rounded-xl border border-[var(--border)] bg-black/20 p-3">
              <div className="flex items-center justify-between gap-2"><div><div className="text-xs font-bold">{t('identity.heritage')}</div><div className="mt-1 text-[11px] text-[var(--muted)]">{t('identity.heritageHint')}</div></div><button type="button" onClick={() => setShowHeritage((v) => !v)} className="rounded-full border border-[var(--border)] px-3 py-1 text-[11px] font-bold text-[var(--muted)]">{showHeritage ? t('common.close') : heritageNationalityFifa ? t('common.change') : t('common.optional')}</button></div>
              {heritageCountry && !showHeritage ? <div className="mt-3 flex items-center gap-2 text-sm"><img src={flagUrl(heritageCountry.iso_alpha2)} alt="" className="h-4 w-6 rounded-sm" /><span className="truncate">{countryName(heritageCountry, locale)}</span><button type="button" className="ml-auto text-[11px] text-[var(--muted)]" onClick={() => setHeritageNationalityFifa(null)}>{t('common.remove')}</button></div> : null}
              {showHeritage ? <div className="mt-3 space-y-2"><input className="w-full rounded-lg border border-[var(--border)] bg-black/30 px-2.5 py-2 text-sm outline-none" placeholder={t('identity.search')} value={heritageSearch} onChange={(e) => setHeritageSearch(e.target.value)} /><div className="max-h-40 space-y-1 overflow-y-auto">{heritageList.map((c) => <button key={c.fifa_code} type="button" onClick={() => { setHeritageNationalityFifa(c.fifa_code); setShowHeritage(false); setHeritageSearch('') }} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-white/5"><img src={flagUrl(c.iso_alpha2)} alt="" className="h-4 w-5 rounded-sm" /><span className="truncate">{countryName(c, locale)}</span></button>)}</div></div> : null}
            </div>
          </div>
          <div className="flex min-h-0 flex-col"><div className="mb-3 flex items-center justify-between gap-3"><h3 className="font-mono text-xs font-bold uppercase tracking-[.12em] text-[var(--muted)]">{t('identity.nationality')}</h3>{selectedCountry ? <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--accent)]">✓ {countryName(selectedCountry, locale)}</span> : null}</div><input className="mb-3 w-full rounded-xl border border-[var(--border)] bg-black/30 px-3 py-2.5 outline-none focus:border-[var(--accent)]" placeholder={t('identity.search')} value={search} onChange={(e) => setSearch(e.target.value)} /><div className="max-h-[390px] flex-1 space-y-1 overflow-y-auto rounded-xl border border-[var(--border)] bg-black/15 p-2">{list.map((c) => { const selected = nationalityFifa === c.fifa_code; return <button key={c.fifa_code} type="button" onClick={() => { setNationalityFifa(c.fifa_code); if (heritageNationalityFifa === c.fifa_code) setHeritageNationalityFifa(null) }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm ${selected ? 'bg-[var(--accent-soft)] ring-1 ring-[var(--accent)]' : 'hover:bg-white/5'}`}><img src={flagUrl(c.iso_alpha2)} alt="" className="h-5 w-6 rounded-sm object-cover" /><span className="flex-1 truncate">{countryName(c, locale)}</span>{selected ? <span>✓</span> : null}</button>})}{!search && !showAll ? <button type="button" onClick={() => setShowAll(true)} className="w-full rounded-xl py-2 text-sm text-[var(--muted)] hover:text-[var(--fg)]">{t('common.more')}</button> : null}</div></div>
          <div><div className="mb-3 flex items-center justify-between gap-3"><h3 className="font-mono text-xs font-bold uppercase tracking-[.12em] text-[var(--muted)]">{t('identity.position')}</h3>{position ? <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--accent)]">✓ {positionText(position, t, true)}</span> : null}</div><PitchPositionPicker value={position} onChange={setPosition} /><p className="mt-3 text-center text-sm text-[var(--muted)]">{t('game.identity.pitchHint')}</p></div>
        </div>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">{onBack ? <Button tone="secondary" onClick={onBack}>{t('common.back')}</Button> : <span />}<div className="text-right">{!canConfirm ? <p className="mb-2 text-xs font-bold text-[var(--gold)]">{t('game.identity.required')}</p> : null}<Button disabled={!canConfirm} onClick={() => { if (!nationalityFifa || !position) return; onSubmit({ lastName, preferredNumber, preferredFoot, position, nationalityFifa, heritageNationalityFifa: heritageNationalityFifa && heritageNationalityFifa !== nationalityFifa ? heritageNationalityFifa : null }) }}>{t('game.identity.confirm')} <span aria-hidden>→</span></Button></div></div>
      </div>
    </section>
  )
}
