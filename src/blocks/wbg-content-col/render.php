<?php
/**
 * Content Column: front-end render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks markup (paragraph, content section, buttons, list, image).
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Wrapper attributes: background color, text color and padding come from block supports.
$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => 'wbg-content-col',
	)
);
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
</div>