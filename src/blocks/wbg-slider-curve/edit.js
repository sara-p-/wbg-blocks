/**
 * Slider - Curve: editor view.
 *
 * In the editor the slides sit side by side in a horizontally scrolling
 * row so every slide can be seen and edited. The curve shape, arrows and
 * fade only apply on the front end (see render.php / view.js).
 */
import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
} from "@wordpress/block-editor";

const ALLOWED_BLOCKS = ["wbg-blocks/wbg-slide-image"];
const TEMPLATE = [
	["wbg-blocks/wbg-slide-image"],
	["wbg-blocks/wbg-slide-image"],
];

export default function Edit() {
	const blockProps = useBlockProps({
		className: "wbg-slider-curve wbg-slider-curve--editor",
	});

	const innerBlocksProps = useInnerBlocksProps(
		{ className: "wbg-slider-curve__editor-track" },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
			templateLock: false,
			orientation: "horizontal",
			renderAppender: InnerBlocks.ButtonBlockAppender,
		},
	);

	return (
		<div {...blockProps}>
			<p className="wbg-slider-curve__editor-label">
				{__("Slider – Curve", "wbg-blocks")}
			</p>
			<div {...innerBlocksProps} />
		</div>
	);
}
