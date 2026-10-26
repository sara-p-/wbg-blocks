/**
 * Layout - Grid - Static: editor view.
 *
 * Renders an optional H1 heading (toggled via "Heading Settings") above a
 * 2–4 column grid of card blocks. Padding, background color and background
 * image come from native block supports (see block.json), which
 * useBlockProps() applies to the outer wrapper. Text color serialization is
 * skipped on the wrapper and applied to the heading only.
 */
import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	BlockControls,
	AlignmentControl,
	InnerBlocks,
	RichText,
	getColorClassName,
} from "@wordpress/block-editor";
import {
	PanelBody,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";

const ALLOWED_BLOCKS = [
	"wbg-blocks/wbg-card-icon",
	"wbg-blocks/wbg-card-image",
	"wbg-blocks/wbg-card-simple",
	"wbg-blocks/wbg-card-staff",
	"wbg-blocks/wbg-card-styled",
];

const COLUMN_OPTIONS = [2, 3, 4];

const HEADING_FORMATS = ["core/bold", "core/italic"];

/**
 * Keep the column count inside the supported 2–4 range.
 *
 * @param {number|string} value Raw value.
 * @return {number} Clamped column count.
 */
const clampColumns = (value) => {
	const n = parseInt(value, 10);
	if (Number.isNaN(n)) {
		return 3;
	}
	return Math.min(4, Math.max(2, n));
};

/**
 * Convert a "var:preset|color|slug" value to a CSS custom property.
 *
 * @param {string} value Color value.
 * @return {string} CSS-ready color value.
 */
const toCssColor = (value) => {
	if (typeof value === "string" && value.startsWith("var:preset|color|")) {
		return `var(--wp--preset--color--${value.replace("var:preset|color|", "")})`;
	}
	return value;
};

export default function Edit({ attributes, setAttributes }) {
	const { showHeading, heading, headingAlign, textColor, style } = attributes;
	const columns = clampColumns(attributes.columns);
	const customTextColor = style?.color?.text;

	const blockProps = useBlockProps({
		className: `wbg-layout-grid-static wbg-layout-grid-static--cols-${columns}`,
	});

	const innerBlocksProps = useInnerBlocksProps(
		{ className: "wbg-layout-grid-static__grid" },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			templateLock: false,
			orientation: "horizontal",
			renderAppender: InnerBlocks.ButtonBlockAppender,
		},
	);

	const headingClassName = [
		"wbg-layout-grid-static__heading",
		"wp-block-heading",
		headingAlign ? `has-text-align-${headingAlign}` : "",
		textColor || customTextColor ? "has-text-color" : "",
		getColorClassName("color", textColor) || "",
	]
		.filter(Boolean)
		.join(" ");

	const headingStyle =
		customTextColor && !textColor
			? { color: toCssColor(customTextColor) }
			: undefined;

	return (
		<>
			{showHeading && (
				<BlockControls group="block">
					<AlignmentControl
						value={headingAlign}
						onChange={(value) => setAttributes({ headingAlign: value })}
					/>
				</BlockControls>
			)}

			<InspectorControls>
				<PanelBody title={__("Heading Settings", "wbg-blocks")}>
					<ToggleGroupControl
						label={__("Heading", "wbg-blocks")}
						hideLabelFromVision
						value={showHeading ? "heading" : "no-heading"}
						onChange={(value) =>
							setAttributes({ showHeading: value === "heading" })
						}
						isBlock
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					>
						<ToggleGroupControlOption
							value="heading"
							label={__("Heading", "wbg-blocks")}
						/>
						<ToggleGroupControlOption
							value="no-heading"
							label={__("No Heading", "wbg-blocks")}
						/>
					</ToggleGroupControl>
				</PanelBody>

				<PanelBody title={__("Grid settings", "wbg-blocks")}>
					<ToggleGroupControl
						label={__("Columns", "wbg-blocks")}
						help={__(
							"3 and 4 column grids show 2 columns on tablet and 1 on mobile.",
							"wbg-blocks",
						)}
						value={columns}
						onChange={(value) =>
							setAttributes({ columns: clampColumns(value) })
						}
						isBlock
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					>
						{COLUMN_OPTIONS.map((count) => (
							<ToggleGroupControlOption
								key={count}
								value={count}
								label={String(count)}
							/>
						))}
					</ToggleGroupControl>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div className="wbg-layout-grid-static__wrapper">
					{showHeading && (
						<RichText
							tagName="h1"
							className={headingClassName}
							style={headingStyle}
							value={heading}
							onChange={(value) => setAttributes({ heading: value })}
							allowedFormats={HEADING_FORMATS}
							placeholder={__("Add a heading…", "wbg-blocks")}
						/>
					)}
					<div {...innerBlocksProps} />
				</div>
			</div>
		</>
	);
}
