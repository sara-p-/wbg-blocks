<?php
/**
 * Slider - Testimonial: front-end render.
 *
 * Query
 * Builds a WP_Query of the Testimonial post type from the block's settings
 * (categories, number of testimonials, order). The one Slide - Testimonial
 * inner block is the template: it's rendered once per testimonial, with the
 * post passed in through block context (postId / postType), the same way
 * core's Post Template block does it.
 *
 * Headings (the subheading sits above the heading)
 * - Subheading:    subheading h2.fake--h3, then heading h3.fake--h2
 * - No subheading: heading h2
 *
 * Buttons
 * A button is only output when it has both text and a link. Buttons that
 * open in a new tab say so to screen readers. Button 2 uses core's Outline
 * style (is-style-outline), even when button 1 is empty.
 *
 * Accessibility
 * - The block is a labelled region ("carousel"), named by its heading.
 * - Each slide is a group ("testimonial", "Testimonial 2 of 5"). Hidden
 *   slides are inert, so they can't be focused or read out.
 * - The arrows are real buttons with labels, and work with Enter/Space and
 *   the left/right arrow keys. A live region announces the new slide.
 * - Nothing moves on its own, and the fade is off for reduced motion.
 * - Source order matches the mobile reading order: static content, then
 *   each slide (image, name, quote), then the arrows.
 *
 * Markup
 * - __container: WP wide width, with WP root padding left and right.
 * - __layout: one grid that holds everything.
 *   - __static: heading, subheading, text, buttons. Top-left.
 *   - __placeholder--image / --quote: empty cells that keep room for the
 *     slide's image (right) and name + quote (bottom-left).
 *   - __track: covers the static content and both placeholders. Each slide
 *     uses the same grid (CSS subgrid), with its own empty cell top-left,
 *     so its image and quote line up around the static content.
 *   - __nav: prev/next arrows, below the slides (2+ slides only).
 * - Mobile: static content, image, quote, arrows.
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

$wbg_attr = static function ( $name ) use ( $attributes ) {
	return isset( $attributes[ $name ] ) && is_string( $attributes[ $name ] ) ? $attributes[ $name ] : '';
};

// True when a value has visible text (ignores tags and &nbsp;).
$wbg_has_text = static function ( $value ) {
	return '' !== trim( str_replace( '&nbsp;', ' ', wp_strip_all_tags( (string) $value ) ) );
};

$wbg_heading    = $wbg_attr( 'heading' );
$wbg_subheading = $wbg_attr( 'subheading' );
$wbg_text       = $wbg_attr( 'text' );

$wbg_has_heading    = $wbg_has_text( $wbg_heading );
$wbg_has_subheading = $wbg_has_text( $wbg_subheading );

$wbg_per_page = isset( $attributes['perPage'] ) ? (int) $attributes['perPage'] : 6;
$wbg_per_page = max( 1, min( 20, $wbg_per_page ) ); // Same cap as edit.js.

$wbg_orderby = isset( $attributes['orderBy'] ) && in_array( $attributes['orderBy'], array( 'date', 'title', 'modified', 'menu_order', 'rand' ), true )
	? $attributes['orderBy']
	: 'date';

$wbg_order = isset( $attributes['order'] ) && 'asc' === $attributes['order'] ? 'ASC' : 'DESC';

$wbg_tax_terms = isset( $attributes['taxQuery'] ) && is_array( $attributes['taxQuery'] ) ? $attributes['taxQuery'] : array();

/*
 * Buttons: need both text and a link.
 * ------------------------------------------------------------------------ */

$wbg_buttons = array();
foreach ( array( 1, 2 ) as $wbg_number ) {
	$wbg_btn_text = $wbg_attr( "button{$wbg_number}Text" );
	$wbg_btn_url  = trim( $wbg_attr( "button{$wbg_number}Url" ) );

	if ( ! $wbg_has_text( $wbg_btn_text ) || '' === $wbg_btn_url ) {
		continue;
	}

	$wbg_new_tab  = ! empty( $attributes[ "button{$wbg_number}OpensInNewTab" ] );
	$wbg_nofollow = ! empty( $attributes[ "button{$wbg_number}Nofollow" ] );

	$wbg_rel = array();
	if ( $wbg_new_tab ) {
		$wbg_rel[] = 'noopener';
	}
	if ( $wbg_nofollow ) {
		$wbg_rel[] = 'nofollow';
	}

	$wbg_buttons[] = array(
		'number' => $wbg_number,
		'text'   => $wbg_btn_text,
		'url'    => $wbg_btn_url,
		'target' => $wbg_new_tab ? '_blank' : '',
		'rel'    => implode( ' ', $wbg_rel ),
	);
}

