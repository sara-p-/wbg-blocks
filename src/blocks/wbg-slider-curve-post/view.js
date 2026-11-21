// WBG - Slider - Curve - Post
//
// Fading slider: every slide is stacked in the same spot and only the
// active one is visible. The old slide fades out, then the new one fades in
// (timing lives in style.scss). Arrows loop from the last slide back to the
// first.
//
// Uses its own data-wbg-slider-post-* hooks so it never picks up the
// Slider - Curve or Slider - Curve - Full blocks' markup (and vice versa).
//
// No autoplay: slides only change when the user clicks an arrow, presses
// the left/right keys on an arrow, or swipes.
//
// State lives in data attributes, not generic classes like is-active /
// is-ready, so other scripts on the page (theme sliders, tabs, etc.) can't
// show, hide or cycle these slides.

const STATUS_DELAY = 400; // ms to wait before announcing a slide change.
const SWIPE_THRESHOLD = 40; // px of horizontal movement that counts as a swipe.

function initSlider(root) {
	if (undefined !== root.dataset.wbgSliderPostReady) {
		return;
	}

	const track = root.querySelector("[data-wbg-slider-post-track]");
	if (!track) {
		return;
	}

	// Each direct child of the track is one slide.
	const slides = Array.from(track.children);
	// One slide: just show it. No arrows, labels or swipe needed.
	if (slides.length < 2) {
		slides[0]?.setAttribute("data-wbg-slider-post-active", "");
		root.dataset.wbgSliderPostReady = "";
		return;
	}

	const prevButton = root.querySelector("[data-wbg-slider-post-prev]");
	const nextButton = root.querySelector("[data-wbg-slider-post-next]");
	const status = root.querySelector("[data-wbg-slider-post-status]");
	const statusTemplate =
		root.dataset.statusTemplate || "Slide {current} of {total}";
	const slideLabel = root.dataset.slideLabel || "slide";

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
			slide.toggleAttribute("data-wbg-slider-post-active", isActive);
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
				"[data-wbg-slider-post-prev], [data-wbg-slider-post-next]",
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
	root.dataset.wbgSliderPostReady = "";
}

function initAll() {
	document.querySelectorAll("[data-wbg-slider-post]").forEach(initSlider);
}

if ("loading" === document.readyState) {
	document.addEventListener("DOMContentLoaded", initAll);
} else {
	initAll();
}
