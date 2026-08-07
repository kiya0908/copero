import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { allCountries } from '../../data/catalog'
import { flagUrl } from '../../data/flags'
import { initializeDraft } from '../../engine/draft'
import { confirmIdentity } from '../../engine/game'
import { createInitialState, loadLatestState, saveState } from '../../engine/state'
import type { DraftMode, Position, PreferredFoot } from '../../engine/types'
import { useI18n } from '../../i18n/config'
import { countryDisplayName } from '../../i18n/game'
import { trackGameEvent } from '../../lib/analytics'
import { POSITION_LABELS } from '../ui/positions'

const PRIORITY_FIFA = ['ARG', 'BRA', 'MEX', 'URU', 'COL', 'CHI', 'ESP', 'ENG', 'ITA', 'FRA', 'GER', 'POR', 'USA', 'NED', 'BEL']
const DEFAULT_NATIONALITY =
  PRIORITY_FIFA.find((code) => allCountries.some((country) => country.fifa_code === code)) ??
  allCountries[0]?.fifa_code ??
  ''
const POSITIONS = Object.keys(POSITION_LABELS) as Position[]

export function HomepageCareerStarter() {
  const { locale, t } = useI18n()
  const navigate = useNavigate()
  const [hasSavedCareer] = useState(() => Boolean(loadLatestState()))
  const [lastName, setLastName] = useState('')
  const [preferredNumber, setPreferredNumber] = useState(10)
  const [preferredFoot, setPreferredFoot] = useState<PreferredFoot>('right')
  const [nationalityFifa, setNationalityFifa] = useState(DEFAULT_NATIONALITY)
  const [heritageNationalityFifa, setHeritageNationalityFifa] = useState('')
  const [position, setPosition] = useState<Position>('ST')
  const [draftMode, setDraftMode] = useState<DraftMode>('classic')

  const countries = useMemo(() => {
    const priority = PRIORITY_FIFA.map((code) => allCountries.find((country) => country.fifa_code === code)).filter(
      Boolean,
    ) as typeof allCountries
    const priorityCodes = new Set(priority.map((country) => country.fifa_code))
    const rest = allCountries
      .filter((country) => !priorityCodes.has(country.fifa_code))
      .sort((a, b) => countryDisplayName(locale, a).localeCompare(countryDisplayName(locale, b), locale))
    return [...priority, ...rest]
  }, [locale])

  const heritageCountries = useMemo(
    () => countries.filter((country) => country.fifa_code !== nationalityFifa),
    [countries, nationalityFifa],
  )
  const selectedCountry = allCountries.find((country) => country.fifa_code === nationalityFifa) ?? null

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!nationalityFifa) return

    trackGameEvent('game_started', { draft_mode: draftMode, entry: 'homepage' })
    trackGameEvent('identity_completed', {
      position,
      nationality: nationalityFifa,
      preferred_foot: preferredFoot,
      has_heritage_nationality: Boolean(heritageNationalityFifa),
      entry: 'homepage',
    })

    const created = confirmIdentity(createInitialState('long', draftMode), {
      lastName,
      preferredNumber,
      preferredFoot,
      position,
      nationalityFifa,
      heritageNationalityFifa: heritageNationalityFifa || null,
    })
    const readyForDraft = initializeDraft(created)
    saveState(readyForDraft)
    navigate(`/${locale}/game`)
  }

  return (
    <article className="career-starter" aria-labelledby="career-starter-title">
      <div className="career-starter__header">
        <div>
          <p className="career-starter__eyebrow">{t('home', 'starter.eyebrow')}</p>
          <h2 id="career-starter-title">{t('home', 'starter.title')}</h2>
          <p>{t('home', 'starter.body')}</p>
        </div>
        {hasSavedCareer && (
          <button
            type="button"
            className="career-starter__continue"
            onClick={() => navigate(`/${locale}/game`)}
          >
            <span>{t('home', 'starter.activeSave')}</span>
            <strong>{t('home', 'starter.continue')} →</strong>
          </button>
        )}
      </div>

      <div className="career-starter__body">
        <form className="career-starter__form" onSubmit={handleSubmit}>
          <div className="career-starter__row career-starter__row--identity">
            <label className="career-starter__field">
              <span>{t('home', 'starter.lastName')}</span>
              <input
                value={lastName}
                maxLength={24}
                autoComplete="off"
                placeholder={t('home', 'starter.lastNamePlaceholder')}
                onChange={(event) => setLastName(event.target.value)}
              />
            </label>
            <label className="career-starter__field career-starter__field--number">
              <span>{t('home', 'starter.number')}</span>
              <input
                type="number"
                min={1}
                max={99}
                inputMode="numeric"
                value={preferredNumber}
                onChange={(event) => setPreferredNumber(Math.min(99, Math.max(1, Number(event.target.value) || 10)))}
              />
            </label>
          </div>

          <fieldset className="career-starter__fieldset">
            <legend>{t('home', 'starter.foot')}</legend>
            <div className="career-starter__segmented">
              {(['left', 'right'] as PreferredFoot[]).map((foot) => (
                <button
                  key={foot}
                  type="button"
                  aria-pressed={preferredFoot === foot}
                  className="career-starter__segment"
                  onClick={() => setPreferredFoot(foot)}
                >
                  {t('home', foot === 'left' ? 'starter.left' : 'starter.right')}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="career-starter__row">
            <label className="career-starter__field">
              <span>{t('home', 'starter.nationality')}</span>
              <select
                value={nationalityFifa}
                onChange={(event) => {
                  const next = event.target.value
                  setNationalityFifa(next)
                  if (heritageNationalityFifa === next) setHeritageNationalityFifa('')
                }}
              >
                {countries.map((country) => (
                  <option key={country.fifa_code} value={country.fifa_code}>
                    {countryDisplayName(locale, country)}
                  </option>
                ))}
              </select>
            </label>
            <label className="career-starter__field">
              <span>{t('home', 'starter.position')}</span>
              <select value={position} onChange={(event) => setPosition(event.target.value as Position)}>
                {POSITIONS.map((candidate) => (
                  <option key={candidate} value={candidate}>
                    {candidate} · {t('game', `position.${candidate}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <details className="career-starter__optional">
            <summary>
              <span>{t('game', 'identity.heritage')}</span>
              <small>{t('game', 'identity.heritageHint')}</small>
            </summary>
            <label className="career-starter__field">
              <span>{t('game', 'identity.heritage')}</span>
              <select value={heritageNationalityFifa} onChange={(event) => setHeritageNationalityFifa(event.target.value)}>
                <option value="">— {t('game', 'identity.optional')} —</option>
                {heritageCountries.map((country) => (
                  <option key={country.fifa_code} value={country.fifa_code}>
                    {countryDisplayName(locale, country)}
                  </option>
                ))}
              </select>
            </label>
          </details>

          <fieldset className="career-starter__fieldset">
            <legend>{t('home', 'starter.draftMode')}</legend>
            <div className="career-starter__modes">
              {(['classic', 'purist'] as DraftMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={draftMode === mode}
                  className="career-starter__mode"
                  onClick={() => setDraftMode(mode)}
                >
                  <strong>{t('home', `modes.${mode}.title`)}</strong>
                  <span>{t('home', mode === 'classic' ? 'starter.classicHint' : 'starter.puristHint')}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <button className="career-starter__start" type="submit">
            <span>{t('home', 'starter.start')}</span>
            <span aria-hidden="true">→</span>
          </button>
          <p className="career-starter__microcopy">{t('home', 'starter.microcopy')}</p>
        </form>

        <aside className="career-starter__preview" aria-label={t('home', 'starter.preview')}>
          <div className="career-starter__preview-top">
            <span>{t('home', 'starter.preview')}</span>
            <strong>{POSITION_LABELS[position]}</strong>
          </div>
          <div className="career-starter__shirt-number">{preferredNumber}</div>
          <div className="career-starter__player-name">
            {(lastName.trim() || t('home', 'starter.previewFallback')).toUpperCase()}
          </div>
          <div className="career-starter__preview-meta">
            {selectedCountry && (
              <span>
                <img src={flagUrl(selectedCountry.iso_alpha2)} alt="" />
                {countryDisplayName(locale, selectedCountry)}
              </span>
            )}
            <span>{t('home', `modes.${draftMode}.title`)}</span>
          </div>
          <div className="career-starter__draft-track" aria-hidden="true">
            {Array.from({ length: 8 }, (_, index) => (
              <i key={index}>{index + 1}</i>
            ))}
          </div>
          <p>{t('home', 'starter.previewHint')}</p>
        </aside>
      </div>
    </article>
  )
}
