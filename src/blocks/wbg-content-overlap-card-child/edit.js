/**
 * Content Overlap Card Child: editor view.
 *
 * Dynamic block: front-end markup comes from render.php. The block's save()
 * (in index.js) should return <InnerBlocks.Content /> so the inner blocks are
 * stored and passed to render.php as $content.
 *
 * Only insertable inside a Content Overlap Card ("parent" in block.json).
 */
import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	BlockControls,
	RichText,
	MediaPlaceholder,
	MediaReplaceFlow,
	store as blockEditorStore,
} from "@wordpress/block-editor";
import {
	PanelBody,
	RangeControl,
	SelectControl,
	TextareaControl,
	ToggleControl,
	ExternalLink,
	MenuItem,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";
import {
	useSelect,
	useDispatch,
	subscribe,
	select as selectStore,
	dispatch as dispatchStore,
} from "@wordpress/data";
import { store as blocksStore } from "@wordpress/blocks";
import { store as coreStore } from "@wordpress/core-data";
import { store as noticesStore } from "@wordpress/notices";
import { useEffect } from "@wordpress/element";

const BLOCK_NAME = "wbg-blocks/wbg-content-overlap-card-child";

const ALLOWED_BLOCKS = [
	"core/shortcode",
	"core/html",
	"core/paragraph",
	"core/heading",
	"core/list",
	"core/buttons",
	"core/image",
];

const TEMPLATE = [
	["core/paragraph", { placeholder: __("Add content…", "wbg-blocks") }],
];

const HEADING_FORMATS = ["core/bold", "core/italic", "core/link"];

// Heading levels allowed for core/heading inside this block.
const HEADING_LEVELS = [3, 4, 5, 6];

const ALLOWED_MEDIA_TYPES = ["image"];

// Fallbacks, matching block.json.
const DEFAULTS = {
	contentPosition: 30,
	imageOverhangTop: 40,
	imageOverhangLeft: 75,
	imageWidth: 437,
	imageHeight: 586,
	imageSizeSlug: "large",
};

/**
 * Hide H1–H2 from the "Transform" menu (and the inserter / slash commands)
 * while the selection is inside this block.
 *
 * Core lists each heading level as a block variation of core/heading, and
 * there's no per-parent way to hide variations. So while a block inside a
 * Content Overlap Card Child is selected, the H1–H2 variations are removed
 * from the editor, and they're added back as soon as the selection leaves.
 * This only changes what the editor offers; nothing is saved. The level fix
 * in Edit() below still catches anything that gets through.
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

/**
 * Convert a block style value (e.g. "var:preset|spacing|40") to a CSS value.
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
 * URL of one size of an image, from either a media-library selection
 * (media.sizes) or a REST media record (media.media_details.sizes).
 */
const getSizeUrl = (media, slug) =>
	media?.sizes?.[slug]?.url ||
	media?.media_details?.sizes?.[slug]?.source_url ||
	undefined;

const px = (value, fallback) => {
	const number = Number(value);
	return `${Number.isFinite(number) ? number : fallback}px`;
};

export default function Edit({ attributes, setAttributes, clientId }) {
	const {
		showSubheading,
		subheading,
		heading,
		contentPosition,
		imageOverhangTop,
		imageOverhangLeft,
		imageHeight,
		imageWidth,
		imageId,
		imageUrl,
		imageAlt,
		imageSizeSlug,
		imageScale,
		style,
	} = attributes;

	const { createErrorNotice } = useDispatch(noticesStore);
	const { updateBlockAttributes } = useDispatch(blockEditorStore);

	// The chosen image's record (for the Resolution options) and the site's
	// registered image sizes (for their labels).
	const { media, imageSizes, innerBlocks } = useSelect(
		(select) => ({
			media: imageId
				? select(coreStore).getMedia(imageId, { context: "view" })
				: undefined,
			imageSizes: select(blockEditorStore).getSettings()?.imageSizes || [],
			innerBlocks: select(blockEditorStore).getBlocks(clientId),
		}),
		[imageId, clientId],
	);

	// Headings inside the block: H3–H6 only. levelOptions hides the other
	// levels in the heading's toolbar; any heading that's added, pasted or
	// transformed at another level is moved to H3.
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

	const sizeOptions = imageSizes
		.filter(({ slug }) => getSizeUrl(media, slug))
		.map(({ name, slug }) => ({ value: slug, label: name }));

	// --- Image handlers ---------------------------------------------------

	const onSelectImage = (selected) => {
		if (!selected || !selected.url) {
			setAttributes({
				imageId: undefined,
				imageUrl: "",
				imageAlt: "",
			});
			return;
		}

		const slug = imageSizeSlug || DEFAULTS.imageSizeSlug;

		setAttributes({
			imageId: selected.id,
			imageUrl: getSizeUrl(selected, slug) || selected.url,
			imageAlt: selected.alt || "",
		});
	};

	const onSelectImageUrl = (url) => {
		setAttributes({
			imageId: undefined,
			imageUrl: url,
			imageAlt: "",
		});
	};

	const onRemoveImage = () => {
		setAttributes({
			imageId: undefined,
			imageUrl: "",
			imageAlt: "",
		});
	};

	const onImageError = (message) => {
		createErrorNotice(message, { type: "snackbar" });
	};

	const onChangeSize = (slug) => {
		setAttributes({
			imageSizeSlug: slug,
			imageUrl: getSizeUrl(media, slug) || imageUrl,
		});
	};

	// --- Wrapper ------------------------------------------------------------

	// Top padding, passed to the CSS so the image can still overhang the top
	// of the card on mobile, where it's back in the flow.
	const padTop = toCssValue(style?.spacing?.padding?.top);

	// Padding, background color, background image and text color are applied
	// to the wrapper by the native block supports.
	const blockProps = useBlockProps({
		className: [
			"wbg-content-overlap-card-child",
			imageScale === "cover" ? "is-image-cover" : "",
		]
			.filter(Boolean)
			.join(" "),
		style: {
			// Unitless (a percentage); the CSS turns it into lengths.
			"--wbg-content-position": `${
				Number(contentPosition ?? DEFAULTS.contentPosition) || 0
			}`,
			"--wbg-image-overhang-top": px(
				imageOverhangTop,
				DEFAULTS.imageOverhangTop,
			),
			"--wbg-image-overhang-left": px(
				imageOverhangLeft,
				DEFAULTS.imageOverhangLeft,
			),
			"--wbg-image-width": px(imageWidth, DEFAULTS.imageWidth),
			"--wbg-image-height": px(imageHeight, DEFAULTS.imageHeight),
			...(padTop && { "--wbg-pad-top": padTop }),
		},
	});

	const innerBlocksProps = useInnerBlocksProps(
		{ className: "wbg-content-overlap-card-child__body" },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
			// The parent locks its own inner blocks ("all"); unlock these.
			templateLock: false,
		},
	);

	return (
		<>
			<BlockControls group="other">
				<MediaReplaceFlow
					mediaId={imageId}
					mediaURL={imageUrl}
					allowedTypes={ALLOWED_MEDIA_TYPES}
					accept="image/*"
					onSelect={onSelectImage}
					onSelectURL={onSelectImageUrl}
					onError={onImageError}
					name={
						imageUrl
							? __("Replace image", "wbg-blocks")
							: __("Add image", "wbg-blocks")
					}
				>
					{imageUrl &&
						(({ onClose }) => (
							<MenuItem
								onClick={() => {
									onRemoveImage();
									onClose();
								}}
							>
								{__("Remove image", "wbg-blocks")}
							</MenuItem>
						))}
				</MediaReplaceFlow>
			</BlockControls>

			<InspectorControls>
				<PanelBody title={__("Content", "wbg-blocks")}>
					<ToggleControl
						label={__("Show subheading", "wbg-blocks")}
						checked={!!showSubheading}
						onChange={(value) => setAttributes({ showSubheading: value })}
						__nextHasNoMarginBottom
					/>

					<RangeControl
						label={__("Space left of content (%)", "wbg-blocks")}
						help={__(
							"Share of the card's width before the content column starts, leaving room for the image. Desktop and tablet only; the content column is up to 660px wide.",
							"wbg-blocks",
						)}
						value={contentPosition}
						onChange={(value) =>
							setAttributes({
								contentPosition: value ?? DEFAULTS.contentPosition,
							})
						}
						min={0}
						max={60}
						step={1}
						allowReset
						resetFallbackValue={DEFAULTS.contentPosition}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>

				<PanelBody title={__("Image", "wbg-blocks")}>
					{imageUrl && (
						<>
							<TextareaControl
								label={__("Alternative text", "wbg-blocks")}
								value={imageAlt}
								onChange={(value) => setAttributes({ imageAlt: value })}
								help={
									<>
										<ExternalLink href="https://www.w3.org/WAI/tutorials/images/decision-tree">
											{__("Describe the purpose of the image.", "wbg-blocks")}
										</ExternalLink>
										<br />
										{__("Leave empty if decorative.", "wbg-blocks")}
									</>
								}
								__nextHasNoMarginBottom
							/>

							{sizeOptions.length > 0 && (
								<SelectControl
									label={__("Resolution", "wbg-blocks")}
									value={imageSizeSlug}
									options={sizeOptions}
									onChange={onChangeSize}
									help={__(
										"Select the size of the source image.",
										"wbg-blocks",
									)}
									__next40pxDefaultSize
									__nextHasNoMarginBottom
								/>
							)}

							<ToggleGroupControl
								label={__("Scale", "wbg-blocks")}
								value={imageScale}
								onChange={(value) => setAttributes({ imageScale: value })}
								help={
									imageScale === "cover"
										? __("Image covers the space evenly.", "wbg-blocks")
										: __("Image is contained without distortion.", "wbg-blocks")
								}
								isBlock
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							>
								<ToggleGroupControlOption
									value="contain"
									label={__("Contain", "wbg-blocks")}
								/>
								<ToggleGroupControlOption
									value="cover"
									label={__("Cover", "wbg-blocks")}
								/>
							</ToggleGroupControl>
						</>
					)}

					<RangeControl
						label={__("Image width (px)", "wbg-blocks")}
						value={imageWidth}
						onChange={(value) =>
							setAttributes({ imageWidth: value ?? DEFAULTS.imageWidth })
						}
						min={100}
						max={1000}
						step={10}
						allowReset
						resetFallbackValue={DEFAULTS.imageWidth}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>

					<RangeControl
						label={__("Image height (px)", "wbg-blocks")}
						value={imageHeight}
						onChange={(value) =>
							setAttributes({ imageHeight: value ?? DEFAULTS.imageHeight })
						}
						min={100}
						max={1200}
						step={10}
						allowReset
						resetFallbackValue={DEFAULTS.imageHeight}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>

					<RangeControl
						label={__("Overhang above card (px)", "wbg-blocks")}
						help={__(
							"The card gets a matching top and bottom margin.",
							"wbg-blocks",
						)}
						value={imageOverhangTop}
						onChange={(value) =>
							setAttributes({
								imageOverhangTop: value ?? DEFAULTS.imageOverhangTop,
							})
						}
						min={0}
						max={400}
						step={5}
						allowReset
						resetFallbackValue={DEFAULTS.imageOverhangTop}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>

					<RangeControl
						label={__("Overhang left of card (px)", "wbg-blocks")}
						value={imageOverhangLeft}
						onChange={(value) =>
							setAttributes({
								imageOverhangLeft: value ?? DEFAULTS.imageOverhangLeft,
							})
						}
						min={0}
						max={400}
						step={5}
						allowReset
						resetFallbackValue={DEFAULTS.imageOverhangLeft}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div
					className={[
						"wbg-content-overlap-card-child__media",
						imageUrl ? "" : "is-empty",
					]
						.filter(Boolean)
						.join(" ")}
				>
					{imageUrl ? (
						<img
							className="wbg-content-overlap-card-child__image"
							src={imageUrl}
							alt={imageAlt}
						/>
					) : (
						<MediaPlaceholder
							icon="format-image"
							labels={{
								title: __("Card image", "wbg-blocks"),
								instructions: __(
									"Upload an image, pick one from your media library, or insert from URL.",
									"wbg-blocks",
								),
							}}
							onSelect={onSelectImage}
							onSelectURL={onSelectImageUrl}
							onError={onImageError}
							accept="image/*"
							allowedTypes={ALLOWED_MEDIA_TYPES}
						/>
					)}
				</div>

				<div className="wbg-content-overlap-card-child__wrapper">
					<div
						className="wbg-content-overlap-card-child__placeholder"
						aria-hidden="true"
					/>

					<div className="wbg-content-overlap-card-child__content">
						{showSubheading && (
							<RichText
								tagName="h6"
								className="wbg-content-overlap-card-child__subheading"
								value={subheading}
								onChange={(value) => setAttributes({ subheading: value })}
								placeholder={__("Subheading", "wbg-blocks")}
								allowedFormats={HEADING_FORMATS}
							/>
						)}

						<RichText
							tagName="h2"
							className="wbg-content-overlap-card-child__heading h2--alt-small"
							value={heading}
							onChange={(value) => setAttributes({ heading: value })}
							placeholder={__("Heading", "wbg-blocks")}
							allowedFormats={HEADING_FORMATS}
						/>

						<div {...innerBlocksProps} />
					</div>
				</div>
			</div>
		</>
	);
}
