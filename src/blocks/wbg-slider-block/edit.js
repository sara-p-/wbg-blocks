/**
 * Slider - Block: editor view.
 *
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
		autoplay,
		"button-text": buttonText,
		"button-link": buttonLink,
		"button-opens-in-new-tab": opensInNewTab,
		"button-nofollow": nofollow,
	} = attributes;

	const [isEditingLink, setIsEditingLink] = useState(false);
	const [popoverAnchor, setPopoverAnchor] = useState(null);

	const slideCount = useSelect(
		(select) => select(blockEditorStore).getBlockCount(clientId),
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

	return (
		<>
			<InspectorControls>
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
					<RichText
						identifier="heading"
						tagName="h2"
						className="wp-block-heading wbg-slider-block__heading"
						value={heading}
						onChange={(value) => setAttributes({ heading: value })}
						placeholder={__("Heading (optional)…", "wbg-blocks")}
					/>
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
