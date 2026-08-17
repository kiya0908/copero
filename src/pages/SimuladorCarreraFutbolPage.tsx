import { HomepageCareerStarter } from '../components/home/HomepageCareerStarter'
import { SiteFooter } from '../components/layout/SiteFooter'
import { SiteHeader } from '../components/layout/SiteHeader'
import { useI18n } from '../i18n/config'
import { simuladorCarreraFutbolContent, simulatorSections } from '../data/simulador-carrera-futbol'

export function SimuladorCarreraFutbolPage() {
  const { locale } = useI18n()
  const content = simuladorCarreraFutbolContent[locale]
  const sections = simulatorSections(locale)

  return (
    <div className="marketing-page build-career-page">
      <SiteHeader playHref="#simulador-carrera" />
      <main>
        <section className="site-section build-career-hero">
          <div className="site-container build-career-hero__grid">
            <div className="build-career-hero__copy">
              <p className="eyebrow">{content.hero.eyebrow}</p>
              <h1>{content.hero.title}</h1>
              <p className="lead">{content.hero.lead}</p>
              <div className="build-career-hero__actions">
                <a className="button button--primary" href="#simulador-carrera">{content.hero.primary}</a>
                <a className="button button--secondary" href="#guia-simulador">{content.hero.secondary}</a>
              </div>
              <ul className="build-career-facts" aria-label={content.hero.factsLabel}>
                {content.hero.facts.map((fact) => <li key={fact}>{fact}</li>)}
              </ul>
            </div>

            <aside className="career-route-board" aria-label={content.route.label}>
              <div className="career-route-board__top">
                <span>{content.route.label}</span>
                <strong>{content.route.live}</strong>
              </div>
              <div className="career-route-board__player">
                <span className="career-route-board__shirt">10</span>
                <div>
                  <strong>{content.route.player}</strong>
                  <small>{content.route.age}</small>
                </div>
              </div>
              <ol className="career-route-board__stages">
                {content.route.stages.map((stage, index) => (
                  <li key={stage.title}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <div><strong>{stage.title}</strong><small>{stage.detail}</small></div>
                  </li>
                ))}
              </ol>
              <p>{content.route.footer}</p>
            </aside>
          </div>
        </section>

        <section className="site-section build-career-player" id="simulador-carrera">
          <div className="site-container">
            <HomepageCareerStarter entry="simulador_carrera_futbol" />
          </div>
        </section>

        <section className="site-section site-section--seo-intro" id="guia-simulador">
          <div className="site-container seo-intro-grid">
            <div className="section-heading section-heading--wide">
              <p className="eyebrow">{content.intro.eyebrow}</p>
              <h2>{content.intro.title}</h2>
            </div>
            <div className="seo-copy">
              {content.intro.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </div>
        </section>

        {sections.map((section, index) => (
          <section className={index % 2 === 1 ? 'site-section build-career-result-section' : 'site-section'} key={section.title}>
            <div className="site-container">
              <div className="section-heading section-heading--wide">
                <p className="eyebrow">{section.eyebrow}</p>
                <h2>{section.title}</h2>
              </div>
              <div className="seo-copy">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </div>
          </section>
        ))}

        <section className="site-section" id="simulador-faq">
          <div className="site-container">
            <div className="section-heading">
              <p className="eyebrow">{content.faq.eyebrow}</p>
              <h2>{content.faq.title}</h2>
            </div>
            <div className="build-career-faq-list">
              {content.faq.items.map((item) => (
                <details key={item.question}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="site-section">
          <div className="site-container">
            <div className="final-cta build-career-final-cta">
              <p className="eyebrow">{content.finalCta.eyebrow}</p>
              <h2>{content.finalCta.title}</h2>
              <p className="lead">{content.finalCta.body}</p>
              <a className="button button--primary" href="#simulador-carrera">{content.finalCta.button}</a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
