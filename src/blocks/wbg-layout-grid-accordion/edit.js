/**
 * Layout - Grid - Accordion: editor view.
 *
 * Renders a 2–4 column grid of card blocks. On the front end only the first
 * `visibleRows` rows are shown until the "See More" button is clicked (see
 * render.php and view.js). In the editor every card stays visible so it can
 * be edited; cards past the desktop cut-off are dimmed and a non-interactive
 * preview of the button is shown beneath the grid.
 *
 * Padding, background color and background image come from native block
 * supports (see block.json), which useBlockProps() applies to the outer
 * wrapper.
 */
import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	InnerBlocks,
} from "@wordpress/block-editor";
import {
	PanelBody,
	RangeControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";

const ALLOWED_BLOCKS = [
	"wbg-blocks/wbg-card-icon",
	"wbg-blocks/wbg-card-image",
	"wbg-blocks/wbg-card-simple",
	"wbg-blocks/wbg-card-staff",
	"wbg-blocks/wbg-card-styled",
];

const COLUMN_OPTIONS = [2, 3, 4];

// Keep in sync with $wbg-max-rows in style.scss and the clamp in render.php.
const MIN_ROWS = 1;
const MAX_ROWS = 6;

/**
 * Keep the column count inside the supported 2–4 range.
 *
 * @param {number|string} value Raw value.
 * @return {number} Clamped column count.
 */
const clampColumns = (value) => {
	const n = parseInt(value, 10);
	if (Number.isNaN(n)) {
		return 4;
	}
	return Math.min(4, Math.max(2, n));
};

/**
 * Keep the visible row count inside the supported range.
 *
 * @param {number|string} value Raw value.
 * @return {number} Clamped row count.
 */
const clampRows = (value) => {
	const n = parseInt(value, 10);
	if (Number.isNaN(n)) {
		return 2;
	}
	return Math.min(MAX_ROWS, Math.max(MIN_ROWS, n));
};

export default function Edit({ attributes, setAttributes }) {
	const columns = clampColumns(attributes.columns);
	const visibleRows = clampRows(attributes.visibleRows);

	const blockProps = useBlockProps({
		className: [
			"wbg-layout-grid-accordion",
			`wbg-layout-grid-accordion--cols-${columns}`,
			`wbg-layout-grid-accordion--rows-${visibleRows}`,
			"is-editor-preview",
		].join(" "),
	});

	const innerBlocksProps = useInnerBlocksProps(
		{ className: "wbg-layout-grid-accordion__grid" },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			templateLock: false,
			orientation: "horizontal",
			renderAppender: InnerBlocks.ButtonBlockAppender,
		},
	);

	return (
		<>
			<InspectorControls>
				<PanelBody title={__("Grid settings", "wbg-blocks")}>
					<ToggleGroupControl
						label={__("Columns", "wbg-blocks")}
						help={__(
							"Tablet always shows 2 columns and mobile shows 1.",
							"wbg-blocks",
						)}
						value={columns}
						onChange={(value) =>
							setAttributes({ columns: clampColumns(value) })
						}
						isBlock
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					>
						{COLUMN_OPTIONS.map((count) => (
							<ToggleGroupControlOption
								key={count}
								value={count}
								label={String(count)}
							/>
						))}
					</ToggleGroupControl>
				</PanelBody>

				<PanelBody title={__("Accordion settings", "wbg-blocks")}>
					<RangeControl
						label={__("Visible rows on desktop", "wbg-blocks")}
						help={__(
							"Rows shown before the See More button. Tablet shows 2 rows of 2 cards and mobile shows 4 cards. Dimmed cards in the editor are hidden until See More is clicked.",
							"wbg-blocks",
						)}
						value={visibleRows}
						onChange={(value) =>
							setAttributes({ visibleRows: clampRows(value) })
						}
						min={MIN_ROWS}
						max={MAX_ROWS}
						step={1}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div className="wbg-layout-grid-accordion__wrapper">
					<div {...innerBlocksProps} />

					<div className="wbg-layout-grid-accordion__actions">
						<span
							className="wbg-layout-grid-accordion__toggle wp-element-button"
							aria-hidden="true"
						>
							<span className="wbg-layout-grid-accordion__toggle-label">
								{__("See More", "wbg-blocks")}
							</span>
						</span>
					</div>
				</div>
			</div>
		</>
	);
}
