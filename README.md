# coperofree

Simulador de carrera futbolística en el navegador (React + Vite + TypeScript). Firmás contratos, elegís roles, enfrentás eventos y armás tu trayectoria.

## Origen e inspiración

Este proyecto está inspirado en el simulador de carrera de **[Copero](https://copero.com.ar)** y en la experiencia de **[PotreroAR](https://potrero.ar)**.

- Datos de clubes, competiciones y assets (logos, banderas, imágenes de eventos) se apoyan en el ecosistema / CDN de Copero (`media.copero.com.ar`).
- La UI y el flujo de ofertas toman ideas del estilo Potrero.

**No es un producto oficial** de Copero ni de PotreroAR. Es un experimento independiente.

## Vibecoding

Hecho con **vibecoding asistido por IA**: prototipo rápido, abierto a que cualquiera lo forkée, lo cambie y lo hostee en su propio sitio.

Este repositorio **no se mantiene de forma activa**. No hay promesa de soporte, issues prioritarios ni roadmap. Si querés mejorarlo, forkeá y seguí por tu cuenta.

## Desarrollo

```bash
npm install
npm run dev
```

Opcional — regenerar el catálogo desde un bundle de Copero:

```bash
CAREER_BUNDLE=/ruta/a/CareerSimulatorPage.js npm run extract
# o
npm run extract -- /ruta/a/CareerSimulatorPage.js
```

## Build

```bash
npm run build
npm run preview
```

## Deploy (Vercel u otro host estático)

1. Importá el fork en [Vercel](https://vercel.com) (u otro host de sitios estáticos).
2. Framework: **Vite**.
3. Build: `npm run build`
4. Output: `dist`
5. `vercel.json` ya reescribe la SPA a `index.html`.

No hace falta backend ni variables de entorno.

## Licencia

MIT — ver [LICENSE](LICENSE). Podés usar, modificar y republicar libremente.
