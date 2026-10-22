/**
 * Card - Styled: editor view.
 */
import { __ } from "@wordpress/i18n";
import { useState } from "@wordpress/element";
import {
	useBlockProps,
	RichText,
	InspectorControls,
	BlockControls,
	__experimentalLinkControl as LinkControl,
} from "@wordpress/block-editor";
import {
	PanelBody,
	SelectControl,
	TextControl,
	ToolbarButton,
	Popover,
} from "@wordpress/components";
import { link, linkOff } from "@wordpress/icons";
import { prependHTTP } from "@wordpress/url";

import { ICONS, ICON_OPTIONS } from "./icons";

/**
 * Turns a stored spacing value ("var:preset|spacing|24" or "2rem")
 * into something CSS understands. Mirrors the helper in render.php.
 */
function toCssValue(value) {
	if (typeof value !== "string" || value === "") {
		return undefined;
	}
	if (value.startsWith("var:")) {
		return `var(--wp--${value.slice(4).split("|").join("--")})`;
	}
	return value;
}

/** True when rich text has visible characters (not just empty tags). */
function hasText(html) {
	return !!html && html.replace(/<[^>]*>/g, "").trim() !== "";
}

export default function Edit({ attributes, setAttributes, isSelected }) {
	const {
		heading,
		text,
		buttonText,
		buttonUrl,
		buttonOpensInNewTab,
		buttonAriaLabel,
		icon,
		style,
	} = attributes;

	const [isEditingURL, setIsEditingURL] = useState(false);
	const [popoverAnchor, setPopoverAnchor] = useState(null);

	const blockProps = useBlockProps({
		className: "wbg-card-styled",
	});

	const gap = toCssValue(style?.spacing?.blockGap);
	const IconComponent = ICONS[icon]?.Component;
	const hasButtonText = hasText(buttonText);

	// The button field stays visible while the block is selected so it can be
	// filled in; once deselected it only shows if it actually has text.
	const showButton = isSelected || hasButtonText;
	const showFooter = showButton || !!IconComponent;

	const unlink = () => {
		setAttributes({ buttonUrl: "", buttonOpensInNewTab: false });
		setIsEditingURL(false);
	};

	return (
		<>
			<BlockControls group="block">
				<ToolbarButton
					name="link"
					icon={link}
					title={__("Button link", "wbg-blocks")}
					onClick={() => setIsEditingURL(true)}
					isActive={!!buttonUrl}
				/>
				{!!buttonUrl && (
					<ToolbarButton
						name="unlink"
						icon={linkOff}
						title={__("Remove button link", "wbg-blocks")}
						onClick={unlink}
					/>
				)}
			</BlockControls>

			{isSelected && isEditingURL && (
				<Popover
					placement="bottom"
					anchor={popoverAnchor}
					onClose={() => setIsEditingURL(false)}
					focusOnMount="firstElement"
					shift
				>
					<LinkControl
						value={{ url: buttonUrl, opensInNewTab: buttonOpensInNewTab }}
						onChange={({ url: newUrl = "", opensInNewTab: newTab }) =>
							setAttributes({
								buttonUrl: prependHTTP(newUrl),
								buttonOpensInNewTab: !!newTab,
							})
						}
						onRemove={unlink}
						forceIsEditingLink={!buttonUrl}
					/>
				</Popover>
			)}

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

				{hasButtonText && (
					<PanelBody title={__("Button", "wbg-blocks")}>
						<TextControl
							label={__("Accessible label (optional)", "wbg-blocks")}
							help={__(
								"Replaces the button text for screen readers. Use it when the visible text isn't descriptive on its own, e.g. “Learn more about our tours”.",
								"wbg-blocks",
							)}
							value={buttonAriaLabel}
							onChange={(value) => setAttributes({ buttonAriaLabel: value })}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
					</PanelBody>
				)}
			</InspectorControls>

			<div {...blockProps}>
				<div
					className="wbg-card-styled__column"
					style={gap ? { "--wbg-card-gap": gap } : undefined}
				>
					<div className="wbg-card-styled__row wbg-card-styled__row--content">
						<RichText
							tagName="h2"
							className="wbg-card-styled__heading wp-block-heading"
							value={heading}
							onChange={(value) => setAttributes({ heading: value })}
							placeholder={__("Heading", "wbg-blocks")}
						/>
						<RichText
							tagName="p"
							className="wbg-card-styled__text"
							value={text}
							onChange={(value) => setAttributes({ text: value })}
							placeholder={__("Type your text…", "wbg-blocks")}
						/>
					</div>

					{showFooter && (
						<div className="wbg-card-styled__row wbg-card-styled__row--footer">
							{showButton && (
								<div className="wp-block-button is-style-small-size is-style-small-size--4 wbg-card-styled__button-wrap">
									<RichText
										ref={setPopoverAnchor}
										tagName="div"
										className="wp-block-button__link wp-element-button wbg-card-styled__button"
										value={buttonText}
										onChange={(value) => setAttributes({ buttonText: value })}
										placeholder={__(
											"Add button text (optional)…",
											"wbg-blocks",
										)}
										allowedFormats={["core/bold", "core/italic"]}
										withoutInteractiveFormatting
										aria-label={__("Button text", "wbg-blocks")}
									/>
								</div>
							)}

							{IconComponent && (
								<span className="wbg-card-styled__icon" aria-hidden="true">
									<IconComponent focusable="false" />
								</span>
							)}
						</div>
					)}
				</div>
			</div>
		</>
	);
}
