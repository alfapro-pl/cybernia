/* [ZMIANA N1] Aktualności z LinkedIn.
 * Czyta data/articles.json i buduje karty prowadzące do wpisów na LinkedIn.
 * Brak API i brak skryptów LinkedIn: lista jest utrzymywana ręcznie (zgodnie z zasadami LinkedIn),
 * a kliknięcie otwiera oryginalny wpis na LinkedIn. Pusta lista lub błąd = sekcja pozostaje ukryta.
 * Tekst jest wstawiany przez textContent (bez ryzyka wstrzyknięcia HTML); dozwolone są tylko adresy https.
 * [ZMIANA N2] Opcjonalne pole "embed" (np. "urn:li:share:7496927954870886401"): karta dostaje przycisk „Pokaż wpis tutaj”.
 * Oficjalne osadzenie LinkedIn (iframe) wczytuje się DOPIERO po kliknięciu, więc bez zgody nie ma połączenia z LinkedIn. */
(function () {
	'use strict';
	var list = document.getElementById('news-list');
	var section = document.getElementById('aktualnosci');
	// Przeglądarki nie pozwalają wczytać pliku JSON przy otwarciu strony wprost z dysku (file://) – wtedy sekcja zostaje ukryta.
	// Aby ją zobaczyć lokalnie, uruchom stronę przez serwer (np. rozszerzenie Live Server w VS Code).
	if (!list || !section || !window.fetch || location.protocol === 'file:') { return; }

	function el(tag, cls, text) {
		var n = document.createElement(tag);
		if (cls) { n.className = cls; }
		if (text) { n.textContent = text; }
		return n;
	}
	function isHttps(u) { return typeof u === 'string' && /^https:\/\//i.test(u); }
	function localImage(u) { return typeof u === 'string' && /^img\/[\w\-\/.]+\.(jpe?g|png|webp|avif)$/i.test(u); }
	function validUrn(u) { return typeof u === 'string' && /^urn:li:(share|ugcPost|activity):[0-9]{10,25}$/.test(u); }
	function fmt(d) {
		var t = new Date(d + 'T00:00:00');
		return isNaN(t) ? '' : t.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
	}

	fetch(list.getAttribute('data-source'), { cache: 'no-cache' })
		.then(function (r) { if (!r.ok) { throw new Error(r.status); } return r.json(); })
		.then(function (items) {
			var limit = parseInt(list.getAttribute('data-limit'), 10) || 6;
			items = (Array.isArray(items) ? items : [])
				.filter(function (a) { return a && a.title && isHttps(a.url); })
				.sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); })
				.slice(0, limit);
			if (!items.length) { return; }

			items.forEach(function (a) {
				var col = el('div', 'col-lg-4 col-md-6 mb-30');
				var withEmbed = validUrn(a.embed);
				// karta z osadzeniem to <div> (przycisk nie może leżeć wewnątrz linku), zwykła karta to cały klikalny link
				var card = withEmbed ? el('div', 'news-card news-embed') : el('a', 'news-card');
				if (!withEmbed) {
					card.href = a.url;
					card.target = '_blank';
					card.rel = 'noopener noreferrer';
				}
				if (localImage(a.image)) {
					var img = el('img');
					img.src = a.image;
					img.alt = a.imageAlt || '';
					img.loading = 'lazy';
					card.appendChild(img);
				}
				var body = el('div', 'news-body');
				if (a.date && fmt(a.date)) {
					var time = el('time', 'news-date', fmt(a.date));
					time.setAttribute('datetime', a.date);
					body.appendChild(time);
				}
				body.appendChild(el('h3', '', a.title));
				if (a.excerpt) { body.appendChild(el('p', '', a.excerpt)); }
				if (withEmbed) {
					var actions = el('div', 'news-actions');
					var btn = el('button', 'news-load', 'Pokaż wpis tutaj');
					btn.type = 'button';
					var holder = el('div', 'news-frame');
					btn.addEventListener('click', function () {
						var f = document.createElement('iframe');
						f.src = 'https://www.linkedin.com/embed/feed/update/' + a.embed + '?collapsed=1';
						f.title = 'Osadzony wpis z LinkedIn: ' + a.title;
						f.loading = 'lazy';
						f.referrerPolicy = 'strict-origin-when-cross-origin';
						f.setAttribute('allowfullscreen', '');
						holder.appendChild(f);
						btn.hidden = true;
					});
					var open = el('a', 'news-more', 'Otwórz na LinkedIn →');
					open.href = a.url; open.target = '_blank'; open.rel = 'noopener noreferrer';
					open.appendChild(el('span', 'sr-only', ' (otwiera się w nowej karcie)'));
					actions.appendChild(btn);
					actions.appendChild(open);
					body.appendChild(actions);
					body.appendChild(el('p', 'news-note', 'Po kliknięciu wpis wczyta się z serwerów LinkedIn (szczegóły w polityce prywatności).'));
					body.appendChild(holder);
				} else {
					var more = el('span', 'news-more', 'Czytaj na LinkedIn →');
					more.appendChild(el('span', 'sr-only', ' (otwiera się w nowej karcie)'));
					body.appendChild(more);
				}
				card.appendChild(body);
				col.appendChild(card);
				list.appendChild(col);
			});

			section.hidden = false;
			var link = document.getElementById('aktualnosci-link');
			if (link) { link.hidden = false; }
		})
		.catch(function () { /* brak pliku lub błąd sieci: sekcja zostaje ukryta */ });
})();
