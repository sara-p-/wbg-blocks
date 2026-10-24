/**
 * Card - Image: editor view.
 */
import { __ } from "@wordpress/i18n";
import { useBlockProps, useInnerBlocksProps } from "@wordpress/block-editor";

const ALLOWED_BLOCKS = ["core/heading", "core/paragraph", "core/buttons"];
const TEMPLATE = [
	[
		"core/heading",
		{
			level: 3,
			textColor: "green",
			style: {
				typography: {
					textAlign: "center",
					fontStyle: "italic",
				},
			},
			placeholder: __("Headline goes here.", "wbg-blocks"),
		},
	],
	[
		"core/paragraph",
		{
			placeholder: __("Text goes here.", "wbg-blocks"),
			style: {
				typography: {
					textAlign: "center",
				},
			},
		},
	],
];

/**
 * Build inline styles for the image div from the native background
 * support values (style.background). Serialization to the wrapper is
 * skipped in block.json, so we apply them here ourselves.
 */
function getBackgroundStyles(background = {}) {
	const image = background?.backgroundImage;
	const url = typeof image === "string" ? image : image?.url;

	if (!url) {
		return {};
	}

	// Match core's defaults: "cover" when no size is chosen,
	// centered when "contain" has no explicit position.
	const size = background.backgroundSize || "cover";
	const position =
		background.backgroundPosition ||
		(size === "contain" ? "50% 50%" : undefined);

	return {
		backgroundImage: `url("${url}")`,
		backgroundSize: size,
		backgroundPosition: position,
		backgroundRepeat: background.backgroundRepeat,
		backgroundAttachment: background.backgroundAttachment,
	};
}

/**
 * Convert the native blockGap value to a CSS value.
 * "var:preset|spacing|24" -> "var(--wp--preset--spacing--24)"
 */
function getGapValue(gap) {
	if (gap && typeof gap === "object") {
		gap = gap.top;
	}

	if (typeof gap !== "string" || gap === "") {
		return undefined;
	}

	if (gap.startsWith("var:preset|spacing|")) {
		const slug = gap.slice(gap.lastIndexOf("|") + 1);
		return `var(--wp--preset--spacing--${slug})`;
	}

	return gap;
}

export default function Edit({ attributes }) {
	const { style } = attributes;

	const backgroundStyles = getBackgroundStyles(style?.background);
	const hasImage = !!backgroundStyles.backgroundImage;
	const gap = getGapValue(style?.spacing?.blockGap);

	// Wrapper gets padding + colors from block supports.
	// The editor's background support ignores __experimentalSkipSerialization,
	// so explicitly cancel the background image on the wrapper. Styles passed
	// here win over the ones injected by block supports.
	const blockProps = useBlockProps({
		className: hasImage ? "wbg-card-image has-image" : "wbg-card-image",
		style: {
			backgroundImage: "none",
			backgroundSize: undefined,
			backgroundPosition: undefined,
			backgroundRepeat: undefined,
			backgroundAttachment: undefined,
		},
	});

	// Inner blocks live in their own div so blockGap applies only here.
	const innerBlocksProps = useInnerBlocksProps(
		{
			className: "wbg-card-image__content",
			style: gap ? { "--wbg-card-gap": gap } : undefined,
		},
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
		},
	);

	const imageClassName = hasImage
		? "wbg-card-image__image has-background-image"
		: "wbg-card-image__image is-placeholder";

	return (
		<div {...blockProps}>
			<div
				className={imageClassName}
				style={backgroundStyles}
				aria-hidden="true"
			>
				{!hasImage && (
					<span className="wbg-card-image__placeholder-text">
						{__("Choose an image under Background → Image.", "wbg-blocks")}
					</span>
				)}
			</div>
			<div {...innerBlocksProps} />
		</div>
	);
}
