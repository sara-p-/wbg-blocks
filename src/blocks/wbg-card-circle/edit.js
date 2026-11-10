/**
 * Card - Circle: editor view.
 */
import { __ } from "@wordpress/i18n";
import {
	RichText,
	useBlockProps,
	useInnerBlocksProps,
} from "@wordpress/block-editor";

const ALLOWED_BLOCKS = [
	"core/paragraph",
	"core/list",
	"core/image",
	"core/buttons",
];

const TEMPLATE = [
	[
		"core/paragraph",
		{
			placeholder: __("Text goes here.", "wbg-blocks"),
		},
	],
];

/**
 * Build inline styles for the circle from the native Background panel.
 * The block's background support uses __experimentalSkipSerialization,
 * so core does not apply the image to the wrapper; we apply it here.
 *
 * @param {Object} background style.background attribute.
 * @return {Object|undefined} React style object.
 */
function getCircleStyle(background = {}) {
	const image = background?.backgroundImage;
	const url = typeof image === "string" ? image : image?.url;

	if (!url) {
		return undefined;
	}

	return {
		backgroundImage: `url(${JSON.stringify(url)})`,
		backgroundSize: background.backgroundSize,
		backgroundPosition: background.backgroundPosition,
		backgroundRepeat: background.backgroundRepeat,
	};
}

export default function Edit({ attributes, setAttributes }) {
	const { heading, style, isPreview } = attributes;

	const circleStyle = getCircleStyle(style?.background);

	const blockProps = useBlockProps({
		className: "wbg-card-circle" + (isPreview ? " is-wbg-preview" : ""),
	});

	// Inner blocks render directly inside the block wrapper so the
	// layout/blockGap styles target them as direct children. The circle
	// and heading are rendered as siblings before them.
	const { children, ...innerBlocksProps } = useInnerBlocksProps(blockProps, {
		allowedBlocks: ALLOWED_BLOCKS,
		template: TEMPLATE,
	});

	return (
		<div {...innerBlocksProps}>
			<div
				className={
					"wbg-card-circle__circle" + (circleStyle ? " has-image" : "")
				}
				style={circleStyle}
				aria-hidden="true"
			/>
			<RichText
				tagName="h2"
				className="wp-block-heading wbg-card-circle__heading"
				value={heading}
				onChange={(value) => setAttributes({ heading: value })}
				placeholder={__("Heading…", "wbg-blocks")}
				allowedFormats={["core/bold", "core/italic"]}
			/>
			{children}
		</div>
	);
}
