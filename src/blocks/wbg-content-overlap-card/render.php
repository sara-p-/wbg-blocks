<?php
/**
 * Content Overlap Card: front-end render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks markup (one Content Overlap Card Child).
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Wrapper attributes: padding, background color and background image come from block supports.
$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => 'wbg-content-overlap-card alignfull',
	)
);
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <div class="wbg-content-overlap-card__wrapper">
    <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
  </div>
</div>