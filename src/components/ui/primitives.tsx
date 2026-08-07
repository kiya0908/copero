import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

type Tone = 'primary' | 'secondary' | 'ghost' | 'gold'

const toneClass: Record<Tone, string> = {
  primary: 'border-transparent bg-[var(--accent)] text-[var(--accent-ink)] shadow-[var(--shadow-accent)] hover:-translate-y-0.5 hover:rotate-[-0.5deg] hover:bg-[var(--accent-hover)]',
  secondary: 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--fg)] hover:-translate-y-0.5 hover:border-[var(--fg)]',
  ghost: 'border-transparent bg-transparent text-[var(--muted)] hover:text-[var(--fg)]',
  gold: 'border-[var(--gold-border)] bg-[var(--gold-soft)] text-[var(--gold)] hover:-translate-y-0.5',
}

const buttonBase = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition-[transform,background,border-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-45'

export function Button({ tone = 'primary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone }) {
  return <button {...props} className={`${buttonBase} ${toneClass[tone]} ${className}`} />
}

export function ButtonLink({ tone = 'primary', className = '', ...props }: LinkProps & { tone?: Tone }) {
  return <Link {...props} className={`${buttonBase} ${toneClass[tone]} ${className}`} />
}

export function SurfaceCard({ children, className = '', gold = false }: { children: ReactNode; className?: string; gold?: boolean }) {
  return <div className={`${gold ? 'brand-result-card' : 'surface-card'} ${className}`}>{children}</div>
}

export function Eyebrow({ children, gold = false }: { children: ReactNode; gold?: boolean }) {
  return <p className={`font-mono text-[11px] font-bold uppercase tracking-[0.14em] ${gold ? 'text-[var(--gold)]' : 'text-[var(--accent)]'}`}>{children}</p>
}

export function SectionHeading({ eyebrow, title, body }: { eyebrow: ReactNode; title: ReactNode; body?: ReactNode }) {
  return <div className="max-w-3xl"><Eyebrow>{eyebrow}</Eyebrow><h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.5rem)] font-black uppercase leading-[.98] tracking-[-0.035em] text-[var(--fg)]">{title}</h2>{body ? <p className="mt-4 max-w-[60ch] text-base leading-7 text-[var(--muted)]">{body}</p> : null}</div>
}

export function StatusPanel({ kind, title, body, action }: { kind: 'loading' | 'empty' | 'error'; title: string; body?: string; action?: ReactNode }) {
  return <div className="surface-card flex min-h-40 flex-col items-center justify-center p-6 text-center"><span className={`status-pill status-${kind}`}>{kind}</span><h3 className="mt-4 font-display text-xl font-black uppercase">{title}</h3>{body ? <p className="mt-2 max-w-md text-sm text-[var(--muted)]">{body}</p> : null}{action ? <div className="mt-5">{action}</div> : null}</div>
}
