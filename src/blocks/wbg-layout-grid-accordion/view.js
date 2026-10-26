/**
 * Layout - Grid - Accordion: front-end See More / See Less toggle.
 *
 * Which cards are hidden at each breakpoint is handled entirely in CSS
 * (style.scss) by the .is-collapsed class on the block. This script:
 *  - toggles .is-collapsed when the button is clicked,
 *  - animates the grid height between the collapsed and expanded sizes,
 *  - updates aria-expanded and the button label (See More / See Less),
 *  - scrolls the block back into view after collapsing if its top has
 *    scrolled out of the viewport.
 */

const BLOCK_SELECTOR = ".wbg-layout-grid-accordion";
const GRID_SELECTOR = ".wbg-layout-grid-accordion__grid";
const TOGGLE_SELECTOR = ".wbg-layout-grid-accordion__toggle";
const LABEL_SELECTOR = ".wbg-layout-grid-accordion__toggle-label";
const COLLAPSED_CLASS = "is-collapsed";
const DURATION = 400;
const EASING = "cubic-bezier(0.4, 0, 0.2, 1)";

const prefersReducedMotion = () =>
	window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

	const label = button.querySelector(LABEL_SELECTOR) || button;
	const labelMore = button.dataset.labelMore || "See More";
	const labelLess = button.dataset.labelLess || "See Less";

	// Source of truth for the button state. The class can lag behind it while
	// a collapse animation is running.
	let isCollapsed = block.classList.contains(COLLAPSED_CLASS);
	let animation = null;

	const setState = (collapsed) => {
		isCollapsed = collapsed;
		block.classList.toggle(COLLAPSED_CLASS, collapsed);
		button.setAttribute("aria-expanded", String(!collapsed));
		label.textContent = collapsed ? labelMore : labelLess;
	};

	// Stop any running animation and apply its end state immediately.
	const settle = () => {
		if (!animation) {
			return;
		}
		animation.onfinish = null;
		animation.cancel();
		animation = null;
		grid.style.overflow = "";
		block.classList.toggle(COLLAPSED_CLASS, isCollapsed);
	};

	const scrollBackIfNeeded = () => {
		const top = block.getBoundingClientRect().top;
		if (top < 0) {
			block.scrollIntoView({
				block: "start",
				behavior: prefersReducedMotion() ? "auto" : "smooth",
			});
		}
	};

	button.addEventListener("click", () => {
		// If a previous animation is still running, jump to its end state so
		// measurements start from a settled layout.
		settle();

		const willCollapse = !isCollapsed;

		if (prefersReducedMotion() || typeof grid.animate !== "function") {
			setState(willCollapse);
			if (willCollapse) {
				scrollBackIfNeeded();
			}
			return;
		}

		const startHeight = measureHeight(block, grid, !willCollapse);
		const endHeight = measureHeight(block, grid, willCollapse);

		if (willCollapse) {
			// Keep the extra cards in place while the grid shrinks over them,
			// then hide them once the animation ends.
			isCollapsed = true;
			button.setAttribute("aria-expanded", "false");
			label.textContent = labelMore;
		} else {
			// Reveal the cards first, then grow the grid to fit them.
			setState(false);
		}

		grid.style.overflow = "hidden";

		animation = grid.animate(
			[{ height: `${startHeight}px` }, { height: `${endHeight}px` }],
			{ duration: DURATION, easing: EASING },
		);

		animation.onfinish = () => {
			animation = null;
			grid.style.overflow = "";
			if (willCollapse) {
				setState(true);
				scrollBackIfNeeded();
			}
		};
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
