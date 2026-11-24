/**
 * Slider - Testimonial: editor view.
 *
 * Static content
 * Subheading (h3 look, above), heading (h2 look), text and 2 buttons are edited
 * inline. Each button's link is set with WP's link popover: click into a
 * button, then use the link button in the block toolbar. A button only shows
 * on the front end when it has both text and a link.
 *
 * Slides
 * The slider runs a query of the Testimonial post type (categories, number,
 * order). The Slide - Testimonial block is added once, as the only inner
 * block, and is the template for every slide; render.php renders it once
 * per testimonial.
 *
 * Unlike the Curve sliders, the editor shows the same layout as the front
 * end: the static content sits top-left and the slide wraps around it. The
 * arrows under the slide switch which testimonial the slide block shows, so
 * every one can be checked.
 *
 * The editor lists posts and terms through the REST API, so the Testimonial
 * post type and its taxonomies need show_in_rest.
 */
import { __, sprintf } from "@wordpress/i18n";
import { useSelect } from "@wordpress/data";
import { useEffect, useMemo, useState } from "@wordpress/element";
import { useDebounce } from "@wordpress/compose";
import { decodeEntities } from "@wordpress/html-entities";
import { store as coreStore } from "@wordpress/core-data";
import {
	useBlockProps,
	useInnerBlocksProps,
	BlockContextProvider,
	BlockControls,
	InspectorControls,
	RichText,
	__experimentalLinkControl as LinkControl,
} from "@wordpress/block-editor";
import {
	FormTokenField,
	PanelBody,
	Popover,
	RangeControl,
	SelectControl,
	Spinner,
	ToolbarButton,
	__experimentalVStack as VStack,
} from "@wordpress/components";

const POST_TYPE = "testimonial";
const SLIDE_BLOCK = "wbg-blocks/wbg-slide-testimonial";
const ALLOWED_BLOCKS = [SLIDE_BLOCK];
const TEMPLATE = [[SLIDE_BLOCK]];

const HEADING_FORMATS = ["core/bold", "core/italic"];
const TEXT_FORMATS = ["core/bold", "core/italic", "core/link"];
const BUTTON_FORMATS = ["core/bold", "core/italic"];

// Options shown in the link popover, under the URL.
const LINK_SETTINGS = [
	{ id: "opensInNewTab", title: __("Open in new tab", "wbg-blocks") },
	{ id: "nofollow", title: __("Mark as nofollow", "wbg-blocks") },
];

// "orderBy/order" pairs.
const ORDER_OPTIONS = [
	{ label: __("Newest to oldest", "wbg-blocks"), value: "date/desc" },
	{ label: __("Oldest to newest", "wbg-blocks"), value: "date/asc" },
	{ label: __("A → Z", "wbg-blocks"), value: "title/asc" },
	{ label: __("Z → A", "wbg-blocks"), value: "title/desc" },
	{ label: __("Recently updated", "wbg-blocks"), value: "modified/desc" },
	{ label: __("Menu order", "wbg-blocks"), value: "menu_order/asc" },
	{ label: __("Random", "wbg-blocks"), value: "rand/desc" },
];

const MAX_POSTS = 20; // Same cap as render.php.
const TERM_SUGGESTIONS = 20;
const EMPTY_ARRAY = [];

/* ---------------------------------------------------------------------- */
/* Term picker (one per taxonomy)                                         */
/* ---------------------------------------------------------------------- */

function TermControl({ taxonomy, value, onChange }) {
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(setSearch, 250);

	const { suggestions, selected } = useSelect(
		(select) => {
			const { getEntityRecords } = select(coreStore);
			const base = { _fields: "id,name", context: "view" };

			return {
				suggestions:
					getEntityRecords("taxonomy", taxonomy.slug, {
						...base,
						search,
						orderby: "count",
						order: "desc",
						per_page: TERM_SUGGESTIONS,
					}) || EMPTY_ARRAY,
				selected: value.length
					? getEntityRecords("taxonomy", taxonomy.slug, {
							...base,
							include: value,
							per_page: value.length,
						}) || EMPTY_ARRAY
					: EMPTY_ARRAY,
			};
		},
		[taxonomy.slug, search, value],
	);

	// Selected terms, in the order they were picked.
	const tokens = value
		.map((id) => selected.find((term) => term.id === id))
		.filter(Boolean)
		.map((term) => ({ id: term.id, value: decodeEntities(term.name) }));

	// Tokens are either { id, value } (already picked) or a typed/suggested
	// name, which is matched back to a term.
	const onTokensChange = (newTokens) => {
		const known = [...selected, ...suggestions];
		const ids = newTokens
			.map((token) => {
				if (token && "object" === typeof token && token.id) {
					return token.id;
				}
				const name = String("object" === typeof token ? token.value : token)
					.trim()
					.toLowerCase();
				const match = known.find(
					(term) => decodeEntities(term.name).toLowerCase() === name,
				);
				return match ? match.id : null;
			})
			.filter(Boolean);

		onChange([...new Set(ids)]);
	};

	return (
		<FormTokenField
			label={decodeEntities(taxonomy.name)}
			value={tokens}
			suggestions={suggestions.map((term) => decodeEntities(term.name))}
			onInputChange={debouncedSearch}
			onChange={onTokensChange}
			maxSuggestions={TERM_SUGGESTIONS}
			__experimentalShowHowTo={false}
			__next40pxDefaultSize
			__nextHasNoMarginBottom
		/>
	);
}

