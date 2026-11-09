/**
 * Layout - Grid - Accordion: front-end See More / See Less toggle.
 *
 * Which cards are hidden at each breakpoint is handled entirely in CSS
 * (style.scss) by the .is-collapsed class on the block. This script:
 *  - toggles .is-collapsed when the button is clicked,
 *  - animates the grid height between the collapsed and expanded sizes,
 *  - while collapsing, scrolls the page in step with the shrinking grid so
 *    the button stays where it was clicked (one smooth motion instead of a
 *    collapse followed by a scroll jump),
 *  - updates aria-expanded and the button label (See More / See Less).
 *
 * The animation runs on requestAnimationFrame rather than the Web
 * Animations API so the grid height and the scroll position can be updated
 * together in the same frame.
 */

const BLOCK_SELECTOR = ".wbg-layout-grid-accordion";
const GRID_SELECTOR = ".wbg-layout-grid-accordion__grid";
const TOGGLE_SELECTOR = ".wbg-layout-grid-accordion__toggle";
const LABEL_SELECTOR = ".wbg-layout-grid-accordion__toggle-label";
const COLLAPSED_CLASS = "is-collapsed";

// Duration scales with the distance travelled, within these bounds (ms).
const MIN_DURATION = 350;
const MAX_DURATION = 700;
const MS_PER_PX = 0.6;

const prefersReducedMotion = () =>
	window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Ease-in-out: starts and ends gently, so the motion has no sudden jump at
 * either end.
 *
 * @param {number} t Progress, 0–1.
 * @return {number} Eased progress, 0–1.
 */
const easeInOutCubic = (t) =>
	t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Scroll the window by a number of pixels immediately, ignoring any
 * `scroll-behavior: smooth` set by the theme (which would make the scroll
 * lag behind the animation).
 *
 * @param {number} delta Pixels to scroll (negative = up).
 */
const scrollByInstant = (delta) => {
	if (!delta) {
		return;
	}
	window.scrollTo({ top: window.scrollY + delta, behavior: "instant" });
};

/**
 * Measure the grid's height with the block collapsed or expanded, without
 * leaving the block in that state.
 *
 * @param {HTMLElement} block     Block wrapper.
 * @param {HTMLElement} grid      Grid element.
 * @param {boolean}     collapsed State to measure.
 * @return {number} Height in px.
 */
const measureHeight = (block, grid, collapsed) => {
	const wasCollapsed = block.classList.contains(COLLAPSED_CLASS);
	block.classList.toggle(COLLAPSED_CLASS, collapsed);
	const height = grid.getBoundingClientRect().height;
	block.classList.toggle(COLLAPSED_CLASS, wasCollapsed);
	return height;
};

/**
 * Wire up one accordion grid.
 *
 * @param {HTMLElement} block Block wrapper.
 */
const initAccordion = (block) => {
	if (block.dataset.wbgAccordionReady) {
		return;
	}

	const grid = block.querySelector(GRID_SELECTOR);
	const button = block.querySelector(TOGGLE_SELECTOR);

	if (!grid || !button) {
		return;
	}

	block.dataset.wbgAccordionReady = "true";

	const root = document.documentElement;
	const label = button.querySelector(LABEL_SELECTOR) || button;
	const labelMore = button.dataset.labelMore || "See More";
	const labelLess = button.dataset.labelLess || "See Less";

	// Source of truth for the button state. The class lags behind it while a
	// collapse animation is running (hidden cards stay visible until the
	// grid has finished shrinking over them).
	let isCollapsed = block.classList.contains(COLLAPSED_CLASS);
	let frame = null;
	let finish = null;

	const setLabel = (collapsed) => {
		button.setAttribute("aria-expanded", String(!collapsed));
		label.textContent = collapsed ? labelMore : labelLess;
	};

	const setState = (collapsed) => {
		isCollapsed = collapsed;
		block.classList.toggle(COLLAPSED_CLASS, collapsed);
		setLabel(collapsed);
	};

	/**
	 * Run fn() and then scroll so the button is back where it was before.
	 *
	 * @param {Function} fn Layout-changing callback.
	 */
	const keepButtonInPlace = (fn) => {
		const before = button.getBoundingClientRect().top;
		fn();
		scrollByInstant(button.getBoundingClientRect().top - before);
	};

	// Stop any running animation and jump to its end state.
	const stop = () => {
		if (frame) {
			cancelAnimationFrame(frame);
			frame = null;
		}
		if (finish) {
			const done = finish;
			finish = null;
			done();
		}
	};

	button.addEventListener("click", () => {
		stop();

		const willCollapse = !isCollapsed;

		if (prefersReducedMotion()) {
			if (willCollapse) {
				keepButtonInPlace(() => setState(true));
			} else {
				setState(false);
			}
			return;
		}

		const startHeight = measureHeight(block, grid, isCollapsed);
		const endHeight = measureHeight(block, grid, willCollapse);
		const distance = Math.abs(endHeight - startHeight);

		if (!distance) {
			setState(willCollapse);
			return;
		}

		if (willCollapse) {
			// Update the button now, but keep the extra cards in place while
			// the grid shrinks over them; hide them when the animation ends.
			isCollapsed = true;
			setLabel(true);
		} else {
			// Reveal the cards first, then grow the grid to fit them.
			setState(false);
		}

		const duration = Math.min(
			MAX_DURATION,
			Math.max(MIN_DURATION, distance * MS_PER_PX),
		);
		const anchorTop = button.getBoundingClientRect().top;

		grid.style.height = `${startHeight}px`;
		grid.style.overflow = "hidden";
		// Stop the browser's own scroll anchoring from fighting ours.
		root.style.overflowAnchor = "none";

		finish = () => {
			// Hide the extra cards and release the fixed height in the same
			// step, so the grid never briefly shows at full height.
			keepButtonInPlace(() => {
				if (willCollapse) {
					setState(true);
				}
				grid.style.height = "";
				grid.style.overflow = "";
			});
			root.style.overflowAnchor = "";
		};

		let startTime = null;

		const step = (now) => {
			if (startTime === null) {
				startTime = now;
			}

			const progress = Math.min(1, (now - startTime) / duration);
			const height =
				startHeight + (endHeight - startHeight) * easeInOutCubic(progress);

			grid.style.height = `${height}px`;

			if (willCollapse) {
				// The grid shrank, so the button moved up: scroll up by the
				// same amount so it stays under the pointer.
				scrollByInstant(button.getBoundingClientRect().top - anchorTop);
			}

			if (progress < 1) {
				frame = requestAnimationFrame(step);
			} else {
				frame = null;
				stop();
			}
		};

		frame = requestAnimationFrame(step);
	});
};

const init = () => {
	document.querySelectorAll(BLOCK_SELECTOR).forEach(initAccordion);
};

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", init);
} else {
	init();
}
