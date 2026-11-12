<?php
/**
 * Slide - Image: front-end render.
 *
 * @var array    $attributes Block attributes.
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

$classes = array( 'wbg-slide-image' );

// Background color + background image (block supports) are applied here.
$wrapper_attributes = get_block_wrapper_attributes(
	array( 'class' => implode( ' ', $classes ) )
);


?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>

</div>