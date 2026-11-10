/**
 * Content - Pill Image: editor view.
 */
import { __ } from "@wordpress/i18n";
import { useBlockProps } from "@wordpress/block-editor";

/**
 * Build inline styles for the pill from the native Background panel.
 *
 * The block's background support uses __experimentalSkipSerialization,
 * so core does not put the image on the wrapper; we apply it to the
 * inner pill element instead. Only values the user has set are output;
 * the stylesheet supplies the defaults (cover / center / no-repeat).
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
	};
}

export default function Edit({ attributes }) {
	const pillStyle = getPillStyle(attributes.style?.background);

	// The editor's background hook still adds the image to the wrapper even
	// with __experimentalSkipSerialization. Styles passed here are merged
	// after the hook's styles, so these reset the wrapper's background.
	const blockProps = useBlockProps({
		className: "wbg-content-pill-image alignfull",
		style: {
			backgroundImage: "none",
			backgroundSize: undefined,
			backgroundPosition: undefined,
			backgroundRepeat: undefined,
			backgroundAttachment: undefined,
		},
	});

	return (
		<div {...blockProps}>
			<div className="wbg-content-pill-image__inner">
				<div
					className={`wbg-content-pill-image__pill${
						pillStyle ? "" : " is-empty"
					}`}
					style={pillStyle}
				>
					{!pillStyle && (
						<span className="wbg-content-pill-image__placeholder">
							{__(
								"Choose a background image in the block settings.",
								"wbg-blocks",
							)}
						</span>
					)}
				</div>
			</div>
		</div>
	);
}
