/**
 * WBG Mega Menu – front-end behavior.
 *
 * Pattern: disclosure (button + panel), per the WAI-ARIA APG
 * "Disclosure Navigation Menu" example.
 *
 * - Toggles `.is-open` on the block and the panel.
 * - Keeps aria-expanded in sync on the trigger button.
 * - Moves focus into the panel on open; returns it to the trigger on close.
 * - Escape closes the panel (an open core/navigation submenu is closed first).
 * - Clicking outside, or tabbing out of the menu, closes the panel.
 * - Only one mega menu is open at a time.
 *
 * Submenus inside the panel are core/navigation blocks, which already handle
 * their own keyboard toggling through the Interactivity API. This script
 * coordinates with them rather than re-implementing submenus.
 */

const SELECTOR = ".wbg-mega-menu";
const OPEN_CLASS = "is-open";
const HTML_OPEN_CLASS = "wbg-mega-menu-is-open";

const FOCUSABLE = [
	"a[href]",
	"area[href]",
	"button:not([disabled])",
	'input:not([disabled]):not([type="hidden"])',
	"select:not([disabled])",
	"textarea:not([disabled])",
	'[tabindex]:not([tabindex="-1"])',
	'[contenteditable="true"]',
].join(",");

/** @type {Set<MegaMenu>} */
const instances = new Set();

const isVisible = (el) =>
	!!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);

/**
 * True when the element sits inside a core/navigation submenu that is
 * currently expanded. Core closes that submenu on Escape, so the mega menu
 * should stay open for that key press.
 *
 * @param {EventTarget|null} target
 * @return {boolean}
 */
function isInsideOpenSubmenu(target) {
	if (!(target instanceof Element)) {
		return false;
	}

	let item = target.closest(".wp-block-navigation-item.has-child");

	while (item) {
		const toggle = item.querySelector(
			":scope > .wp-block-navigation-submenu__toggle",
		);

		if (toggle?.getAttribute("aria-expanded") === "true") {
			return true;
		}

		item = item.parentElement?.closest(".wp-block-navigation-item.has-child");
	}

	return false;
}

class MegaMenu {
	/**
	 * @param {HTMLElement} root The block wrapper.
	 */
	constructor(root) {
		this.root = root;
		this.toggle = root.querySelector(".wbg-mega-menu__toggle");
		this.panel = root.querySelector(".wbg-mega-menu__panel");
		this.closeButton = root.querySelector(".wbg-mega-menu__close");
		this.isOpen = false;

		if (!this.toggle || !this.panel) {
			return;
		}

		// Toggle label: "Button Text" when closed, "Close Button Text" when open.
		this.toggleText =
			this.toggle.querySelector(".wbg-mega-menu__toggle-text") || this.toggle;
		this.openText =
			this.toggle.dataset.openText || this.toggleText.textContent.trim();
		this.closeText = this.toggle.dataset.closeText || this.openText;

		this.toggle.addEventListener("click", () => {
			if (this.isOpen) {
				this.close({ returnFocus: true });
			} else {
				this.open();
			}
		});

		this.closeButton?.addEventListener("click", () =>
			this.close({ returnFocus: true }),
		);

		// Close when keyboard focus leaves the whole menu (trigger + panel).
		this.root.addEventListener("focusout", (event) => {
			if (!this.isOpen) {
				return;
			}
			const next = event.relatedTarget;
			if (next && !this.root.contains(next)) {
				this.close();
			}
		});

		instances.add(this);
		this.root.classList.add("is-ready");
	}

	open() {
		instances.forEach((instance) => {
			if (instance !== this) {
				instance.close();
			}
		});

		this.isOpen = true;
		this.root.classList.add(OPEN_CLASS);
		this.panel.classList.add(OPEN_CLASS);
		this.toggle.setAttribute("aria-expanded", "true");
		this.toggleText.textContent = this.closeText;
		document.documentElement.classList.add(HTML_OPEN_CLASS);

		// Let the browser apply the open styles before moving focus.
		window.requestAnimationFrame(() => this.focusFirst());
	}

	/**
	 * @param {Object}  [options]
	 * @param {boolean} [options.returnFocus=false] Move focus back to the trigger.
	 */
	close({ returnFocus = false } = {}) {
		if (!this.isOpen) {
			return;
		}

		this.isOpen = false;
		this.root.classList.remove(OPEN_CLASS);
		this.panel.classList.remove(OPEN_CLASS);
		this.toggle.setAttribute("aria-expanded", "false");
		this.toggleText.textContent = this.openText;

		if (![...instances].some((instance) => instance.isOpen)) {
			document.documentElement.classList.remove(HTML_OPEN_CLASS);
		}

		if (returnFocus) {
			this.toggle.focus();
		}
	}

	/**
	 * Focus the first visible focusable element in the panel
	 * (skips whichever desktop/mobile content is hidden by CSS).
	 */
	focusFirst() {
		const target = [...this.panel.querySelectorAll(FOCUSABLE)].find(isVisible);
		(target || this.panel).focus({ preventScroll: true });
	}
}

/* -------------------------------------------------------------------------
 * Global listeners (shared by every instance)
 * ---------------------------------------------------------------------- */

// Capture phase so this runs before core/navigation's own Escape handler,
// while a submenu's aria-expanded still reflects its real state.
document.addEventListener(
	"keydown",
	(event) => {
		if (event.key !== "Escape") {
			return;
		}

		const openMenu = [...instances].find((instance) => instance.isOpen);
		if (!openMenu) {
			return;
		}

		// First Escape closes the open submenu (handled by core).
		if (isInsideOpenSubmenu(event.target)) {
			return;
		}

		const active = document.activeElement;
		const focusWasInside =
			!active || active === document.body || openMenu.root.contains(active);

		openMenu.close({ returnFocus: focusWasInside });
	},
	true,
);

// Click outside closes.
document.addEventListener("click", (event) => {
	instances.forEach((instance) => {
		if (instance.isOpen && !instance.root.contains(event.target)) {
			instance.close();
		}
	});
});

// If the viewport crosses the desktop/mobile breakpoint while open, the
// focused element may now be hidden. Move focus to a visible element.
let resizeFrame = 0;
window.addEventListener("resize", () => {
	window.cancelAnimationFrame(resizeFrame);
	resizeFrame = window.requestAnimationFrame(() => {
		instances.forEach((instance) => {
			const active = document.activeElement;
			if (
				instance.isOpen &&
				active &&
				instance.panel.contains(active) &&
				!isVisible(active)
			) {
				instance.focusFirst();
			}
		});
	});
});

/* -------------------------------------------------------------------------
 * Init
 * ---------------------------------------------------------------------- */

function init() {
	document.querySelectorAll(SELECTOR).forEach((root) => {
		if (root.dataset.wbgMegaMenuInit) {
			return;
		}
		root.dataset.wbgMegaMenuInit = "1";
		new MegaMenu(root);
	});
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", init);
} else {
	init();
}
