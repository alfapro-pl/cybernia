/* [ZMIANA G5] Formularz kontaktowy bez serwera i bez usług zewnętrznych (GitHub Pages nie uruchamia PHP).
 * Po kliknięciu przycisku strona NIC nie wysyła: otwiera program pocztowy użytkownika z gotową wiadomością
 * (odnośnik mailto:). Użytkownik sam sprawdza treść i klika „Wyślij” w swoim programie.
 * Gdy program pocztowy się nie otworzy (albo wiadomość jest za długa na odnośnik mailto:), pod formularzem pojawia się
 * pole z gotową treścią i przycisk „Skopiuj treść”. Adres e-mail jest składany ze skrótu, żeby nie leżał w kodzie jako gotowy tekst.
 * Zastępuje dotychczasowy js/ajax-form.js (Formspree, [ZMIANA G1]). */
$(function () {
	var form = document.getElementById('contact-form');
	if (!form) { return; }

	var ADDR = ['kontakt', 'cybernia.pl'].join('@');
	var MAX_URL = 1800; // bezpieczny limit długości odnośnika mailto: (przeglądarki i programy pocztowe różnie ucinają dłuższe)

	var msg = form.querySelector('.ajax-response');
	var box = document.getElementById('mail-fallback');
	var copyArea = document.getElementById('mail-copy');
	var copyBtn = document.getElementById('mail-copy-btn');
	var addrSpan = document.getElementById('mail-addr');
	if (addrSpan) { addrSpan.textContent = ADDR; }

	function val(id) { return (document.getElementById(id).value || '').trim(); }
	function say(text, cls) {
		msg.className = 'ajax-response' + (cls ? ' ' + cls : '');
		msg.textContent = text;
	}

	form.addEventListener('submit', function (e) {
		e.preventDefault(); // natywną walidację (required, type, pattern) przeglądarka wykonuje przed tym zdarzeniem

		var subject = 'Formularz www: ' + val('cf-subject');
		var body =
			'Imię i nazwisko: ' + val('cf-name') + '\r\n' +
			'E-mail: ' + val('cf-email') + '\r\n' +
			'Telefon: ' + val('cf-phone') + '\r\n' +
			'Temat: ' + val('cf-subject') + '\r\n\r\n' +
			'Wiadomość:\r\n' + val('cf-message').replace(/\r?\n/g, '\r\n') + '\r\n';

		var url = 'mailto:' + ADDR + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

		// pole z gotową treścią – zawsze przygotowane, pokazujemy je, gdy może się przydać
		copyArea.value = 'Do: ' + ADDR + '\r\nTemat: ' + subject + '\r\n\r\n' + body;

		if (url.length > MAX_URL) {
			box.hidden = false;
			say('Wiadomość jest zbyt długa, aby otworzyć ją automatycznie w programie pocztowym. Skopiuj treść poniżej i wyślij ją na adres ' + ADDR + '.', 'error');
			return;
		}
		say('Otwieramy Twój program pocztowy z gotową wiadomością. Sprawdź ją i kliknij „Wyślij” w swoim programie – dopiero wtedy wiadomość do nas trafi.', 'success');
		box.hidden = false;
		// otwarcie odnośnika mailto: (zachowuje się jak kliknięcie linku „napisz e-mail”)
		var a = document.createElement('a');
		a.href = url;
		a.style.display = 'none';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	});

	if (copyBtn) {
		copyBtn.addEventListener('click', function () {
			function done() { copyBtn.textContent = 'Skopiowano'; setTimeout(function () { copyBtn.textContent = 'Skopiuj treść'; }, 2500); }
			if (navigator.clipboard && window.isSecureContext) {
				navigator.clipboard.writeText(copyArea.value).then(done, function () { copyArea.select(); });
			} else {
				copyArea.select();
				try { if (document.execCommand('copy')) { done(); } } catch (err) { /* użytkownik skopiuje ręcznie */ }
			}
		});
	}
});
