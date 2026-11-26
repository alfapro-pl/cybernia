(function ($) {
"use strict";

// One Page Nav
var top_offset = $('.header-area').height() - 100;
$('.main-menu nav ul').onePageNav({
	currentClass: 'active',
	scrollOffset: top_offset,
});

// sticky
// [ZMIANA C2] toggleClass zamiast if/else – to samo zachowanie, krócej
$(window).on('scroll', function () {
	$("#header-sticky").toggleClass("sticky-menu", $(window).scrollTop() >= 200);
});

// RESPONSIVE MENU
// [ZMIANA A1] Przycisk (button) zamiast div + aria-expanded; Esc zamyka menu
var $menuBtn = $('#menu-toggle');
var $menu = $('#mobile-menu');
function closeMenu() {
	$menu.slideUp();
	$menuBtn.attr('aria-expanded', 'false');
}
$menuBtn.on('click', function () {
	var open = $menuBtn.attr('aria-expanded') === 'true';
	$menuBtn.attr('aria-expanded', open ? 'false' : 'true');
	$menu.slideToggle();
});
$(document).on('keydown', function (e) {
	if (e.key === 'Escape' && $menuBtn.attr('aria-expanded') === 'true') {
		closeMenu();
		$menuBtn.trigger('focus');
	}
});

// menu toggle
$(".main-menu li a").on('click', function () {
	if ($(window).width() < 1200) {
		closeMenu();
	}
});

// [ZMIANA B8] Po zwinięciu menu na wąskim ekranie slideUp zostawiał inline display:none.
// Po powiększeniu okna (>= 1200 px) menu pozostawało niewidoczne. Czyścimy styl przy zmianie rozmiaru.
$(window).on('resize', function () {
	if ($(window).width() >= 1200) {
		$menu.removeAttr('style');
		$menuBtn.attr('aria-expanded', 'false');
	}
});

// smoth scroll
// [ZMIANA A3] Przewijanie przenosi też fokus na sekcję (klawiatura / czytnik ekranu), respektuje
// prefers-reduced-motion i nie wywala błędu, gdy cel nie istnieje.
$(function () {
	$('a.smoth-scroll').on('click', function (event) {
		var $target = $($(this).attr('href'));
		if (!$target.length) { return; }
		event.preventDefault();
		var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		$('html, body').stop().animate({
			scrollTop: $target.offset().top - 100
		}, reduce ? 0 : 1000).promise().done(function () {
			if (!$target.attr('tabindex')) { $target.attr('tabindex', '-1'); }
			$target[0].focus({ preventScroll: true });
		});
	});
});

// mainSlider
function mainSlider() {
	var BasicSlider = $('.slider-active');
	BasicSlider.on('init', function (e, slick) {
		var $firstAnimatingElements = $('.single-slider:first-child').find('[data-animation]');
		doAnimations($firstAnimatingElements);
	});
	BasicSlider.on('beforeChange', function (e, slick, currentSlide, nextSlide) {
		var $animatingElements = $('.single-slider[data-slick-index="' + nextSlide + '"]').find('[data-animation]');
		doAnimations($animatingElements);
	});
	BasicSlider.slick({
		autoplay: true,
		autoplaySpeed: 10000,
		dots: false,
		fade: true,
		arrows: true,
		prevArrow: '<button type="button" class="slick-prev"><i class="icon dripicons-chevron-left"></i></button>',
		nextArrow: '<button type="button" class="slick-next"><i class="icon dripicons-chevron-right"></i></button>',
		responsive: [
			{ breakpoint: 1200, settings: { dots: false, arrows: false } }
		]
	});

	function doAnimations(elements) {
		var animationEndEvents = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
		elements.each(function () {
			var $this = $(this);
			var $animationDelay = $this.data('delay');
			var $animationType = 'animated ' + $this.data('animation');
			$this.css({
				'animation-delay': $animationDelay,
				'-webkit-animation-delay': $animationDelay
			});
			$this.addClass($animationType).one(animationEndEvents, function () {
				$this.removeClass($animationType);
			});
		});
	}
}
mainSlider();

// [ZMIANA P1] Usunięto inicjalizacje wtyczek, których elementów nie ma na stronie
// (.services-active, .testimonial-active, .blog-active, .popup-image, .popup-video,
// .paroller, #parallax, .grid / isotope, .button-group). Wołały nieistniejące elementy
// i wymuszały ładowanie ~130 KB zbędnego JS.

// brand-active
$('.brand-active').slick({
	dots: false,
	infinite: true,
	arrows: false,
	speed: 1000,
	slidesToShow: 6,
	slidesToScroll: 2,
	responsive: [
		{
			breakpoint: 1500,
			settings: {
				slidesToShow: 6,
				slidesToScroll: 3,
				infinite: true,
			}
		},
		{
			breakpoint: 1200,
			settings: {
				slidesToShow: 5,
				slidesToScroll: 3,
				infinite: true,
			}
		},
		{
			breakpoint: 992,
			settings: {
				slidesToShow: 3,
				slidesToScroll: 1
			}
		},
		{
			breakpoint: 767,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 1
			}
		},
		{
			breakpoint: 480,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1
			}
		}
	]
});

