/**
 * Hero - Headline: editor view.
 *
 */
import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	RichText,
	InspectorControls,
} from "@wordpress/block-editor";
import {
	PanelBody,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";

export default function Edit({ attributes, setAttributes }) {
	const { heading, headingSize, contentWidth } = attributes;

	const classes = [
		"wbg-hero-headline alignfull",
		contentWidth === "wide" && "is-width--wide",
	]
		.filter(Boolean)
		.join(" ");

	const blockProps = useBlockProps({ className: classes });

	return (
		<>
			<InspectorControls>
				<PanelBody title={__("Settings", "wbg-blocks")}>
					<ToggleGroupControl
						label={__("Heading Size", "wbg-blocks")}
						value={headingSize}
						onChange={(value) => setAttributes({ headingSize: value })}
						isBlock
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					>
						<ToggleGroupControlOption
							value="normal"
							label={__("Normal", "wbg-blocks")}
						/>
						<ToggleGroupControlOption
							value="large"
							label={__("Large", "wbg-blocks")}
						/>
					</ToggleGroupControl>

					<ToggleGroupControl
						label={__("Content Width", "wbg-blocks")}
						value={contentWidth}
						onChange={(value) => setAttributes({ contentWidth: value })}
						isBlock
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					>
						<ToggleGroupControlOption
							value="normal"
							label={__("Normal", "wbg-blocks")}
						/>
						<ToggleGroupControlOption
							value="wide"
							label={__("Wide", "wbg-blocks")}
						/>
					</ToggleGroupControl>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div className="wbg-hero-headline__wrapper">
					<RichText
						identifier="heading"
						tagName="h2"
						className={[
							"wbg-hero-headline__heading",
							"wp-block-heading",
							headingSize === "large" && "fake--h1",
						]
							.filter(Boolean)
							.join(" ")}
						value={heading}
						onChange={(value) => setAttributes({ heading: value })}
						allowedFormats={["core/bold", "core/italic"]}
						placeholder={__("Headline goes here.", "wbg-blocks")}
					/>
				</div>
			</div>
		</>
	);
}
