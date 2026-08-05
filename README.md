# Copero

Simulador de carrera futbolística en el navegador (React + Vite + TypeScript). Firmás contratos, elegís roles, enfrentás eventos y armás tu trayectoria.

- Sitio: https://copero.top
- Soporte: support@copero.top

## Origen e inspiración

Este proyecto está inspirado en el simulador de carrera de **[Copero](https://copero.com.ar)** y en la experiencia de **[PotreroAR](https://potrero.ar)**.

- Datos de clubes, competiciones y assets (logos, banderas, imágenes de eventos) se apoyan en el ecosistema / CDN de Copero (`media.copero.com.ar`).
- La UI y el flujo de ofertas toman ideas del estilo Potrero.

**No es un producto oficial** de Copero ni de PotreroAR. Es un experimento independiente.

## Desarrollo

```bash
npm install
cp .env.example .env.local
npm run dev
```

Opcional — regenerar el catálogo desde un bundle de Copero:

```bash
CAREER_BUNDLE=/ruta/a/CareerSimulatorPage.js npm run extract
# o
npm run extract -- /ruta/a/CareerSimulatorPage.js
```

## Analítica

Google Analytics 4 y Microsoft Clarity se cargan únicamente en builds de producción y solo cuando existe el ID correspondiente.

```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_CLARITY_PROJECT_ID=xxxxxxxxxx
```

Los IDs son identificadores públicos del navegador, no secretos. En Vercel deben configurarse como variables de entorno de Production antes de desplegar nuevamente.

Eventos incluidos:

- `game_started`
- `identity_completed`
- `draft_round_completed`
- `draft_legend_skipped`
- `draft_completed`
- `origin_club_selected`
- `season_completed`
- `transfer_offer_accepted`
- `career_finished`
- `result_shared`
- `result_card_downloaded`
- `career_restarted`

Los eventos no envían apellido, correo ni otros datos personales introducidos por el jugador.

## Build

```bash
npm run lint
npm run build
npm run preview
```

## Deploy en Vercel

1. Importá el repositorio en Vercel.
2. Framework: **Vite**.
3. Build: `npm run build`.
4. Output: `dist`.
5. Configurá `copero.top` como dominio de producción.
6. Agregá los IDs de GA4 y Clarity cuando estén disponibles.

`vercel.json` reescribe las rutas de la SPA a `index.html`. El proyecto no necesita backend.

## SEO de producción

- Canonical: `https://copero.top/`
- Sitemap: `https://copero.top/sitemap.xml`
- Robots: `https://copero.top/robots.txt`
- Correo público: `support@copero.top`

La imagen Open Graph definitiva se añadirá cuando esté aprobado el arte visual del sitio.

## Licencia

MIT — ver [LICENSE](LICENSE). Podés usar, modificar y republicar libremente.
