// WBG - Slider - Curve
//
// Fading slider: every slide is stacked in the same spot and only the
// active one is visible. Arrows loop from the last slide back to the first.

const STATUS_DELAY = 400; // ms to wait before announcing a slide change.
const SWIPE_THRESHOLD = 40; // px of horizontal movement that counts as a swipe.

function initSlider(root) {
	if (root.dataset.wbgSliderReady) {
		return;
	}

	const track = root.querySelector("[data-wbg-slider-track]");
	if (!track) {
		return;
	}

	// Each direct child of the track is one slide.
	const slides = Array.from(track.children);
	if (slides.length < 2) {
		return;
	}

	root.dataset.wbgSliderReady = "true";

	const viewport = root.querySelector(".wbg-slider-curve-child__viewport");
	const prevButton = root.querySelector("[data-wbg-slider-prev]");
	const nextButton = root.querySelector("[data-wbg-slider-next]");
	const status = root.querySelector("[data-wbg-slider-status]");
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

	// Swipe on touch / pen devices.
	if (viewport) {
		let startX = null;
		let startY = null;

		viewport.addEventListener("pointerdown", (event) => {
			if ("mouse" === event.pointerType) {
				return;
			}
			startX = event.clientX;
			startY = event.clientY;
		});

		viewport.addEventListener("pointerup", (event) => {
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

		viewport.addEventListener("pointercancel", () => {
			startX = null;
			startY = null;
		});
	}

	setActive(0, false);
	root.classList.add("is-ready");
}

function initAll() {
	document.querySelectorAll("[data-wbg-slider]").forEach(initSlider);
}

if ("loading" === document.readyState) {
	document.addEventListener("DOMContentLoaded", initAll);
} else {
	initAll();
}
