/**
 * Hero - Simple: editor view.
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
const TEMPLATE = [["core/buttons"]];

export default function Edit({ attributes, setAttributes }) {
	const { subheading, heading, text, fontWeight } = attributes;

	const blockProps = useBlockProps({
		className: [
			"wbg-hero-simple",
			fontWeight === "bold" ? "font-weight--bold" : "",
		]
			.filter(Boolean)
			.join(" "),
	});

	const innerBlocksProps = useInnerBlocksProps(
		{ className: "wbg-hero-simple__buttons" },
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
						label={__("Font Weight", "wbg-blocks")}
						value={fontWeight}
						onChange={(value) => setAttributes({ fontWeight: value })}
						isBlock
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					>
						<ToggleGroupControlOption
							value="normal"
							label={__("Normal", "wbg-blocks")}
						/>
						<ToggleGroupControlOption
							value="bold"
							label={__("Bold", "wbg-blocks")}
						/>
					</ToggleGroupControl>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div className="wbg-hero-simple__wrapper">
					<div className="wbg-hero-simple__content">
						<RichText
							tagName="h6"
							className="wp-block-heading wbg-hero-simple__subheading"
							value={subheading}
							onChange={(value) => setAttributes({ subheading: value })}
							placeholder={__("Subheading…", "wbg-blocks")}
							disableLineBreaks
						/>
						<div className="wbg-hero-simple__heading-container">
							<RichText
								tagName="h1"
								className="wp-block-heading wbg-hero-simple__heading"
								value={heading}
								onChange={(value) => setAttributes({ heading: value })}
								placeholder={__("Heading…", "wbg-blocks")}
								disableLineBreaks
							/>
						</div>
						<div className="wbg-hero-simple__text-container">
							<RichText
								tagName="p"
								className="wbg-hero-simple__text"
								value={text}
								onChange={(value) => setAttributes({ text: value })}
								placeholder={__("Text…", "wbg-blocks")}
								disableLineBreaks
							/>
						</div>
					</div>

					<div {...innerBlocksProps} />
				</div>
			</div>
		</>
	);
}
