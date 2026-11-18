<?php
/**
 * Slider - Curve - Full: front-end render.
 *
 * Markup
 * - __container: WP wide width, with WP root padding left and right.
 * - __title-row: optional title circle (only output when it has text).
 * - __track: every slide stacked in the same spot; view.js fades between
 *   them.
 * - __nav: prev/next arrows, centred below the slides (2+ slides only).
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks markup (the slides).
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

if ( empty( $block->inner_blocks ) ) {
	return;
}

/*
 * Attributes.
 * ------------------------------------------------------------------------ */

$wbg_title     = isset( $attributes['title'] ) && is_string( $attributes['title'] ) ? $attributes['title'] : '';
$wbg_has_title = '' !== trim( str_replace( '&nbsp;', ' ', wp_strip_all_tags( $wbg_title ) ) );

$wbg_slide_count = count( $block->inner_blocks );
$wbg_track_id    = wp_unique_id( 'wbg-slider-curve-full-track-' );
$wbg_title_id    = wp_unique_id( 'wbg-slider-curve-full-title-' );

/*
 * Output.
 * ------------------------------------------------------------------------ */

$wbg_wrapper_args = array(
	'class'                => 'wbg-slider-curve-full alignfull',
	'data-wbg-slider-full' => 'true',
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
  <div class="wbg-slider-curve-full__container">
    <?php if ( $wbg_has_title ) : ?>
    <div class="wbg-slider-curve-full__title-row">
      <div class="wbg-slider-curve-full__title-container">
        <h2 class="wbg-slider-curve-full__title h2--alt-small" id="<?php echo esc_attr( $wbg_title_id ); ?>">
          <?php echo wp_kses_post( $wbg_title ); ?></h2>
      </div>
    </div>
    <?php endif; ?>

    <div class="wbg-slider-curve-full__track" id="<?php echo esc_attr( $wbg_track_id ); ?>" data-wbg-slider-full-track>
      <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Inner blocks markup. ?>
    </div>

    <?php if ( $wbg_slide_count > 1 ) : ?>
    <div class="wbg-slider-curve-full__nav">
      <button type="button" class="wbg-slider-curve-full__arrow wbg-slider-curve-full__arrow--prev"
        aria-controls="<?php echo esc_attr( $wbg_track_id ); ?>"
        aria-label="<?php esc_attr_e( 'Previous slide', 'wbg-blocks' ); ?>" data-wbg-slider-full-prev>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
      </button>
      <button type="button" class="wbg-slider-curve-full__arrow wbg-slider-curve-full__arrow--next"
        aria-controls="<?php echo esc_attr( $wbg_track_id ); ?>"
        aria-label="<?php esc_attr_e( 'Next slide', 'wbg-blocks' ); ?>" data-wbg-slider-full-next>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
      </button>
    </div>

    <p class="wbg-slider-curve-full__status" aria-live="polite" aria-atomic="true" data-wbg-slider-full-status></p>
    <?php endif; ?>
  </div>
</div>