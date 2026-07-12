    (function () {
      var audio = document.getElementById('bg-audio');
      var toggle = document.getElementById('audio-toggle');
      var panel = document.getElementById('audio-panel');
      var nowEl = document.getElementById('audio-now');
      var listEl = document.getElementById('audio-list');
      var prevBtn = document.getElementById('audio-prev');
      var nextBtn = document.getElementById('audio-next');

      if (!audio || !toggle || !panel || !nowEl || !listEl || !prevBtn || !nextBtn) return;

      var TRACKS = [
        { title: 'Calm',           src: 'assets/audio/calm.mp3' },
        { title: 'Celtik Spoon',   src: 'assets/audio/Celtik spoon.mp3' },
        { title: 'Down Bad Again', src: 'assets/audio/Down bad again.mp3' },
        { title: 'Progressive',    src: 'assets/audio/progressive.mp3' },
        { title: 'Reborn',         src: 'assets/audio/Reborn.mp3' },
        { title: 'Vibrate',        src: 'assets/audio/Vibrate.mp3' }
      ];
      var trackButtons = Array.prototype.slice.call(listEl.querySelectorAll('.audio-player__track'));
      var currentIndex = 0;

      function loadTrack(index, autoplayIfUnmuted) {
        currentIndex = index;
        audio.src = TRACKS[index].src;
        nowEl.textContent = TRACKS[index].title;
        trackButtons.forEach(function (btn, i) {
          var active = i === index;
          btn.classList.toggle('is-active', active);
          if (active) {
            btn.setAttribute('aria-current', 'true');
          } else {
            btn.removeAttribute('aria-current');
          }
        });
        if (autoplayIfUnmuted && !audio.muted) {
          audio.play().catch(function () {});
        }
      }

      function updateButton() {
        toggle.setAttribute('aria-pressed', audio.muted ? 'false' : 'true');
        toggle.setAttribute('aria-label', audio.muted ? 'Attiva audio' : 'Disattiva audio');
        toggle.classList.toggle('is-muted', audio.muted);
        toggle.classList.toggle('is-playing', !audio.muted);
      }

      // Selezione esplicita di una traccia: attiva sempre l'audio
      function selectTrack(index) {
        if (audio.muted) {
          audio.muted = false;
          updateButton();
        }
        loadTrack(index, true);
      }

      // Parte sempre muto (autoplay garantito), primo click dell'utente sblocca l'audio
      audio.play().catch(function () {});

      toggle.addEventListener('click', function () {
        if (audio.muted) {
          audio.muted = false;
          updateButton();
          audio.play().catch(function () {});
        } else {
          audio.muted = true;
          updateButton();
        }
      });

      audio.addEventListener('volumechange', updateButton);

      prevBtn.addEventListener('click', function () {
        selectTrack((currentIndex - 1 + TRACKS.length) % TRACKS.length);
      });

      nextBtn.addEventListener('click', function () {
        selectTrack((currentIndex + 1) % TRACKS.length);
      });

      trackButtons.forEach(function (btn, i) {
        btn.addEventListener('click', function () {
          selectTrack(i);
        });
      });

      audio.addEventListener('ended', function () {
        loadTrack((currentIndex + 1) % TRACKS.length, true);
      });

      // Feedback di buffering: "…" accanto al titolo finché la traccia non suona
      audio.addEventListener('waiting', function () {
        nowEl.classList.add('is-loading');
      });
      audio.addEventListener('playing', function () {
        nowEl.classList.remove('is-loading');
      });
    })();

    (function () {
      var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Rotator con effetto scramble/decode
      var rotator = document.getElementById('rotator');
      if (rotator && !prefersReducedMotion) {
        var words = ['agenti AI', 'prompt', 'workflow'];
        var index = 0;
        var glyphs = '!<>-_\\/[]{}=+*^?#01';

        function scrambleTo(word) {
          var frame = 0;
          var totalFrames = Math.max(14, word.length * 3);
          var timer = setInterval(function () {
            var out = '';
            for (var i = 0; i < word.length; i++) {
              var reveal = (frame / totalFrames) * word.length * 1.4;
              if (i < reveal) {
                out += word[i];
              } else {
                out += glyphs[Math.floor(Math.random() * glyphs.length)];
              }
            }
            rotator.textContent = out;
            frame++;
            if (frame > totalFrames) {
              clearInterval(timer);
              rotator.textContent = word;
            }
          }, 34);
        }

        setInterval(function () {
          index = (index + 1) % words.length;
          scrambleTo(words[index]);
        }, 3000);
      }

      // Pannello di comando: typing loop
      var typed = document.getElementById('orch-typed');
      if (typed) {
        var cmd = 'orchestrate --all';
        if (prefersReducedMotion) {
          typed.textContent = cmd;
        } else {
          var pos = 0;
          var deleting = false;
          function typeStep() {
            typed.textContent = cmd.slice(0, pos);
            var delay;
            if (!deleting) {
              pos++;
              delay = 65 + Math.random() * 70;
              if (pos > cmd.length) { deleting = true; delay = 2600; }
            } else {
              pos--;
              delay = 28;
              if (pos < 0) { deleting = false; pos = 0; delay = 700; }
            }
            setTimeout(typeStep, delay);
          }
          typeStep();
        }
      }

      // Readout: orologio locale (strumentazione della legenda)
      var timeEl = document.getElementById('readout-time');
      if (timeEl) {
        function tick() {
          var now = new Date();
          var offset = -now.getTimezoneOffset() / 60;
          var gmt = 'GMT' + (offset >= 0 ? '+' : '') + offset;
          var hh = String(now.getHours()).padStart(2, '0');
          var mm = String(now.getMinutes()).padStart(2, '0');
          timeEl.textContent = gmt + ' IT ' + hh + ':' + mm;
        }
        tick();
        setInterval(tick, 15000);
      }

      // Readout: coordinate puntatore
      var posEl = document.getElementById('readout-pos');
      if (posEl && !prefersReducedMotion) {
        document.addEventListener('pointermove', function (e) {
          posEl.textContent =
            String(Math.round(e.clientX)).padStart(4, '0') + ' X ' +
            String(Math.round(e.clientY)).padStart(4, '0') + ' Y';
        }, { passive: true });
      }
    })();

    (function () {
      // Reveal ink-on nodo-per-nodo (macrostruttura Map/Diagram, max 5 nodi).
      // One-shot; disattivato sotto 40rem e con prefers-reduced-motion.
      // Si attenuano solo i nodi sotto la piega; fallback passivo su scroll
      // per gli ambienti dove IntersectionObserver non scatta (tab nascoste).
      var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var wide = window.matchMedia('(min-width: 40rem)').matches;
      if (reduced || !wide || !('IntersectionObserver' in window)) return;

      var targets = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'))
        .filter(function (t) {
          return t.getBoundingClientRect().top > window.innerHeight * 0.85;
        });
      if (!targets.length) return;

      targets.forEach(function (t) { t.classList.add('is-dim'); });

      function show(el) {
        el.classList.remove('is-dim');
        io.unobserve(el);
        targets = targets.filter(function (t) { return t !== el; });
        if (!targets.length) {
          window.removeEventListener('scroll', onScroll);
        }
      }

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) show(entry.target);
        });
      }, { threshold: 0.15 });

      targets.forEach(function (t) { io.observe(t); });

      var ticking = false;
      function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          ticking = false;
          targets.slice().forEach(function (t) {
            var r = t.getBoundingClientRect();
            if (r.top < window.innerHeight * 0.85 && r.bottom > 0) show(t);
          });
        });
      }
      window.addEventListener('scroll', onScroll, { passive: true });
    })();

    (function () {
      // Archi della mappa: hub → nodi, disegnati sul layer SVG (solo ≥ 60rem).
      // Le linee passano dietro ai nodi (superfici opache): niente routing fine.
      var map = document.getElementById('map');
      var svg = document.getElementById('map-edges');
      if (!map || !svg) return;

      var mq = window.matchMedia('(min-width: 60rem)');

      // [sorgente, destinazione, frazione-x sul bordo inferiore sorgente, frazione-x sul bordo superiore destinazione]
      var EDGES = [
        ['hub', 'about', 0.18, 0.7],
        ['hub', 'projects', 0.45, 0.5],
        ['hub', 'skills', 0.8, 0.55],
        ['projects', 'experience', 0.12, 0.1]
      ];

      function draw() {
        if (!mq.matches) { svg.innerHTML = ''; return; }
        var mr = map.getBoundingClientRect();
        if (mr.width === 0) return;
        svg.setAttribute('viewBox', '0 0 ' + Math.round(mr.width) + ' ' + Math.round(mr.height));
        var parts = [];

        EDGES.forEach(function (edge) {
          var s = document.getElementById(edge[0]);
          var t = document.getElementById(edge[1]);
          if (!s || !t) return;
          var sr = s.getBoundingClientRect();
          var tr = t.getBoundingClientRect();
          var sx = sr.left - mr.left + sr.width * edge[2];
          var sy = sr.bottom - mr.top - 8;
          var tx = tr.left - mr.left + tr.width * edge[3];
          var ty = tr.top - mr.top - 1;
          if (ty <= sy) return;
          var g = Math.max(24, (ty - sy) * 0.45);
          parts.push(
            '<path class="map-edge" d="M ' + sx.toFixed(1) + ' ' + sy.toFixed(1) +
            ' C ' + sx.toFixed(1) + ' ' + (sy + g).toFixed(1) +
            ', ' + tx.toFixed(1) + ' ' + (ty - g).toFixed(1) +
            ', ' + tx.toFixed(1) + ' ' + ty.toFixed(1) + '" />'
          );
          parts.push(
            '<rect class="map-edge--diamond" x="' + (sx - 3.5).toFixed(1) + '" y="' + (sy - 3.5).toFixed(1) +
            '" width="7" height="7" transform="rotate(45 ' + sx.toFixed(1) + ' ' + sy.toFixed(1) + ')" />'
          );
        });

        svg.innerHTML = parts.join('');
      }

      var timer = null;
      function schedule() {
        clearTimeout(timer);
        timer = setTimeout(draw, 120);
      }

      draw();
      window.addEventListener('load', draw);
      window.addEventListener('resize', schedule, { passive: true });
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(draw);
      }
    })();
