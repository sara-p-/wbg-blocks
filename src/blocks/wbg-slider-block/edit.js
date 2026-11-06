/**
 * Slider - Block: editor view.
 *
 * Above the slides, a heading row holds an optional H2 heading and an
 * optional paragraph of text, laid out in one column (heading above text)
 * or two (heading left, text right) via the "Heading type" setting.
 */
import { __ } from "@wordpress/i18n";
import { useState } from "@wordpress/element";
import { useSelect } from "@wordpress/data";
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
	InspectorControls,
	BlockControls,
	AlignmentControl,
	RichText,
	store as blockEditorStore,
	__experimentalLinkControl as LinkControl,
} from "@wordpress/block-editor";
import {
	PanelBody,
	Popover,
	ToolbarButton,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";
import { prependHTTP } from "@wordpress/url";

const ALLOWED_BLOCKS = [
	"wbg-blocks/wbg-slide-block",
	"wbg-blocks/wbg-slide-simple",
];
const TEMPLATE = [["wbg-blocks/wbg-slide-block"]];

const HEADING_TYPES = ["1-col", "2-col"];

const HEADING_FORMATS = ["core/bold", "core/italic"];

const LINK_SETTINGS = [
	{ id: "opensInNewTab", title: __("Open in new tab", "wbg-blocks") },
	{ id: "nofollow", title: __("Mark as nofollow", "wbg-blocks") },
];

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
		autoplay,
		"button-text": buttonText,
		"button-link": buttonLink,
		"button-opens-in-new-tab": opensInNewTab,
		"button-nofollow": nofollow,
	} = attributes;

	const headingType = HEADING_TYPES.includes(attributes.headingType)
		? attributes.headingType
		: "1-col";

	const [isEditingLink, setIsEditingLink] = useState(false);
	const [popoverAnchor, setPopoverAnchor] = useState(null);

	const slideCount = useSelect(
		(select) => select(blockEditorStore).getBlockCount(clientId),
		[clientId],
	);

	// The toolbar's alignment control follows the field being edited: it
	// aligns the text while the cursor is in the text field, and the heading
	// otherwise.
	const isEditingText = useSelect(
		(select) => {
			const selection = select(blockEditorStore).getSelectionStart();
			return (
				selection?.clientId === clientId && selection?.attributeKey === "text"
			);
		},
		[clientId],
	);

	const blockProps = useBlockProps({
		className: "wbg-slider-block wbg-slider-block--editor alignfull",
	});

	// Slides sit in a horizontal, scrollable track.
	const innerBlocksProps = useInnerBlocksProps(
		{ className: "wbg-slider-block__track" },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
			templateLock: false,
			orientation: "horizontal",
			renderAppender: InnerBlocks.ButtonBlockAppender,
		},
	);

	const unlink = () => {
		setAttributes({
			"button-link": "",
			"button-opens-in-new-tab": false,
			"button-nofollow": false,
		});
		setIsEditingLink(false);
	};

	const headingClassName = [
		"wp-block-heading",
		"wbg-slider-block__heading",
		headingAlign ? `has-text-align-${headingAlign}` : "",
	]
		.filter(Boolean)
		.join(" ");

	const textClassName = [
		"wbg-slider-block__text",
		textAlign ? `has-text-align-${textAlign}` : "",
	]
		.filter(Boolean)
		.join(" ");

	const headingField = (
		<RichText
			identifier="heading"
			tagName="h2"
			className={headingClassName}
			value={heading}
			onChange={(value) => setAttributes({ heading: value })}
			allowedFormats={HEADING_FORMATS}
			placeholder={__("Heading (optional)…", "wbg-blocks")}
		/>
	);

	const textField = (
		<RichText
			identifier="text"
			tagName="p"
			className={textClassName}
			value={text}
			onChange={(value) => setAttributes({ text: value })}
			placeholder={__("Text (optional)…", "wbg-blocks")}
		/>
	);

	return (
		<>
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

				<PanelBody title={__("Settings", "wbg-blocks")}>
					<ToggleGroupControl
						label={__("Autoplay", "wbg-blocks")}
						value={autoplay}
						onChange={(value) => setAttributes({ autoplay: value })}
						isBlock
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					>
						<ToggleGroupControlOption
							value="autoplay"
							label={__("Autoplay", "wbg-blocks")}
						/>
						<ToggleGroupControlOption
							value="static"
							label={__("Static", "wbg-blocks")}
						/>
					</ToggleGroupControl>
				</PanelBody>
			</InspectorControls>

			<BlockControls group="block">
				{isEditingText ? (
					<AlignmentControl
						label={__("Align text", "wbg-blocks")}
						value={textAlign}
						onChange={(value) => setAttributes({ textAlign: value })}
					/>
				) : (
					<AlignmentControl
						label={__("Align heading", "wbg-blocks")}
						value={headingAlign}
						onChange={(value) => setAttributes({ headingAlign: value })}
					/>
				)}
				<ToolbarButton
					icon="admin-links"
					label={__("Button link", "wbg-blocks")}
					onClick={() => setIsEditingLink((open) => !open)}
					isActive={!!buttonLink || isEditingLink}
				/>
				{!!buttonLink && (
					<ToolbarButton
						icon="editor-unlink"
						label={__("Remove button link", "wbg-blocks")}
						onClick={unlink}
					/>
				)}
			</BlockControls>

			<div {...blockProps}>
				<div className="wbg-slider-block__header">
					<div
						className={`wbg-slider-block__row wbg-slider-block__row--${headingType}`}
					>
						{"2-col" === headingType ? (
							<>
								<div className="wbg-slider-block__col">{headingField}</div>
								<div className="wbg-slider-block__col">{textField}</div>
							</>
						) : (
							<div className="wbg-slider-block__col">
								{headingField}
								{textField}
							</div>
						)}
					</div>
				</div>

				<div className="wbg-slider-block__viewport">
					<div {...innerBlocksProps} />
				</div>

				{slideCount > 1 && (
					<div className="wbg-slider-block__dots" aria-hidden="true">
						{Array.from({ length: slideCount }, (_, i) => (
							<span
								key={i}
								className={`wbg-slider-block__dot${0 === i ? " is-active" : ""}`}
							/>
						))}
					</div>
				)}

				<div className="wbg-slider-block__footer">
					<div className="wp-block-button wbg-slider-block__button">
						<RichText
							ref={setPopoverAnchor}
							identifier="button-text"
							tagName="div"
							className="wp-block-button__link wp-element-button"
							value={buttonText}
							onChange={(value) => setAttributes({ "button-text": value })}
							placeholder={__("Button (optional)…", "wbg-blocks")}
							allowedFormats={["core/bold", "core/italic"]}
							withoutInteractiveFormatting
						/>
					</div>
				</div>
			</div>

			{isSelected && isEditingLink && (
				<Popover
					placement="bottom"
					anchor={popoverAnchor}
					onClose={() => setIsEditingLink(false)}
					focusOnMount="firstElement"
					shift
				>
					<LinkControl
						value={{ url: buttonLink, opensInNewTab, nofollow }}
						settings={LINK_SETTINGS}
						forceIsEditingLink={!buttonLink}
						onChange={({
							url = "",
							opensInNewTab: newTab = false,
							nofollow: newNofollow = false,
						}) =>
							setAttributes({
								"button-link": url ? prependHTTP(url) : "",
								"button-opens-in-new-tab": newTab,
								"button-nofollow": newNofollow,
							})
						}
						onRemove={unlink}
					/>
				</Popover>
			)}
		</>
	);
}
