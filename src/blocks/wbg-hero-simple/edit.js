/**
 * Hero - Simple: editor view.
 *
 * In the editor the subheading is always shown as an h6 and the heading as an h1.
 * The front end (render.php) swaps the tags for SEO when a subheading is present.
 */
import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	useInnerBlocksProps,
	RichText,
} from "@wordpress/block-editor";

const ALLOWED_BLOCKS = ["core/buttons"];
const TEMPLATE = [["core/buttons"]];

export default function Edit({ attributes, setAttributes }) {
	const { subheading, heading, text } = attributes;

	const blockProps = useBlockProps();

	const innerBlocksProps = useInnerBlocksProps(
		{ className: "wbg-hero-simple__buttons" },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
		},
	);

	return (
		<div {...blockProps}>
			<div className="wbg-hero-simple__wrapper">
				<div className="wbg-hero-simple__content">
					<RichText
						tagName="h6"
						className="wp-block-heading wbg-hero-simple__subheading"
						value={subheading}
						onChange={(value) => setAttributes({ subheading: value })}
						placeholder={__("Subheading…", "wbg-blocks")}
						disableLineBreaks
					/>
					<div className="wbg-hero-simple__heading-container">
						<RichText
							tagName="h1"
							className="wp-block-heading wbg-hero-simple__heading"
							value={heading}
							onChange={(value) => setAttributes({ heading: value })}
							placeholder={__("Heading…", "wbg-blocks")}
							disableLineBreaks
						/>
					</div>
					<div className="wbg-hero-simple__text-container">
						<RichText
							tagName="p"
							className="wbg-hero-simple__text"
							value={text}
							onChange={(value) => setAttributes({ text: value })}
							placeholder={__("Text…", "wbg-blocks")}
							disableLineBreaks
						/>
					</div>
				</div>

				<div {...innerBlocksProps} />
			</div>
		</div>
	);
}
