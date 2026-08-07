import { SeoHead } from '../components/seo/SeoHead'
import { ButtonLink, Eyebrow, SectionHeading, SurfaceCard } from '../components/ui/primitives'
import { localePath, useI18n } from '../i18n/config'

const faqKeys = ['free', 'save', 'potential', 'official'] as const

export function HomePage() {
  const { locale, t } = useI18n()
  const playHref = localePath(locale, 'game')
  return (
    <>
      <SeoHead page="home" />
      <main>
        <section className="site-section border-0 pt-10 md:pt-16">
          <div className="site-container hero-grid">
            <div className="py-6 md:py-12">
              <Eyebrow>{t('home.eyebrow')}</Eyebrow>
              <h1 className="mt-4 max-w-[11ch] font-display text-[clamp(3rem,8vw,6.5rem)] font-black uppercase leading-[.88] tracking-[-0.055em] text-[var(--fg)]">
                {t('home.title')}
              </h1>
              <p className="mt-6 max-w-[60ch] text-[clamp(1rem,2vw,1.2rem)] leading-8 text-[var(--muted)]">{t('home.lead')}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink to={playHref}>{t('home.play')} <span aria-hidden>→</span></ButtonLink>
                <ButtonLink tone="secondary" to="#how-to-play">{t('home.how')}</ButtonLink>
              </div>
              <div className="mt-7 flex flex-wrap gap-2">
                {['browser', 'noLogin', 'saved'].map((key) => <span className="fact-tag" key={key}>{t(`home.fact.${key}`)}</span>)}
              </div>
            </div>
            <SurfaceCard gold className="career-preview self-center p-6 md:p-8">
              <Eyebrow gold>{t('home.result.eyebrow')}</Eyebrow>
              <div className="mt-4 grid grid-cols-[1fr_auto] items-start gap-5">
                <div><div className="font-display text-[clamp(3.5rem,9vw,7rem)] font-black leading-none text-[var(--fg)]">S–D</div><p className="mt-1 font-mono text-xs uppercase tracking-[.14em] text-[var(--gold)]">{t('home.result.grade')}</p></div>
                <div className="result-score"><strong>OVR</strong><span>+</span></div>
              </div>
              <h2 className="mt-7 font-display text-2xl font-black uppercase leading-tight">{t('home.result.title')}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{t('home.result.body')}</p>
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                {['stats', 'timeline', 'trophies'].map((key) => <div className="result-feature" key={key}>{t(`home.result.${key}`)}</div>)}
              </div>
            </SurfaceCard>
          </div>
        </section>

        <section className="site-section" id="how-to-play">
          <div className="site-container">
            <SectionHeading eyebrow={t('home.steps.eyebrow')} title={t('home.steps.title')} />
            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {['identity', 'draft', 'origin', 'career'].map((key, index) => (
                <SurfaceCard key={key} className="p-5 md:p-6">
                  <span className="step-number">0{index + 1}</span>
                  <h3 className="mt-5 font-display text-xl font-black uppercase">{t(`home.step.${key}.title`)}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{t(`home.step.${key}.body`)}</p>
                </SurfaceCard>
              ))}
            </div>
          </div>
        </section>

        <section className="site-section" id="mechanics">
          <div className="site-container grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
            <SectionHeading eyebrow={t('home.modes.eyebrow')} title={t('home.modes.title')} />
            <div className="grid gap-4 sm:grid-cols-2">
              {['classic', 'purist'].map((key) => <SurfaceCard key={key} className="p-6"><Eyebrow>{t(`home.${key}.title`)}</Eyebrow><p className="mt-5 leading-7 text-[var(--muted)]">{t(`home.${key}.body`)}</p></SurfaceCard>)}
            </div>
          </div>
          <div className="site-container mt-16">
            <SectionHeading eyebrow={t('home.features.eyebrow')} title={t('home.features.title')} />
            <div className="mt-9 grid gap-4 md:grid-cols-2">
              {['contracts', 'objectives', 'national', 'events'].map((key) => <SurfaceCard key={key} className="p-6"><h3 className="font-display text-xl font-black uppercase">{t(`home.feature.${key}`)}</h3><p className="mt-3 leading-7 text-[var(--muted)]">{t(`home.feature.${key}.body`)}</p></SurfaceCard>)}
            </div>
          </div>
        </section>

        <section className="site-section" id="faq">
          <div className="site-container max-w-4xl">
            <h2 className="font-display text-[clamp(2rem,5vw,3.4rem)] font-black uppercase">{t('home.faq.title')}</h2>
            <div className="mt-8 divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {faqKeys.map((key) => <details key={key} className="group py-5"><summary className="cursor-pointer list-none pr-8 font-display text-lg font-black uppercase marker:hidden">{t(`home.faq.${key}.q`)}</summary><p className="mt-3 max-w-3xl leading-7 text-[var(--muted)]">{t(`home.faq.${key}.a`)}</p></details>)}
            </div>
            <div className="mt-10"><ButtonLink to={playHref}>{t('home.play')} <span aria-hidden>→</span></ButtonLink></div>
          </div>
        </section>
      </main>
      <footer className="border-t border-[var(--border)] py-8"><div className="site-container flex flex-wrap items-center justify-between gap-4 text-sm text-[var(--muted)]"><strong className="font-display uppercase text-[var(--fg)]">Copero</strong><span>{t('footer.note')}</span><a className="hover:text-[var(--fg)]" href="mailto:support@copero.top">support@copero.top</a></div></footer>
    </>
  )
}
