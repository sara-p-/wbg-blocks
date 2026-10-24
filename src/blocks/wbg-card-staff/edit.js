/**
 * Card - Staff: editor view.
 */
import { __ } from "@wordpress/i18n";
import { useBlockProps, RichText } from "@wordpress/block-editor";

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

const ALLOWED_FORMATS = ["core/bold", "core/italic", "core/link"];

export default function Edit({ attributes, setAttributes }) {
	const { style, name, position } = attributes;

	const backgroundStyles = getBackgroundStyles(style?.background);
	const hasImage = !!backgroundStyles.backgroundImage;

	// Wrapper gets padding + colors from block supports.
	// The editor's background support ignores __experimentalSkipSerialization,
	// so explicitly cancel the background image on the wrapper. Styles passed
	// here win over the ones injected by block supports.
	const blockProps = useBlockProps({
		className: hasImage ? "wbg-card-staff has-image" : "wbg-card-staff",
		style: {
			backgroundImage: "none",
			backgroundSize: undefined,
			backgroundPosition: undefined,
			backgroundRepeat: undefined,
			backgroundAttachment: undefined,
		},
	});

	const imageClassName = hasImage
		? "wbg-card-staff__image has-background-image"
		: "wbg-card-staff__image is-placeholder";

	return (
		<div {...blockProps}>
			<div
				className={imageClassName}
				style={backgroundStyles}
				aria-hidden="true"
			>
				{!hasImage && (
					<span className="wbg-card-staff__placeholder-text">
						{__("Choose an image under Background → Image.", "wbg-blocks")}
					</span>
				)}
			</div>
			<div className="wbg-card-staff__content">
				<RichText
					identifier="name"
					tagName="h3"
					className="wp-block-heading wbg-card-staff__name"
					value={name}
					onChange={(value) => setAttributes({ name: value })}
					placeholder={__("Name", "wbg-blocks")}
					allowedFormats={ALLOWED_FORMATS}
					disableLineBreaks
				/>
				<RichText
					identifier="position"
					tagName="p"
					className="wbg-card-staff__position"
					value={position}
					onChange={(value) => setAttributes({ position: value })}
					placeholder={__("Position", "wbg-blocks")}
					allowedFormats={ALLOWED_FORMATS}
				/>
			</div>
		</div>
	);
}
