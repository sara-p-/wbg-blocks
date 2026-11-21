<?php
/**
 * Slider - Curve - Post: front-end render.
 *
 * Query
 * Builds a WP_Query from the block's settings (post type, categories/tags,
 * number of posts, order, offset, exclude current post). The one
 * Slide - Curve - Post inner block is the template: it's rendered once per
 * post, with the post passed in through block context (postId / postType),
 * the same way core's Post Template block does it.
 *
 * Markup
 * - __container: WP wide width, with WP root padding left and right.
 * - __title-row: optional title circle (only output when it has text).
 * - __track: every slide stacked in the same spot; view.js fades between
 *   them.
 * - __nav: prev/next arrows, centred below the slides (2+ slides only).
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Unused: the slide block is rendered per post below.
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

/*
 * Attributes.
 * ------------------------------------------------------------------------ */

$wbg_title     = isset( $attributes['title'] ) && is_string( $attributes['title'] ) ? $attributes['title'] : '';
$wbg_has_title = '' !== trim( str_replace( '&nbsp;', ' ', wp_strip_all_tags( $wbg_title ) ) );

// Post types the slider can show. The slide block uses the same filter.
$wbg_post_types = array_values( (array) apply_filters( 'wbg_slider_curve_post_post_types', array( 'event', 'program' ) ) );
if ( empty( $wbg_post_types ) ) {
	return;
}

$wbg_post_type = isset( $attributes['postType'] ) && in_array( $attributes['postType'], $wbg_post_types, true )
	? $attributes['postType']
	: $wbg_post_types[0];

$wbg_per_page = isset( $attributes['perPage'] ) ? (int) $attributes['perPage'] : 6;
$wbg_per_page = max( 1, min( 20, $wbg_per_page ) ); // Same cap as edit.js.

$wbg_offset = isset( $attributes['offset'] ) ? max( 0, (int) $attributes['offset'] ) : 0;

$wbg_orderby = isset( $attributes['orderBy'] ) && in_array( $attributes['orderBy'], array( 'date', 'title', 'modified', 'rand' ), true )
	? $attributes['orderBy']
	: 'date';

$wbg_order = isset( $attributes['order'] ) && 'asc' === $attributes['order'] ? 'ASC' : 'DESC';

$wbg_exclude_current = ! isset( $attributes['excludeCurrent'] ) || (bool) $attributes['excludeCurrent'];

$wbg_tax_terms = isset( $attributes['taxQuery'] ) && is_array( $attributes['taxQuery'] ) ? $attributes['taxQuery'] : array();

/*
 * Query.
 * ------------------------------------------------------------------------ */

// One clause per taxonomy: a post must match every taxonomy that has terms,
// and any one of the terms within it. Taxonomies the post type doesn't use
// are skipped (e.g. after switching post type).
$wbg_tax_query = array();
foreach ( $wbg_tax_terms as $wbg_taxonomy => $wbg_term_ids ) {
	if ( ! is_string( $wbg_taxonomy ) || ! is_array( $wbg_term_ids ) || ! is_object_in_taxonomy( $wbg_post_type, $wbg_taxonomy ) ) {
		continue;
	}

	$wbg_term_ids = array_values( array_filter( array_map( 'absint', $wbg_term_ids ) ) );
	if ( empty( $wbg_term_ids ) ) {
		continue;
	}

	$wbg_tax_query[] = array(
		'taxonomy'         => $wbg_taxonomy,
		'field'            => 'term_id',
		'terms'            => $wbg_term_ids,
		'operator'         => 'IN',
		'include_children' => false, // Matches the editor preview (REST API).
	);
}

$wbg_query_args = array(
	'post_type'           => $wbg_post_type,
	'post_status'         => 'publish',
	'has_password'        => false,
	'posts_per_page'      => $wbg_per_page,
	'offset'              => $wbg_offset,
	'orderby'             => $wbg_orderby,
	'order'               => $wbg_order,
	'ignore_sticky_posts' => true,
	'no_found_rows'       => true,
);

if ( $wbg_tax_query ) {
	$wbg_query_args['tax_query'] = array_merge( array( 'relation' => 'AND' ), $wbg_tax_query ); // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
}

if ( $wbg_exclude_current && is_singular() ) {
	$wbg_query_args['post__not_in'] = array( get_queried_object_id() ); // phpcs:ignore WordPressVIPMinimum.Performance.WPQueryParams.PostNotIn_post__not_in
}

$wbg_query_args = apply_filters( 'wbg_slider_curve_post_query_args', $wbg_query_args, $attributes, $block );

