/**
 * Hero - Static - Child: editor view.
 */
import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	useInnerBlocksProps,
	RichText,
} from "@wordpress/block-editor";

const ALLOWED_BLOCKS = [
	"core/paragraph",
	"core/buttons",
	"core/list",
	"core/image",
];
// Starting content is centred so the toolbar controls reflect it.
// Blocks added later are centred by style.scss unless the user changes them.
const TEMPLATE = [
	["core/paragraph", { align: "center" }],
	[
		"core/buttons",
		{ layout: { type: "flex", justifyContent: "center" } },
		[
			["core/button"],
			// Block style variation: stored as an is-style-* class.
			["core/button", { className: "is-style-outline-light" }],
		],
	],
];

/**
 * Build inline styles for the pill from the native Background panel.
 *
 * Background support uses __experimentalSkipSerialization, so the image
 * goes on the inner pill, not the wrapper. Only values the user has set
 * are output; the stylesheet supplies the defaults (cover / center / no-repeat).
 *
 * @param {Object} background style.background attribute.
 * @return {Object|undefined} React style object.
 */
function getPillStyle(background = {}) {
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
		backgroundAttachment: background.backgroundAttachment,
	};
}

/**
 * Convert the block-gap value from the Dimensions panel to a CSS value.
 *
 * Presets are stored as "var:preset|spacing|48" and become
 * "var(--wp--preset--spacing--48)". Custom values ("2rem") pass through.
 * With no value set, the stylesheet falls back to the 48 preset.
 *
 * @param {string|Object} blockGap style.spacing.blockGap attribute.
 * @return {string|undefined} CSS value.
 */
function getGapValue(blockGap) {
	const value = typeof blockGap === "string" ? blockGap : blockGap?.top;

	if (!value) {
		return undefined;
	}

	return value.startsWith("var:")
		? `var(--wp--${value.slice(4).split("|").join("--")})`
		: value;
}

export default function Edit({ attributes, setAttributes }) {
	const { heading } = attributes;

	const pillStyle = getPillStyle(attributes.style?.background);
	const gap = getGapValue(attributes.style?.spacing?.blockGap);

	// The editor's background hook still puts the image on the wrapper even
	// with __experimentalSkipSerialization. Styles passed here are merged
	// after the hook's styles, so these clear the wrapper's background.
	const blockProps = useBlockProps({
		className: "wbg-hero-static-child",
		style: {
			backgroundImage: "none",
			backgroundSize: undefined,
			backgroundPosition: undefined,
			backgroundRepeat: undefined,
			backgroundAttachment: undefined,
		},
	});

	const innerBlocksProps = useInnerBlocksProps(
		{
			className: "wbg-hero-static-child__content",
			// Block gap applies to the inner blocks only.
			style: gap ? { "--wbg-content-gap": gap } : undefined,
		},
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
			// Don't inherit the parent's templateLock: content stays editable.
			templateLock: false,
		},
	);

	return (
		<div {...blockProps}>
			<div className="wbg-hero-static-child__wrapper">
				<div
					className={`wbg-hero-static-child__pill${pillStyle ? "" : " is-empty"}`}
					style={pillStyle}
				>
					{!pillStyle && (
						<span className="wbg-hero-static-child__placeholder">
							{__(
								"Choose a background image in the block settings.",
								"wbg-blocks",
							)}
						</span>
					)}
				</div>

				<div className="wbg-hero-static-child__heading-container">
					<RichText
						identifier="heading"
						tagName="h1"
						className="wp-block-heading wbg-hero-static-child__heading"
						value={heading}
						onChange={(value) => setAttributes({ heading: value })}
						placeholder={__("Heading…", "wbg-blocks")}
					/>
				</div>

				<div {...innerBlocksProps} />
			</div>
		</div>
	);
}
