const ADSTERRA_IFRAME_DOCUMENT = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body { margin: 0; min-height: 100%; background: transparent; }
      body { display: flex; align-items: flex-start; justify-content: center; overflow: hidden; }
      #container-3c38ac0440cda8d6dc5e05eb5625645d { width: 100%; }
    </style>
  </head>
  <body>
    <div id="container-3c38ac0440cda8d6dc5e05eb5625645d"></div>
    <script async="async" data-cfasync="false" src="https://pl30782583.effectivecpmnetwork.com/3c38ac0440cda8d6dc5e05eb5625645d/invoke.js"></script>
  </body>
</html>`

export function AdsterraAd() {
  return (
    <aside className="adsterra-ad" aria-label="Advertisement">
      <span className="adsterra-ad__label" aria-hidden="true">Advertisement</span>
      <iframe
        className="adsterra-ad__frame"
        title="Advertisement"
        srcDoc={ADSTERRA_IFRAME_DOCUMENT}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-popups allow-popups-to-escape-sandbox allow-scripts allow-top-navigation-by-user-activation"
      />
    </aside>
  )
}
