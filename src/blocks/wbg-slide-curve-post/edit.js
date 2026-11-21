/**
 * Slide - Curve - Post: editor view.
 *
 * The content comes from the Event / Program post that the parent
 * Curve Slider - Post passes in through block context (postId), so nothing
 * is edited inline. The editor shows render.php's output through
 * ServerSideRender, with the post sent as `post_id` (WP turns that into the
 * same postId context). This keeps the preview identical to the front end
 * (same ACF formatting, same featured image) without needing the ACF fields
 * exposed in the REST API.
 *
 * The block has no settings of its own: the content is always on the left
 * and the image on the right.
 */
import { __ } from "@wordpress/i18n";
import { useMemo } from "@wordpress/element";
import { useBlockProps } from "@wordpress/block-editor";
import { Placeholder, Spinner } from "@wordpress/components";
import ServerSideRender from "@wordpress/server-side-render";

const BLOCK_NAME = "wbg-blocks/wbg-slide-curve-post";

function EmptyState() {
	return (
		<Placeholder
			icon="grid-view"
			label={__("Curve Slide - Post", "wbg-blocks")}
			instructions={__(
				"No posts match the Curve Slider's settings.",
				"wbg-blocks",
			)}
		/>
	);
}

function LoadingState() {
	return (
		<Placeholder
			icon="grid-view"
			label={__("Curve Slide - Post", "wbg-blocks")}
		>
			<Spinner />
		</Placeholder>
	);
}

export default function Edit({ attributes, context }) {
	const { postId } = context;

	// Tells ServerSideRender which post to render.
	const urlQueryArgs = useMemo(() => ({ post_id: postId }), [postId]);

	/* ------------------------------------------------------------------ */
	/* Markup                                                             */
	/* ------------------------------------------------------------------ */

	// render.php outputs the full .wbg-slide-curve-post wrapper itself, so
	// this editor wrapper only carries the editor's own block props.
	const blockProps = useBlockProps({
		className: "wbg-slide-curve-post-editor",
	});

	return (
		<div {...blockProps}>
			{postId ? (
				<ServerSideRender
					block={BLOCK_NAME}
					attributes={attributes}
					urlQueryArgs={urlQueryArgs}
					EmptyResponsePlaceholder={EmptyState}
					LoadingResponsePlaceholder={LoadingState}
				/>
			) : (
				<EmptyState />
			)}
		</div>
	);
}
