<?php
/**
 * Slider - Curve: front-end render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks markup (slides).
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

if ( empty( $block->inner_blocks ) ) {
	return;
}

$wbg_slide_count = count( $block->inner_blocks );
$wbg_track_id    = wp_unique_id( 'wbg-slider-curve-track-' );

$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class'                => 'wbg-slider-curve',
		'data-wbg-slider'      => 'true',
		'role'                 => 'region',
		'aria-roledescription' => __( 'carousel', 'wbg-blocks' ),
		'aria-label'           => __( 'Image slider', 'wbg-blocks' ),
		/* translators: Keep {current} and {total} as they are. */
		'data-status-template' => __( 'Slide {current} of {total}', 'wbg-blocks' ),
		'data-slide-label'     => __( 'slide', 'wbg-blocks' ),
	)
);
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <div class="wbg-slider-curve__viewport">
    <div class="wbg-slider-curve__track" id="<?php echo esc_attr( $wbg_track_id ); ?>" data-wbg-slider-track>
      <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
    </div>
  </div>

  <?php if ( $wbg_slide_count > 1 ) : ?>
  <div class="wbg-slider-curve__nav">
    <button type="button" class="wbg-slider-curve__arrow wbg-slider-curve__arrow--prev"
      aria-controls="<?php echo esc_attr( $wbg_track_id ); ?>"
      aria-label="<?php esc_attr_e( 'Previous slide', 'wbg-blocks' ); ?>" data-wbg-slider-prev>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round"
          stroke-linejoin="round" />
      </svg>
    </button>
    <button type="button" class="wbg-slider-curve__arrow wbg-slider-curve__arrow--next"
      aria-controls="<?php echo esc_attr( $wbg_track_id ); ?>"
      aria-label="<?php esc_attr_e( 'Next slide', 'wbg-blocks' ); ?>" data-wbg-slider-next>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round"
          stroke-linejoin="round" />
      </svg>
    </button>
  </div>

  <p class="wbg-slider-curve__status" aria-live="polite" aria-atomic="true" data-wbg-slider-status></p>
  <?php endif; ?>
</div>