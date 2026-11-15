/**
 * Slide - Curve - Full: editor view.
 *
 */
import { __ } from "@wordpress/i18n";

import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	RichText,
	__experimentalGetGapCSSValue as getGapCSSValue,
} from "@wordpress/block-editor";
import {
	PanelBody,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";

const ALLOWED_BLOCKS = [
	"core/paragraph",
	"core/buttons",
	"core/list",
	"core/image",
];
const TEMPLATE = [
	["core/paragraph"],
	["core/buttons", {}, [["core/button"], ["core/button"]]],
];

const TEXT_FORMATS = ["core/bold", "core/italic"];

export default function Edit({ attributes, setAttributes }) {
	const {
		contentPosition,
		date,
		time,
		price,
		memberPrice,
		subheading,
		heading,
		style,
	} = attributes;

	const isContentRight = contentPosition === "content-right";

	/* ------------------------------------------------------------------ */
	/* Block supports we apply ourselves (serialization is skipped)       */
	/* ------------------------------------------------------------------ */

	// Background image -> the __image div, not the block wrapper.
	// Size/position/repeat fall back to the defaults in style.scss.
	const background = style?.background;
	const backgroundUrl = background?.backgroundImage?.url;
	const imageStyle = backgroundUrl
		? {
				backgroundImage: `url("${backgroundUrl}")`,
				backgroundSize: background?.backgroundSize,
				backgroundPosition: background?.backgroundPosition,
				backgroundRepeat: background?.backgroundRepeat,
				backgroundAttachment: background?.backgroundAttachment,
			}
		: undefined;

	// Block spacing -> the __inner div only.
	const blockGap = getGapCSSValue(style?.spacing?.blockGap);
	const innerStyle = blockGap ? { "--wbg-scf-block-gap": blockGap } : undefined;

	/* ------------------------------------------------------------------ */
	/* Markup                                                             */
	/* ------------------------------------------------------------------ */

	const blockProps = useBlockProps({
		className: ["wbg-slide-curve-full", isContentRight ? "content--right" : ""]
			.filter(Boolean)
			.join(" "),
		// The editor's background support still puts the image on the wrapper
		// (skipSerialization only stops it on the front end). Cancel it here;
		// the image is applied to the __image div below instead.
		style: { backgroundImage: "none" },
	});

	const innerBlocksProps = useInnerBlocksProps(
		{ className: "wbg-slide-curve-full__inner", style: innerStyle },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
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
				<div className="wbg-slide-curve-full__row">
					<div className="wbg-slide-curve-full__col wbg-slide-curve-full__col--content">
						<div className="wbg-slide-curve-full__content">
							<div className="wbg-slide-curve-full__meta">
								<p className="wbg-slide-curve-full__meta-line">
									<RichText
										tagName="span"
										className="wbg-slide-curve-full__date"
										value={date}
										onChange={(value) => setAttributes({ date: value })}
										placeholder={__("Date", "wbg-blocks")}
										allowedFormats={TEXT_FORMATS}
									/>{" "}
									<span
										className="wbg-slide-curve-full__sep"
										aria-hidden="true"
									>
										|
									</span>{" "}
									<RichText
										tagName="span"
										className="wbg-slide-curve-full__time"
										value={time}
										onChange={(value) => setAttributes({ time: value })}
										placeholder={__("Time", "wbg-blocks")}
										allowedFormats={TEXT_FORMATS}
									/>
								</p>
								<p className="wbg-slide-curve-full__meta-line">
									<span className="wbg-slide-curve-full__price">
										<RichText
											tagName="span"
											value={price}
											onChange={(value) => setAttributes({ price: value })}
											placeholder={__("Price", "wbg-blocks")}
											allowedFormats={TEXT_FORMATS}
										/>{" "}
										<span className="wbg-slide-curve-full__price-label">
											{__("Non-Members", "wbg-blocks")}
										</span>
									</span>{" "}
									<span
										className="wbg-slide-curve-full__sep"
										aria-hidden="true"
									>
										|
									</span>{" "}
									<span className="wbg-slide-curve-full__member-price">
										<RichText
											tagName="span"
											value={memberPrice}
											onChange={(value) =>
												setAttributes({ memberPrice: value })
											}
											placeholder={__("Member Price", "wbg-blocks")}
											allowedFormats={TEXT_FORMATS}
										/>{" "}
										<span className="wbg-slide-curve-full__price-label">
											{__("Members", "wbg-blocks")}
										</span>
									</span>
								</p>
							</div>

							<RichText
								tagName="h6"
								className="wbg-slide-curve-full__subheading"
								value={subheading}
								onChange={(value) => setAttributes({ subheading: value })}
								placeholder={__("Optional Subheading", "wbg-blocks")}
								allowedFormats={TEXT_FORMATS}
							/>
							<RichText
								tagName="h2"
								className="wbg-slide-curve-full__heading h2--alt-small"
								value={heading}
								onChange={(value) => setAttributes({ heading: value })}
								placeholder={__("Heading", "wbg-blocks")}
								allowedFormats={TEXT_FORMATS}
							/>
							<div {...innerBlocksProps} />
						</div>
					</div>

					{/* Empty column: reserves the space the image sits in. */}
					<div className="wbg-slide-curve-full__col wbg-slide-curve-full__col--spacer fake-image-container" />

					{/* Absolutely positioned on desktop; below the content on mobile. */}
					<div className="wbg-slide-curve-full__image-container">
						<div
							className={[
								"wbg-slide-curve-full__image",
								backgroundUrl ? "" : "wbg-slide-curve-full__image--placeholder",
							]
								.filter(Boolean)
								.join(" ")}
							style={imageStyle}
						/>
					</div>
				</div>
			</div>
		</>
	);
}
