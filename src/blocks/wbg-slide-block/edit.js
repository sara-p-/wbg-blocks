/**
 * Slide - Block: editor view.
 *
 */

import { __ } from "@wordpress/i18n";
import { useState, useEffect } from "@wordpress/element";
import { prependHTTP } from "@wordpress/url";
import {
	useBlockProps,
	RichText,
	InspectorControls,
	BlockControls,
	__experimentalLinkControl as LinkControl,
} from "@wordpress/block-editor";
import {
	PanelBody,
	Popover,
	ToolbarButton,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";

const LINK_SETTINGS = [
	{
		id: "opensInNewTab",
		title: __("Open in new tab", "wbg-blocks"),
	},
	{
		id: "nofollow",
		title: __("Mark as nofollow", "wbg-blocks"),
	},
];

export default function Edit({ attributes, setAttributes, isSelected }) {
	const {
		overlay,
		heading,
		date,
		time,
		text,
		"button-text": buttonText,
		"button-link": buttonLink,
		"button-opens-in-new-tab": opensInNewTab,
		"button-nofollow": nofollow,
	} = attributes;

	const [isEditingLink, setIsEditingLink] = useState(false);
	const [popoverAnchor, setPopoverAnchor] = useState(null);

	// Close the link popover when the block is deselected.
	useEffect(() => {
		if (!isSelected) {
			setIsEditingLink(false);
		}
	}, [isSelected]);

	const blockProps = useBlockProps({
		className: ["wbg-slide-block", overlay === "overlay" ? "is-overlay" : ""]
			.filter(Boolean)
			.join(" "),
	});

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
				<PanelBody title={__("Overlay", "wbg-blocks")}>
					<ToggleGroupControl
						label={__("Background overlay", "wbg-blocks")}
						value={overlay}
						onChange={(value) => setAttributes({ overlay: value })}
						isBlock
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					>
						<ToggleGroupControlOption
							value="no-overlay"
							label={__("No overlay", "wbg-blocks")}
						/>
						<ToggleGroupControlOption
							value="overlay"
							label={__("Overlay", "wbg-blocks")}
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
				<div className="wbg-slide-block__inner">
					<div className="wbg-slide-block__col wbg-slide-block__col--meta">
						<div className="wbg-slide-block__date-time">
							<RichText
								identifier="date"
								tagName="h5"
								className="wp-block-heading wbg-slide-block__date"
								value={date}
								onChange={(value) => setAttributes({ date: value })}
								placeholder={__("Date…", "wbg-blocks")}
							/>
							<RichText
								identifier="time"
								tagName="h6"
								className="wp-block-heading wbg-slide-block__time"
								value={time}
								onChange={(value) => setAttributes({ time: value })}
								placeholder={__("Time…", "wbg-blocks")}
							/>
						</div>

						<div className="wp-block-button wbg-slide-block__button">
							<RichText
								ref={setPopoverAnchor}
								identifier="button-text"
								tagName="div"
								className="wp-block-button__link wp-element-button"
								value={buttonText}
								onChange={(value) => setAttributes({ "button-text": value })}
								placeholder={__("Add text…", "wbg-blocks")}
								allowedFormats={["core/bold", "core/italic"]}
								withoutInteractiveFormatting
							/>
						</div>
					</div>

					<div className="wbg-slide-block__col wbg-slide-block__col--content">
						<RichText
							identifier="heading"
							tagName="h2"
							className="wp-block-heading wbg-slide-block__heading"
							value={heading}
							onChange={(value) => setAttributes({ heading: value })}
							placeholder={__("Heading…", "wbg-blocks")}
						/>
						<RichText
							identifier="text"
							tagName="p"
							className="wbg-slide-block__text"
							value={text}
							onChange={(value) => setAttributes({ text: value })}
							placeholder={__("Text…", "wbg-blocks")}
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
						value={{
							url: buttonLink,
							opensInNewTab,
							nofollow,
						}}
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
