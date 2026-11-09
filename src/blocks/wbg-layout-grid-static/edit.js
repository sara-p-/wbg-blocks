/**
 * Layout - Grid - Static: editor view.
 *
 * Renders a heading row (an H1 heading plus a paragraph of text) above a
 * 2–4 column grid of card blocks. The "Heading type" setting lays the row
 * out as one column (heading above text) or two columns (heading left, text
 * right). An optional footer (a short centred paragraph and a centred
 * button) sits beneath the grid.
 *
 * Padding, background color and background image come from native block
 * supports (see block.json), which useBlockProps() applies to the outer
 * wrapper. Text color serialization is skipped on the wrapper and applied to
 * the heading, text and footer text only.
 */
import { __ } from "@wordpress/i18n";
import { useState } from "@wordpress/element";
import { useSelect } from "@wordpress/data";
import { prependHTTP } from "@wordpress/url";
import {
	store as blockEditorStore,
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	BlockControls,
	AlignmentControl,
	InnerBlocks,
	RichText,
	getColorClassName,
	__experimentalLinkControl as LinkControl,
} from "@wordpress/block-editor";
import {
	PanelBody,
	Popover,
	ToolbarButton,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";

const ALLOWED_BLOCKS = [
	"wbg-blocks/wbg-card-icon",
	"wbg-blocks/wbg-card-image",
	"wbg-blocks/wbg-card-simple",
	"wbg-blocks/wbg-card-staff",
	"wbg-blocks/wbg-card-styled",
	"wbg-blocks/wbg-card-circle",
];

const COLUMN_OPTIONS = [2, 3, 4];

const HEADING_TYPES = ["1-col", "2-col"];

const HEADING_FORMATS = ["core/bold", "core/italic"];

const BUTTON_FORMATS = ["core/bold", "core/italic"];

// Same options the native link control shows.
const LINK_SETTINGS = [
	{ id: "opensInNewTab", title: __("Open in new tab", "wbg-blocks") },
	{ id: "nofollow", title: __("Mark as nofollow", "wbg-blocks") },
];

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

export default function Edit({
	attributes,
	setAttributes,
	clientId,
	isSelected,
}) {
	const {
		heading,
		headingAlign,
		text,
		textAlign,
		footerText,
		buttonText,
		buttonUrl,
		buttonOpensInNewTab,
		buttonNofollow,
		contentWidth,
		textColor,
		style,
	} = attributes;

	const [isEditingLink, setIsEditingLink] = useState(false);
	const [buttonAnchor, setButtonAnchor] = useState(null);

	// Which of this block's rich text fields holds the cursor, if any.
	const selectedField = useSelect(
		(select) => {
			const selection = select(blockEditorStore).getSelectionStart();
			return selection?.clientId === clientId ? selection?.attributeKey : null;
		},
		[clientId],
	);
	const headingType = HEADING_TYPES.includes(attributes.headingType)
		? attributes.headingType
		: "1-col";
	const columns = clampColumns(attributes.columns);
	const customTextColor = style?.color?.text;

	const classes = [
		"wbg-layout-grid-static",
		`wbg-layout-grid-static--cols-${columns}`,
		contentWidth === "wide" && "is-width--wide",
	]
		.filter(Boolean)
		.join(" ");

	const blockProps = useBlockProps({ className: classes });

	const innerBlocksProps = useInnerBlocksProps(
		{ className: "wbg-layout-grid-static__grid" },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			templateLock: false,
			orientation: "horizontal",
			renderAppender: InnerBlocks.ButtonBlockAppender,
		},
	);

	// Text color classes, shared by the heading, text and footer text.
	const colorClassName = [
		textColor || customTextColor ? "has-text-color" : "",
		getColorClassName("color", textColor) || "",
	];

	const colorStyle =
		customTextColor && !textColor
			? { color: toCssColor(customTextColor) }
			: undefined;

	const headingClassName = [
		"wbg-layout-grid-static__heading",
		"wp-block-heading",
		headingAlign ? `has-text-align-${headingAlign}` : "",
		...colorClassName,
	]
		.filter(Boolean)
		.join(" ");

	const textClassName = [
		"wbg-layout-grid-static__text",
		textAlign ? `has-text-align-${textAlign}` : "",
		...colorClassName,
	]
		.filter(Boolean)
		.join(" ");

	const footerTextClassName = [
		"wbg-layout-grid-static__footer-text",
		...colorClassName,
	]
		.filter(Boolean)
		.join(" ");

	const removeLink = () => {
		setAttributes({
			buttonUrl: "",
			buttonOpensInNewTab: false,
			buttonNofollow: false,
		});
		setIsEditingLink(false);
	};

	const headingField = (
		<RichText
			identifier="heading"
			tagName="h1"
			className={headingClassName}
			style={colorStyle}
			value={heading}
			onChange={(value) => setAttributes({ heading: value })}
			allowedFormats={HEADING_FORMATS}
			placeholder={__("Add a heading…", "wbg-blocks")}
		/>
	);

	const textField = (
		<RichText
			identifier="text"
			tagName="p"
			className={textClassName}
			style={colorStyle}
			value={text}
			onChange={(value) => setAttributes({ text: value })}
			placeholder={__("Add text…", "wbg-blocks")}
		/>
	);

	// Alignment follows the field being edited: the text while the cursor is
	// in it, nothing for the footer fields (they're always centred), and the
	// heading otherwise.
	let alignmentControl = null;

	if ("text" === selectedField) {
		alignmentControl = (
			<AlignmentControl
				label={__("Align text", "wbg-blocks")}
				value={textAlign}
				onChange={(value) => setAttributes({ textAlign: value })}
			/>
		);
	} else if (!["footerText", "buttonText"].includes(selectedField)) {
		alignmentControl = (
			<AlignmentControl
				label={__("Align heading", "wbg-blocks")}
				value={headingAlign}
				onChange={(value) => setAttributes({ headingAlign: value })}
			/>
		);
	}

	return (
		<>
			<BlockControls group="block">
				{alignmentControl}

				<ToolbarButton
					icon="admin-links"
					label={__("Button link", "wbg-blocks")}
					onClick={() => setIsEditingLink((open) => !open)}
					isActive={!!buttonUrl || isEditingLink}
				/>
				{!!buttonUrl && (
					<ToolbarButton
						icon="editor-unlink"
						label={__("Remove button link", "wbg-blocks")}
						onClick={removeLink}
					/>
				)}
			</BlockControls>

			<InspectorControls>
				<PanelBody title={__("Heading Settings", "wbg-blocks")}>
					<ToggleGroupControl
						label={__("Heading type", "wbg-blocks")}
						help={__(
							"2 Column places the heading and text side by side. They stack on mobile.",
							"wbg-blocks",
						)}
						value={headingType}
						onChange={(value) => setAttributes({ headingType: value })}
						isBlock
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					>
						<ToggleGroupControlOption
							value="1-col"
							label={__("1 Column", "wbg-blocks")}
						/>
						<ToggleGroupControlOption
							value="2-col"
							label={__("2 Column", "wbg-blocks")}
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

					<ToggleGroupControl
						label={__("Content Width", "wbg-blocks")}
						value={contentWidth}
						onChange={(value) => setAttributes({ contentWidth: value })}
						isBlock
						__next40pxDefaultSize
						__nextHasNoMarginBottom
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
				<div className="wbg-layout-grid-static__wrapper">
					<div
						className={`wbg-layout-grid-static__row wbg-layout-grid-static__row--${headingType}`}
					>
						{"2-col" === headingType ? (
							<>
								<div className="wbg-layout-grid-static__col">
									{headingField}
								</div>
								<div className="wbg-layout-grid-static__col">{textField}</div>
							</>
						) : (
							<div className="wbg-layout-grid-static__col">
								{headingField}
								{textField}
							</div>
						)}
					</div>
					<div {...innerBlocksProps} />

					<div className="wbg-layout-grid-static__footer">
						<RichText
							identifier="footerText"
							tagName="p"
							className={footerTextClassName}
							style={colorStyle}
							value={footerText}
							onChange={(value) => setAttributes({ footerText: value })}
							placeholder={__("Add text (optional)…", "wbg-blocks")}
						/>

						<div className="wp-block-button wbg-layout-grid-static__button">
							<RichText
								ref={setButtonAnchor}
								identifier="buttonText"
								tagName="div"
								className="wp-block-button__link wp-element-button"
								value={buttonText}
								onChange={(value) => setAttributes({ buttonText: value })}
								placeholder={__("Add button text (optional)…", "wbg-blocks")}
								allowedFormats={BUTTON_FORMATS}
								withoutInteractiveFormatting
							/>
						</div>
					</div>
				</div>
			</div>

			{isSelected && isEditingLink && (
				<Popover
					placement="bottom"
					anchor={buttonAnchor}
					onClose={() => setIsEditingLink(false)}
					focusOnMount="firstElement"
					shift
				>
					<LinkControl
						value={{
							url: buttonUrl,
							opensInNewTab: buttonOpensInNewTab,
							nofollow: buttonNofollow,
						}}
						settings={LINK_SETTINGS}
						forceIsEditingLink={!buttonUrl}
						onChange={({ url = "", opensInNewTab = false, nofollow = false }) =>
							setAttributes({
								buttonUrl: url ? prependHTTP(url) : "",
								buttonOpensInNewTab: opensInNewTab,
								buttonNofollow: nofollow,
							})
						}
						onRemove={removeLink}
					/>
				</Popover>
			)}
		</>
	);
}
