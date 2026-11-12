/**
 * Content - Curve - Images: editor view.
 *
 */
import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	RichText,
} from "@wordpress/block-editor";
import {
	PanelBody,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";

const ALLOWED_BLOCKS = ["wbg-blocks/wbg-slider-curve"];

const TEMPLATE = [["wbg-blocks/wbg-slider-curve"]];

const HEADING_FORMATS = ["core/bold", "core/italic"];

export default function Edit({ attributes, setAttributes }) {
	const { title, subheading, heading, text, contentPosition, style } =
		attributes;

	const isContentRight = contentPosition === "content-right";

	const blockProps = useBlockProps({
		className: [
			"wbg-content-curve-images",
			"alignfull",
			isContentRight ? "content--right" : "",
		]
			.filter(Boolean)
			.join(" "),
	});

	const innerBlocksProps = useInnerBlocksProps(
		{
			className: "wbg-content-curve-images__slider",
		},
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
			templateLock: true,
		},
	);

	return (
		<>
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
			</InspectorControls>

			<div {...blockProps}>
				{/* The innerBlocks slider */}
				<div className="wbg-content-curve-images__slider-container">
					<div {...innerBlocksProps} />
				</div>
				{/* Flexbox row with content */}
				<div className="wbg-content-curve-images__row">
					<div className="wbg-content-curve-images__col">
						<div className="wbg-content-curve-images__title-container">
							<RichText
								tagName="h2"
								className="wbg-content-curve-images__title h2--alt-small"
								value={title}
								onChange={(value) => setAttributes({ title: value })}
								placeholder={__("Title (optional)", "wbg-blocks")}
								allowedFormats={HEADING_FORMATS}
							/>
						</div>
						<div className="wbg-content-curve-images__content">
							<div className="wbg-content-curve-images__meta">
								<RichText
									tagName="p"
									className="wbg-content-curve-images__date"
									value={date}
									onChange={(value) => setAttributes({ date: value })}
									placeholder={__("Date", "wbg-blocks")}
									allowedFormats={HEADING_FORMATS}
								/>
								<RichText
									tagName="p"
									className="wbg-content-curve-images__time"
									value={time}
									onChange={(value) => setAttributes({ time: value })}
									placeholder={__("Time", "wbg-blocks")}
									allowedFormats={HEADING_FORMATS}
								/>
								<div className="wbg-content-curve-images__pricing">
									<RichText
										tagName="p"
										className="wbg-content-curve-images__price"
										value={price}
										onChange={(value) => setAttributes({ price: value })}
										placeholder={__("Price", "wbg-blocks")}
										allowedFormats={HEADING_FORMATS}
									/>
									<RichText
										tagName="p"
										className="wbg-content-curve-images__member-price"
										value={memberPrice}
										onChange={(value) => setAttributes({ memberPrice: value })}
										placeholder={__("Member Price", "wbg-blocks")}
										allowedFormats={HEADING_FORMATS}
									/>
								</div>
							</div>
							<RichText
								tagName="h6"
								className="wbg-content-curve-images__subheading"
								value={subheading}
								onChange={(value) => setAttributes({ subheading: value })}
								placeholder={__("Optional Subheading", "wbg-blocks")}
								allowedFormats={HEADING_FORMATS}
							/>
							<RichText
								tagName="h2"
								className="wbg-content-curve-images__heading"
								value={heading}
								onChange={(value) => setAttributes({ heading: value })}
								placeholder={__("Heading", "wbg-blocks")}
								allowedFormats={HEADING_FORMATS}
							/>
							<RichText
								tagName="p"
								className="wbg-content-curve-images__text"
								value={text}
								onChange={(value) => setAttributes({ text: value })}
								placeholder={__("Text", "wbg-blocks")}
								allowedFormats={HEADING_FORMATS}
							/>
							<div className="wbg-content-curve-images__buttons">
								<RichText
									tagName="p"
									className="wbg-content-curve-images__button-text"
									value={buttonText}
									onChange={(value) => setAttributes({ buttonText: value })}
									placeholder={__("Optional Button 1", "wbg-blocks")}
								/>
								<RichText
									tagName="p"
									className="wbg-content-curve-images__button-text"
									value={buttonText}
									onChange={(value) => setAttributes({ buttonText: value })}
									placeholder={__("Optional Button 1", "wbg-blocks")}
								/>
							</div>
						</div>
					</div>
					<div className="wbg-content-curve-images__col fake-slider-container"></div>
				</div>
			</div>
		</>
	);
}