/* ---------------------------------------------------------------------- */
/* Button (rich text + WP link popover)                                   */
/* ---------------------------------------------------------------------- */

function ButtonField({
	number,
	attributes,
	setAttributes,
	isActive,
	onFocus,
	isLinkOpen,
	setIsLinkOpen,
}) {
	const key = `button${number}`;
	const text = attributes[`${key}Text`];
	const url = attributes[`${key}Url`];
	const opensInNewTab = attributes[`${key}OpensInNewTab`];
	const nofollow = attributes[`${key}Nofollow`];

	// The popover is anchored to the button.
	const [anchor, setAnchor] = useState(null);

	const linkValue = useMemo(
		() => ({ url, opensInNewTab, nofollow }),
		[url, opensInNewTab, nofollow],
	);

	const setLink = ({
		url: nextUrl = "",
		opensInNewTab: nextNewTab = false,
		nofollow: nextNofollow = false,
	} = {}) =>
		setAttributes({
			[`${key}Url`]: nextUrl,
			[`${key}OpensInNewTab`]: !!nextNewTab,
			[`${key}Nofollow`]: !!nextNofollow,
		});

	return (
		<>
			{isActive && (
				<BlockControls group="block">
					<ToolbarButton
						icon="admin-links"
						label={
							url
								? /* translators: %d: button number. */
									sprintf(__("Edit button %d link", "wbg-blocks"), number)
								: /* translators: %d: button number. */
									sprintf(__("Add button %d link", "wbg-blocks"), number)
						}
						onClick={() => setIsLinkOpen(!isLinkOpen)}
						isPressed={!!url || isLinkOpen}
					/>
				</BlockControls>
			)}

			<div
				ref={setAnchor}
				className={`wp-block-button wbg-slider-testimonial__button${
					url ? "" : " has-no-link"
				}`}
				onFocus={onFocus}
			>
				<RichText
					tagName="div"
					className="wp-block-button__link wp-element-button"
					identifier={`${key}Text`}
					value={text}
					onChange={(value) => setAttributes({ [`${key}Text`]: value })}
					/* translators: %d: button number. */
					placeholder={sprintf(
						__("Button %d (optional)", "wbg-blocks"),
						number,
					)}
					allowedFormats={BUTTON_FORMATS}
					withoutInteractiveFormatting
				/>
			</div>

			{isActive && isLinkOpen && (
				<Popover
					placement="bottom"
					anchor={anchor}
					onClose={() => setIsLinkOpen(false)}
					focusOnMount="firstElement"
					shift
				>
					<LinkControl
						value={linkValue}
						onChange={setLink}
						onRemove={() => {
							setLink();
							setIsLinkOpen(false);
						}}
						settings={LINK_SETTINGS}
						forceIsEditingLink={!url}
					/>
				</Popover>
			)}
		</>
	);
}

/* ---------------------------------------------------------------------- */
/* Slide                                                                  */
/* ---------------------------------------------------------------------- */

// The one real slide block, as the slider's track. Rendered inside a
// BlockContextProvider so it gets the current testimonial's ID, the same
// way core's Post Template does it.
function SlideTrack() {
	const innerBlocksProps = useInnerBlocksProps(
		{ className: "wbg-slider-testimonial__track" },
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
			// Exactly one slide block: it can't be removed, moved or added to.
			templateLock: "all",
			renderAppender: false,
		},
	);

	return <div {...innerBlocksProps} />;
}

