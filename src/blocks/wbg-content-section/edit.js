/**
 * Content Section: editor view.
 *
 * Dynamic block: front-end markup comes from render.php. The block's save()
 * (in index.js) should return <InnerBlocks.Content /> so the inner blocks are
 * stored and passed to render.php as $content.
 *
 * Only insertable inside a Content Column ("parent" in block.json).
 */
import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	useInnerBlocksProps,
	RichText,
} from "@wordpress/block-editor";

const ALLOWED_BLOCKS = ["core/paragraph", "core/list", "core/buttons"];

const TEMPLATE = [
	["core/paragraph", { placeholder: __("Add text…", "wbg-blocks") }],
];

const HEADING_FORMATS = ["core/bold", "core/italic", "core/link"];

export default function Edit({ attributes, setAttributes }) {
	const { heading } = attributes;

	const blockProps = useBlockProps({
		className: "wbg-content-section",
	});

	const innerBlocksProps = useInnerBlocksProps(
		{ className: "wbg-content-section__body" },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
			templateLock: false,
		},
	);

	return (
		<div {...blockProps}>
			<RichText
				tagName="h6"
				className="wbg-content-section__heading"
				value={heading}
				onChange={(value) => setAttributes({ heading: value })}
				placeholder={__("Heading", "wbg-blocks")}
				allowedFormats={HEADING_FORMATS}
			/>

			<div {...innerBlocksProps} />
		</div>
	);
}
