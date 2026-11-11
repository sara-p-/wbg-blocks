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
import { useSelect, useDispatch } from "@wordpress/data";
import { useEffect } from "@wordpress/element";

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

// Heading levels allowed inside the card.
const HEADING_LEVELS = [3, 4, 5, 6];

const hasAllowedLevelOptions = (levelOptions) =>
	Array.isArray(levelOptions) &&
	levelOptions.length === HEADING_LEVELS.length &&
	HEADING_LEVELS.every((level, i) => levelOptions[i] === level);

// Backdrop shown only in the block inserter/styles preview.
const PREVIEW_STYLE = {
	backgroundColor: "var(--wp--preset--color--green)",
	padding: "var(--wp--preset--spacing--32)",
};

export default function Edit({
	attributes,
	setAttributes,
	isSelected,
	clientId,
}) {
	const { heading, isPreview } = attributes;

	const { hasSelectedInnerBlock, innerBlocks } = useSelect(
		(select) => {
			const store = select(blockEditorStore);
			return {
				hasSelectedInnerBlock: store.hasSelectedInnerBlock(clientId, true),
				innerBlocks: store.getBlocks(clientId),
			};
		},
		[clientId],
	);

	const { updateBlockAttributes, __unstableMarkNextChangeAsNotPersistent } =
		useDispatch(blockEditorStore);

	// Restrict inner core/heading blocks to H3–H6: limit the level
	// dropdown and bump any H1/H2 (e.g. newly inserted or pasted) to H3.
	useEffect(() => {
		innerBlocks.forEach((block) => {
			if (block.name !== "core/heading") {
				return;
			}

			const updates = {};

			if (!hasAllowedLevelOptions(block.attributes.levelOptions)) {
				updates.levelOptions = HEADING_LEVELS;
			}

			if (!HEADING_LEVELS.includes(block.attributes.level)) {
				updates.level = HEADING_LEVELS[0];
			}

			if (Object.keys(updates).length) {
				__unstableMarkNextChangeAsNotPersistent();
				updateBlockAttributes(block.clientId, updates);
			}
		});
	}, [
		innerBlocks,
		updateBlockAttributes,
		__unstableMarkNextChangeAsNotPersistent,
	]);

	// Show the optional heading field when it has content, or while the
	// card (or anything inside it) is selected so it can be filled in.
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

	const card = (
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

	if (isPreview) {
		return <div style={PREVIEW_STYLE}>{card}</div>;
	}

	return card;
}
