/**
 * Slide - Curve - Post: editor view.
 *
 * The content comes from an Event / Program post and its ACF fields, so
 * nothing is edited inline. The editor shows render.php's output through
 * ServerSideRender, which keeps the preview identical to the front end
 * (same ACF formatting, same featured image) without needing the CPT or
 * the ACF fields exposed in the REST API.
 */
import { __ } from "@wordpress/i18n";

import { useBlockProps, InspectorControls } from "@wordpress/block-editor";
import {
	PanelBody,
	Placeholder,
	Spinner,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";
import ServerSideRender from "@wordpress/server-side-render";

const BLOCK_NAME = "wbg-blocks/wbg-slide-curve-post";

function EmptyState() {
	return (
		<Placeholder
			icon="grid-view"
			label={__("Curve Slide - Post", "wbg-blocks")}
			instructions={__("No published Events found.", "wbg-blocks")}
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

export default function Edit({ attributes, setAttributes }) {
	const { contentPosition } = attributes;

	/* ------------------------------------------------------------------ */
	/* Markup                                                             */
	/* ------------------------------------------------------------------ */

	// render.php outputs the full .wbg-slide-curve-post wrapper itself, so
	// this editor wrapper only carries the editor's own block props.
	const blockProps = useBlockProps({
		className: "wbg-slide-curve-post-editor",
	});

	return (
		<>
			<InspectorControls>
				<PanelBody title={__("Layout", "wbg-blocks")}>
					<ToggleGroupControl
						label={__("Content position", "wbg-blocks")}
						value={contentPosition}
						onChange={(value) => setAttributes({ contentPosition: value })}
						isBlock
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					>
						<ToggleGroupControlOption
							value="content-left"
							label={__("Content Left", "wbg-blocks")}
						/>
						<ToggleGroupControlOption
							value="content-right"
							label={__("Content Right", "wbg-blocks")}
						/>
					</ToggleGroupControl>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<ServerSideRender
					block={BLOCK_NAME}
					attributes={attributes}
					EmptyResponsePlaceholder={EmptyState}
					LoadingResponsePlaceholder={LoadingState}
				/>
			</div>
		</>
	);
}
