import { useEffect } from 'react'
import { ButtonLink } from '../ui/primitives'
import { localePath, useI18n } from '../../i18n/config'

export function NotFoundPage() {
  const { locale, t } = useI18n()
  useEffect(() => { const previous=document.title; document.title=`${t('notFound.title')} · Copero`; let robots=document.head.querySelector<HTMLMetaElement>('meta[name="robots"]'); if(!robots){robots=document.createElement('meta');robots.name='robots';document.head.appendChild(robots)} const old=robots.content; robots.content='noindex, nofollow'; return () => { document.title=previous; if(robots)robots.content=old } },[t])
  return <main className="site-container flex min-h-[70vh] items-center justify-center py-16"><section className="surface-card w-full max-w-xl p-8 text-center sm:p-12"><p className="font-mono text-xs font-black uppercase tracking-[.2em] text-[var(--accent)]">404</p><h1 className="mt-4 font-display text-4xl font-black uppercase">{t('notFound.title')}</h1><p className="mx-auto mt-4 max-w-md leading-7 text-[var(--muted)]">{t('notFound.body')}</p><div className="mt-7 flex justify-center"><ButtonLink to={localePath(locale)}>{t('notFound.home')}</ButtonLink></div></section></main>
}
