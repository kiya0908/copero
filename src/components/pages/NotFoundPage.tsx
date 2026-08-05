import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  useEffect(() => {
    const previousTitle = document.title
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    const previousRobots = robots?.content

    document.title = 'Página no encontrada · Copero'
    if (robots) robots.content = 'noindex, nofollow'

    return () => {
      document.title = previousTitle
      if (robots && previousRobots) robots.content = previousRobots
    }
  }, [])

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <section className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center sm:p-12">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-violet-300">Error 404</p>
        <h1 className="mt-4 text-4xl font-black text-white">Esta página no existe</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/55">
          El simulador está disponible en la página principal. Volvé para crear tu jugador y empezar una nueva carrera.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="rounded-full bg-white px-6 py-3 text-sm font-extrabold text-black transition hover:bg-white/90"
          >
            Volver al juego
          </Link>
          <a
            href="mailto:support@copero.top"
            className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
          >
            Contactar soporte
          </a>
        </div>
      </section>
    </main>
  )
}
