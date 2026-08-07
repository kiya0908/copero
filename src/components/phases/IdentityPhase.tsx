import { useMemo, useState } from 'react'
import { allCountries } from '../../data/catalog'
import { flagUrl } from '../../data/flags'
import type { Position, PreferredFoot } from '../../engine/types'
import { useI18n } from '../../i18n/config'
import { countryDisplayName, type GameTranslate } from '../../i18n/game'
import { KitPreview } from '../ui/KitPreview'
import { PitchPositionPicker } from '../ui/PitchPositionPicker'

const INITIAL_COUNTRIES = 24
const PRIORITY_FIFA = ['ARG', 'BRA', 'MEX', 'URU', 'COL', 'CHI', 'ESP', 'ENG', 'ITA', 'FRA', 'GER', 'POR', 'USA', 'NED', 'BEL']
const DEFAULT_NATIONALITY =
  PRIORITY_FIFA.find((code) => allCountries.some((country) => country.fifa_code === code)) ??
  allCountries[0]?.fifa_code ??
  null
const DEFAULT_POSITION: Position = 'ST'

export function IdentityPhase({
  onSubmit,
  onBack,
}: {
  onSubmit: (input: {
    lastName: string
    preferredNumber: number
    preferredFoot: PreferredFoot
    position: Position
    nationalityFifa: string
    heritageNationalityFifa: string | null
  }) => void
  onBack?: () => void
}) {
  const { locale, t } = useI18n()
  const gameT: GameTranslate = (key, params) => t('game', key, params)
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
  const selectedCountry = useMemo(
    () => allCountries.find((country) => country.fifa_code === nationalityFifa) ?? null,
    [nationalityFifa],
  )

  const list = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = q
      ? allCountries.filter(
          (country) =>
            country.name_es.toLowerCase().includes(q) ||
            country.name_en.toLowerCase().includes(q) ||
            country.fifa_code.toLowerCase().includes(q),
        )
      : allCountries

    if (q) return filtered.slice(0, 80)

    const priority = PRIORITY_FIFA.map((code) => filtered.find((country) => country.fifa_code === code)).filter(
      Boolean,
    ) as typeof allCountries
    const rest = filtered.filter((country) => !PRIORITY_FIFA.includes(country.fifa_code))
    const ordered = [...priority, ...rest]
    if (showAll) return ordered.slice(0, 80)
    return ordered.slice(0, Math.max(INITIAL_COUNTRIES, priority.length))
  }, [search, showAll])

  const heritageList = useMemo(() => {
    const q = heritageSearch.trim().toLowerCase()
    const filtered = allCountries.filter((country) => country.fifa_code !== nationalityFifa)
    if (!q) return filtered.slice(0, 40)
    return filtered
      .filter(
        (country) =>
          country.name_es.toLowerCase().includes(q) ||
          country.name_en.toLowerCase().includes(q) ||
          country.fifa_code.toLowerCase().includes(q),
      )
      .slice(0, 40)
  }, [heritageSearch, nationalityFifa])

  const heritageCountry = useMemo(
    () => allCountries.find((country) => country.fifa_code === heritageNationalityFifa) ?? null,
    [heritageNationalityFifa],
  )

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="glass-card rounded-3xl border border-white/10 p-5 sm:p-7">
        <h2 className="mb-2 text-3xl font-bold text-white">{gameT('identity.title')}</h2>
        <p className="mb-6 text-sm leading-relaxed text-white/50">{gameT('identity.helper')}</p>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/70">{gameT('identity.section')}</h3>
            <KitPreview
              lastName={lastName}
              number={preferredNumber}
              primary={selectedCountry?.kit_primary_color ?? selectedCountry?.primary_color}
              secondary={selectedCountry?.kit_secondary_color}
              tertiary={selectedCountry?.kit_tertiary_color}
            />
            <div className="grid grid-cols-[1fr_72px] gap-2">
              <label className="space-y-1 text-sm">
                <span className="text-white/50">{gameT('identity.lastName')}</span>
                <input
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 uppercase text-white outline-none focus:border-white/30"
                  value={lastName}
                  placeholder={gameT('identity.lastNamePlaceholder')}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-white/50">{gameT('identity.number')}</span>
                <input
                  type="number"
                  min={1}
                  max={99}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-white outline-none focus:border-white/30"
                  value={preferredNumber}
                  onChange={(event) => setPreferredNumber(Number(event.target.value) || 10)}
                />
              </label>
            </div>
            <div>
              <p className="mb-2 text-sm text-white/50">{gameT('identity.foot')}</p>
              <div className="flex gap-2">
                {(['left', 'right'] as const).map((foot) => (
                  <button
                    key={foot}
                    type="button"
                    onClick={() => setPreferredFoot(foot)}
                    className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
                      preferredFoot === foot ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/15'
                    }`}
                  >
                    {gameT(foot === 'left' ? 'identity.left' : 'identity.right')}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/25 p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-white/70">{gameT('identity.heritage')}</div>
                  <div className="text-[11px] text-white/45">{gameT('identity.heritageHint')}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHeritage((current) => !current)}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                    heritageNationalityFifa || showHeritage
                      ? 'bg-sky-400 text-black'
                      : 'bg-white/10 text-white/70'
                  }`}
                >
                  {gameT(showHeritage ? 'identity.close' : heritageNationalityFifa ? 'identity.change' : 'identity.optional')}
                </button>
              </div>
              {heritageCountry && !showHeritage && (
                <div className="mt-2 flex items-center gap-2 text-sm text-white">
                  <img src={flagUrl(heritageCountry.iso_alpha2)} alt="" className="h-4 w-6 rounded-sm" />
                  {countryDisplayName(locale, heritageCountry)}
                  <button
                    type="button"
                    className="ml-auto text-[11px] text-white/45 hover:text-white"
                    onClick={() => setHeritageNationalityFifa(null)}
                  >
                    {gameT('identity.remove')}
                  </button>
                </div>
              )}
              {showHeritage && (
                <div className="mt-2 space-y-2">
                  <input
                    className="w-full rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5 text-sm text-white outline-none focus:border-white/30"
                    placeholder={gameT('identity.search')}
                    value={heritageSearch}
                    onChange={(event) => setHeritageSearch(event.target.value)}
                  />
                  <div className="max-h-36 space-y-1 overflow-y-auto">
                    {heritageList.map((country) => (
                      <button
                        key={country.fifa_code}
                        type="button"
                        onClick={() => {
                          setHeritageNationalityFifa(country.fifa_code)
                          setShowHeritage(false)
                          setHeritageSearch('')
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-white/10"
                      >
                        <img src={flagUrl(country.iso_alpha2)} alt="" className="h-4 w-4 rounded-full" />
                        <span className="truncate text-white/85">{countryDisplayName(locale, country)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-white/70">{gameT('identity.nationality')}</h3>
              {selectedCountry && (
                <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                  ✓ {countryDisplayName(locale, selectedCountry)}
                </span>
              )}
            </div>
            <div className="relative mb-3">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">⌕</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-black/50 py-2.5 pl-9 pr-3 text-white outline-none focus:border-white/30"
                placeholder={gameT('identity.search')}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="max-h-[380px] flex-1 space-y-1 overflow-y-auto rounded-xl border border-white/5 bg-black/20 p-2">
              {list.map((country) => {
                const selected = nationalityFifa === country.fifa_code
                return (
                  <button
                    key={country.fifa_code}
                    type="button"
                    onClick={() => {
                      setNationalityFifa(country.fifa_code)
                      if (heritageNationalityFifa === country.fifa_code) setHeritageNationalityFifa(null)
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                      selected ? 'bg-white/10 ring-1 ring-white' : 'hover:bg-white/5'
                    }`}
                  >
                    <img src={flagUrl(country.iso_alpha2)} alt="" className="h-5 w-5 rounded-full object-cover" />
                    <span className="flex-1 truncate text-white">{countryDisplayName(locale, country)}</span>
                    {selected && <span>✓</span>}
                  </button>
                )
              })}
              {!search && !showAll && (
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="w-full rounded-xl py-2 text-sm text-white/60 hover:text-white"
                >
                  {gameT('identity.more')}
                </button>
              )}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-white/70">{gameT('identity.position')}</h3>
              {position && (
                <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                  ✓ {gameT(`position.${position}`)}
                </span>
              )}
            </div>
            <PitchPositionPicker value={position} onChange={setPosition} />
            <p className="mt-3 text-center text-sm text-white/50">{gameT('identity.pitchHint')}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="rounded-full border border-white/30 px-6 py-2.5 text-white transition hover:bg-white/5"
            >
              {gameT('identity.back')}
            </button>
          ) : (
            <span />
          )}
          <div className="flex flex-col items-end gap-2">
            {!canConfirm && <p className="text-xs font-semibold text-amber-300">{gameT('identity.required')}</p>}
            <button
              type="button"
              disabled={!canConfirm}
              onClick={() => {
                if (!nationalityFifa || !position) return
                onSubmit({
                  lastName,
                  preferredNumber,
                  preferredFoot,
                  position,
                  nationalityFifa,
                  heritageNationalityFifa:
                    heritageNationalityFifa && heritageNationalityFifa !== nationalityFifa
                      ? heritageNationalityFifa
                      : null,
                })
              }}
              className={`rounded-full px-8 py-2.5 font-semibold transition ${
                canConfirm ? 'bg-white text-black hover:bg-white/90' : 'cursor-not-allowed bg-white/20 text-white/40'
              }`}
            >
              {gameT('identity.confirm')}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