// counterUp
// [ZMIANA S4] Wtyczki jquery.counterup + jquery.waypoints 2.x przestają działać z jQuery 3 (używają usuniętego $(window).load()).
// Zamiast dokładać kolejne biblioteki: ten sam efekt (liczba narasta od 0 w ok. 1 s po wejściu w widok) na IntersectionObserver.
// Bez obsługi IntersectionObserver albo przy prefers-reduced-motion zostaje od razu wartość końcowa z HTML.
(function () {
	var els = document.querySelectorAll('.count');
	var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (!els.length || reduce || !('IntersectionObserver' in window)) { return; }

	function animate(el) {
		var finalText = el.textContent;
		var target = parseInt(finalText.replace(/\s/g, ''), 10);
		if (isNaN(target)) { return; }
		var start = null, duration = 1000;
		el.textContent = '0';
		function step(ts) {
			if (start === null) { start = ts; }
			var k = Math.min((ts - start) / duration, 1);
			el.textContent = k < 1 ? String(Math.round(target * k)) : finalText;
			if (k < 1) { window.requestAnimationFrame(step); }
		}
		window.requestAnimationFrame(step);
	}

	var io = new IntersectionObserver(function (entries) {
		entries.forEach(function (entry) {
			if (entry.isIntersecting) { io.unobserve(entry.target); animate(entry.target); }
		});
	}, { threshold: 0.6 });
	Array.prototype.forEach.call(els, function (el) { io.observe(el); });
})();

// service active
$('.s-single-services').on('mouseenter', function () {
	$(this).addClass('active').parent().siblings().find('.s-single-services').removeClass('active');
});

// scrollToTop
// [ZMIANA C2] Poprawione nazwy opcji wtyczki scrollUp v2.4.1 (topDistance/topSpeed/animationInSpeed
// były ignorowane; wartości poniżej odpowiadają dotychczasowym domyślnym) + dostępna nazwa przycisku.
$.scrollUp({
	scrollName: 'scrollUp',
	scrollDistance: 300,
	scrollSpeed: 300,
	animation: 'fade',
	animationSpeed: 200,
	scrollText: '<i class="fal fa-level-up-alt" aria-hidden="true"></i>', // [ZMIANA T6] fal zamiast fas (bez pliku solid)
	scrollTitle: 'Wróć na górę strony',
	activeOverlay: false
});

// typed
$(".element").each(function () {
	var a = $(this);
	a.typed({
		strings: a.attr("data-elements").split(","),
		typeSpeed: 100,
		backDelay: 3e3
	});
});

// WOW active
new WOW().init();

})(jQuery);
