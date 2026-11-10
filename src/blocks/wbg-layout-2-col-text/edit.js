/**
 * Layout - 2-Col - Text: editor view.
 *
 * In the editor the subheading is always shown as an h6 and the heading as an h1.
 * The front end (render.php) swaps the tags for SEO when a subheading is present.
 */
import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	RichText,
} from "@wordpress/block-editor";
import {
	PanelBody,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";

const ALLOWED_BLOCKS = ["core/buttons"];
const TEMPLATE = [["core/paragraph", "core/buttons"]];

export default function Edit({ attributes, setAttributes }) {
	const { subheading, heading, contentLayout } = attributes;

	const blockProps = useBlockProps({
		className: [
			"wbg-layout-2-col-text",
			"alignfull",
			contentLayout === "content-left" ? "layout--content-left" : "",
		]
			.filter(Boolean)
			.join(" "),
	});

	const innerBlocksProps = useInnerBlocksProps(
		{ className: "wbg-layout-2-col-text__content" },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
		},
	);

	return (
		<>
			<InspectorControls>
				<PanelBody title={__("Settings", "wbg-blocks")}>
					<ToggleGroupControl
						label={__("Content Layout", "wbg-blocks")}
						value={contentLayout}
						onChange={(value) => setAttributes({ contentLayout: value })}
						isBlock
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					>
						<ToggleGroupControlOption
							value="content-right"
							label={__("Content Right", "wbg-blocks")}
						/>
						<ToggleGroupControlOption
							value="content-left"
							label={__("Content Left", "wbg-blocks")}
						/>
					</ToggleGroupControl>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div className="wbg-layout-2-col-text__wrapper">
					<div className="wbg-layout-2-col-text__row">
						<div className="wbg-layout-2-col-text__headings wbg-layout-2-col-text__col">
							<RichText
								tagName="h6"
								className="wp-block-heading wbg-layout-2-col-text__subheading"
								value={subheading}
								onChange={(value) => setAttributes({ subheading: value })}
								placeholder={__("Subheading…", "wbg-blocks")}
								disableLineBreaks
							/>
							<RichText
								tagName="h2"
								className="wp-block-heading wbg-layout-2-col-text__heading"
								value={heading}
								onChange={(value) => setAttributes({ heading: value })}
								placeholder={__("Heading…", "wbg-blocks")}
								disableLineBreaks
							/>
						</div>
						<div className="wbg-layout-2-col-text__col">
							<div {...innerBlocksProps} />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
