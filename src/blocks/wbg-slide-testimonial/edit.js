/**
 * Slide - Testimonial: editor view.
 *
 * The content comes from the Testimonial post that the parent
 * Testimonial Slider passes in through block context (postId), so nothing
 * is edited here and there are no settings. The editor shows render.php's
 * output through ServerSideRender, with the post sent as `post_id` (WP turns
 * that into the same postId context). This keeps the preview identical to
 * the front end (same ACF formatting, same featured image) without needing
 * the ACF field exposed in the REST API.
 *
 * The slider's arrows (in the editor) change which testimonial this block
 * shows.
 */
import { __ } from "@wordpress/i18n";
import { useMemo } from "@wordpress/element";
import { useBlockProps } from "@wordpress/block-editor";
import { Placeholder, Spinner } from "@wordpress/components";
import ServerSideRender from "@wordpress/server-side-render";

const BLOCK_NAME = "wbg-blocks/wbg-slide-testimonial";

function EmptyState() {
	return (
		<Placeholder
			className="wbg-slide-testimonial-editor__state"
			icon="format-quote"
			label={__("Testimonial Slide", "wbg-blocks")}
			instructions={__(
				"No testimonials match the Testimonial Slider's settings.",
				"wbg-blocks",
			)}
		/>
	);
}

function LoadingState() {
	return (
		<Placeholder
			className="wbg-slide-testimonial-editor__state"
			icon="format-quote"
			label={__("Testimonial Slide", "wbg-blocks")}
		>
			<Spinner />
		</Placeholder>
	);
}

export default function Edit({ attributes, context }) {
	const { postId } = context;

	// Tells ServerSideRender which testimonial to render.
	const urlQueryArgs = useMemo(() => ({ post_id: postId }), [postId]);

	/* ------------------------------------------------------------------ */
	/* Markup                                                             */
	/* ------------------------------------------------------------------ */

	// render.php outputs the full .wbg-slide-testimonial wrapper itself, so
	// this editor wrapper only carries the editor's own block props. It's
	// taken out of the layout (display: contents, see style.scss) so the
	// slide lines up with the slider's grid.
	const blockProps = useBlockProps({
		className: "wbg-slide-testimonial-editor",
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
