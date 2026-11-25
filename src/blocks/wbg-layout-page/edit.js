/**
 * Layout - Page: editor view.
 *
 * A full-width section that takes any inner blocks.
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
 * - .wbg-layout-page.alignfull: background, colors, top/bottom padding.
 *   - __wrapper: the inner blocks. Width from the layout setting, with WP
 *     root padding left and right.
 */
import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
} from "@wordpress/block-editor";
import {
	PanelBody,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";

const LAYOUT_OPTIONS = [
	{ label: __("Standard", "wbg-blocks"), value: "standard" },
	{ label: __("Wide", "wbg-blocks"), value: "wide" },
];

export default function Edit({ attributes, setAttributes }) {
	const { layoutWidth } = attributes;
	const isWide = "wide" === layoutWidth;

	/* ------------------------------------------------------------------ */
	/* Markup                                                             */
	/* ------------------------------------------------------------------ */

	const blockProps = useBlockProps({
		className: `wbg-layout-page alignfull${isWide ? " layout--wide" : ""}`,
	});

	// No allowedBlocks: every block can go in here.
	const innerBlocksProps = useInnerBlocksProps({
		className: "wbg-layout-page__wrapper",
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
								? __("Content uses the extra-wide width.", "wbg-blocks")
								: __("Content uses the theme's wide width.", "wbg-blocks")
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
				<div {...innerBlocksProps} />
			</div>
		</>
	);
}
