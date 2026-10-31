<?php
/**
 * Slide - Block: front-end render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content (unused – dynamic block).
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

$heading     = $attributes['heading'] ?? '';
$date        = $attributes['date'] ?? '';
$time        = $attributes['time'] ?? '';
$text        = $attributes['text'] ?? '';
$button_text = $attributes['button-text'] ?? '';
$button_link = $attributes['button-link'] ?? '';
$new_tab     = ! empty( $attributes['button-opens-in-new-tab'] );
$nofollow    = ! empty( $attributes['button-nofollow'] );
$overlay     = $attributes['overlay'] ?? 'no-overlay';

$classes = array( 'wbg-slide-block' );
if ( 'overlay' === $overlay ) {
	$classes[] = 'is-overlay';
}

// Background color + background image (block supports) are applied here.
$wrapper_attributes = get_block_wrapper_attributes(
	array( 'class' => implode( ' ', $classes ) )
);

// Build the button link attributes.
$link_attrs = '';
if ( $button_link ) {
	$link_attrs .= sprintf( ' href="%s"', esc_url( $button_link ) );

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
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <div class="wbg-slide-block__inner">
    <div class="wbg-slide-block__col wbg-slide-block__col--meta">
      <div class="wbg-slide-block__date-time">
        <?php if ( '' !== trim( $date ) ) : ?>
        <h5 class="wp-block-heading wbg-slide-block__date"><?php echo wp_kses_post( $date ); ?></h5>
        <?php endif; ?>
        <?php if ( '' !== trim( $time ) ) : ?>
        <h6 class="wp-block-heading wbg-slide-block__time"><?php echo wp_kses_post( $time ); ?></h6>
        <?php endif; ?>
      </div>

      <?php if ( '' !== trim( $button_text ) ) : ?>
      <div class="wp-block-button wbg-slide-block__button">
        <a class="wp-block-button__link wp-element-button"
          <?php echo $link_attrs; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above. ?>><?php echo wp_kses_post( $button_text ); ?></a>
      </div>
      <?php endif; ?>
    </div>

    <div class="wbg-slide-block__col wbg-slide-block__col--content">
      <?php if ( '' !== trim( $heading ) ) : ?>
      <h2 class="wp-block-heading wbg-slide-block__heading"><?php echo wp_kses_post( $heading ); ?></h2>
      <?php endif; ?>

      <?php if ( '' !== trim( $date ) ) : ?>
      <h5 class="wp-block-heading wbg-slide-block__date mobile-view"><?php echo wp_kses_post( $date ); ?></h5>
      <?php endif; ?>

      <?php if ( '' !== trim( $time ) ) : ?>
      <h6 class="wp-block-heading wbg-slide-block__time mobile-view"><?php echo wp_kses_post( $time ); ?></h6>
      <?php endif; ?>

      <?php if ( '' !== trim( $text ) ) : ?>
      <p class="wbg-slide-block__text"><?php echo wp_kses_post( $text ); ?></p>
      <?php endif; ?>
      <?php if ( '' !== trim( $button_text ) ) : ?>
      <div class="wp-block-button wbg-slide-block__button mobile-view">
        <a class="wp-block-button__link wp-element-button"
          <?php echo $link_attrs; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above. ?>><?php echo wp_kses_post( $button_text ); ?></a>
      </div>
      <?php endif; ?>
    </div>
  </div>
</div>