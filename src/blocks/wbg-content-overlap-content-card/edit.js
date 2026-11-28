/**
 * Content Overlap Content Card: editor view.
 *
 * Dynamic block: front-end markup comes from render.php. The block's save()
 * (in index.js) should return <InnerBlocks.Content /> so the card is stored
 * and passed to render.php as $content.
 *
 * Holds exactly one Content Overlap Content Card Child. The template adds it
 * and templateLock "all" stops it being removed, moved or joined by another
 * block. (The child unlocks its own inner blocks.)
 *
 * The image lives here, not in the child, so it can reach the section's own
 * right and bottom edges as well as the card's. It sits on top of the card.
 */
import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	BlockControls,
	MediaPlaceholder,
	MediaReplaceFlow,
	store as blockEditorStore,
} from "@wordpress/block-editor";
import {
	PanelBody,
	RangeControl,
	SelectControl,
	TextareaControl,
	ExternalLink,
	MenuItem,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";
import { useSelect, useDispatch } from "@wordpress/data";
import { store as coreStore } from "@wordpress/core-data";
import { store as noticesStore } from "@wordpress/notices";

const CHILD_BLOCK = "wbg-blocks/wbg-content-overlap-content-card-child";

const TEMPLATE = [[CHILD_BLOCK]];

const ALLOWED_MEDIA_TYPES = ["image"];

// Fallbacks, matching block.json.
const DEFAULTS = {
	imageWidth: 620,
	imageAnchorX: "section",
	imageAnchorY: "section",
	imageOffsetX: 0,
	imageOffsetY: 0,
	imageSizeSlug: "large",
};

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

export default function Edit({ attributes, setAttributes }) {
	const {
		imageId,
		imageUrl,
		imageAlt,
		imageSizeSlug,
		imageWidth,
		imageAnchorX,
		imageAnchorY,
		imageOffsetX,
		imageOffsetY,
		style,
	} = attributes;

	const { createErrorNotice } = useDispatch(noticesStore);

	// The chosen image's record (for the Resolution options) and the site's
	// registered image sizes (for their labels).
	const { media, imageSizes } = useSelect(
		(select) => ({
			media: imageId
				? select(coreStore).getMedia(imageId, { context: "view" })
				: undefined,
			imageSizes: select(blockEditorStore).getSettings()?.imageSizes || [],
		}),
		[imageId],
	);

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

	const anchorX = imageAnchorX === "card" ? "card" : "section";
	const anchorY = imageAnchorY === "card" ? "card" : "section";

	// Bottom padding, passed to the CSS so the image can line up with the
	// card's bottom edge.
	const padBottom = toCssValue(style?.spacing?.padding?.bottom);

	// Padding, background color and background image are applied to the
	// wrapper by the native block supports.
	const blockProps = useBlockProps({
		className: [
			"wbg-content-overlap-content-card",
			"alignfull",
			`is-image-x-${anchorX}`,
			`is-image-y-${anchorY}`,
		].join(" "),
		style: {
			"--wbg-image-width": px(imageWidth, DEFAULTS.imageWidth),
			"--wbg-image-offset-x": px(imageOffsetX, DEFAULTS.imageOffsetX),
			"--wbg-image-offset-y": px(imageOffsetY, DEFAULTS.imageOffsetY),
			...(padBottom && { "--wbg-pad-bottom": padBottom }),
		},
	});

	const innerBlocksProps = useInnerBlocksProps(
		{ className: "wbg-content-overlap-content-card__wrapper" },
		{
			allowedBlocks: [CHILD_BLOCK],
			template: TEMPLATE,
			templateLock: "all",
			renderAppender: false,
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
						</>
					)}

					<RangeControl
						label={__("Image width (px)", "wbg-blocks")}
						help={__(
							"Height follows the image. On desktop and tablet the image shrinks if it would cover the card's content column.",
							"wbg-blocks",
						)}
						value={imageWidth}
						onChange={(value) =>
							setAttributes({ imageWidth: value ?? DEFAULTS.imageWidth })
						}
						min={100}
						max={1200}
						step={10}
						allowReset
						resetFallbackValue={DEFAULTS.imageWidth}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>

				<PanelBody title={__("Image position", "wbg-blocks")}>
					<ToggleGroupControl
						label={__("Right edge lines up with", "wbg-blocks")}
						value={anchorX}
						onChange={(value) => setAttributes({ imageAnchorX: value })}
						isBlock
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					>
						<ToggleGroupControlOption
							value="section"
							label={__("Section", "wbg-blocks")}
						/>
						<ToggleGroupControlOption
							value="card"
							label={__("Card", "wbg-blocks")}
						/>
					</ToggleGroupControl>

					<RangeControl
						label={__("Push right (px)", "wbg-blocks")}
						help={__(
							"Moves the image past that edge. Negative moves it in. Anything past the section's side edge is cut off.",
							"wbg-blocks",
						)}
						value={imageOffsetX}
						onChange={(value) =>
							setAttributes({ imageOffsetX: value ?? DEFAULTS.imageOffsetX })
						}
						min={-400}
						max={400}
						step={5}
						allowReset
						resetFallbackValue={DEFAULTS.imageOffsetX}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>

					<ToggleGroupControl
						label={__("Bottom edge lines up with", "wbg-blocks")}
						value={anchorY}
						onChange={(value) => setAttributes({ imageAnchorY: value })}
						isBlock
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					>
						<ToggleGroupControlOption
							value="section"
							label={__("Section", "wbg-blocks")}
						/>
						<ToggleGroupControlOption
							value="card"
							label={__("Card", "wbg-blocks")}
						/>
					</ToggleGroupControl>

					<RangeControl
						label={__("Push down (px)", "wbg-blocks")}
						help={__(
							"Moves the image past that edge. Negative moves it up. Past the section's bottom, it will overlap the next block.",
							"wbg-blocks",
						)}
						value={imageOffsetY}
						onChange={(value) =>
							setAttributes({ imageOffsetY: value ?? DEFAULTS.imageOffsetY })
						}
						min={-400}
						max={400}
						step={5}
						allowReset
						resetFallbackValue={DEFAULTS.imageOffsetY}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div {...innerBlocksProps} />

				<div
					className={[
						"wbg-content-overlap-content-card__media",
						imageUrl ? "" : "is-empty",
					]
						.filter(Boolean)
						.join(" ")}
				>
					{imageUrl ? (
						<img
							className="wbg-content-overlap-content-card__image"
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
			</div>
		</>
	);
}