// The buttons use core's button classes (and the Outline style), but WP only
// loads core's button CSS on pages with a core Button block. Load it here.
if ( $wbg_buttons ) {
	wp_enqueue_style( 'wp-block-button' );
}

/*
 * Query.
 * ------------------------------------------------------------------------ */

$wbg_post_type = 'testimonial';

// One clause per taxonomy: a testimonial must match every taxonomy that has
// terms, and any one of the terms within it.
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
	'orderby'             => $wbg_orderby,
	'order'               => $wbg_order,
	'ignore_sticky_posts' => true,
	'no_found_rows'       => true,
);

if ( $wbg_tax_query ) {
	$wbg_query_args['tax_query'] = array_merge( array( 'relation' => 'AND' ), $wbg_tax_query ); // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
}

$wbg_query_args = apply_filters( 'wbg_slider_testimonial_query_args', $wbg_query_args, $attributes, $block );

$wbg_query = new WP_Query( $wbg_query_args );

/*
 * Slides: render the slide block once per testimonial.
 * ------------------------------------------------------------------------ */

// The slide block saved inside this one.
$wbg_slide_block = null;
foreach ( $block->parsed_block['innerBlocks'] as $wbg_inner_block ) {
	if ( 'wbg-blocks/wbg-slide-testimonial' === $wbg_inner_block['blockName'] ) {
		$wbg_slide_block = $wbg_inner_block;
		break;
	}
}

// Fallback, so the slider still works if the slide block is missing.
if ( null === $wbg_slide_block ) {
	$wbg_slide_block = array(
		'blockName'    => 'wbg-blocks/wbg-slide-testimonial',
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
				'postId'                     => get_the_ID(),
				'postType'                   => get_post_type(),
				'wbg-blocks/sliderHeading'    => $wbg_heading,
				'wbg-blocks/sliderSubheading' => $wbg_subheading,
			)
		)
	)->render();

	if ( '' !== trim( $wbg_slide_html ) ) {
		$wbg_slides[] = $wbg_slide_html;
	}
}
wp_reset_postdata();

// Nothing to show at all.
if ( empty( $wbg_slides ) && ! $wbg_has_heading && ! $wbg_has_subheading && ! $wbg_has_text( $wbg_text ) && empty( $wbg_buttons ) ) {
	return;
}

$wbg_slide_count = count( $wbg_slides );
$wbg_track_id    = wp_unique_id( 'wbg-slider-testimonial-track-' );
$wbg_heading_id    = wp_unique_id( 'wbg-slider-testimonial-heading-' );
$wbg_subheading_id = wp_unique_id( 'wbg-slider-testimonial-subheading-' );

/*
 * Heading levels.
 * ------------------------------------------------------------------------ */

if ( $wbg_has_subheading ) {
	$wbg_heading_tag   = 'h3';
	$wbg_heading_class = 'wbg-slider-testimonial__heading fake--h2';
} else {
	$wbg_heading_tag   = 'h2';
	$wbg_heading_class = 'wbg-slider-testimonial__heading';
}

/*
 * Output.
 * ------------------------------------------------------------------------ */

$wbg_wrapper_args = array(
	'class'                       => 'wbg-slider-testimonial alignfull',
	'data-wbg-slider-testimonial' => 'true',
	'role'                        => 'region',
	'aria-roledescription'        => __( 'carousel', 'wbg-blocks' ),
	/* translators: Keep {current} and {total} as they are. */
	'data-status-template'        => __( 'Testimonial {current} of {total}', 'wbg-blocks' ),
	'data-slide-label'            => __( 'testimonial', 'wbg-blocks' ),
);

// Name the region after the heading, or the subheading if that's all
// there is, so it's announced as e.g. "Voices of The Gardens, carousel".
if ( $wbg_has_heading ) {
	$wbg_wrapper_args['aria-labelledby'] = $wbg_heading_id;
} elseif ( $wbg_has_subheading ) {
	$wbg_wrapper_args['aria-labelledby'] = $wbg_subheading_id;
} else {
	$wbg_wrapper_args['aria-label'] = __( 'Testimonials', 'wbg-blocks' );
}

