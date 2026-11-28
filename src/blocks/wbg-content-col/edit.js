/**
 * Content Column: editor view.
 *
 * Dynamic block: front-end markup comes from render.php. The block's save()
 * (in index.js) should return <InnerBlocks.Content /> so the inner blocks are
 * stored and passed to render.php as $content.
 *
 * Only insertable inside a Content Row ("parent" in block.json).
 */
import { useBlockProps, useInnerBlocksProps } from "@wordpress/block-editor";

const ALLOWED_BLOCKS = [
	"core/paragraph",
	"wbg-blocks/wbg-content-section",
	"core/buttons",
	"core/list",
	"core/image",
];

const TEMPLATE = [["wbg-blocks/wbg-content-section"]];

export default function Edit() {
	// Background color, text color and padding are applied to the wrapper by
	// the native block supports.
	const blockProps = useBlockProps({
		className: "wbg-content-col",
	});

	const innerBlocksProps = useInnerBlocksProps(blockProps, {
		allowedBlocks: ALLOWED_BLOCKS,
		template: TEMPLATE,
		templateLock: false,
	});

	return <div {...innerBlocksProps} />;
}
