/**
 * Hero - 2 Column: editor view.
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
	const { subheading, heading, layout } = attributes;

	const blockProps = useBlockProps({
		className: [
			"wbg-hero-2-col",
			layout === "content-left" ? "layout--content-left" : "",
		]
			.filter(Boolean)
			.join(" "),
	});

	const innerBlocksProps = useInnerBlocksProps(
		{ className: "wbg-hero-2-col__content" },
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
						label={__("Layout", "wbg-blocks")}
						value={layout}
						onChange={(value) => setAttributes({ layout: value })}
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
				<div className="wbg-hero-2-col__wrapper">
					<div className="wbg-hero-2-col__row">
						<div className="wbg-hero-2-col__headings wbg-hero-2-col__col">
							<RichText
								tagName="h6"
								className="wp-block-heading wbg-hero-2-col__subheading"
								value={subheading}
								onChange={(value) => setAttributes({ subheading: value })}
								placeholder={__("Subheading…", "wbg-blocks")}
								disableLineBreaks
							/>
							<RichText
								tagName="h2"
								className="wp-block-heading wbg-hero-2-col__heading"
								value={heading}
								onChange={(value) => setAttributes({ heading: value })}
								placeholder={__("Heading…", "wbg-blocks")}
								disableLineBreaks
							/>
						</div>
						<div className="wbg-hero-2-col__col">
							<div {...innerBlocksProps} />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
