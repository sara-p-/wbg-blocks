/**
 * Layout - 1-Col - Background: editor view.
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

const ALLOWED_BLOCKS = ["core/buttons", "core/paragraph", "core/heading"];
const TEMPLATE = [["core/paragraph", "core/buttons"]];

/**
 * Converts a preset reference like "var:preset|spacing|24" into
 * "var(--wp--preset--spacing--24)". Custom values (e.g. "2rem") pass through.
 */
const toCssValue = (value) => {
	if (typeof value !== "string" || value === "") {
		return undefined;
	}
	if (value.startsWith("var:")) {
		return `var(--wp--${value.slice(4).split("|").join("--")})`;
	}
	return value;
};

export default function Edit({ attributes, setAttributes }) {
	const { subheading, heading, contentLayout, overlay, contentWidth } =
		attributes;

	const blockProps = useBlockProps({
		className: [
			"wbg-layout-1-col-background",
			"alignfull",
			contentLayout === "content-left" ? "layout--content-left" : "",
			overlay === "overlay" ? "has-overlay" : "",
			contentWidth === "wide" ? "content-width--wide" : "",
		]
			.filter(Boolean)
			.join(" "),
	});

	const contentGap = toCssValue(attributes.style?.spacing?.blockGap);

	const innerBlocksProps = useInnerBlocksProps(
		{
			className: "wbg-layout-1-col-background__content",
			style: contentGap ? { "--wbg-content-gap": contentGap } : undefined,
		},
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
							value="content-left"
							label={__("Content Left", "wbg-blocks")}
						/>
						<ToggleGroupControlOption
							value="content-right"
							label={__("Content Right", "wbg-blocks")}
						/>
					</ToggleGroupControl>

					<ToggleGroupControl
						label={__("Content Width", "wbg-blocks")}
						value={contentWidth}
						onChange={(value) => setAttributes({ contentWidth: value })}
						isBlock
						__nextHasNoMarginBottom
						__next40pxDefaultSize
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

					<ToggleGroupControl
						label={__("Overlay", "wbg-blocks")}
						help={__(
							"Darkens the background image to help text stand out.",
							"wbg-blocks",
						)}
						value={overlay}
						onChange={(value) => setAttributes({ overlay: value })}
						isBlock
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					>
						<ToggleGroupControlOption
							value="no-overlay"
							label={__("No Overlay", "wbg-blocks")}
						/>
						<ToggleGroupControlOption
							value="overlay"
							label={__("Overlay", "wbg-blocks")}
						/>
					</ToggleGroupControl>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div className="wbg-layout-1-col-background__wrapper">
					<div className="wbg-layout-1-col-background__row">
						<div className="wbg-layout-1-col-background__col">
							<div className="wbg-layout-1-col-background__headings">
								<RichText
									tagName="h6"
									className="wp-block-heading wbg-layout-1-col-background__subheading"
									value={subheading}
									onChange={(value) => setAttributes({ subheading: value })}
									placeholder={__("Subheading…", "wbg-blocks")}
								/>
								<RichText
									tagName="h2"
									className="wp-block-heading wbg-layout-1-col-background__heading h2--alt"
									value={heading}
									onChange={(value) => setAttributes({ heading: value })}
									placeholder={__("Heading…", "wbg-blocks")}
								/>
							</div>
							<div {...innerBlocksProps} />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
