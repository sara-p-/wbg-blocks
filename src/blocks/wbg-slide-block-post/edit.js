/**
 * Slide - Block - Post: editor view.
 *
 * The content comes from an Event / Program post and its ACF fields, so
 * nothing is edited inline and the block has no attributes or sidebar
 * controls. The editor shows render.php's output through ServerSideRender,
 * which keeps the preview identical to the front end (same ACF formatting,
 * same featured image) without needing the CPT or the ACF fields exposed
 * in the REST API.
 */
import { __ } from "@wordpress/i18n";

import { useBlockProps } from "@wordpress/block-editor";
import { Placeholder, Spinner } from "@wordpress/components";
import ServerSideRender from "@wordpress/server-side-render";

const BLOCK_NAME = "wbg-blocks/wbg-slide-block-post";

function EmptyState() {
	return (
		<Placeholder
			icon="menu"
			label={__("Slide - Block - Post", "wbg-blocks")}
			instructions={__("No published Events found.", "wbg-blocks")}
		/>
	);
}

function LoadingState() {
	return (
		<Placeholder icon="menu" label={__("Slide - Block - Post", "wbg-blocks")}>
			<Spinner />
		</Placeholder>
	);
}

export default function Edit({ attributes }) {
	/* ------------------------------------------------------------------ */
	/* Markup                                                             */
	/* ------------------------------------------------------------------ */

	// render.php outputs the full .wbg-slide-block-post wrapper itself, so
	// this editor wrapper only carries the editor's own block props.
	const blockProps = useBlockProps({
		className: "wbg-slide-block-post-editor",
	});

	return (
		<div {...blockProps}>
			<ServerSideRender
				block={BLOCK_NAME}
				attributes={attributes}
				EmptyResponsePlaceholder={EmptyState}
				LoadingResponsePlaceholder={LoadingState}
			/>
		</div>
	);
}