$wbg_wrapper_attributes = get_block_wrapper_attributes( $wbg_wrapper_args );
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <div class="wbg-slider-testimonial__container">
    <div class="wbg-slider-testimonial__layout">
      <div class="wbg-slider-testimonial__static">
        <?php if ( $wbg_has_heading || $wbg_has_subheading || $wbg_has_text( $wbg_text ) ) : ?>
        <div class="wbg-slider-testimonial__intro">
          <?php if ( $wbg_has_subheading ) : ?>
          <h2 class="wbg-slider-testimonial__subheading fake--h6" id="<?php echo esc_attr( $wbg_subheading_id ); ?>">
            <?php echo wp_kses_post( $wbg_subheading ); ?></h2>
          <?php endif; ?>

          <?php if ( $wbg_has_heading ) : ?>
          <<?php echo esc_html( $wbg_heading_tag ); ?> class="<?php echo esc_attr( $wbg_heading_class ); ?>"
            id="<?php echo esc_attr( $wbg_heading_id ); ?>"><?php echo wp_kses_post( $wbg_heading ); ?>
          </<?php echo esc_html( $wbg_heading_tag ); ?>>
          <?php endif; ?>

          <?php if ( $wbg_has_text( $wbg_text ) ) : ?>
          <p class="wbg-slider-testimonial__text"><?php echo wp_kses_post( $wbg_text ); ?></p>
          <?php endif; ?>
        </div>
        <?php endif; ?>

        <?php if ( $wbg_buttons ) : ?>
        <div class="wp-block-buttons wbg-slider-testimonial__buttons">
          <?php foreach ( $wbg_buttons as $wbg_btn ) : ?>
          <div
            class="wp-block-button wbg-slider-testimonial__button<?php echo 2 === $wbg_btn['number'] ? ' is-style-outline is-style-outline--3' : ''; ?>">
            <a class="wp-block-button__link wp-element-button" href="<?php echo esc_url( $wbg_btn['url'] ); ?>"
              <?php if ( '' !== $wbg_btn['target'] ) : ?> target="<?php echo esc_attr( $wbg_btn['target'] ); ?>"
              <?php endif; ?> <?php if ( '' !== $wbg_btn['rel'] ) : ?> rel="<?php echo esc_attr( $wbg_btn['rel'] ); ?>"
              <?php endif; ?>><?php echo wp_kses( $wbg_btn['text'], array( 'strong' => array(), 'em' => array(), 'b' => array(), 'i' => array() ) ); ?><?php if ( '' !== $wbg_btn['target'] ) : ?><span
                class="wbg-slider-testimonial__sr-only">
                <?php esc_html_e( '(opens in a new tab)', 'wbg-blocks' ); ?></span><?php endif; ?></a>
          </div>
          <?php endforeach; ?>
        </div>
        <?php endif; ?>
      </div>

      <div class="wbg-slider-testimonial__placeholder wbg-slider-testimonial__placeholder--image" aria-hidden="true">
      </div>
      <div class="wbg-slider-testimonial__placeholder wbg-slider-testimonial__placeholder--quote" aria-hidden="true">
      </div>

      <?php if ( $wbg_slide_count ) : ?>
      <div class="wbg-slider-testimonial__track" id="<?php echo esc_attr( $wbg_track_id ); ?>"
        data-wbg-slider-testimonial-track>
        <?php echo implode( '', $wbg_slides ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Rendered slide blocks. ?>
      </div>
      <?php endif; ?>

      <?php if ( $wbg_slide_count > 1 ) : ?>
      <div class="wbg-slider-testimonial__nav">
        <button type="button" class="wbg-slider-testimonial__arrow wbg-slider-testimonial__arrow--prev"
          aria-controls="<?php echo esc_attr( $wbg_track_id ); ?>"
          aria-label="<?php esc_attr_e( 'Previous testimonial', 'wbg-blocks' ); ?>" data-wbg-slider-testimonial-prev>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </button>
        <button type="button" class="wbg-slider-testimonial__arrow wbg-slider-testimonial__arrow--next"
          aria-controls="<?php echo esc_attr( $wbg_track_id ); ?>"
          aria-label="<?php esc_attr_e( 'Next testimonial', 'wbg-blocks' ); ?>" data-wbg-slider-testimonial-next>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </button>
      </div>

      <p class="wbg-slider-testimonial__status" aria-live="polite" aria-atomic="true"
        data-wbg-slider-testimonial-status></p>
      <?php endif; ?>
    </div>
  </div>
</div>