<?php
/**
 * Content Section: front-end render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks markup (paragraph, list, buttons).
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$wbg_heading     = $attributes['heading'] ?? '';
$wbg_has_heading = '' !== trim( wp_strip_all_tags( $wbg_heading ) );
$wbg_has_content = '' !== trim( $content );

// Nothing to show.
if ( ! $wbg_has_heading && ! $wbg_has_content ) {
	return;
}

$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => 'wbg-content-section',
	)
);
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <?php if ( $wbg_has_heading ) : ?>
  <h6 class="wbg-content-section__heading"><?php echo wp_kses_post( $wbg_heading ); ?></h6>
  <?php endif; ?>

  <?php if ( $wbg_has_content ) : ?>
  <div class="wbg-content-section__body">
    <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
  </div>
  <?php endif; ?>
</div>