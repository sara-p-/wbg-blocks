/**
 * Layout - 2 Column: editor view.
 *
 */
import { __ } from "@wordpress/i18n";
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	RichText,
} from "@wordpress/block-editor";
import {
	PanelBody,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";

const ALLOWED_BLOCKS = ["core/paragraph", "core/list", "core/buttons"];

const TEMPLATE = [
	["core/paragraph", { placeholder: __("Add content…", "wbg-blocks") }],
	["core/buttons", {}, [["core/button"]]],
];

const HEADING_FORMATS = ["core/bold", "core/italic", "core/link"];

/**
 * Convert a block style value (e.g. "var:preset|spacing|40") to a CSS value.
 * blockGap can also be an object ({ top, left }) when axial gap is enabled.
 */
const toCssValue = (value) => {
	if (value && typeof value === "object") {
		value = value.top;
	}
	if (typeof value !== "string" || !value) {
		return undefined;
	}
	const prefix = "var:preset|spacing|";
	if (value.startsWith(prefix)) {
		return `var(--wp--preset--spacing--${value.slice(prefix.length)})`;
	}
	return value;
};

/**
 * Build inline styles for the absolutely positioned media block from the
 * native background-image support (serialization is skipped in block.json).
 */
const getMediaStyle = (background = {}) => {
	const image = background.backgroundImage;
	const url = typeof image === "string" ? image : image?.url;

	if (!url) {
		return undefined;
	}

	return {
		backgroundImage: `url("${url}")`,
		backgroundSize: background.backgroundSize || "cover",
		backgroundPosition: background.backgroundPosition || "center",
		backgroundRepeat: background.backgroundRepeat || "no-repeat",
		...(background.backgroundAttachment && {
			backgroundAttachment: background.backgroundAttachment,
		}),
	};
};

export default function Edit({ attributes, setAttributes }) {
	const { subheading, heading, contentPosition, style } = attributes;

	const isContentLeft = contentPosition === "content-left";
	const gap = toCssValue(style?.spacing?.blockGap);

	const blockProps = useBlockProps({
		className: ["wbg-layout-2-col", isContentLeft ? "content--left" : ""]
			.filter(Boolean)
			.join(" "),
		// The editor's background-image hook ignores skipSerialization and
		// puts the image on the wrapper too. Styles passed here win over the
		// hook's, so cancel it; the image is drawn on __media instead.
		style: { backgroundImage: "none" },
	});

	const innerBlocksProps = useInnerBlocksProps(
		{
			className: "wbg-layout-2-col__body",
			style: gap ? { "--wbg-block-gap": gap } : undefined,
		},
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
			templateLock: false,
		},
	);

	return (
		<>
			<InspectorControls>
				<PanelBody title={__("Layout", "wbg-blocks")}>
					<ToggleGroupControl
						label={__("Content position", "wbg-blocks")}
						value={contentPosition}
						onChange={(value) => setAttributes({ contentPosition: value })}
						isBlock
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					>
						<ToggleGroupControlOption
							value="content-left"
							label={__("Content Left", "wbg-blocks")}
						/>
						<ToggleGroupControlOption
							value="content-right"
							label={__("Content Right", "wbg-blocks")}
						/>
					</ToggleGroupControl>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div
					className="wbg-layout-2-col__media"
					style={getMediaStyle(style?.background)}
					aria-hidden="true"
				/>

				<div className="wbg-layout-2-col__wrapper">
					<div className="wbg-layout-2-col__content">
						<RichText
							tagName="h6"
							className="wbg-layout-2-col__subheading"
							value={subheading}
							onChange={(value) => setAttributes({ subheading: value })}
							placeholder={__("Subheading (optional)", "wbg-blocks")}
							allowedFormats={HEADING_FORMATS}
						/>

						<RichText
							tagName="h2"
							className="wbg-layout-2-col__heading"
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
