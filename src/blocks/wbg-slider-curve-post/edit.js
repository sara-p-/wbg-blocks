/**
 * Slider - Curve - Post: editor view.
 *
 * The slider runs a query (post type, categories, tags, number, order) and
 * shows one Slide - Curve - Post per result. The slide block is added once,
 * as the only inner block, and is the template for every slide:
 *
 * - The first post shows in the real inner block.
 * - Every other post is a server-rendered preview of the same block.
 *
 * As in Slider - Curve - Full, the slides sit side by side in a horizontally
 * scrolling row so every slide can be seen. The fade, arrows and stacked
 * slides only apply on the front end (see render.php / view.js).
 *
 * The editor lists posts and terms through the REST API, so the Event and
 * Program post types and their taxonomies need show_in_rest.
 */
import { __ } from "@wordpress/i18n";
import { useSelect } from "@wordpress/data";
import { useMemo, useState } from "@wordpress/element";
import { useDebounce } from "@wordpress/compose";
import { decodeEntities } from "@wordpress/html-entities";
import { store as coreStore } from "@wordpress/core-data";
import {
	useBlockProps,
	useInnerBlocksProps,
	BlockContextProvider,
	InspectorControls,
	RichText,
} from "@wordpress/block-editor";
import {
	FormTokenField,
	PanelBody,
	RangeControl,
	SelectControl,
	Spinner,
	ToggleControl,
	__experimentalVStack as VStack,
} from "@wordpress/components";
import ServerSideRender from "@wordpress/server-side-render";

const SLIDE_BLOCK = "wbg-blocks/wbg-slide-curve-post";
const ALLOWED_BLOCKS = [SLIDE_BLOCK];
const TEMPLATE = [[SLIDE_BLOCK]];

const TEXT_FORMATS = ["core/bold", "core/italic"];

// Keep in step with the wbg_slider_curve_post_post_types filter in render.php.
const POST_TYPE_OPTIONS = [
	{ label: __("Events", "wbg-blocks"), value: "event" },
	{ label: __("Programs", "wbg-blocks"), value: "program" },
];

// "orderBy/order" pairs.
const ORDER_OPTIONS = [
	{ label: __("Newest to oldest", "wbg-blocks"), value: "date/desc" },
	{ label: __("Oldest to newest", "wbg-blocks"), value: "date/asc" },
	{ label: __("A → Z", "wbg-blocks"), value: "title/asc" },
	{ label: __("Z → A", "wbg-blocks"), value: "title/desc" },
	{ label: __("Recently updated", "wbg-blocks"), value: "modified/desc" },
	{ label: __("Random", "wbg-blocks"), value: "rand/desc" },
];

const MAX_POSTS = 20; // Same cap as render.php.
const MAX_OFFSET = 20;
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
/* Slides                                                                 */
/* ---------------------------------------------------------------------- */

