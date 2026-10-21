/**
 * Card - Simple: editor view.
 */
import { __ } from "@wordpress/i18n";
import { useBlockProps, useInnerBlocksProps } from "@wordpress/block-editor";

const ALLOWED_BLOCKS = ["core/heading", "core/paragraph", "core/buttons"];
const TEMPLATE = [
	[
		"core/heading",
		{
			level: 2,
			placeholder: __("Headline goes here.", "wbg-blocks"),
		},
	],
	[
		"core/paragraph",
		{
			placeholder: __("Text goes here.", "wbg-blocks"),
		},
	],
];

export default function Edit() {
	const blockProps = useBlockProps({
		className: "wbg-card-simple",
	});

	// Inner blocks render directly inside the block wrapper so the
	// layout/blockGap styles can target them as direct children.
	const innerBlocksProps = useInnerBlocksProps(blockProps, {
		allowedBlocks: ALLOWED_BLOCKS,
		template: TEMPLATE,
	});

	return <div {...innerBlocksProps} />;
}
