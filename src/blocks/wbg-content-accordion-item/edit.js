/**
 * Content - Accordion Item: editor view.
 */
import { __ } from "@wordpress/i18n";
import { useState, useEffect } from "@wordpress/element";
import { useSelect } from "@wordpress/data";
import {
	useBlockProps,
	useInnerBlocksProps,
	RichText,
	store as blockEditorStore,
} from "@wordpress/block-editor";

const ALLOWED_BLOCKS = ["core/paragraph"];
const TEMPLATE = [
	[
		"core/paragraph",
		{
			placeholder: __("Text goes here.", "wbg-blocks"),
		},
	],
];

export default function Edit({ attributes, setAttributes, clientId }) {
	const { heading } = attributes;

	// Start open for a brand-new (empty) item so the template paragraph is
	// visible; existing items start collapsed like the front end.
	const [isOpen, setIsOpen] = useState(() => !heading);

	// If an inner paragraph gets selected (e.g. via List View), make sure
	// the panel is open so the author can see what they're editing.
	const hasSelectedInnerBlock = useSelect(
		(select) => select(blockEditorStore).hasSelectedInnerBlock(clientId, true),
		[clientId],
	);

	useEffect(() => {
		if (hasSelectedInnerBlock) {
			setIsOpen(true);
		}
	}, [hasSelectedInnerBlock]);

	const blockProps = useBlockProps({
		className: `wbg-content-accordion-item${isOpen ? " is-open" : ""}`,
	});

	const innerBlocksProps = useInnerBlocksProps(
		{ className: "wbg-content-accordion-item__panel-content" },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
		},
	);

	return (
		<div {...blockProps}>
			<div className="wbg-content-accordion-item__toggle editor-toggle">
				<RichText
					tagName="h5"
					className="wbg-content-accordion-item__heading"
					value={heading}
					onChange={(value) => setAttributes({ heading: value })}
					placeholder={__("Accordion heading…", "wbg-blocks")}
					allowedFormats={["core/bold", "core/italic"]}
					withoutInteractiveFormatting
				/>
				<button
					type="button"
					className="wbg-content-accordion-item__icon-button"
					aria-expanded={isOpen}
					aria-label={
						isOpen
							? __("Collapse accordion item", "wbg-blocks")
							: __("Expand accordion item", "wbg-blocks")
					}
					onClick={() => setIsOpen((open) => !open)}
				>
					<span
						className="wbg-content-accordion-item__icon"
						aria-hidden="true"
					/>
				</button>
			</div>

			<div className="wbg-content-accordion-item__panel">
				<div className="wbg-content-accordion-item__panel-inner">
					<div {...innerBlocksProps} />
				</div>
			</div>
		</div>
	);
}
