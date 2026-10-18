/**
 * Hero - 2 Column: save.
 *
 * This is a dynamic block, so render.php builds the markup. We only save the
 * inner blocks (core/buttons) so they're stored in post content and passed to
 * render.php as $content.
 */
import { InnerBlocks } from "@wordpress/block-editor";

export default function save() {
	return <InnerBlocks.Content />;
}
