<?php
/**
 * Content - Accordion: front-end render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks markup.
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

$wbg_heading    = isset( $attributes['heading'] ) ? $attributes['heading'] : '';
$wbg_color_mode = isset( $attributes['colorMode'] ) ? $attributes['colorMode'] : 'dark';
$wbg_has_heading = '' !== trim( wp_strip_all_tags( $wbg_heading ) );

$wbg_classes = array( 'wbg-content-accordion', 'alignfull' );

if ( 'light' === $wbg_color_mode ) {
	$wbg_classes[] = 'is-color-mode--light';
}

// Also outputs the top/bottom padding styles from block supports.
$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => implode( ' ', $wbg_classes ),
	)
);
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <div class="wbg-content-accordion__container">
    <div class="wbg-content-accordion__wrapper">
      <?php if ( $wbg_has_heading ) : ?>
      <h2 class="wp-block-heading wbg-content-accordion__heading"><?php echo wp_kses_post( $wbg_heading ); ?></h2>
      <?php endif; ?>

      <div class="wbg-content-accordion__content">
        <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
      </div>
    </div>
  </div>
</div>