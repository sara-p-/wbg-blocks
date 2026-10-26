/**
 * Layout - Grid - Carousel: front-end carousel.
 *
 * The track (.wbg-layout-grid-carousel__grid) is a native, snap-aligned
 * horizontal scroller on tablet/mobile (see style.scss), so touch swiping
 * works out of the box. This script adds:
 *  - prev/next arrows and navigation dots,
 *  - smooth slide transitions (SLIDE_SPEED ms),
 *  - carousel ARIA semantics, and `inert` on off-screen slides.
 *
 * The carousel only moves when the visitor uses it; there is no autoplay.
 *
 * Whether the carousel is active, and how many slides are in view, comes
 * from the --wbg-slides-per-view custom property (0 = plain grid), so the
 * breakpoints live in one place: style.scss.
 */

const ROOT_SELECTOR = ".wbg-layout-grid-carousel[data-wbg-carousel]";
const SLIDE_SPEED = 350; // Transition length in ms.

const easeInOutCubic = (t) =>
	t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Fill %d / %1$d placeholders in a translated string.
 *
 * @param {string}    template Translated string.
 * @param {...number} values   Replacement values.
 * @return {string} Formatted string.
 */
const format = (template, ...values) => {
	let next = 0;
	return String(template).replace(/%(?:(\d+)\$)?d/g, (match, position) => {
		const index = position ? parseInt(position, 10) - 1 : next++;
		return values[index] ?? "";
	});
};

const parseConfig = (root) => {
	try {
		return JSON.parse(root.dataset.wbgCarousel || "{}");
	} catch (error) {
		return {};
	}
};

class GridCarousel {
	constructor(root, track, controls) {
		const config = parseConfig(root);

		this.root = root;
		this.track = track;
		this.controls = controls;
		this.slides = Array.from(track.children);
		// Arrows sit beside the track (in __stage), not in the controls row.
		this.prevButton = root.querySelector(
			".wbg-layout-grid-carousel__arrow--prev",
		);
		this.nextButton = root.querySelector(
			".wbg-layout-grid-carousel__arrow--next",
		);
		this.dotsContainer = controls.querySelector(
			".wbg-layout-grid-carousel__dots",
		);

		this.i18n = config.i18n || {};
		this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

		this.enabled = false;
		this.perView = 0;
		this.pageCount = 0;
		this.index = 0;
		this.dots = [];

		this.frame = null;
		this.scrollTimer = null;
		this.animating = false;

		this.bindEvents();
		this.refresh();
	}

	bindEvents() {
		this.prevButton?.addEventListener("click", () => this.goTo(this.index - 1));
		this.nextButton?.addEventListener("click", () => this.goTo(this.index + 1));

		this.track.addEventListener("scroll", () => this.onScroll(), {
			passive: true,
		});

		// A swipe takes over from any arrow/dot animation in progress.
		this.track.addEventListener("touchstart", () => this.cancelAnimation(), {
			passive: true,
		});

		if ("ResizeObserver" in window) {
			let pending = null;
			new ResizeObserver(() => {
				cancelAnimationFrame(pending);
				pending = requestAnimationFrame(() => this.refresh());
			}).observe(this.track);
		} else {
			window.addEventListener("resize", () => this.refresh());
		}
	}

	/**
	 * Re-read the layout and switch the carousel on or off to match it.
	 */
	refresh() {
		const perView =
			parseInt(
				getComputedStyle(this.root).getPropertyValue("--wbg-slides-per-view"),
				10,
			) || 0;

		this.perView = perView;

		if (perView < 1 || this.slides.length <= perView) {
			this.disable();
			return;
		}

		const pageCount = this.slides.length - perView + 1;

		if (pageCount !== this.pageCount) {
			this.pageCount = pageCount;
			this.buildDots();
		}

		this.index = Math.min(this.index, pageCount - 1);

		if (!this.enabled) {
			this.enable();
		}

		this.updateUi();
		this.scrollToIndex(this.index, false);
	}

	enable() {
		this.enabled = true;
		this.setControlsHidden(false);

		this.root.setAttribute("role", "region");
		this.root.setAttribute("aria-roledescription", "carousel");
		this.root.setAttribute("aria-label", this.i18n.carousel || "Cards");
		this.track.setAttribute("aria-live", "polite");

		this.slides.forEach((slide) => {
			slide.setAttribute("role", "group");
			slide.setAttribute("aria-roledescription", "slide");
		});
	}

	setControlsHidden(hidden) {
		this.controls.hidden = hidden;
		[this.prevButton, this.nextButton].forEach((button) => {
			if (button) {
				button.hidden = hidden;
			}
		});
	}

