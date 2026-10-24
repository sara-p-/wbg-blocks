/**
 * Hero - Headline: editor view.
 *
 */
import { __ } from "@wordpress/i18n";
import { useBlockProps, useInnerBlocksProps } from "@wordpress/block-editor";

const ALLOWED_BLOCKS = ["core/heading"];
const TEMPLATE = [
	[
		"core/heading",
		{
			level: 1,
			placeholder: __("Headline goes here.", "wbg-blocks"),
		},
	],
];

export default function Edit({}) {
	const blockProps = useBlockProps({
		className: "wbg-hero-headline",
	});

	const innerBlocksProps = useInnerBlocksProps(
		{ className: "wbg-hero-headline__heading" },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
		},
	);

	return (
		<div {...blockProps}>
			<div className="wbg-hero-headline__wrapper">
				<div {...innerBlocksProps} />
			</div>
		</div>
	);
}
