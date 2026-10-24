/**
 * Card - Icon: editor view.
 */
import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	store as blockEditorStore,
} from "@wordpress/block-editor";
import { PanelBody, SelectControl } from "@wordpress/components";
import { useSelect, useDispatch } from "@wordpress/data";
import { useEffect } from "@wordpress/element";

import { ICONS, ICON_OPTIONS } from "../../../assets/js/icons";

const ALLOWED_BLOCKS = ["core/heading", "core/paragraph", "core/buttons"];

const TEMPLATE = [
	[
		"core/heading",
		{
			level: 3,
			levelOptions: [3],
			textColor: "green",
			style: {
				typography: {
					textAlign: "center",
					fontStyle: "italic",
				},
			},
			placeholder: __("Headline goes here.", "wbg-blocks"),
		},
	],
	[
		"core/paragraph",
		{
			placeholder: __("Card text…", "wbg-blocks"),
			style: {
				typography: {
					textAlign: "center",
				},
			},
		},
	],
	[
		"core/buttons",
		{
			layout: {
				type: "flex",
				justifyContent: "center",
			},
		},
		[["core/button", { placeholder: __("Button text…", "wbg-blocks") }]],
	],
];

/**
 * Convert a saved blockGap value into a usable CSS value.
 * "var:preset|spacing|40" -> "var(--wp--preset--spacing--40)"
 * Object values ({ top, left }) use the vertical (top) value.
 */
function toCssValue(value) {
	if (value && typeof value === "object") {
		value = value.top;
	}
	if (typeof value !== "string" || !value) {
		return undefined;
	}
	if (value.startsWith("var:")) {
		return `var(--wp--${value.slice(4).split("|").join("--")})`;
	}
	return value;
}

export default function Edit({ attributes, setAttributes, clientId }) {
	const { icon, style } = attributes;

	const IconComponent = ICONS[icon]?.Component;
	const gap = toCssValue(style?.spacing?.blockGap);

	const blockProps = useBlockProps({
		className: "wbg-card-icon",
	});

	const innerBlocksProps = useInnerBlocksProps(
		{
			className: "wbg-card-icon__content",
			style: gap ? { "--wbg-card-icon-gap": gap } : undefined,
		},
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
		},
	);

	// Keep every heading in the card locked to h3, including headings the
	// user inserts later or transforms from a paragraph.
	const innerBlocks = useSelect(
		(select) => select(blockEditorStore).getBlocks(clientId),
		[clientId],
	);
	const { updateBlockAttributes, __unstableMarkNextChangeAsNotPersistent } =
		useDispatch(blockEditorStore);

	useEffect(() => {
		innerBlocks.forEach((block) => {
			if (block.name !== "core/heading") {
				return;
			}
			const { level, levelOptions } = block.attributes;
			const isLocked =
				level === 3 &&
				Array.isArray(levelOptions) &&
				levelOptions.length === 1 &&
				levelOptions[0] === 3;

			if (!isLocked) {
				__unstableMarkNextChangeAsNotPersistent();
				updateBlockAttributes(block.clientId, {
					level: 3,
					levelOptions: [3],
				});
			}
		});
	}, [innerBlocks]);

	return (
		<>
			<InspectorControls>
				<PanelBody title={__("Icon", "wbg-blocks")}>
					<SelectControl
						label={__("Icon", "wbg-blocks")}
						value={icon}
						options={ICON_OPTIONS}
						onChange={(value) => setAttributes({ icon: value })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				{IconComponent && (
					<span className="wbg-card-icon__icon" aria-hidden="true">
						<IconComponent focusable="false" />
					</span>
				)}
				<div {...innerBlocksProps} />
			</div>
		</>
	);
}
