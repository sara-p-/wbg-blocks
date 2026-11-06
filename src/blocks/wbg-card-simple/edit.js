/**
 * Card - Simple: editor view.
 */
import { __ } from "@wordpress/i18n";
import {
	RichText,
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from "@wordpress/block-editor";
import { useSelect } from "@wordpress/data";

const ALLOWED_BLOCKS = [
	"core/heading",
	"core/paragraph",
	"core/list",
	"core/buttons",
	"core/image",
];
const TEMPLATE = [
	[
		"core/paragraph",
		{
			placeholder: __("Text goes here.", "wbg-blocks"),
		},
	],
];

export default function Edit({
	attributes,
	setAttributes,
	isSelected,
	clientId,
}) {
	const { heading } = attributes;

	// Show the optional heading field when it has content, or while the
	// card (or anything inside it) is selected so it can be filled in.
	const hasSelectedInnerBlock = useSelect(
		(select) => select(blockEditorStore).hasSelectedInnerBlock(clientId, true),
		[clientId],
	);
	const showHeading = !!heading || isSelected || hasSelectedInnerBlock;

	const blockProps = useBlockProps({
		className: "wbg-card-simple",
	});

	// Inner blocks render directly inside the block wrapper so the
	// layout/blockGap styles can target them as direct children.
	// The heading is rendered as a sibling of the inner blocks.
	const { children, ...innerBlocksProps } = useInnerBlocksProps(blockProps, {
		allowedBlocks: ALLOWED_BLOCKS,
		template: TEMPLATE,
	});

	return (
		<div {...innerBlocksProps}>
			{showHeading && (
				<RichText
					tagName="h3"
					className="wp-block-heading wbg-card-simple__heading fake--h2"
					value={heading}
					onChange={(value) => setAttributes({ heading: value })}
					placeholder={__("Optional heading…", "wbg-blocks")}
					allowedFormats={["core/bold", "core/italic"]}
				/>
			)}
			{children}
		</div>
	);
}
