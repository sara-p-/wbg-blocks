/**
 * Content Overlap Content Card Child: editor view.
 *
 * Dynamic block: front-end markup comes from render.php. The block's save()
 * (in index.js) should return <InnerBlocks.Content /> so the inner blocks are
 * stored and passed to render.php as $content.
 *
 * Only insertable inside a Content Overlap Content Card ("parent" in
 * block.json). The image lives in the parent; this block only keeps an empty
 * placeholder column on the right so the content stays clear of it.
 */
import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	BlockControls,
	AlignmentControl,
	RichText,
} from "@wordpress/block-editor";
import { PanelBody, ToggleControl } from "@wordpress/components";

const ALLOWED_BLOCKS = [
	"core/paragraph",
	"core/buttons",
	"wbg-blocks/wbg-content-row",
	"core/list",
	"core/image",
];

const TEMPLATE = [
	["core/paragraph", { placeholder: __("Add content…", "wbg-blocks") }],
];

const HEADING_FORMATS = ["core/bold", "core/italic", "core/link"];

const HEADING_ALIGNMENTS = ["left", "center", "right"];

export default function Edit({ attributes, setAttributes }) {
	const { showSubheading, subheading, heading, headingAlign } = attributes;

	const align = HEADING_ALIGNMENTS.includes(headingAlign)
		? headingAlign
		: "center";

	// Padding (top/bottom), background color, background image and text color
	// are applied to the wrapper by the native block supports.
	const blockProps = useBlockProps({
		className: "wbg-content-overlap-content-card-child",
	});

	// The inner blocks go straight into the content column.
	const innerBlocksProps = useInnerBlocksProps(
		{ className: "wbg-content-overlap-content-card-child__content" },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
			// The parent locks its own inner blocks ("all"); unlock these.
			templateLock: false,
		},
	);

	return (
		<>
			{/* Aligns the subheading and heading together. */}
			<BlockControls group="block">
				<AlignmentControl
					value={align}
					onChange={(value) =>
						setAttributes({ headingAlign: value || "center" })
					}
				/>
			</BlockControls>

			<InspectorControls>
				<PanelBody title={__("Content", "wbg-blocks")}>
					<ToggleControl
						label={__("Show subheading", "wbg-blocks")}
						checked={!!showSubheading}
						onChange={(value) => setAttributes({ showSubheading: value })}
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div className="wbg-content-overlap-content-card-child__wrapper">
					<div
						className={`wbg-content-overlap-content-card-child__header is-align-${align}`}
					>
						{showSubheading && (
							<RichText
								tagName="h6"
								className="wbg-content-overlap-content-card-child__subheading"
								value={subheading}
								onChange={(value) => setAttributes({ subheading: value })}
								placeholder={__("Subheading", "wbg-blocks")}
								allowedFormats={HEADING_FORMATS}
							/>
						)}

						<RichText
							tagName="h2"
							className="wbg-content-overlap-content-card-child__heading h1--alt"
							value={heading}
							onChange={(value) => setAttributes({ heading: value })}
							placeholder={__("Heading", "wbg-blocks")}
							allowedFormats={HEADING_FORMATS}
						/>
					</div>

					<div className="wbg-content-overlap-content-card-child__row">
						<div {...innerBlocksProps} />

						<div
							className="wbg-content-overlap-content-card-child__placeholder"
							aria-hidden="true"
						/>
					</div>
				</div>
			</div>
		</>
	);
}
