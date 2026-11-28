/**
 * Content Row: editor view.
 *
 * Dynamic block: front-end markup comes from render.php. The block's save()
 * (in index.js) should return <InnerBlocks.Content /> so the columns are
 * stored and passed to render.php as $content.
 *
 * Only insertable inside a Content Overlap Content Card Child ("parent" in
 * block.json). Holds up to two Content Columns: once there are two, the
 * appender is hidden and no more columns can be added, pasted or duplicated
 * into the row.
 */
import {
	useBlockProps,
	useInnerBlocksProps,
	ButtonBlockAppender,
	store as blockEditorStore,
} from "@wordpress/block-editor";
import { useSelect } from "@wordpress/data";

const COL_BLOCK = "wbg-blocks/wbg-content-col";

const MAX_COLUMNS = 2;

const TEMPLATE = [[COL_BLOCK]];

export default function Edit({ clientId }) {
	const columnCount = useSelect(
		(select) => select(blockEditorStore).getBlockCount(clientId),
		[clientId],
	);

	const isFull = columnCount >= MAX_COLUMNS;

	// Top/bottom padding is applied to the wrapper by the native block supports.
	const blockProps = useBlockProps({
		className: "wbg-content-row",
	});

	const innerBlocksProps = useInnerBlocksProps(blockProps, {
		allowedBlocks: isFull ? [] : [COL_BLOCK],
		template: TEMPLATE,
		templateLock: false,
		orientation: "horizontal",
		renderAppender: isFull
			? false
			: () => <ButtonBlockAppender rootClientId={clientId} />,
	});

	return <div {...innerBlocksProps} />;
}
