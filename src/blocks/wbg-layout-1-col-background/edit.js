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

export default function Edit({ attributes, setAttributes }) {
	const { subheading, heading, contentLayout } = attributes;

	const blockProps = useBlockProps({
		className: [
			"wbg-layout-1-col-background",
			"alignfull",
			contentLayout === "content-left" ? "layout--content-left" : "",
		]
			.filter(Boolean)
			.join(" "),
	});

	const innerBlocksProps = useInnerBlocksProps(
		{ className: "wbg-layout-1-col-background__content" },
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
									className="wp-block-heading wbg-layout-1-col-background__heading"
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
