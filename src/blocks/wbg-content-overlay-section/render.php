<?php
/**
 * Content - Overlay Section: front-end render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Unused.
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */




$wbg_classes = array( 'wbg-content-overlay-section alignfull' );

if ( 'wide' === ( $attributes['contentWidth'] ?? 'normal' ) ) {
	$wbg_classes[] = 'is-width--wide';
}

$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => implode( ' ', $wbg_classes ),
	)
);
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <div class="wbg-content-overlay-section__wrapper">
    <div class="wbg-content-overlay-section__content">
      <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
    </div>
  </div>
</div>