// The one real slide block. Rendered inside a BlockContextProvider so it
// gets the first post's ID, the same way core's Post Template does it.
function SlideInnerBlocks() {
	const innerBlocksProps = useInnerBlocksProps(
		{
			className:
				"wbg-slider-curve-post__editor-slide wbg-slider-curve-post__editor-slide--template",
		},
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

// Every other post: a look-only render of the slide block.
function SlidePreview({ postId }) {
	const urlQueryArgs = useMemo(() => ({ post_id: postId }), [postId]);

	return (
		<div
			className="wbg-slider-curve-post__editor-slide wbg-slider-curve-post__editor-slide--preview"
			aria-hidden="true"
		>
			<ServerSideRender block={SLIDE_BLOCK} urlQueryArgs={urlQueryArgs} />
		</div>
	);
}

export default function Edit({ attributes, setAttributes }) {
	const {
		title,
		postType,
		taxQuery,
		perPage,
		offset,
		orderBy,
		order,
		excludeCurrent,
	} = attributes;

	/* ------------------------------------------------------------------ */
	/* Query                                                              */
	/* ------------------------------------------------------------------ */

	const { allTaxonomies, currentPostId } = useSelect(
		(select) => ({
			allTaxonomies: select(coreStore).getTaxonomies({
				type: postType,
				per_page: -1,
			}),
			currentPostId: select("core/editor")?.getCurrentPostId?.(),
		}),
		[postType],
	);

	// Categories, tags and any other public taxonomy on this post type.
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
			offset,
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

		if (excludeCurrent && Number.isInteger(currentPostId)) {
			args.exclude = [currentPostId];
		}

		return args;
	}, [
		perPage,
		offset,
		orderBy,
		order,
		taxQuery,
		taxonomies,
		excludeCurrent,
		currentPostId,
	]);

	const { posts, isLoading } = useSelect(
		(select) => {
			const { getEntityRecords, hasFinishedResolution } = select(coreStore);
			const args = ["postType", postType, query];

			return {
				posts: getEntityRecords(...args),
				isLoading: !hasFinishedResolution("getEntityRecords", args),
			};
		},
		[postType, query],
	);

	const postIds = useMemo(() => (posts || []).map((post) => post.id), [posts]);

	/* ------------------------------------------------------------------ */
	/* Slides                                                             */
	/* ------------------------------------------------------------------ */

	// First post -> the real slide block. postId is null when there are no
	// posts, so the slide doesn't fall back to the page being edited.
	const slideContext = useMemo(
		() => ({ postId: postIds[0] ?? null, postType }),
		[postIds, postType],
	);

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
		className: "wbg-slider-curve-post wbg-slider-curve-post--editor alignfull",
	});

	return (
		<>
			<InspectorControls>
				<PanelBody title={__("Posts", "wbg-blocks")}>
					<VStack spacing={4}>
						<SelectControl
							label={__("Post type", "wbg-blocks")}
							value={postType}
							options={POST_TYPE_OPTIONS}
							onChange={(value) => setAttributes({ postType: value })}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
						<RangeControl
							label={__("Number of posts", "wbg-blocks")}
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
						<RangeControl
							label={__("Offset", "wbg-blocks")}
							help={__(
								"Skip this many posts before the first slide.",
								"wbg-blocks",
							)}
							value={offset}
							onChange={(value) => setAttributes({ offset: value ?? 0 })}
							min={0}
							max={MAX_OFFSET}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
						<ToggleControl
							label={__("Exclude the current post", "wbg-blocks")}
							help={__(
								"On an Event or Program page, leave that post out of the slider.",
								"wbg-blocks",
							)}
							checked={excludeCurrent}
							onChange={(value) => setAttributes({ excludeCurrent: value })}
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
										"Leave a filter empty to include all. Posts must match every filter you fill in, and any one term within it.",
										"wbg-blocks",
									)
								: __("This post type has no categories or tags.", "wbg-blocks")}
						</p>
					</VStack>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<div className="wbg-slider-curve-post__container">
					{/* Title circle: its own row above the slides. */}
					<div className="wbg-slider-curve-post__title-row">
						<div className="wbg-slider-curve-post__title-container">
							<RichText
								tagName="h2"
								className="wbg-slider-curve-post__title h2--alt-small"
								value={title}
								onChange={(value) => setAttributes({ title: value })}
								placeholder={__("Title (optional)", "wbg-blocks")}
								allowedFormats={TEXT_FORMATS}
							/>
						</div>
					</div>

					<div className="wbg-slider-curve-post__editor-track">
						<BlockContextProvider value={slideContext}>
							<SlideInnerBlocks />
						</BlockContextProvider>

						{postIds.slice(1).map((postId) => (
							<SlidePreview key={postId} postId={postId} />
						))}
					</div>

					{isLoading && (
						<div className="wbg-slider-curve-post__editor-status">
							<Spinner />
						</div>
					)}
				</div>
			</div>
		</>
	);
}