$wbg_query = new WP_Query( $wbg_query_args );
if ( ! $wbg_query->have_posts() ) {
	return;
}

/*
 * Slides: render the slide block once per post.
 * ------------------------------------------------------------------------ */

// The slide block saved inside this one (its settings apply to every slide).
$wbg_slide_block = null;
foreach ( $block->parsed_block['innerBlocks'] as $wbg_inner_block ) {
	if ( 'wbg-blocks/wbg-slide-curve-post' === $wbg_inner_block['blockName'] ) {
		$wbg_slide_block = $wbg_inner_block;
		break;
	}
}

// Fallback, so the slider still works if the slide block is missing.
if ( null === $wbg_slide_block ) {
	$wbg_slide_block = array(
		'blockName'    => 'wbg-blocks/wbg-slide-curve-post',
		'attrs'        => array(),
		'innerBlocks'  => array(),
		'innerHTML'    => '',
		'innerContent' => array(),
	);
}

$wbg_slides = array();
while ( $wbg_query->have_posts() ) {
	$wbg_query->the_post();

	$wbg_slide_html = (
		new WP_Block(
			$wbg_slide_block,
			array(
				'postId'                 => get_the_ID(),
				'postType'               => get_post_type(),
				'wbg-blocks/sliderTitle' => $wbg_title,
			)
		)
	)->render();

	if ( '' !== trim( $wbg_slide_html ) ) {
		$wbg_slides[] = $wbg_slide_html;
	}
}
wp_reset_postdata();

if ( empty( $wbg_slides ) ) {
	return;
}

$wbg_slide_count = count( $wbg_slides );
$wbg_track_id    = wp_unique_id( 'wbg-slider-curve-post-track-' );
$wbg_title_id    = wp_unique_id( 'wbg-slider-curve-post-title-' );

/*
 * Output.
 * ------------------------------------------------------------------------ */

$wbg_wrapper_args = array(
	'class'                => 'wbg-slider-curve-post alignfull',
	'data-wbg-slider-post' => 'true',
	'role'                 => 'region',
	'aria-roledescription' => __( 'carousel', 'wbg-blocks' ),
	/* translators: Keep {current} and {total} as they are. */
	'data-status-template' => __( 'Slide {current} of {total}', 'wbg-blocks' ),
	'data-slide-label'     => __( 'slide', 'wbg-blocks' ),
);

// Name the region after the title when there is one.
if ( $wbg_has_title ) {
	$wbg_wrapper_args['aria-labelledby'] = $wbg_title_id;
} else {
	$wbg_wrapper_args['aria-label'] = __( 'Slider', 'wbg-blocks' );
}

$wbg_wrapper_attributes = get_block_wrapper_attributes( $wbg_wrapper_args );
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <div class="wbg-slider-curve-post__container">
    <?php if ( $wbg_has_title ) : ?>
    <div class="wbg-slider-curve-post__title-row">
      <div class="wbg-slider-curve-post__title-container">
        <h2 class="wbg-slider-curve-post__title h2--alt-small" id="<?php echo esc_attr( $wbg_title_id ); ?>">
          <?php echo wp_kses_post( $wbg_title ); ?></h2>
      </div>
    </div>
    <?php endif; ?>

    <div class="wbg-slider-curve-post__track" id="<?php echo esc_attr( $wbg_track_id ); ?>" data-wbg-slider-post-track>
      <?php echo implode( '', $wbg_slides ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Rendered slide blocks. ?>
    </div>

    <?php if ( $wbg_slide_count > 1 ) : ?>
    <div class="wbg-slider-curve-post__nav">
      <button type="button" class="wbg-slider-curve-post__arrow wbg-slider-curve-post__arrow--prev"
        aria-controls="<?php echo esc_attr( $wbg_track_id ); ?>"
        aria-label="<?php esc_attr_e( 'Previous slide', 'wbg-blocks' ); ?>" data-wbg-slider-post-prev>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
      </button>
      <button type="button" class="wbg-slider-curve-post__arrow wbg-slider-curve-post__arrow--next"
        aria-controls="<?php echo esc_attr( $wbg_track_id ); ?>"
        aria-label="<?php esc_attr_e( 'Next slide', 'wbg-blocks' ); ?>" data-wbg-slider-post-next>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
      </button>
    </div>

    <p class="wbg-slider-curve-post__status" aria-live="polite" aria-atomic="true" data-wbg-slider-post-status></p>
    <?php endif; ?>
  </div>
</div>