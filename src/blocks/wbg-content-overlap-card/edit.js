/**
 * Content Overlap Card: editor view.
 *
 * Dynamic block: front-end markup comes from render.php. The block's save()
 * (in index.js) should return <InnerBlocks.Content /> so the card is stored
 * and passed to render.php as $content.
 *
 * Holds exactly one Content Overlap Card Child. The template adds it and
 * templateLock "all" stops it being removed, moved or joined by another
 * block. (The child unlocks its own inner blocks.)
 */
import { useBlockProps, useInnerBlocksProps } from "@wordpress/block-editor";

const CHILD_BLOCK = "wbg-blocks/wbg-content-overlap-card-child";

const TEMPLATE = [[CHILD_BLOCK]];

export default function Edit() {
	// Padding, background color and background image are applied to the
	// wrapper by the native block supports.
	const blockProps = useBlockProps({
		className: "wbg-content-overlap-card alignfull",
	});

	const innerBlocksProps = useInnerBlocksProps(
		{ className: "wbg-content-overlap-card__wrapper" },
		{
			allowedBlocks: [CHILD_BLOCK],
			template: TEMPLATE,
			templateLock: "all",
			renderAppender: false,
		},
	);

	return (
		<div {...blockProps}>
			<div {...innerBlocksProps} />
		</div>
	);
}
