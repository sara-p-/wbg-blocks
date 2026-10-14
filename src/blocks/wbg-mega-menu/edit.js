/**
 * WBG Mega Menu – editor UI.
 *
 * The editor only shows the trigger button. The panel itself is rendered
 * on the front end by render.php, and the open/close behavior lives in view.js.
 */
import { __ } from "@wordpress/i18n";
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import {
	ExternalLink,
	Notice,
	PanelBody,
	SelectControl,
	Spinner,
	TextControl,
} from "@wordpress/components";
import { useEntityRecords } from "@wordpress/core-data";
import { decodeEntities } from "@wordpress/html-entities";
import { addQueryArgs } from "@wordpress/url";

/**
 * Must match the area registered in includes/mega-menu-panels.php.
 */
const PANEL_AREA = "mega-menu-panel";

/**
 * Link to open a template part in the Site Editor.
 *
 * @param {string} id Template part ID ("theme//slug").
 * @return {string} Admin URL.
 */
const getEditUrl = (id) =>
	addQueryArgs("site-editor.php", {
		postType: "wp_template_part",
		postId: id,
		canvas: "edit",
	});

export default function Edit({ attributes, setAttributes }) {
	const { megaMenuPanel, mobileMenuPanel, buttonText, closeButtonText } =
		attributes;

	const { records, hasResolved } = useEntityRecords(
		"postType",
		"wp_template_part",
		{ per_page: -1 },
	);

	const panels = (records ?? []).filter((part) => part.area === PANEL_AREA);

	const panelOptions = panels.map((part) => ({
		value: part.id, // "theme//slug"
		label: decodeEntities(part.title?.rendered || part.title?.raw || part.slug),
	}));

	const desktopOptions = [
		{ value: "", label: __("— Select a panel —", "wbg-blocks") },
		...panelOptions,
	];

	const mobileOptions = [
		{ value: "", label: __("None", "wbg-blocks") },
		...panelOptions,
	];

	const panelExists = (id) => !id || panels.some((part) => part.id === id);

	const blockProps = useBlockProps({ className: "wbg-mega-menu" });

	return (
		<>
			<InspectorControls>
				<PanelBody title={__("Mega Menu Settings", "wbg-blocks")}>
					<div style={{ display: "grid", gap: "16px" }}>
						{!hasResolved && <Spinner />}

						{hasResolved && panels.length === 0 && (
							<Notice status="info" isDismissible={false}>
								{__(
									"No Mega Menu Panels exist yet. In the Site Editor, go to Patterns → Add new → Template part and choose the “Mega Menu Panel” area.",
									"wbg-blocks",
								)}
							</Notice>
						)}

						{hasResolved &&
							(!panelExists(megaMenuPanel) ||
								!panelExists(mobileMenuPanel)) && (
								<Notice status="warning" isDismissible={false}>
									{__(
										"A selected panel no longer exists. Please choose another.",
										"wbg-blocks",
									)}
								</Notice>
							)}

						{hasResolved && (
							<>
								<SelectControl
									label={__("Mega Menu Panel", "wbg-blocks")}
									value={megaMenuPanel}
									options={desktopOptions}
									onChange={(value) =>
										setAttributes({
											megaMenuPanel: value,
										})
									}
									__next40pxDefaultSize
									__nextHasNoMarginBottom
								/>
								{megaMenuPanel && panelExists(megaMenuPanel) && (
									<ExternalLink href={getEditUrl(megaMenuPanel)}>
										{__("Edit this panel", "wbg-blocks")}
									</ExternalLink>
								)}

								<SelectControl
									label={__("Mega Menu Mobile Panel", "wbg-blocks")}
									value={mobileMenuPanel}
									options={mobileOptions}
									onChange={(value) =>
										setAttributes({
											mobileMenuPanel: value,
										})
									}
									__next40pxDefaultSize
									__nextHasNoMarginBottom
								/>
								{mobileMenuPanel && panelExists(mobileMenuPanel) && (
									<ExternalLink href={getEditUrl(mobileMenuPanel)}>
										{__("Edit this panel", "wbg-blocks")}
									</ExternalLink>
								)}
							</>
						)}

						<TextControl
							label={__("Button Text", "wbg-blocks")}
							value={buttonText}
							onChange={(value) => setAttributes({ buttonText: value })}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>

						<TextControl
							label={__("Close Button Text", "wbg-blocks")}
							value={closeButtonText}
							onChange={(value) => setAttributes({ closeButtonText: value })}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
					</div>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<button
					type="button"
					className="wbg-mega-menu__toggle wp-element-button"
					aria-expanded="false"
					onClick={(event) => event.preventDefault()}
				>
					{buttonText || __("Menu", "wbg-blocks")}
				</button>
			</div>
		</>
	);
}
