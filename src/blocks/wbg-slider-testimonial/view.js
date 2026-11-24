// WBG - Slider - Testimonial
//
// Fading slider: every slide is stacked in the same spot and only the
// active one is visible. The old slide fades out, then the new one fades in
// (timing lives in style.scss). Arrows loop from the last slide back to the
// first. The static heading/text/buttons never move.
//
// Uses its own data-wbg-slider-testimonial-* hooks so it never picks up the
// Curve sliders' markup (and vice versa).

const STATUS_DELAY = 400; // ms to wait before announcing a slide change.
const SWIPE_THRESHOLD = 40; // px of horizontal movement that counts as a swipe.

function initSlider(root) {
	if (root.dataset.wbgSliderTestimonialReady) {
		return;
	}

	const track = root.querySelector("[data-wbg-slider-testimonial-track]");
	if (!track) {
		root.classList.add("is-ready");
		return;
	}

	// Each direct child of the track is one slide.
	const slides = Array.from(track.children);
	if (slides.length < 2) {
		root.classList.add("is-ready");
		slides[0]?.classList.add("is-active");
		return;
	}

	root.dataset.wbgSliderTestimonialReady = "true";

	const prevButton = root.querySelector("[data-wbg-slider-testimonial-prev]");
	const nextButton = root.querySelector("[data-wbg-slider-testimonial-next]");
	const status = root.querySelector("[data-wbg-slider-testimonial-status]");
	const statusTemplate =
		root.dataset.statusTemplate || "Testimonial {current} of {total}";
	const slideLabel = root.dataset.slideLabel || "testimonial";

	const total = slides.length;
	let current = 0;
	let statusTimer = null;

	const formatStatus = (index) =>
		statusTemplate.replace("{current}", index + 1).replace("{total}", total);

	// Label each slide for assistive tech.
	slides.forEach((slide, i) => {
		slide.setAttribute("role", "group");
		slide.setAttribute("aria-roledescription", slideLabel);
		slide.setAttribute("aria-label", formatStatus(i));
	});

	const announce = (index) => {
		if (!status) {
			return;
		}
		clearTimeout(statusTimer);
		statusTimer = setTimeout(() => {
			status.textContent = formatStatus(index);
		}, STATUS_DELAY);
	};

	const setActive = (index, shouldAnnounce = true) => {
		current = (index + total) % total;

		slides.forEach((slide, i) => {
			const isActive = i === current;
			slide.classList.toggle("is-active", isActive);
			// Hidden slides can't be focused or read out.
			slide.inert = !isActive;
			if (isActive) {
				slide.removeAttribute("aria-hidden");
			} else {
				slide.setAttribute("aria-hidden", "true");
			}
		});

		if (shouldAnnounce) {
			announce(current);
		}
	};

	prevButton?.addEventListener("click", () => setActive(current - 1));
	nextButton?.addEventListener("click", () => setActive(current + 1));

	// Left/right arrow keys while focus is on either arrow button.
	root.addEventListener("keydown", (event) => {
		if (
			!event.target.closest(
				"[data-wbg-slider-testimonial-prev], [data-wbg-slider-testimonial-next]",
			)
		) {
			return;
		}
		if ("ArrowLeft" === event.key) {
			event.preventDefault();
			setActive(current - 1);
		} else if ("ArrowRight" === event.key) {
			event.preventDefault();
			setActive(current + 1);
		}
	});

	// Swipe on touch / pen devices.
	let startX = null;
	let startY = null;

	track.addEventListener("pointerdown", (event) => {
		if ("mouse" === event.pointerType) {
			return;
		}
		startX = event.clientX;
		startY = event.clientY;
	});

	track.addEventListener("pointerup", (event) => {
		if (null === startX) {
			return;
		}
		const deltaX = event.clientX - startX;
		const deltaY = event.clientY - startY;
		startX = null;
		startY = null;

		if (
			Math.abs(deltaX) > SWIPE_THRESHOLD &&
			Math.abs(deltaX) > Math.abs(deltaY)
		) {
			setActive(deltaX < 0 ? current + 1 : current - 1);
		}
	});

	track.addEventListener("pointercancel", () => {
		startX = null;
		startY = null;
	});

	setActive(0, false);
	root.classList.add("is-ready");
}

function initAll() {
	document
		.querySelectorAll("[data-wbg-slider-testimonial]")
		.forEach(initSlider);
}

if ("loading" === document.readyState) {
	document.addEventListener("DOMContentLoaded", initAll);
} else {
	initAll();
}
