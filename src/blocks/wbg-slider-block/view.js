// WBG - Slider - Block

const AUTOPLAY_DELAY = 6000; // ms between slides.
const STATUS_DELAY = 400; // ms to wait before announcing a slide change.
const SCROLL_END_DELAY = 120; // ms of no scrolling that counts as "stopped".

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function initSlider(root) {
	if (root.dataset.wbgSliderReady) {
		return;
	}

	const track = root.querySelector("[data-wbg-slider-track]");
	if (!track) {
		return;
	}

	const slides = Array.from(
		track.querySelectorAll(":scope > [data-wbg-slide]"),
	);
	if (slides.length < 2) {
		return;
	}

	root.dataset.wbgSliderReady = "true";
	root.classList.add("is-ready");

	const viewport = root.querySelector(".wbg-slider-block__viewport");
	const prevButton = root.querySelector("[data-wbg-slider-prev]");
	const nextButton = root.querySelector("[data-wbg-slider-next]");
	const dots = Array.from(root.querySelectorAll("[data-wbg-slider-dot]"));
	const status = root.querySelector("[data-wbg-slider-status]");
	const statusTemplate =
		root.dataset.statusTemplate || "Slide {current} of {total}";

	let current = -1;
	let isProgrammatic = false;
	let scrollFrame = null;
	let scrollEndTimer = null;
	let statusTimer = null;
	let autoplayTimer = null;

	// Autoplay is off when the block is static or the user prefers reduced motion.
	let stopped = root.dataset.autoplay !== "true" || reducedMotion.matches;
	const pauseReasons = new Set();

	/* ------------------------------------------------------------------ */
	/* State                                                              */
	/* ------------------------------------------------------------------ */

	const announce = (index) => {
		// Only announce changes the user made, never autoplay ticks.
		if (!status || autoplayTimer) {
			return;
		}
		clearTimeout(statusTimer);
		statusTimer = setTimeout(() => {
			status.textContent = statusTemplate
				.replace("{current}", index + 1)
				.replace("{total}", slides.length);
		}, STATUS_DELAY);
	};

	const setActive = (index) => {
		if (index === current) {
			return;
		}
		const isInitial = -1 === current;
		current = index;

		slides.forEach((slide, i) =>
			slide.classList.toggle("is-active", i === index),
		);

		dots.forEach((dot, i) => {
			if (i === index) {
				dot.setAttribute("aria-current", "true");
			} else {
				dot.removeAttribute("aria-current");
			}
		});

		prevButton?.setAttribute("aria-disabled", String(0 === index));
		nextButton?.setAttribute(
			"aria-disabled",
			String(slides.length - 1 === index),
		);

		if (!isInitial) {
			announce(index);
		}
	};

	const getClosestIndex = () => {
		const center = track.scrollLeft + track.clientWidth / 2;
		let closest = 0;
		let smallest = Infinity;

		slides.forEach((slide, i) => {
			const distance = Math.abs(
				slide.offsetLeft + slide.offsetWidth / 2 - center,
			);
			if (distance < smallest) {
				smallest = distance;
				closest = i;
			}
		});

		return closest;
	};

	const goTo = (index, instant = false) => {
		const target = Math.max(0, Math.min(index, slides.length - 1));
		const slide = slides[target];

		isProgrammatic = true;
		track.scrollTo({
			left: slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2,
			behavior: instant || reducedMotion.matches ? "auto" : "smooth",
		});
		setActive(target);

		// If the track was already in place, no scroll event will fire.
		clearTimeout(scrollEndTimer);
		scrollEndTimer = setTimeout(() => {
			isProgrammatic = false;
		}, SCROLL_END_DELAY * 4);
	};

	/* ------------------------------------------------------------------ */
	/* Autoplay                                                           */
	/* ------------------------------------------------------------------ */

	const advance = () => goTo(current >= slides.length - 1 ? 0 : current + 1);

	const syncAutoplay = () => {
		const shouldRun = !stopped && 0 === pauseReasons.size;

		if (shouldRun && !autoplayTimer) {
			autoplayTimer = setInterval(advance, AUTOPLAY_DELAY);
		} else if (!shouldRun && autoplayTimer) {
			clearInterval(autoplayTimer);
			autoplayTimer = null;
		}

		root.classList.toggle("is-autoplaying", shouldRun);
	};

	// Temporary: hover, focus, tab hidden, scrolled off-screen.
	const pause = (reason) => {
		pauseReasons.add(reason);
		syncAutoplay();
	};
	const resume = (reason) => {
		pauseReasons.delete(reason);
		syncAutoplay();
	};

	// Permanent: any deliberate interaction with the slider.
	const stop = () => {
		stopped = true;
		syncAutoplay();
	};

	/* ------------------------------------------------------------------ */
	/* Events                                                             */
	/* ------------------------------------------------------------------ */

	track.addEventListener(
		"scroll",
		() => {
			if (!scrollFrame) {
				scrollFrame = requestAnimationFrame(() => {
					scrollFrame = null;
					if (!isProgrammatic) {
						setActive(getClosestIndex());
					}
				});
			}

			clearTimeout(scrollEndTimer);
			scrollEndTimer = setTimeout(() => {
				isProgrammatic = false;
				setActive(getClosestIndex());
			}, SCROLL_END_DELAY);
		},
		{ passive: true },
	);

	prevButton?.addEventListener("click", () => {
		stop();
		if ("true" !== prevButton.getAttribute("aria-disabled")) {
			goTo(current - 1);
		}
	});

	nextButton?.addEventListener("click", () => {
		stop();
		if ("true" !== nextButton.getAttribute("aria-disabled")) {
			goTo(current + 1);
		}
	});

	dots.forEach((dot, i) =>
		dot.addEventListener("click", () => {
			stop();
			goTo(i);
		}),
	);

	// Hover pauses (mouse only), leaving resumes.
	viewport?.addEventListener("pointerenter", (event) => {
		if ("mouse" === event.pointerType) {
			pause("hover");
		}
	});
	viewport?.addEventListener("pointerleave", (event) => {
		if ("mouse" === event.pointerType) {
			resume("hover");
		}
	});

	// Touch / pen on the slides stops autoplay for good.
	viewport?.addEventListener("pointerdown", (event) => {
		if ("mouse" !== event.pointerType) {
			stop();
		}
	});

	// Horizontal trackpad / wheel scrolling counts as taking control.
	track.addEventListener(
		"wheel",
		(event) => {
			if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
				stop();
			}
		},
		{ passive: true },
	);

	// Focus anywhere in the block pauses; leaving the block resumes.
	root.addEventListener("focusin", () => pause("focus"));
	root.addEventListener("focusout", (event) => {
		if (!root.contains(event.relatedTarget)) {
			resume("focus");
		}
	});

	// Tabbing into a partly visible slide brings it to the centre.
	track.addEventListener("focusin", (event) => {
		const index = slides.findIndex((slide) => slide.contains(event.target));
		if (index > -1 && index !== current) {
			goTo(index);
		}
	});

	document.addEventListener("visibilitychange", () => {
		if (document.hidden) {
			pause("hidden");
		} else {
			resume("hidden");
		}
	});

	if ("IntersectionObserver" in window) {
		new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				resume("offscreen");
			} else {
				pause("offscreen");
			}
		}).observe(root);
	}

	reducedMotion.addEventListener?.("change", (event) => {
		if (event.matches) {
			stop();
		}
	});

	// Keep the active slide centred when the window is resized.
	if ("ResizeObserver" in window) {
		let lastWidth = track.clientWidth;
		new ResizeObserver(() => {
			if (track.clientWidth !== lastWidth && current > -1) {
				lastWidth = track.clientWidth;
				goTo(current, true);
			}
		}).observe(track);
	}

	/* ------------------------------------------------------------------ */
	/* Start                                                              */
	/* ------------------------------------------------------------------ */

	setActive(getClosestIndex());
	syncAutoplay();
}

function initAll() {
	document.querySelectorAll("[data-wbg-slider]").forEach(initSlider);
}

if ("loading" === document.readyState) {
	document.addEventListener("DOMContentLoaded", initAll);
} else {
	initAll();
}
