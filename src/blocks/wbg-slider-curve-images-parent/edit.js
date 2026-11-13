/**
 * Content - Curve - Images: editor view.
 *
 * Markup matches render.php, but the editor always uses the same tags:
 * title h2.h2--alt-small, meta p, subheading h6, heading h2.h2--alt-small.
 * Only render.php changes heading levels for accessibility.
 *
 * The title circle sits in its own row above the two-column flex row, so
 * it isn't part of the content column.
 *
 * Slides: the Slider - Curve block keeps its own horizontally scrolling row
 * of slides in the editor, with a "+" appender at the end. On top of that,
 * this block adds an "Add slide" button to its toolbar and sidebar so slides
 * can be added without first digging into the slider.
 */
import { __, _n, sprintf } from "@wordpress/i18n";
import { useEffect, useState } from "@wordpress/element";
import { useSelect, useDispatch } from "@wordpress/data";
import { createBlock } from "@wordpress/blocks";
import { prependHTTP } from "@wordpress/url";
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	BlockControls,
	RichText,
	store as blockEditorStore,
	__experimentalLinkControl as LinkControl,
} from "@wordpress/block-editor";
import {
	Button,
	PanelBody,
	Popover,
	ToolbarButton,
	ToolbarGroup,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";
import { link, linkOff, plus } from "@wordpress/icons";

const ALLOWED_BLOCKS = ["wbg-blocks/wbg-slider-curve-child"];
const TEMPLATE = [["wbg-blocks/wbg-slider-curve-child"]];
const SLIDE_BLOCK = "wbg-blocks/wbg-slide-image";

const TEXT_FORMATS = ["core/bold", "core/italic"];

export default function Edit({
	clientId,
	attributes,
	setAttributes,
	isSelected,
}) {
	const {
		contentPosition,
		title,
		date,
		time,
		price,
		memberPrice,
		subheading,
		heading,
		text,
	} = attributes;

	const isContentRight = contentPosition === "content-right";

	/* ------------------------------------------------------------------ */
	/* Buttons + link popover                                             */
	/* ------------------------------------------------------------------ */

	const buttons = [
		{
			key: "button1",
			className: "",
			placeholder: __("Optional Button 1", "wbg-blocks"),
		},
		{
			key: "button2",
			className: "wbg-slider-curve-images-parent__button--outline",
			placeholder: __("Optional Button 2", "wbg-blocks"),
		},
	];

	const linkSettings = [
		{ id: "opensInNewTab", title: __("Open in new tab", "wbg-blocks") },
		{ id: "nofollow", title: __("Mark as nofollow", "wbg-blocks") },
	];

	// Which button's text is focused, so the toolbar knows what to link.
	const [activeButton, setActiveButton] = useState(null);
	const [isEditingLink, setIsEditingLink] = useState(false);

	// Separate state per anchor keeps the ref callbacks stable.
	const [button1Anchor, setButton1Anchor] = useState(null);
	const [button2Anchor, setButton2Anchor] = useState(null);
	const anchors = { button1: button1Anchor, button2: button2Anchor };
	const anchorSetters = {
		button1: setButton1Anchor,
		button2: setButton2Anchor,
	};

	useEffect(() => {
		if (!isSelected) {
			setActiveButton(null);
			setIsEditingLink(false);
		}
	}, [isSelected]);

	// Focus anywhere in the block decides whether a button is active.
	// The toolbar and link popover render outside this element, so using
	// them doesn't clear the active button.
	const handleFocus = (event) => {
		const buttonEl = event.target?.closest?.("[data-wbg-button]");
		const next = buttonEl ? buttonEl.dataset.wbgButton : null;
		if (next !== activeButton) {
			setActiveButton(next);
			setIsEditingLink(false);
		}
	};

	const updateLink = (
		key,
		{ url = "", opensInNewTab = false, nofollow = false } = {},
	) => {
		setAttributes({
			[`${key}Url`]: url ? prependHTTP(url) : "",
			[`${key}OpensInNewTab`]: !!opensInNewTab,
			[`${key}Nofollow`]: !!nofollow,
		});
	};

	const activeUrl = activeButton ? attributes[`${activeButton}Url`] : "";

	/* ------------------------------------------------------------------ */
	/* Slides                                                             */
	/* ------------------------------------------------------------------ */

	const { sliderClientId, slideCount } = useSelect(
		(select) => {
			const { getBlockOrder } = select(blockEditorStore);
			const sliderId = getBlockOrder(clientId)[0];
			return {
				sliderClientId: sliderId,
				slideCount: sliderId ? getBlockOrder(sliderId).length : 0,
			};
		},
		[clientId],
	);

	const { insertBlock } = useDispatch(blockEditorStore);

	const addSlide = () => {
		if (!sliderClientId) {
			return;
		}
		// Appends to the end of the slider and selects the new slide.
		insertBlock(createBlock(SLIDE_BLOCK), undefined, sliderClientId);
	};

	/* ------------------------------------------------------------------ */
	/* Markup                                                             */
	/* ------------------------------------------------------------------ */

	const blockProps = useBlockProps({
		className: [
			"wbg-slider-curve-images-parent",
			"alignfull",
			isContentRight ? "content--right" : "",
		]
			.filter(Boolean)
			.join(" "),
		onFocus: handleFocus,
	});

	const innerBlocksProps = useInnerBlocksProps(
		{ className: "wbg-slider-curve-images-parent__slider" },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
			// The slider can't be removed or moved. The slider sets its own
			// templateLock: false, so slides can still be added and removed.
			templateLock: "all",
		},
	);

	return (
		<>
			<BlockControls group="other">
				<ToolbarGroup>
					<ToolbarButton
						icon={plus}
						label={__("Add slide", "wbg-blocks")}
						onClick={addSlide}
						disabled={!sliderClientId}
					/>
				</ToolbarGroup>
			</BlockControls>

			{isSelected && activeButton && (
				<BlockControls group="block">
					<ToolbarButton
						icon={link}
						label={__("Link", "wbg-blocks")}
						onClick={() => setIsEditingLink(true)}
						isActive={!!activeUrl}
					/>
					{!!activeUrl && (
						<ToolbarButton
							icon={linkOff}
							label={__("Unlink", "wbg-blocks")}
							onClick={() => {
								updateLink(activeButton);
								setIsEditingLink(false);
							}}
						/>
					)}
				</BlockControls>
			)}

			{isSelected && activeButton && isEditingLink && (
				<Popover
					placement="bottom"
					anchor={anchors[activeButton]}
					onClose={() => setIsEditingLink(false)}
					focusOnMount="firstElement"
					shift
				>
					<LinkControl
						value={{
							url: activeUrl,
							opensInNewTab: attributes[`${activeButton}OpensInNewTab`],
							nofollow: attributes[`${activeButton}Nofollow`],
						}}
						onChange={(value) => updateLink(activeButton, value)}
						onRemove={() => {
							updateLink(activeButton);
							setIsEditingLink(false);
						}}
						settings={linkSettings}
					/>
				</Popover>
			)}

			<InspectorControls>
				<PanelBody title={__("Layout", "wbg-blocks")}>
					<ToggleGroupControl
						label={__("Content position", "wbg-blocks")}
						value={contentPosition}
						onChange={(value) => setAttributes({ contentPosition: value })}
						isBlock
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					>
						<ToggleGroupControlOption
							value="content-left"
							label={__("Content Left", "wbg-blocks")}
						/>
						<ToggleGroupControlOption
							value="content-right"
							label={__("Content Right", "wbg-blocks")}
						/>
					</ToggleGroupControl>
				</PanelBody>
				<PanelBody title={__("Slides", "wbg-blocks")}>
					<p>
						{sprintf(
							/* translators: %d: number of slides. */
							_n("%d slide.", "%d slides.", slideCount, "wbg-blocks"),
							slideCount,
						)}{" "}
						{__(
							"Scroll the slider sideways to see every slide. Select a slide to change its image.",
							"wbg-blocks",
						)}
					</p>
					<Button
						variant="secondary"
						icon={plus}
						onClick={addSlide}
						disabled={!sliderClientId}
						__next40pxDefaultSize
					>
						{__("Add slide", "wbg-blocks")}
					</Button>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				{/* Title circle: outside the flex row, lined up with the content column. */}
				<div className="wbg-slider-curve-images-parent__title-row">
					<div className="wbg-slider-curve-images-parent__title-container">
						<RichText
							tagName="h2"
							className="wbg-slider-curve-images-parent__title h2--alt-small"
							value={title}
							onChange={(value) => setAttributes({ title: value })}
							placeholder={__("Title (optional)", "wbg-blocks")}
							allowedFormats={TEXT_FORMATS}
						/>
					</div>
				</div>

				<div className="wbg-slider-curve-images-parent__row">
					<div className="wbg-slider-curve-images-parent__col wbg-slider-curve-images-parent__col--content">
						<div className="wbg-slider-curve-images-parent__content">
							<div className="wbg-slider-curve-images-parent__meta">
								<p className="wbg-slider-curve-images-parent__meta-line">
									<RichText
										tagName="span"
										className="wbg-slider-curve-images-parent__date"
										value={date}
										onChange={(value) => setAttributes({ date: value })}
										placeholder={__("Date", "wbg-blocks")}
										allowedFormats={TEXT_FORMATS}
									/>{" "}
									<span
										className="wbg-slider-curve-images-parent__sep"
										aria-hidden="true"
									>
										|
									</span>{" "}
									<RichText
										tagName="span"
										className="wbg-slider-curve-images-parent__time"
										value={time}
										onChange={(value) => setAttributes({ time: value })}
										placeholder={__("Time", "wbg-blocks")}
										allowedFormats={TEXT_FORMATS}
									/>
								</p>
								<p className="wbg-slider-curve-images-parent__meta-line">
									<span className="wbg-slider-curve-images-parent__price">
										<RichText
											tagName="span"
											value={price}
											onChange={(value) => setAttributes({ price: value })}
											placeholder={__("Price", "wbg-blocks")}
											allowedFormats={TEXT_FORMATS}
										/>{" "}
										<span className="wbg-slider-curve-images-parent__price-label">
											{__("Non-Members", "wbg-blocks")}
										</span>
									</span>{" "}
									<span
										className="wbg-slider-curve-images-parent__sep"
										aria-hidden="true"
									>
										|
									</span>{" "}
									<span className="wbg-slider-curve-images-parent__member-price">
										<RichText
											tagName="span"
											value={memberPrice}
											onChange={(value) =>
												setAttributes({ memberPrice: value })
											}
											placeholder={__("Member Price", "wbg-blocks")}
											allowedFormats={TEXT_FORMATS}
										/>{" "}
										<span className="wbg-slider-curve-images-parent__price-label">
											{__("Members", "wbg-blocks")}
										</span>
									</span>
								</p>
							</div>

							<RichText
								tagName="h6"
								className="wbg-slider-curve-images-parent__subheading"
								value={subheading}
								onChange={(value) => setAttributes({ subheading: value })}
								placeholder={__("Optional Subheading", "wbg-blocks")}
								allowedFormats={TEXT_FORMATS}
							/>
							<RichText
								tagName="h2"
								className="wbg-slider-curve-images-parent__heading h2--alt-small"
								value={heading}
								onChange={(value) => setAttributes({ heading: value })}
								placeholder={__("Heading", "wbg-blocks")}
								allowedFormats={TEXT_FORMATS}
							/>
							<RichText
								tagName="p"
								className="wbg-slider-curve-images-parent__text"
								value={text}
								onChange={(value) => setAttributes({ text: value })}
								placeholder={__("Text", "wbg-blocks")}
								allowedFormats={TEXT_FORMATS}
							/>

							<div className="wbg-slider-curve-images-parent__buttons">
								{buttons.map(({ key, className, placeholder }) => (
									<RichText
										key={key}
										ref={anchorSetters[key]}
										data-wbg-button={key}
										tagName="div"
										className={[
											"wp-element-button",
											"wbg-slider-curve-images-parent__button",
											className,
										]
											.filter(Boolean)
											.join(" ")}
										value={attributes[`${key}Text`]}
										onChange={(value) =>
											setAttributes({ [`${key}Text`]: value })
										}
										placeholder={placeholder}
										allowedFormats={TEXT_FORMATS}
										withoutInteractiveFormatting
										identifier={`${key}Text`}
									/>
								))}
							</div>
						</div>
					</div>

					{/* Empty column: reserves the space the slider sits in. */}
					<div className="wbg-slider-curve-images-parent__col wbg-slider-curve-images-parent__col--spacer fake-slider-container" />

					{/* Absolutely positioned on desktop; below the content on mobile. */}
					<div className="wbg-slider-curve-images-parent__slider-container">
						<div {...innerBlocksProps} />
					</div>
				</div>
			</div>
		</>
	);
}
