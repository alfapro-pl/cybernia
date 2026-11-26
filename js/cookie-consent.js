/* [ZMIANA R3] Baner zgody na zewnętrzne treści (mapa Google) i mapa widoczna od razu po zaakceptowaniu.
 * - Bez zgody mapa się NIE ładuje (żadne dane nie trafiają do Google); jest przycisk „Pokaż mapę” na jednorazowe wczytanie.
 * - Wybór (Akceptuję / Odrzucam) zapisuje się w przeglądarce (localStorage, klucz "cybernia-zgoda") na 12 miesięcy.
 * - Zmiana decyzji: link „Ustawienia cookies” w stopce (albo adres index.html#ustawienia-cookies z polityki prywatności).
 * Zastępuje wcześniejszy plik js/map-consent.js ([ZMIANA R2]). */
(function () {
	'use strict';
	var KEY = 'cybernia-zgoda';
	var MAX_AGE = 365 * 24 * 60 * 60 * 1000; // 12 miesięcy

	var box = document.getElementById('map-box');
	var banner = document.getElementById('cookie-banner');
	if (!box || !banner) { return; }
	var original = box.innerHTML; // zawartość „przed zgodą” – do przywrócenia po cofnięciu zgody

	function readChoice() {
		try {
			var d = JSON.parse(localStorage.getItem(KEY) || 'null');
			if (d && typeof d.maps === 'boolean' && typeof d.t === 'number' && Date.now() - d.t < MAX_AGE) { return d.maps; }
		} catch (e) { /* brak dostępu do pamięci przeglądarki – baner pokaże się przy każdej wizycie */ }
		return null;
	}
	function saveChoice(v) {
		try { localStorage.setItem(KEY, JSON.stringify({ v: 1, maps: v, t: Date.now() })); } catch (e) { /* ignorujemy */ }
	}

	function loadMap() {
		var src = box.getAttribute('data-map-src');
		// tylko adresy map Google
		if (!/^https:\/\/www\.google\.com\/maps\?/.test(src || '')) { return; }
		if (box.querySelector('iframe')) { return; }
		var f = document.createElement('iframe');
		f.className = 'map';
		f.title = box.getAttribute('data-map-title') || 'Mapa dojazdu';
		f.src = src;
		f.referrerPolicy = 'no-referrer-when-downgrade';
		f.setAttribute('allowfullscreen', '');
		while (box.firstChild) { box.removeChild(box.firstChild); }
		box.classList.add('is-loaded');
		box.appendChild(f);
	}
	function unloadMap() {
		if (!box.querySelector('iframe')) { return; }
		box.classList.remove('is-loaded');
		box.innerHTML = original;
		bindPlaceholder();
	}
	function bindPlaceholder() {
		var b = document.getElementById('map-load');
		if (!b) { return; }
		b.hidden = false; // bez JS przycisku nie ma – zostaje tylko link do Google Maps
		b.addEventListener('click', function () { loadMap(); var f = box.querySelector('iframe'); if (f) { f.focus(); } });
	}

	function showBanner(focus) {
		banner.hidden = false;
		if (focus) { var a = document.getElementById('cookie-accept'); if (a) { a.focus(); } }
	}
	function hideBanner() { banner.hidden = true; }

	document.getElementById('cookie-accept').addEventListener('click', function () {
		saveChoice(true); hideBanner(); loadMap();
	});
	document.getElementById('cookie-reject').addEventListener('click', function () {
		saveChoice(false); hideBanner(); unloadMap();
	});
	var settings = document.getElementById('cookie-settings');
	if (settings) {
		settings.addEventListener('click', function (e) { e.preventDefault(); showBanner(true); });
	}

	bindPlaceholder();
	var choice = readChoice();
	if (choice === true) { loadMap(); }
	if (choice === null) { showBanner(false); }
	if (location.hash === '#ustawienia-cookies') { showBanner(true); }
})();
