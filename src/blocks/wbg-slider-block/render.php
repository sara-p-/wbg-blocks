<?php
/**
 * Slider - Block: front-end render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks markup (wbg-slide-block slides).
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

$heading      = $attributes['heading'] ?? '';
$autoplay     = 'autoplay' === ( $attributes['autoplay'] ?? 'static' );
$button_text  = $attributes['button-text'] ?? '';
$button_link  = $attributes['button-link'] ?? '';
$new_tab      = ! empty( $attributes['button-opens-in-new-tab'] );
$nofollow     = ! empty( $attributes['button-nofollow'] );
$slide_count  = count( $block->inner_blocks );
$has_heading  = '' !== trim( wp_strip_all_tags( $heading ) );
$has_button   = '' !== trim( wp_strip_all_tags( $button_text ) ) && '' !== $button_link;
$has_controls = $slide_count > 1;

$uid        = wp_unique_id( 'wbg-slider-' );
$track_id   = $uid . '-track';
$heading_id = $uid . '-heading';

// Give each slide its carousel semantics: role="group", "slide", "1 of 5".
$slides_html = $content;
if ( $slide_count ) {
	$processor = new WP_HTML_Tag_Processor( $content );
	$index     = 0;

	while ( $processor->next_tag( array( 'class_name' => 'wbg-slide-block' ) ) ) {
		++$index;
		$processor->set_attribute( 'role', 'group' );
		$processor->set_attribute( 'aria-roledescription', __( 'slide', 'wbg-blocks' ) );
		$processor->set_attribute(
			'aria-label',
			/* translators: 1: current slide number, 2: total number of slides. */
			sprintf( __( '%1$d of %2$d', 'wbg-blocks' ), $index, $slide_count )
		);
		$processor->set_attribute( 'data-wbg-slide', '' );
	}

	$slides_html = $processor->get_updated_html();
}

// Wrapper (background color, text color and padding supports are applied here).
$wrapper_args = array(
	'class'                => 'wbg-slider-block alignfull',
	'aria-roledescription' => __( 'carousel', 'wbg-blocks' ),
	'data-wbg-slider'      => '',
	'data-autoplay'        => $autoplay ? 'true' : 'false',
	/* translators: Screen reader status. Keep {current} and {total}. */
	'data-status-template' => __( 'Slide {current} of {total}', 'wbg-blocks' ),
);

if ( $has_heading ) {
	$wrapper_args['aria-labelledby'] = $heading_id;
} else {
	$wrapper_args['aria-label'] = __( 'Slider', 'wbg-blocks' );
}

$wrapper_attributes = get_block_wrapper_attributes( $wrapper_args );

// Button link attributes.
$link_attrs = '';
if ( $has_button ) {
	$link_attrs = sprintf( ' href="%s"', esc_url( $button_link ) );

	$rel = array();
	if ( $new_tab ) {
		$link_attrs .= ' target="_blank"';
		$rel[]       = 'noreferrer';
		$rel[]       = 'noopener';
	}
	if ( $nofollow ) {
		$rel[] = 'nofollow';
	}
	if ( $rel ) {
		$link_attrs .= sprintf( ' rel="%s"', esc_attr( implode( ' ', $rel ) ) );
	}
}

$chevron_prev = '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
$chevron_next = '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <?php if ( $has_heading ) : ?>
  <div class="wbg-slider-block__header">
    <h2 id="<?php echo esc_attr( $heading_id ); ?>" class="wp-block-heading wbg-slider-block__heading">
      <?php echo wp_kses_post( $heading ); ?></h2>
  </div>
  <?php endif; ?>

  <div class="wbg-slider-block__viewport">
    <?php if ( $has_controls ) : ?>
    <button type="button" class="wbg-slider-block__arrow wbg-slider-block__arrow--prev"
      aria-controls="<?php echo esc_attr( $track_id ); ?>"
      aria-label="<?php esc_attr_e( 'Previous slide', 'wbg-blocks' ); ?>" aria-disabled="true" data-wbg-slider-prev>
      <?php echo $chevron_prev; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static SVG. ?>
    </button>
    <button type="button" class="wbg-slider-block__arrow wbg-slider-block__arrow--next"
      aria-controls="<?php echo esc_attr( $track_id ); ?>"
      aria-label="<?php esc_attr_e( 'Next slide', 'wbg-blocks' ); ?>" data-wbg-slider-next>
      <?php echo $chevron_next; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static SVG. ?>
    </button>
    <?php endif; ?>

    <div id="<?php echo esc_attr( $track_id ); ?>" class="wbg-slider-block__track" data-wbg-slider-track>
      <?php echo $slides_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- rendered inner blocks. ?>
    </div>
  </div>

  <?php if ( $has_controls ) : ?>
  <div class="wbg-slider-block__dots" role="group" aria-label="<?php esc_attr_e( 'Choose a slide', 'wbg-blocks' ); ?>">
    <?php for ( $i = 1; $i <= $slide_count; $i++ ) : ?>
    <button type="button" class="wbg-slider-block__dot" aria-controls="<?php echo esc_attr( $track_id ); ?>"
      <?php /* translators: %d: slide number. */ ?>
      aria-label="<?php echo esc_attr( sprintf( __( 'Go to slide %d', 'wbg-blocks' ), $i ) ); ?>"
      <?php echo 1 === $i ? 'aria-current="true"' : ''; ?> data-wbg-slider-dot></button>
    <?php endfor; ?>
  </div>

  <div class="wbg-slider-block__status" aria-live="polite" aria-atomic="true" data-wbg-slider-status></div>
  <?php endif; ?>

  <?php if ( $has_button ) : ?>
  <div class="wbg-slider-block__footer">
    <div class="wp-block-button wbg-slider-block__button">
      <a class="wp-block-button__link wp-element-button"
        <?php echo $link_attrs; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above. ?>><?php echo wp_kses_post( $button_text ); ?></a>
    </div>
  </div>
  <?php endif; ?>
</section>