<?php
/**
 * Card - Simple: front-end render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks markup.
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

$wbg_heading = isset( $attributes['heading'] ) ? trim( $attributes['heading'] ) : '';

$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => 'wbg-card-simple',
	)
);
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <?php if ( '' !== $wbg_heading ) : ?>
  <h3 class="wp-block-heading wbg-card-simple__heading fake--h2"><?php echo wp_kses_post( $wbg_heading ); ?></h3>
  <?php endif; ?>
  <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
</div>