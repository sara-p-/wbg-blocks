/**
 * Slider - Curve - Full: editor view.
 *
 * In the editor the slides sit side by side in a horizontally scrolling
 * row so every slide can be seen and edited. The fade, arrows and
 * stacked slides only apply on the front end (see render.php / view.js).
 */
import { __ } from "@wordpress/i18n";
import { useSelect, useDispatch } from "@wordpress/data";
import { createBlock } from "@wordpress/blocks";
import {
	useBlockProps,
	useInnerBlocksProps,
	BlockControls,
	InnerBlocks,
	RichText,
	store as blockEditorStore,
} from "@wordpress/block-editor";
import { ToolbarButton, ToolbarGroup } from "@wordpress/components";
import { plus } from "@wordpress/icons";

const SLIDE_BLOCK = "wbg-blocks/wbg-slide-curve-full";
const ALLOWED_BLOCKS = [SLIDE_BLOCK];
const TEMPLATE = [[SLIDE_BLOCK]];

const TEXT_FORMATS = ["core/bold", "core/italic"];

export default function Edit({ clientId, attributes, setAttributes }) {
	const { title } = attributes;

	/* ------------------------------------------------------------------ */
	/* Slides                                                             */
	/* ------------------------------------------------------------------ */

	const slideCount = useSelect(
		(select) => select(blockEditorStore).getBlockCount(clientId),
		[clientId],
	);

	const { insertBlock } = useDispatch(blockEditorStore);

	// Appends a slide to the end of the row and selects it.
	const addSlide = () => {
		insertBlock(createBlock(SLIDE_BLOCK), slideCount, clientId);
	};

	/* ------------------------------------------------------------------ */
	/* Markup                                                             */
	/* ------------------------------------------------------------------ */

	const blockProps = useBlockProps({
		className: "wbg-slider-curve-full wbg-slider-curve-full--editor alignfull",
	});

	const innerBlocksProps = useInnerBlocksProps(
		{ className: "wbg-slider-curve-full__editor-track" },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
			templateLock: false,
			orientation: "horizontal",
			renderAppender: InnerBlocks.ButtonBlockAppender,
		},
	);

	return (
		<>
			<BlockControls group="other">
				<ToolbarGroup>
					<ToolbarButton icon={plus} onClick={addSlide}>
						{__("Add slide", "wbg-blocks")}
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>

			<div {...blockProps}>
				<div className="wbg-slider-curve-full__container">
					{/* Title circle: its own row above the slides. */}
					<div className="wbg-slider-curve-full__title-row">
						<div className="wbg-slider-curve-full__title-container">
							<RichText
								tagName="h2"
								className="wbg-slider-curve-full__title h2--alt-small"
								value={title}
								onChange={(value) => setAttributes({ title: value })}
								placeholder={__("Title (optional)", "wbg-blocks")}
								allowedFormats={TEXT_FORMATS}
							/>
						</div>
					</div>

					<div {...innerBlocksProps} />
				</div>
			</div>
		</>
	);
}
