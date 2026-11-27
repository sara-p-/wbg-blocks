/**
 * Content Overlap: editor view.
 *
 * Dynamic block: front-end markup comes from render.php. The block's save()
 * (in index.js) should return <InnerBlocks.Content /> so the inner blocks are
 * stored and passed to render.php as $content.
 */
import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	RichText,
	store as blockEditorStore,
} from "@wordpress/block-editor";
import {
	useSelect,
	useDispatch,
	subscribe,
	select as selectStore,
	dispatch as dispatchStore,
} from "@wordpress/data";
import { store as blocksStore } from "@wordpress/blocks";
import { useEffect } from "@wordpress/element";
import {
	BaseControl,
	Button,
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";

const ALLOWED_BLOCKS = [
	"core/paragraph",
	"core/heading",
	"core/list",
	"core/buttons",
	"core/image",
];

// Heading levels allowed for core/heading inside this block.
const HEADING_LEVELS = [4, 5, 6];

const BLOCK_NAME = "wbg-blocks/wbg-content-overlap";

/**
 * Hide H1–H3 from the "Transform" menu (and the inserter / slash commands)
 * while the selection is inside this block.
 *
 * Core lists each heading level as a block variation of core/heading, and
 * there's no per-parent way to hide variations. So while a block inside a
 * Content Overlap block is selected, the H1–H3 variations are removed from
 * the editor, and they're added back as soon as the selection leaves. This
 * only changes what the editor offers; nothing is saved. The level fix in
 * Edit() below still catches anything that gets through.
 *
 * Runs once, when this file is first loaded.
 */
let wbgHiddenHeadingVariations = null;

subscribe(() => {
	const blockEditor = selectStore(blockEditorStore);
	const selectedId = blockEditor.getSelectedBlockClientId();
	const isInside =
		!!selectedId &&
		blockEditor.getBlockParentsByBlockName(selectedId, BLOCK_NAME).length > 0;

	if (isInside && !wbgHiddenHeadingVariations) {
		const toHide = (
			selectStore(blocksStore).getBlockVariations("core/heading") || []
		).filter(
			(variation) =>
				variation.attributes?.level !== undefined &&
				!HEADING_LEVELS.includes(variation.attributes.level),
		);

		// Set the flag before dispatching: the dispatch re-runs this callback.
		wbgHiddenHeadingVariations = toHide;

		if (toHide.length) {
			dispatchStore(blocksStore).removeBlockVariations(
				"core/heading",
				toHide.map((variation) => variation.name),
			);
		}
	} else if (!isInside && wbgHiddenHeadingVariations) {
		const toRestore = wbgHiddenHeadingVariations;
		wbgHiddenHeadingVariations = null;

		if (toRestore.length) {
			dispatchStore(blocksStore).addBlockVariations("core/heading", toRestore);
		}
	}
}, blockEditorStore);

const TEMPLATE = [
	["core/paragraph", { placeholder: __("Add content…", "wbg-blocks") }],
	["core/buttons", {}, [["core/button"]]],
];

const HEADING_FORMATS = ["core/bold", "core/italic", "core/link"];

const IMAGE_POSITIONS = [
	"top-left",
	"bottom-left",
	"bottom-right",
	"top-right",
];

/**
 * Convert a block style value (e.g. "var:preset|spacing|40" or
 * "var:preset|color|green") to a CSS value.
 */
const toCssValue = (value) => {
	if (typeof value !== "string" || !value) {
		return undefined;
	}
	if (value.startsWith("var:")) {
		return `var(--wp--${value.slice(4).split("|").join("--")})`;
	}
	return value;
};

/**
 * Build inline styles for the image div from the native background-image
 * support (serialization is skipped in block.json).
 */
const getMediaStyle = (background = {}) => {
	const image = background.backgroundImage;
	const url = typeof image === "string" ? image : image?.url;

	if (!url) {
		return undefined;
	}

	return {
		backgroundImage: `url("${url}")`,
		backgroundSize: background.backgroundSize || "contain",
		backgroundPosition: background.backgroundPosition || "center",
		backgroundRepeat: background.backgroundRepeat || "no-repeat",
		...(background.backgroundAttachment && {
			backgroundAttachment: background.backgroundAttachment,
		}),
	};
};

/**
 * Map the native background size / position settings onto the video, so a
 * video fills the image box the same way an image would.
 */
const getVideoStyle = (background = {}) => {
	const size = background.backgroundSize;
	let objectFit = "contain";

	if (size === "cover") {
		objectFit = "cover";
	} else if (size === "auto") {
		objectFit = "none";
	}

	return {
		objectFit,
		objectPosition: background.backgroundPosition || "center",
	};
};

export default function Edit({ attributes, setAttributes, clientId }) {
	const {
		showSubheading,
		subheading,
		heading,
		headingSize,
		contentWidth,
		contentColumnWidth,
		imagePosition,
		imageWidth,
		imageHeight,
		imageOverlap,
		videoId,
		videoUrl,
		style,
	} = attributes;

	const position = IMAGE_POSITIONS.includes(imagePosition)
		? imagePosition
		: "top-right";
	const [vertical, side] = position.split("-");

	// With a video, the background image becomes the video's poster instead
	// of being drawn on the box.
	const mediaStyle = videoUrl ? undefined : getMediaStyle(style?.background);
	const posterImage = style?.background?.backgroundImage;
	const posterUrl =
		typeof posterImage === "string" ? posterImage : posterImage?.url;

	// Top/bottom padding, passed to the CSS so the image can overlap the
	// block above or below on mobile.
	const padTop = toCssValue(style?.spacing?.padding?.top);
	const padBottom = toCssValue(style?.spacing?.padding?.bottom);

	// Padding, background color and text color are applied to the wrapper
	// by the native block supports.
	const blockProps = useBlockProps({
		className: [
			"wbg-content-overlap",
			"alignfull",
			`image--${vertical}`,
			`image--${side}`,
			contentWidth === "wide" ? "is-content-wide" : "",
		]
			.filter(Boolean)
			.join(" "),
		style: {
			// The editor's background-image hook ignores skipSerialization and
			// puts the image on the wrapper too. Styles passed here win over
			// the hook's, so cancel it; the image is drawn on __media instead.
			backgroundImage: "none",
			"--wbg-image-width": `${Number(imageWidth) || 0}px`,
			"--wbg-image-height": `${Number(imageHeight) || 0}px`,
			"--wbg-image-overlap": `${Number(imageOverlap) || 0}px`,
			"--wbg-content-width": `${Number(contentColumnWidth) || 50}%`,
			...(padTop && { "--wbg-pad-top": padTop }),
			...(padBottom && { "--wbg-pad-bottom": padBottom }),
		},
	});

	// Limit inner heading blocks to H4–H6. levelOptions hides the other
	// levels in the heading's toolbar (WP 6.3+); any heading that's added,
	// pasted or transformed at another level is moved to H4.
	const innerBlocks = useSelect(
		(select) => select(blockEditorStore).getBlocks(clientId),
		[clientId],
	);
	const { updateBlockAttributes } = useDispatch(blockEditorStore);

	useEffect(() => {
		innerBlocks.forEach((block) => {
			if (block.name !== "core/heading") {
				return;
			}

			const { level, levelOptions } = block.attributes;
			const changes = {};

			if (
				!Array.isArray(levelOptions) ||
				levelOptions.join() !== HEADING_LEVELS.join()
			) {
				changes.levelOptions = HEADING_LEVELS;
			}
			if (!HEADING_LEVELS.includes(level)) {
				changes.level = HEADING_LEVELS[0];
			}

			if (Object.keys(changes).length) {
				updateBlockAttributes(block.clientId, changes);
			}
		});
	}, [innerBlocks, updateBlockAttributes]);

	const innerBlocksProps = useInnerBlocksProps(
		{ className: "wbg-content-overlap__body" },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
			templateLock: false,
		},
	);

	return (
		<>
			<InspectorControls>
				<PanelBody title={__("Content", "wbg-blocks")}>
					<ToggleControl
						label={__("Show subheading", "wbg-blocks")}
						checked={!!showSubheading}
						onChange={(value) => setAttributes({ showSubheading: value })}
						__nextHasNoMarginBottom
					/>

					<ToggleGroupControl
						label={__("Heading size", "wbg-blocks")}
						value={headingSize}
						onChange={(value) => setAttributes({ headingSize: value })}
						isBlock
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					>
						<ToggleGroupControlOption
							value="standard"
							label={__("Standard", "wbg-blocks")}
						/>
						<ToggleGroupControlOption
							value="large"
							label={__("Large", "wbg-blocks")}
						/>
					</ToggleGroupControl>

					<ToggleGroupControl
						label={__("Content width", "wbg-blocks")}
						value={contentWidth}
						onChange={(value) => setAttributes({ contentWidth: value })}
						isBlock
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					>
						<ToggleGroupControlOption
							value="standard"
							label={__("Standard", "wbg-blocks")}
						/>
						<ToggleGroupControlOption
							value="wide"
							label={__("Wide", "wbg-blocks")}
						/>
					</ToggleGroupControl>

					<RangeControl
						label={__("Content column width (%)", "wbg-blocks")}
						help={__(
							"Desktop and tablet only, up to 800px. On mobile the content is full width.",
							"wbg-blocks",
						)}
						value={contentColumnWidth}
						onChange={(value) =>
							setAttributes({ contentColumnWidth: value ?? 50 })
						}
						min={30}
						max={80}
						step={1}
						allowReset
						resetFallbackValue={50}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>

				<PanelBody title={__("Image", "wbg-blocks")}>
					<BaseControl
						id={`wbg-content-overlap-video-${clientId}`}
						label={__("Video", "wbg-blocks")}
						help={__(
							"Plays muted on a loop in place of the background image, using the same size and position settings. The background image is shown until the video starts.",
							"wbg-blocks",
						)}
						__nextHasNoMarginBottom
					>
						<div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
							<MediaUploadCheck>
								<MediaUpload
									onSelect={(media) =>
										setAttributes({ videoId: media.id, videoUrl: media.url })
									}
									allowedTypes={["video"]}
									value={videoId}
									render={({ open }) => (
										<Button
											variant="secondary"
											onClick={open}
											__next40pxDefaultSize
										>
											{videoUrl
												? __("Replace video", "wbg-blocks")
												: __("Choose video", "wbg-blocks")}
										</Button>
									)}
								/>
							</MediaUploadCheck>

							{videoUrl && (
								<Button
									variant="tertiary"
									isDestructive
									onClick={() =>
										setAttributes({ videoId: undefined, videoUrl: "" })
									}
									__next40pxDefaultSize
								>
									{__("Remove video", "wbg-blocks")}
								</Button>
							)}
						</div>
					</BaseControl>

					<SelectControl
						label={__("Image position", "wbg-blocks")}
						value={position}
						options={[
							{ value: "top-left", label: __("Top left", "wbg-blocks") },
							{ value: "top-right", label: __("Top right", "wbg-blocks") },
							{ value: "bottom-left", label: __("Bottom left", "wbg-blocks") },
							{
								value: "bottom-right",
								label: __("Bottom right", "wbg-blocks"),
							},
						]}
						onChange={(value) => setAttributes({ imagePosition: value })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>

					<RangeControl
						label={__("Image width (px)", "wbg-blocks")}
						value={imageWidth}
						onChange={(value) => setAttributes({ imageWidth: value ?? 450 })}
						min={100}
						max={1200}
						step={10}
						allowReset
						resetFallbackValue={450}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>

					<RangeControl
						label={__("Image height (px)", "wbg-blocks")}
						value={imageHeight}
						onChange={(value) => setAttributes({ imageHeight: value ?? 500 })}
						min={100}
						max={1200}
						step={10}
						allowReset
						resetFallbackValue={500}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>

					<RangeControl
						label={
							vertical === "top"
								? __("Overlap above block (px)", "wbg-blocks")
								: __("Overlap below block (px)", "wbg-blocks")
						}
						value={imageOverlap}
						onChange={(value) => setAttributes({ imageOverlap: value ?? 150 })}
						min={0}
						max={800}
						step={10}
						allowReset
						resetFallbackValue={150}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div
					className={["wbg-content-overlap__media", videoUrl ? "has-video" : ""]
						.filter(Boolean)
						.join(" ")}
					style={mediaStyle}
					aria-hidden="true"
				>
					{videoUrl && (
						<video
							key={videoUrl}
							className="wbg-content-overlap__video"
							src={videoUrl}
							poster={posterUrl || undefined}
							style={getVideoStyle(style?.background)}
							autoPlay
							muted
							loop
							playsInline
						/>
					)}
				</div>

				<div className="wbg-content-overlap__wrapper">
					<div className="wbg-content-overlap__content">
						{showSubheading && (
							<RichText
								tagName="h6"
								className="wbg-content-overlap__subheading"
								value={subheading}
								onChange={(value) => setAttributes({ subheading: value })}
								placeholder={__("Subheading", "wbg-blocks")}
								allowedFormats={HEADING_FORMATS}
							/>
						)}

						<RichText
							tagName="h2"
							className={[
								"wbg-content-overlap__heading",
								headingSize === "large" ? "h1--alt" : "",
							]
								.filter(Boolean)
								.join(" ")}
							value={heading}
							onChange={(value) => setAttributes({ heading: value })}
							placeholder={__("Heading", "wbg-blocks")}
							allowedFormats={HEADING_FORMATS}
						/>

						<div {...innerBlocksProps} />
					</div>

					<div
						className="wbg-content-overlap__placeholder"
						aria-hidden="true"
					/>
				</div>
			</div>
		</>
	);
}