	disable() {
		if (!this.enabled && this.controls.hidden) {
			return;
		}

		this.enabled = false;
		this.pageCount = 0;
		this.index = 0;
		this.setControlsHidden(true);
		this.cancelAnimation();

		["role", "aria-roledescription", "aria-label"].forEach((name) =>
			this.root.removeAttribute(name),
		);
		this.track.removeAttribute("aria-live");

		this.slides.forEach((slide) => {
			slide.inert = false;
			["role", "aria-roledescription", "aria-label"].forEach((name) =>
				slide.removeAttribute(name),
			);
		});

		this.track.scrollLeft = 0;
	}

	buildDots() {
		this.dotsContainer.textContent = "";
		this.dots = [];

		for (let i = 0; i < this.pageCount; i++) {
			const dot = document.createElement("button");
			dot.type = "button";
			dot.className = "wbg-layout-grid-carousel__dot";
			dot.setAttribute("aria-controls", this.track.id);
			dot.setAttribute(
				"aria-label",
				format(this.i18n.goTo || "Go to slide %d", i + 1),
			);
			dot.addEventListener("click", () => this.goTo(i));

			this.dotsContainer.appendChild(dot);
			this.dots.push(dot);
		}
	}

	/**
	 * Scroll position for each page, clamped to the end of the track.
	 *
	 * @return {number[]} Positions in px.
	 */
	getPositions() {
		const max = this.track.scrollWidth - this.track.clientWidth;
		return this.slides
			.slice(0, this.pageCount)
			.map((slide) => Math.min(slide.offsetLeft, max));
	}

	goTo(index, animate = true) {
		if (!this.enabled) {
			return;
		}

		// Wrap around at both ends.
		this.index = ((index % this.pageCount) + this.pageCount) % this.pageCount;
		this.updateUi();
		this.scrollToIndex(this.index, animate);
	}

	scrollToIndex(index, animate) {
		const target = this.getPositions()[index] ?? 0;
		const start = this.track.scrollLeft;

		this.cancelAnimation();

		if (!animate || this.reducedMotion.matches) {
			this.track.scrollLeft = target;
			return;
		}

		if (Math.abs(target - start) < 1) {
			return;
		}

		const startTime = performance.now();
		this.animating = true;
		this.root.classList.add("is-animating");

		const tick = (now) => {
			const progress = Math.min(1, (now - startTime) / SLIDE_SPEED);
			this.track.scrollLeft =
				start + (target - start) * easeInOutCubic(progress);

			if (progress < 1) {
				this.frame = requestAnimationFrame(tick);
			} else {
				this.frame = null;
				this.animating = false;
				this.root.classList.remove("is-animating");
			}
		};

		this.frame = requestAnimationFrame(tick);
	}

	cancelAnimation() {
		if (this.frame) {
			cancelAnimationFrame(this.frame);
			this.frame = null;
		}
		this.animating = false;
		this.root.classList.remove("is-animating");
	}

	/**
	 * Keep the active dot in sync when the visitor swipes.
	 */
	onScroll() {
		if (!this.enabled || this.animating) {
			return;
		}

		clearTimeout(this.scrollTimer);
		this.scrollTimer = setTimeout(() => {
			const x = this.track.scrollLeft;
			let nearest = 0;
			let best = Infinity;

			this.getPositions().forEach((position, i) => {
				const distance = Math.abs(position - x);
				if (distance < best) {
					best = distance;
					nearest = i;
				}
			});

			if (nearest !== this.index) {
				this.index = nearest;
				this.updateUi();
			}
		}, 120);
	}

	updateUi() {
		const total = this.slides.length;

		this.dots.forEach((dot, i) => {
			const isActive = i === this.index;
			dot.classList.toggle("is-active", isActive);
			if (isActive) {
				dot.setAttribute("aria-current", "true");
			} else {
				dot.removeAttribute("aria-current");
			}
		});

		this.slides.forEach((slide, i) => {
			const visible = i >= this.index && i < this.index + this.perView;
			slide.inert = !visible;
			slide.setAttribute(
				"aria-label",
				format(this.i18n.slide || "%1$d of %2$d", i + 1, total),
			);
		});
	}
}

const init = () => {
	document.querySelectorAll(ROOT_SELECTOR).forEach((root) => {
		if (root.dataset.wbgCarouselReady) {
			return;
		}

		const track = root.querySelector(".wbg-layout-grid-carousel__grid");
		const controls = root.querySelector(".wbg-layout-grid-carousel__controls");

		if (!track || !controls) {
			return;
		}

		root.dataset.wbgCarouselReady = "true";
		new GridCarousel(root, track, controls);
	});
};

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", init);
} else {
	init();
}
