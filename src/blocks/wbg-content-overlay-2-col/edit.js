/**
 * Content - Overlay - 2-Column: editor view.
 *
 * Dynamic block: front-end markup comes from render.php. The block's save()
 * (in index.js) should return <InnerBlocks.Content /> so the inner blocks are
 * stored and passed to render.php as $content.
 */
import { __ } from "@wordpress/i18n";
import { useEffect } from "@wordpress/element";
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	RichText,
} from "@wordpress/block-editor";
import {
	PanelBody,
	RangeControl,
	ToggleControl,
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
 * Build inline styles for the image div from the native background-image
 * support (serialization is skipped in block.json).
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

export default function Edit({ attributes, setAttributes }) {
	const {
		showSubHeading,
		subheading,
		heading,
		contentPosition,
		overhang,
		style,
	} = attributes;

	// Left/right padding is set in style.scss, not per block. Remove any
	// values saved by an earlier version of this block, since WordPress
	// would still output them as inline styles.
	const savedPadding = style?.spacing?.padding;
	useEffect(() => {
		if (
			!savedPadding ||
			(!("left" in savedPadding) && !("right" in savedPadding))
		) {
			return;
		}
		const { left, right, ...padding } = savedPadding;
		setAttributes({
			style: {
				...style,
				spacing: { ...style.spacing, padding },
			},
		});
	}, [savedPadding]);

	const isContentLeft = contentPosition === "content-left";
	const gap = toCssValue(style?.spacing?.blockGap);
	const mediaStyle = getMediaStyle(style?.background);

	// Bottom padding, passed to the CSS so the image can sit on the panel's
	// bottom edge on mobile.
	const padBottom = toCssValue(style?.spacing?.padding?.bottom);

	// Padding, background color and text color are applied to the wrapper
	// by the native block supports.
	const blockProps = useBlockProps({
		className: [
			"wbg-content-overlay-2-col",
			"alignfull",
			isContentLeft ? "content--left" : "",
		]
			.filter(Boolean)
			.join(" "),
		style: {
			// The editor's background-image hook ignores skipSerialization and
			// puts the image on the wrapper too. Styles passed here win over the
			// hook's, so cancel it; the image is drawn on __media instead.
			backgroundImage: "none",
			"--wbg-overhang": `${Number(overhang) || 0}px`,
			...(padBottom && { "--wbg-pad-bottom": padBottom }),
		},
	});

	const innerBlocksProps = useInnerBlocksProps(
		{
			className: "wbg-content-overlay-2-col__body",
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
				<PanelBody title={__("Content", "wbg-blocks")}>
					<ToggleControl
						label={__("Show subheading", "wbg-blocks")}
						checked={!!showSubHeading}
						onChange={(value) => setAttributes({ showSubHeading: value })}
						__nextHasNoMarginBottom
					/>
				</PanelBody>

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

					<RangeControl
						label={__("Image overhang (px)", "wbg-blocks")}
						help={__(
							"How far the image rises above the panel. Space is added above the block to match.",
							"wbg-blocks",
						)}
						value={overhang}
						onChange={(value) => setAttributes({ overhang: value ?? 80 })}
						min={0}
						max={300}
						step={1}
						allowReset
						resetFallbackValue={80}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div
					className={[
						"wbg-content-overlay-2-col__media",
						mediaStyle ? "" : "is-empty",
					]
						.filter(Boolean)
						.join(" ")}
					style={mediaStyle}
					aria-hidden="true"
				/>

				<div className="wbg-content-overlay-2-col__wrapper">
					<div className="wbg-content-overlay-2-col__content">
						{showSubHeading && (
							<RichText
								tagName="h6"
								className="wbg-content-overlay-2-col__subheading"
								value={subheading}
								onChange={(value) => setAttributes({ subheading: value })}
								placeholder={__("Subheading", "wbg-blocks")}
								allowedFormats={HEADING_FORMATS}
							/>
						)}

						<RichText
							tagName="h2"
							className="wbg-content-overlay-2-col__heading h2--alt-small"
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
