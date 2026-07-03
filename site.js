    (function () {
      var audio = document.getElementById('bg-audio');
      var toggle = document.getElementById('audio-toggle');

      if (!audio || !toggle) return;

      function updateButton() {
        toggle.setAttribute('aria-pressed', audio.muted ? 'false' : 'true');
        toggle.setAttribute('aria-label', audio.muted ? 'Attiva audio' : 'Disattiva audio');
        toggle.classList.toggle('is-muted', audio.muted);
        toggle.classList.toggle('is-playing', !audio.muted);
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

      // Terminale hero: typing loop
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

      // Readout: orologio locale
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
