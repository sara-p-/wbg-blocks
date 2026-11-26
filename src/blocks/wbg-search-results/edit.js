/**
 * Search Results: editor view.
 *
 * A full-width section that shows the site's search results. The results
 * are rendered by render.php from the main search query, so there are no
 * real results in the editor. Placeholder cards show the grid instead.
 *
 * Settings
 * - Layout width (one attribute, `layoutWidth`):
 *   - Standard (default): __wrapper is the WP wide width.
 *   - Wide: adds .layout--wide, and __wrapper is the theme.json
 *     settings.custom.layout.extra-wide width.
 * - Top/bottom padding, background color, background image and text color
 *   all use WP's native block supports (see block.json), so their controls
 *   sit in the Styles tab and WP adds the classes/styles itself.
 *
 * Alignment is turned off; the block is always .alignfull.
 *
 * Markup
 * - .wbg-search-results.alignfull: background, colors, top/bottom padding.
 *   - __wrapper: the results. Width from the layout setting, with WP root
 *     padding left and right.
 *     - __summary, then one __group per post type, each with a __list grid
 *       of __item cards.
 */
import { __ } from "@wordpress/i18n";
import { useBlockProps, InspectorControls } from "@wordpress/block-editor";
import {
	PanelBody,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";

const LAYOUT_OPTIONS = [
	{ label: __("Standard", "wbg-blocks"), value: "standard" },
	{ label: __("Wide", "wbg-blocks"), value: "wide" },
];

const PLACEHOLDER_COUNT = 6; // Two full rows at 3 columns.

export default function Edit({ attributes, setAttributes }) {
	const { layoutWidth } = attributes;
	const isWide = "wide" === layoutWidth;

	/* ------------------------------------------------------------------ */
	/* Markup                                                             */
	/* ------------------------------------------------------------------ */

	const blockProps = useBlockProps({
		className: `wbg-search-results alignfull${isWide ? " layout--wide" : ""}`,
	});

	return (
		<>
			<InspectorControls>
				<PanelBody title={__("Layout", "wbg-blocks")}>
					<ToggleGroupControl
						label={__("Layout width", "wbg-blocks")}
						value={layoutWidth}
						onChange={(value) =>
							setAttributes({ layoutWidth: value || "standard" })
						}
						help={
							isWide
								? __("Results use the extra-wide width.", "wbg-blocks")
								: __("Results use the theme's wide width.", "wbg-blocks")
						}
						isBlock
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					>
						{LAYOUT_OPTIONS.map((option) => (
							<ToggleGroupControlOption
								key={option.value}
								value={option.value}
								label={option.label}
							/>
						))}
					</ToggleGroupControl>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div className="wbg-search-results__wrapper">
					<p className="wbg-search-results__summary">
						{__(
							"Search results show here on the search results page.",
							"wbg-blocks",
						)}
					</p>

					<section className="wbg-search-results__group">
						<h2 className="wbg-search-results__group-title">
							{__("Post type", "wbg-blocks")}
						</h2>

						<ul className="wbg-search-results__list" aria-hidden="true">
							{Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
								<li
									key={index}
									className="wbg-search-results__item is-placeholder"
								>
									<div className="wbg-search-results__thumb" />
									<div className="wbg-search-results__body">
										<h3 className="wbg-search-results__title">
											{__("Result title", "wbg-blocks")}
										</h3>
										<p className="wbg-search-results__excerpt">
											{__(
												"A short excerpt from the result, with the search term highlighted.",
												"wbg-blocks",
											)}
										</p>
									</div>
								</li>
							))}
						</ul>
					</section>
				</div>
			</div>
		</>
	);
}
