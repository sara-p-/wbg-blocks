/**
 * Layout - 2 Column - Stripe: editor view.
 *
 */
import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	RichText,
	getColorClassName,
} from "@wordpress/block-editor";
import {
	PanelBody,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";

const ALLOWED_BLOCKS = [
	"core/paragraph",
	"core/list",
	"core/image",
	"core/buttons",
];

const TEMPLATE = [
	["core/paragraph", { placeholder: __("Add content…", "wbg-blocks") }],
	["core/buttons", {}, [["core/button"]]],
];

const HEADING_FORMATS = ["core/bold", "core/italic", "core/link"];

/**
 * Convert a block style value (e.g. "var:preset|spacing|40" or
 * "var:preset|color|green") to a CSS value.
 * blockGap can also be an object ({ top, left }) when axial gap is enabled.
 */
const toCssValue = (value) => {
	if (value && typeof value === "object") {
		value = value.top;
	}
	if (typeof value !== "string" || !value) {
		return undefined;
	}
	if (value.startsWith("var:")) {
		return `var(--wp--${value.slice(4).split("|").join("--")})`;
	}
	return value;
};

/**
 * Build inline styles for the absolutely positioned media block from the
 * native background-image support (serialization is skipped in block.json).
 */
const getMediaStyle = (background = {}) => {
	const image = background.backgroundImage;
	const url = typeof image === "string" ? image : image?.url;

	if (!url) {
		return undefined;
	}

	return {
		backgroundImage: `url("${url}")`,
		backgroundSize: background.backgroundSize || "cover",
		backgroundPosition: background.backgroundPosition || "center",
		backgroundRepeat: background.backgroundRepeat || "no-repeat",
		...(background.backgroundAttachment && {
			backgroundAttachment: background.backgroundAttachment,
		}),
	};
};

/**
 * Build the stripe's class and style from the native background color
 * support (background serialization is skipped in block.json, so the
 * color lands on the stripe instead of the wrapper).
 */
const getStripeProps = (backgroundColor, customBackground) => {
	const presetClass = getColorClassName("background-color", backgroundColor);
	const customColor = !presetClass ? toCssValue(customBackground) : undefined;

	return {
		className: [
			"wbg-layout-2-col-stripe__stripe",
			"alignfull",
			(presetClass || customColor) && "has-background",
			presetClass,
		]
			.filter(Boolean)
			.join(" "),
		style: customColor ? { backgroundColor: customColor } : undefined,
	};
};

export default function Edit({ attributes, setAttributes }) {
	const { subheading, heading, contentPosition, backgroundColor, style } =
		attributes;

	const isContentLeft = contentPosition === "content-left";
	const gap = toCssValue(style?.spacing?.blockGap);
	const stripeProps = getStripeProps(backgroundColor, style?.color?.background);

	const blockProps = useBlockProps({
		className: ["wbg-layout-2-col-stripe", isContentLeft ? "content--left" : ""]
			.filter(Boolean)
			.join(" "),
		// The editor's background-image hook ignores skipSerialization and
		// puts the image on the wrapper too. Styles passed here win over the
		// hook's, so cancel it; the image is drawn on __media instead.
		style: { backgroundImage: "none" },
	});

	const innerBlocksProps = useInnerBlocksProps(
		{
			className: "wbg-layout-2-col-stripe__body",
			style: gap ? { "--wbg-block-gap": gap } : undefined,
		},
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
			templateLock: false,
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
				<div
					className="wbg-layout-2-col-stripe__media"
					style={getMediaStyle(style?.background)}
					aria-hidden="true"
				/>

				<div className="wbg-layout-2-col-stripe__wrapper">
					<div className="wbg-layout-2-col-stripe__content">
						<div {...stripeProps} aria-hidden="true" />

						<RichText
							tagName="h6"
							className="wbg-layout-2-col-stripe__subheading"
							value={subheading}
							onChange={(value) => setAttributes({ subheading: value })}
							placeholder={__("Subheading (optional)", "wbg-blocks")}
							allowedFormats={HEADING_FORMATS}
						/>

						<RichText
							tagName="h2"
							className="wbg-layout-2-col-stripe__heading"
							value={heading}
							onChange={(value) => setAttributes({ heading: value })}
							placeholder={__("Heading", "wbg-blocks")}
							allowedFormats={HEADING_FORMATS}
						/>

						<div {...innerBlocksProps} />
					</div>
				</div>
			</div>
		</>
	);
}
