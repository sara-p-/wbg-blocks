/**
 * Content - Overlay Section: editor view.
 *
 */
import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	RichText,
	InspectorControls,
	useInnerBlocksProps,
} from "@wordpress/block-editor";
import {
	PanelBody,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";

const ALLOWED_BLOCKS = ["wbg-blocks/wbg-content-overlay-2-col"];
const TEMPLATE = [["wbg-blocks/wbg-content-overlay-2-col"]];

export default function Edit({ attributes, setAttributes }) {
	const { contentWidth } = attributes;

	const classes = [
		"wbg-content-overlay-section",
		"alignfull",
		contentWidth === "wide" ? "is-width--wide" : "",
	]
		.filter(Boolean)
		.join(" ");

	const blockProps = useBlockProps({ className: classes });

	const innerBlocksProps = useInnerBlocksProps(
		{ className: "wbg-content-overlay-section__content" },
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
				<div className="wbg-content-overlay-section__wrapper">
					<div {...innerBlocksProps} />
				</div>
			</div>
		</>
	);
}
