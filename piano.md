Espansione design system edi.md — monogramma "e" a blocchi, tipografia, brand kit, Claude Design

Contesto

edi.md è un sito statico puro (index.html ~1200 righe + design-system.css ~1290 righe, nessun build step, deploy Vercel). Il token system è già maturo (colori, tipografia fluida, spacing, motion in CSS variables), ma l'identità di brand è immatura: il "logo" è solo un wordmark testuale inline in Inter, la favicon è una "e" dipendente dal font di sistema, non esistono varianti del marchio né documentazione, il font display Mioya è caricato ma non usato, e ci sono asset orfani (mp4, stili di illustrazioni PNG già cancellate).

Decisioni prese con l'utente:
1. Logomark = monogramma "e" a blocchi (scelto dall'utente con immagine di riferimento — uno stock Adobe con watermark, quindi da NON ricalcare: si disegna un marchio originale con la stessa logica costruttiva): "e" minuscola squadrata, in controforma bianca dentro quadrati di colore sovrapposti e sfalsati, tutto ortogonale, zero curve. Palette rimappata sul design system: il rosso del riferimento → arancione #f54e00, il teal → ink #26251e, gli angoli navy che spuntano dietro → --color-accent-deep #c73a00 (da validare a schermo; alternativa: tono bg #efeee8).
2. Mioya come voce display: hero headline e titoli di sezione in Mioya serif; Inter/mono restano per UI/label/codice.
3. Espansione completa: kit favicon/OG, pagina style guide brand.html, set icone brand, pulizia e consolidamento CSS.
4. Claude Design: creare un nuovo progetto design-system "edi.md" su claude.ai/design e sincronizzarci il sistema (tool DesignSync, già verificato disponibile via ToolSearch).

Palette di riferimento: ink #26251e, bg #f7f7f4, accent --cursor-orange: #f54e00. Tema chiaro fisso (scelta esplicita, non cambia).

Vincoli ambiente verificati: niente ImageMagick/rsvg-convert/inkscape/woff2 tools; sì python3, node, npx. Rasterizzazione → Playwright (skill webapp-testing) o npx one-off.

Ogni fase lascia il sito deployabile; commit per fase. Le cancellazioni PNG già staged si committano con la Fase 4.

Fase 1 — Tipografia: attivare Mioya

File: design-system.css, index.html.

1. Nuovo token dopo --font-display (design-system.css:50): --font-display-serif: "Mioya", Georgia, "Times New Roman", serif;
2. Conversione woff2 (best-effort): provare npx wawoff2 compress assets/fonts/MioyaVF.ttf o pip install --user fonttools brotli. Se riesce → assets/fonts/MioyaVF.woff2 e aggiornare la src del @font-face (design-system.css:6) con woff2 prima del ttf. Se fallisce → tenere il TTF (131 KB, font-display: swap già presente a riga 8).
3. Preload nel head di index.html (~riga 22, vicino ai preconnect): <link rel="preload" href="assets/fonts/MioyaVF.woff2" as="font" crossorigin> (o .ttf).
4. Applicare var(--font-display-serif) a: .ds-hero__headline (design-system.css:~799 — ridurre il tracking a ~-0.015em, verificare line-height 0.98→1.02 a occhio), .section__title (inline in index.html, passerà a site.css in Fase 4), .ds-bio__name, .ds-contact-strip__heading. Nav, pill, bottoni, timeline restano Inter/mono.

Verifica: npx serve -p 3900 . + Playwright document.fonts.check('1em Mioya') + screenshot hero.

Fase 2 — Logomark: monogramma "e" a blocchi (SVG)

Nuova dir assets/brand/. Costruzione originale ispirata al riferimento dell'utente (stock watermarked: stessa logica, geometria nuova). Griglia modulare 120×120, modulo base 20 (tutte le coordinate multiple del modulo o del semimodulo), solo <rect>, zero curve, zero testo. Stratificazione (dal fondo):

1. Angoli deep — due piccoli quadrati #c73a00 (accent-deep) che spuntano in alto-destra e basso-sinistra dietro ai blocchi principali.
2. Quadrato arancione #f54e00, sfalsato verso alto-sinistra (es. x=0 y=0, 90×90).
3. Quadrato ink #26251e, sfalsato verso basso-destra (es. x=30 y=30, 90×90), sotto l'arancione nell'area di sovrapposizione o sopra — decidere a schermo quale ordine dà più profondità.
4. Campo bianco centrale (es. x=20 y=20, 80×80) che ospita la "e".
5. La "e" blocky in controforma: costruita SOLO con rettangoli pieni sopra il campo bianco — una barra arancione per l'occhio superiore della "e", blocchi ink da destra/basso che ritagliano gambo, pancia e apertura. Il bianco che resta È la "e". Spessore aste = 1 modulo (20/120).

Sketch di partenza (valori da rifinire a occhio in esecuzione, con confronti side-by-side a 16/32/64/256px via Playwright):

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect x="95" y="5" width="20" height="20" fill="#c73a00"/>
  <rect x="5" y="95" width="20" height="20" fill="#c73a00"/>
  <rect x="0" y="0" width="90" height="90" fill="#f54e00"/>
  <rect x="30" y="30" width="90" height="90" fill="#26251e"/>
  <rect x="20" y="20" width="80" height="80" fill="#ffffff"/>
  <!-- blocchi che ritagliano la "e" nel campo bianco (controforma) -->
  <rect x="40" y="40" width="30" height="15" fill="#f54e00"/>  <!-- occhio -->
  <rect x="40" y="70" width="60" height="15" fill="#26251e"/>  <!-- taglio pancia/apertura -->
  <!-- + rettangoli ink di rifilo per chiudere la sagoma della e -->
</svg>

Il vincolo strutturale: griglia modulare, soli rect, controforma bianca leggibile come "e" anche a 16px. Regola di famiglia che ne deriva: geometria ortogonale, angoli vivi, terminali piatti — le icone di Fase 5 e i tile della style guide la ereditano (niente più cap rotondi).

File da creare:
- assets/brand/mark.svg — la composizione quadrata completa (versione canonica, è già un tile: funge anche da avatar)
- assets/brand/mark-mono.svg — versione monocroma: tutto ink su bianco (blocchi in tinte piatte di ink, "e" bianca), per contesti a un colore
- assets/brand/mark-inverse.svg — variante per fondi ink/scuri (campo esterno trasparente, blocchi arancione + off-white #fafaf7)
- assets/brand/lockup.svg + lockup-dark.svg — monogramma + wordmark riusando la geometria testuale attuale (Inter 72px, letter-spacing −2.16, "edi" ink / ".md" arancione, da index.html:636–637); gap = un modulo. Nota: convertire il testo in path (o accettare la dipendenza da Inter) perché SVG standalone non eredita i font di pagina.
- Sostituire assets/favicon.svg col monogramma (essendo un quadrato pieno, riempie il canvas favicon senza tile aggiuntivo — ed elimina il bug attuale della "e" font-dipendente: la nuova "e" è geometria pura)

L'asterisco della hero board (index.html:~755) resta com'è: è illustrazione di scena, non marchio — nessuna modifica.

Approvazione visiva: a fine fase produrre una pagina di confronto (scratchpad) con il marchio a 4 dimensioni e le varianti, screenshot da mostrare all'utente prima di procedere al kit raster.

Fase 3 — Kit raster: favicon.ico, PNG, og.png

Strategia (nessun build tooling): ricontrollare command -v magick convert rsvg-convert inkscape; se assenti → Playwright (skill webapp-testing) su template HTML nello scratchpad:
- icon.html: assets/brand/mark.svg a pixel esatti (il marchio è già un tile quadrato); screenshot con clip a 512/192/180/32/16, deviceScaleFactor: 1. A 16px verificare la leggibilità della "e" — se illeggibile, variante semplificata mark-16.svg con meno strati (solo arancione+ink+e bianca, senza angoli deep)
- og.html: pagina 1200×630, bg #f7f7f4, griglia tecnica della hero (data-URI a index.html:~160), monogramma a blocchi grande, wordmark, tagline "Orchestro agenti AI che lavorano per me." in Mioya. Screenshot esatto 1200×630 → sovrascrive assets/og.png
- .ico: npx png-to-ico favicon-32 favicon-16 > favicon.ico (root repo, così risponde /favicon.ico). Se npx fallisce, saltare e annotare il gap.

File: favicon.ico (root), assets/apple-touch-icon.png (180), assets/favicon-192.png, favicon-512.png, favicon-32.png, favicon-16.png, assets/og.png rigenerata.

Head di index.html (righe 8–19): aggiungere <link rel="icon" sizes="32x32"> e <link rel="apple-touch-icon">; cambiare og:image/twitter:image in URL assoluto di produzione (dominio dal progetto Vercel "edi.md-main") + og:image:width/height 1200/630.

Fase 4 — Consolidamento: site.css / site.js / pulizia

Split a tre livelli: design-system.css resta il layer token+componenti ds-*; nuovo site.css riceve tutto il blocco <style> inline (index.html:24–627) verbatim, ordine preservato; nuovo site.js riceve i due blocchi script (1073–1196).

1. <link rel="stylesheet" href="site.css"> dopo design-system.css (riga 23) — l'ordine del cascade è load-bearing (gli override .ds-hero__* vincono per ordine, non specificità).
2. <script src="site.js"></script> a fine body (zero-risk, le IIFE interrogano il DOM).
3. Dead code in design-system.css: rimuovere .ds-illustration/--sm (~774–785), @keyframes float (769–772, unico consumatore verificato), e la regola .ds-illustration nella media query 820px (~1193).
4. Cancellare assets/hero-orchestration.mp4 (orfano, 1 MB). Riscrivere assets/CREDITS.md: via la tabella Transhumans (PNG cancellati), credito a Mioya (dotcolon, SIL OFL) e nota che gli SVG sono originali.
5. Commit incluse le 6 cancellazioni PNG già staged.

Rischi: (a) ordine dei fogli di stile, (b) perdita di una media query nel trasloco. Le animazioni SMIL della board sono nel markup, non toccate. Mitigazione: copia byte-identica + screenshot diff prima/dopo.

Verifica (webapp-testing): screenshot full-page 1280 + 390; #orch-typed arriva a orchestrate --all entro ~4s; emulateMedia({reducedMotion:'reduce'}) → board statica; toggle audio flippa aria-pressed.

Fase 5 — Set icone brand

Nuova dir assets/icons/. Regole: viewBox 24×24, fill=none stroke=currentColor stroke-width=2 stroke-linecap=square stroke-linejoin=miter, 2px di padding, geometria ortogonale dove possibile, griglia pixel — terminali piatti e angoli vivi ereditano il linguaggio a blocchi del monogramma.

Icone (~12): mark (mini-monogramma "e" a blocchi per bullet/eyebrow), user (about), grid (progetti), layers (skills), clock (experience), mail, github, send (Telegram @Addr1000), x, linkedin, audio/audio-off (toggle), pin (location), arrow-right (sostituisce la "→" testuale nei bottoni "Esplora →", index.html:~846, 864).

Wiring: SVG inline in index.html nei punti d'uso (contact strip ~1023–1031, audio toggle ~1054); i file in assets/icons/ sono la fonte di verità e vengono mostrati in brand.html via <img>. Utility .icon { width:1em; height:1em; vertical-align:-0.125em; } in site.css.

Fase 6 — Style guide: brand.html

Root repo, linkata solo dal footer. Riusa design-system.css + site.css + <style> locale per gli helper (swatch, tabelle spec). Sezioni col pattern eyebrow/numero esistente:
1. Logo — monogramma, lockup, varianti su tile chiaro/ink; griglia modulare visibile (costruzione 120/20), clearspace (= un modulo), dimensioni minime (mark 16px, lockup 96px), don'ts (no rotazioni, no ricolorazioni fuori palette, non separare i blocchi, non arrotondare gli angoli).
2. Colori — griglia swatch dai token (nome, var CSS, hex, ruolo).
3. Tipografia — specimen Mioya + scala --text-* live, ruoli Inter/Lato/mono, regole di pairing.
4. Spaziatura & forme — barre --space-*, tile --radius-*, bordi/ombre.
5. Componenti — bottoni, pill, project card, spec card, timeline, contact strip live.
6. Icone — griglia Fase 5.
7. Motion — token durate/easing, policy reduced-motion, nota tema chiaro fisso.

Fase 7 — Sync su Claude Design

Bundle in design-sync/ (versionato). Ogni card = un HTML autonomo, prima riga <!-- @dsCard group="…" -->, CSS inline, token copiati da :root. Mioya embedded come data-URI base64 (woff2 ~55 KB → ~75 KB) nelle card che lo mostrano; Google Fonts via CDN link.

Card: brand-logo.html, brand-usage.html (group "Brand"), colors-palette.html ("Colors"), type-scale.html, type-ui.html ("Type"), components-buttons.html, components-cards.html, components-pills.html ("Components"), icons-set.html ("Icons").

Sequenza tool DesignSync (caricare lo schema via ToolSearch a inizio esecuzione): list_projects → create_project name "edi.md" → finalize_plan (path delle card + localDir = path assoluto di design-sync/) → write_files con localPath.

Fase 8 — Verifica finale e deploy

1. Serve locale + webapp-testing: screenshot / e /brand.html (desktop + 390px), pass reduced-motion, /favicon.ico + assets/favicon.svg + apple-touch-icon → 200, OG meta assoluti, hero anima, font computato dell'headline = Mioya.
2. git status pulito dagli orfani; un commit per fase.
3. Deploy preview con skill vercel:deploy, check OG sull'URL di preview, poi produzione.

File critici

- /home/edi/Scrivania/FAKTOTUM_project/edi.md-main/index.html (head 5–23, stili inline 24–627, hero SVG 669–757, contact strip 1013–1031, JS 1073–1196)
- /home/edi/Scrivania/FAKTOTUM_project/edi.md-main/design-system.css (@font-face 3–9, token 11–114, .ds-illustration morto 769–785, headline ~799)
- Nuovi: site.css, site.js, brand.html, assets/brand/* (canonico: mark.svg — monogramma "e" a blocchi), assets/icons/*, design-sync/*, favicon.ico, kit PNG in assets/

Riferimenti esterni (ricerca fatta, link verificati)

- Openlogos — monogrammi professionali open, riferimento di qualità: https://github.com/arasatasaygin/openlogos / https://openlogos.org/
- Libre Logos — loghi CC0 adattabili liberamente: https://github.com/enjeck/libre-logos
- Penpot Hub, template brand kit editabili in tool open source: https://penpot.app/penpothub/libraries-templates (repo file: https://github.com/penpot/penpot-files)
