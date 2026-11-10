/**
 * Layout - 1-Col - Centered: editor view.
 *
 * Heading markup mirrors render.php:
 * - With a subheading: heading is an h3 with the "h1--alt" class.
 * - Without one: heading is a plain h2.
 * The subheading is always shown as an h6 in the editor so it stays editable;
 * on the front end it renders as h2.fake--h6 (only when it has text).
 *
 * The native Block Spacing (blockGap) control is applied only to the
 * inner blocks container, not the block wrapper.
 */
import { __ } from "@wordpress/i18n";
import { useEffect } from "@wordpress/element";
import { useSelect, useDispatch } from "@wordpress/data";
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	RichText,
	store as blockEditorStore,
} from "@wordpress/block-editor";
import {
	PanelBody,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";

const ALLOWED_BLOCKS = ["core/buttons", "core/heading", "core/paragraph"];

// Heading levels allowed for core/heading blocks inside this block.
const HEADING_LEVELS = [3, 4, 5, 6];

const TEMPLATE = [["core/paragraph"]];

/**
 * True if a rich text value contains visible text (not just tags/whitespace).
 * Mirrors wbg_layout_1_col_centered_has_text() in render.php.
 *
 * @param {string} html Rich text HTML.
 * @return {boolean} Whether there is visible text.
 */
const hasText = (html) =>
	String(html ?? "")
		.replace(/<[^>]*>/g, "")
		.replace(/&nbsp;| /g, " ")
		.trim() !== "";

/**
 * Converts a blockGap value ("var:preset|spacing|40" or a raw CSS value)
 * into a CSS value. Mirrors wbg_layout_1_col_centered_gap_value() in render.php.
 *
 * @param {*} value Stored blockGap value.
 * @return {string|undefined} CSS value, or undefined if not set.
 */
const getGapCSSValue = (value) => {
	if (typeof value !== "string" || value === "") {
		return undefined;
	}
	const prefix = "var:preset|spacing|";
	return value.startsWith(prefix)
		? `var(--wp--preset--spacing--${value.slice(prefix.length)})`
		: value;
};

export default function Edit({ attributes, setAttributes, clientId }) {
	const { subheading, heading, contentWidth, style } = attributes;

	const hasSubheading = hasText(subheading);
	const headingClass = [
		"wp-block-heading",
		"wbg-layout-1-col-centered__heading",
		"h1--alt",
	]
		.filter(Boolean)
		.join(" ");

	const blockGap = getGapCSSValue(style?.spacing?.blockGap);

	// Keep inner core/heading blocks limited to h3–h6.
	const innerBlocks = useSelect(
		(select) => select(blockEditorStore).getBlocks(clientId),
		[clientId],
	);
	const { updateBlockAttributes, __unstableMarkNextChangeAsNotPersistent } =
		useDispatch(blockEditorStore);

	useEffect(() => {
		innerBlocks.forEach(({ name, clientId: childId, attributes: child }) => {
			if (name !== "core/heading") {
				return;
			}
			const needsLevel = !HEADING_LEVELS.includes(child.level);
			const needsOptions =
				JSON.stringify(child.levelOptions) !== JSON.stringify(HEADING_LEVELS);

			if (!needsLevel && !needsOptions) {
				return;
			}

			__unstableMarkNextChangeAsNotPersistent();
			updateBlockAttributes(childId, {
				levelOptions: HEADING_LEVELS,
				...(needsLevel ? { level: HEADING_LEVELS[0] } : {}),
			});
		});
	}, [
		innerBlocks,
		updateBlockAttributes,
		__unstableMarkNextChangeAsNotPersistent,
	]);

	const blockProps = useBlockProps({
		className: [
			"wbg-layout-1-col-centered",
			"alignfull",
			contentWidth === "wide" ? "content-width--wide" : "",
		]
			.filter(Boolean)
			.join(" "),
	});

	const innerBlocksProps = useInnerBlocksProps(
		{
			className: "wbg-layout-1-col-centered__content",
			style: blockGap ? { gap: blockGap } : undefined,
		},
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
		},
	);

	return (
		<>
			<InspectorControls>
				<PanelBody title={__("Settings", "wbg-blocks")}>
					<ToggleGroupControl
						label={__("Content Width", "wbg-blocks")}
						value={contentWidth}
						onChange={(value) => setAttributes({ contentWidth: value })}
						isBlock
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					>
						<ToggleGroupControlOption
							value="normal"
							label={__("Normal", "wbg-blocks")}
						/>
						<ToggleGroupControlOption
							value="wide"
							label={__("Wide", "wbg-blocks")}
						/>
					</ToggleGroupControl>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div className="wbg-layout-1-col-centered__wrapper">
					<div className="wbg-layout-1-col-centered__header">
						<RichText
							tagName="h6"
							className="wp-block-heading wbg-layout-1-col-centered__subheading"
							value={subheading}
							onChange={(value) => setAttributes({ subheading: value })}
							placeholder={__("Optional Subheading…", "wbg-blocks")}
							disableLineBreaks
						/>
						<div className="wbg-layout-1-col-centered__heading-container">
							<RichText
								tagName="h2"
								className={headingClass}
								value={heading}
								onChange={(value) => setAttributes({ heading: value })}
								placeholder={__("Heading…", "wbg-blocks")}
								disableLineBreaks
							/>
						</div>
					</div>

					<div {...innerBlocksProps} />
				</div>
			</div>
		</>
	);
}
