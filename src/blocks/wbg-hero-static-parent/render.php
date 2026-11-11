<?php
/**
 * Layout - 1-Col - Background: front-end render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks markup (core/buttons).
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => "wbg-hero-static-parent",
	)
);

?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <div class="wbg-hero-static-parent__wrapper">
    <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
  </div>
</div>