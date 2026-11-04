/**
 * Content - Accordion: editor view.
 */
import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	InnerBlocks,
	RichText,
} from "@wordpress/block-editor";
import {
	PanelBody,
	// Still exported under the experimental name in most WP versions.
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";

const ALLOWED_BLOCKS = ["wbg-blocks/wbg-content-accordion-item"];
const TEMPLATE = [["wbg-blocks/wbg-content-accordion-item"]];

export default function Edit({ attributes, setAttributes }) {
	const { heading, colorMode } = attributes;

	const classes = ["wbg-content-accordion", "alignfull"];
	if (colorMode === "light") {
		classes.push("is-color-mode--light");
	}

	const blockProps = useBlockProps({
		className: classes.join(" "),
	});

	const innerBlocksProps = useInnerBlocksProps(
		{ className: "wbg-content-accordion__content" },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
			orientation: "vertical",
			renderAppender: InnerBlocks.ButtonBlockAppender,
		},
	);

	return (
		<>
			<InspectorControls>
				<PanelBody title={__("Settings", "wbg-blocks")}>
					<ToggleGroupControl
						label={__("Color Mode", "wbg-blocks")}
						value={colorMode}
						onChange={(value) => setAttributes({ colorMode: value })}
						isBlock
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					>
						<ToggleGroupControlOption
							value="light"
							label={__("Light", "wbg-blocks")}
						/>
						<ToggleGroupControlOption
							value="dark"
							label={__("Dark", "wbg-blocks")}
						/>
					</ToggleGroupControl>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div className="wbg-content-accordion__container">
					<div className="wbg-content-accordion__wrapper">
						<RichText
							tagName="h2"
							className="wp-block-heading wbg-content-accordion__heading"
							value={heading}
							onChange={(value) => setAttributes({ heading: value })}
							placeholder={__("Accordion heading (optional)…", "wbg-blocks")}
							allowedFormats={["core/bold", "core/italic"]}
							withoutInteractiveFormatting
						/>
						<div {...innerBlocksProps} />
					</div>
				</div>
			</div>
		</>
	);
}
