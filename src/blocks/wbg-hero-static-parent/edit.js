/**
 * Hero - Static - Parent - Background: editor view.
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

const ALLOWED_BLOCKS = ["wbg-blocks/wbg-hero-static-child"];
const TEMPLATE = [["wbg-blocks/wbg-hero-static-child"]];

export default function Edit({ attributes, setAttributes }) {
	const blockProps = useBlockProps({
		className: ["wbg-hero-static-parent", "alignfull"]
			.filter(Boolean)
			.join(" "),
	});

	const innerBlocksProps = useInnerBlocksProps(
		{
			className: "wbg-hero-static-parent__content",
		},
		{
			allowedBlocks: ["wbg-blocks/wbg-hero-static-child"],
			template: [["wbg-blocks/wbg-hero-static-child"]],
			templateLock: "all",
		},
	);

	return (
		<div {...blockProps}>
			<div className="wbg-hero-static-parent__wrapper">
				<div {...innerBlocksProps} />
			</div>
		</div>
	);
}