export default function Edit({ attributes, setAttributes, isSelected }) {
	const { heading, subheading, text, taxQuery, perPage, orderBy, order } =
		attributes;

	/* ------------------------------------------------------------------ */
	/* Buttons: which one is being edited                                 */
	/* ------------------------------------------------------------------ */

	const [activeButton, setActiveButton] = useState(null);
	const [isLinkOpen, setIsLinkOpen] = useState(false);

	// Close the link popover when the block is deselected.
	useEffect(() => {
		if (!isSelected) {
			setActiveButton(null);
			setIsLinkOpen(false);
		}
	}, [isSelected]);

	const focusButton = (number) => {
		if (number !== activeButton) {
			setActiveButton(number);
			setIsLinkOpen(false);
		}
	};

	/* ------------------------------------------------------------------ */
	/* Query                                                              */
	/* ------------------------------------------------------------------ */

	const allTaxonomies = useSelect(
		(select) =>
			select(coreStore).getTaxonomies({ type: POST_TYPE, per_page: -1 }),
		[],
	);

	// Testimonial categories (and any other public taxonomy on the CPT).
	const taxonomies = useMemo(
		() =>
			(allTaxonomies || []).filter(
				(taxonomy) => taxonomy.visibility?.publicly_queryable,
			),
		[allTaxonomies],
	);

	// Same query as render.php, in REST API terms.
	const query = useMemo(() => {
		const isRandom = "rand" === orderBy;
		const args = {
			per_page: perPage,
			// The REST API can't order randomly, so the preview shows newest
			// first. The front end is still random.
			orderby: isRandom ? "date" : orderBy,
			order: isRandom ? "desc" : order,
			_fields: "id",
		};

		taxonomies.forEach((taxonomy) => {
			const ids = taxQuery?.[taxonomy.slug];
			if (ids?.length) {
				args[taxonomy.rest_base] = ids;
			}
		});

		return args;
	}, [perPage, orderBy, order, taxQuery, taxonomies]);

	const { posts, isLoading } = useSelect(
		(select) => {
			const { getEntityRecords, hasFinishedResolution } = select(coreStore);
			const args = ["postType", POST_TYPE, query];

			return {
				posts: getEntityRecords(...args),
				isLoading: !hasFinishedResolution("getEntityRecords", args),
			};
		},
		[query],
	);

	const postIds = useMemo(() => (posts || []).map((post) => post.id), [posts]);

	/* ------------------------------------------------------------------ */
	/* Slide being previewed                                              */
	/* ------------------------------------------------------------------ */

	const [current, setCurrent] = useState(0);
	const total = postIds.length;
	const index = total ? current % total : 0;

	// Back to the first testimonial when the query changes.
	useEffect(() => {
		setCurrent(0);
	}, [query]);

	// postId is null when there are no testimonials, so the slide doesn't
	// fall back to the page being edited.
	const slideContext = useMemo(
		() => ({ postId: postIds[index] ?? null, postType: POST_TYPE }),
		[postIds, index],
	);

	const goTo = (step) => setCurrent((index + step + total) % total);

	/* ------------------------------------------------------------------ */
	/* Settings                                                           */
	/* ------------------------------------------------------------------ */

	const setTerms = (taxonomySlug, ids) => {
		const next = { ...taxQuery };
		if (ids.length) {
			next[taxonomySlug] = ids;
		} else {
			delete next[taxonomySlug];
		}
		setAttributes({ taxQuery: next });
	};

	/* ------------------------------------------------------------------ */
	/* Markup                                                             */
	/* ------------------------------------------------------------------ */

	const blockProps = useBlockProps({
		className:
			"wbg-slider-testimonial wbg-slider-testimonial--editor alignfull",
	});

	return (
		<>
			<InspectorControls>
				<PanelBody title={__("Testimonials", "wbg-blocks")}>
					<VStack spacing={4}>
						<RangeControl
							label={__("Number of testimonials", "wbg-blocks")}
							value={perPage}
							onChange={(value) => setAttributes({ perPage: value ?? 6 })}
							min={1}
							max={MAX_POSTS}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
						<SelectControl
							label={__("Order", "wbg-blocks")}
							value={`${orderBy}/${order}`}
							options={ORDER_OPTIONS}
							onChange={(value) => {
								const [nextOrderBy, nextOrder] = value.split("/");
								setAttributes({ orderBy: nextOrderBy, order: nextOrder });
							}}
							help={
								"rand" === orderBy
									? __(
											"Random order is used on the live site. The editor preview shows newest first.",
											"wbg-blocks",
										)
									: undefined
							}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
					</VStack>
				</PanelBody>

				<PanelBody title={__("Filters", "wbg-blocks")}>
					<VStack spacing={4}>
						{taxonomies.map((taxonomy) => (
							<TermControl
								key={taxonomy.slug}
								taxonomy={taxonomy}
								value={taxQuery?.[taxonomy.slug] || EMPTY_ARRAY}
								onChange={(ids) => setTerms(taxonomy.slug, ids)}
							/>
						))}
						<p className="components-base-control__help">
							{taxonomies.length
								? __(
										"Leave a filter empty to include all testimonials. Testimonials can match any one of the categories you pick.",
										"wbg-blocks",
									)
								: __("Testimonials have no categories.", "wbg-blocks")}
						</p>
					</VStack>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div className="wbg-slider-testimonial__container">
					<div className="wbg-slider-testimonial__layout">
						{/* Static content: top-left, the slides wrap around it. */}
						<div className="wbg-slider-testimonial__static">
							<div
								className="wbg-slider-testimonial__intro"
								onFocus={() => focusButton(null)}
							>
								{/* Subheading sits above the heading. */}
								<RichText
									tagName="h3"
									className="wbg-slider-testimonial__subheading"
									identifier="subheading"
									value={subheading}
									onChange={(value) => setAttributes({ subheading: value })}
									placeholder={__("Subheading (optional)", "wbg-blocks")}
									allowedFormats={HEADING_FORMATS}
								/>
								<RichText
									tagName="h2"
									className="wbg-slider-testimonial__heading"
									identifier="heading"
									value={heading}
									onChange={(value) => setAttributes({ heading: value })}
									placeholder={__("Heading", "wbg-blocks")}
									allowedFormats={HEADING_FORMATS}
								/>
								<RichText
									tagName="p"
									className="wbg-slider-testimonial__text"
									identifier="text"
									value={text}
									onChange={(value) => setAttributes({ text: value })}
									placeholder={__("Text (optional)", "wbg-blocks")}
									allowedFormats={TEXT_FORMATS}
								/>
							</div>

							<div className="wp-block-buttons wbg-slider-testimonial__buttons">
								{[1, 2].map((number) => (
									<ButtonField
										key={number}
										number={number}
										attributes={attributes}
										setAttributes={setAttributes}
										isActive={isSelected && activeButton === number}
										onFocus={() => focusButton(number)}
										isLinkOpen={isLinkOpen}
										setIsLinkOpen={setIsLinkOpen}
									/>
								))}
							</div>
						</div>

						{/* Room for the slide's image and quote. */}
						<div
							className="wbg-slider-testimonial__placeholder wbg-slider-testimonial__placeholder--image"
							aria-hidden="true"
						/>
						<div
							className="wbg-slider-testimonial__placeholder wbg-slider-testimonial__placeholder--quote"
							aria-hidden="true"
						/>

						<BlockContextProvider value={slideContext}>
							<SlideTrack />
						</BlockContextProvider>

						{total > 1 && (
							<div className="wbg-slider-testimonial__nav">
								<button
									type="button"
									className="wbg-slider-testimonial__arrow wbg-slider-testimonial__arrow--prev"
									aria-label={__("Previous testimonial", "wbg-blocks")}
									onClick={() => goTo(-1)}
								>
									<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
										<path
											d="M15 6l-6 6 6 6"
											fill="none"
											stroke="currentColor"
											strokeWidth="2.25"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</button>
								<button
									type="button"
									className="wbg-slider-testimonial__arrow wbg-slider-testimonial__arrow--next"
									aria-label={__("Next testimonial", "wbg-blocks")}
									onClick={() => goTo(1)}
								>
									<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
										<path
											d="M9 6l6 6-6 6"
											fill="none"
											stroke="currentColor"
											strokeWidth="2.25"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</button>
							</div>
						)}
					</div>

					<div
						className="wbg-slider-testimonial__editor-status"
						aria-live="polite"
						aria-atomic="true"
					>
						{isLoading ? (
							<Spinner />
						) : (
							total > 0 &&
							sprintf(
								/* translators: 1: current testimonial, 2: number of testimonials. */
								__("Previewing testimonial %1$d of %2$d", "wbg-blocks"),
								index + 1,
								total,
							)
						)}
					</div>
				</div>
			</div>
		</>
	);
}
