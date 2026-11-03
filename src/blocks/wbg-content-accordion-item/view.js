// Content - Accordion Item - view.js

const ITEM_SELECTOR = ".wbg-content-accordion-item";
const TOGGLE_SELECTOR = ".wbg-content-accordion-item__toggle";

function setOpen(item, toggle, panel, open) {
	item.classList.toggle("is-open", open);
	toggle.setAttribute("aria-expanded", open ? "true" : "false");

	// `inert` keeps collapsed content out of the tab order and away from
	// screen readers while still allowing the height animation.
	if (open) {
		panel.removeAttribute("inert");
	} else {
		panel.setAttribute("inert", "");
	}
}

// One delegated listener: works no matter when this script loads, and for
// any accordion items added to the page later.
document.addEventListener("click", (event) => {
	const toggle = event.target.closest(TOGGLE_SELECTOR);
	if (!toggle) {
		return;
	}

	const item = toggle.closest(ITEM_SELECTOR);
	const panel = document.getElementById(toggle.getAttribute("aria-controls"));
	if (!item || !panel) {
		return;
	}

	event.preventDefault();

	const isOpen = toggle.getAttribute("aria-expanded") === "true";
	setOpen(item, toggle, panel, !isOpen);
});
