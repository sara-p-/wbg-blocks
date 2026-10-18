<?php
/**
 * Hero - Headline: front-end render.
 *
 * @var string   $content    Inner blocks markup (core/buttons).
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */


$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => "wbg-hero-headline",
	)
);
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <div class="wbg-hero-headline__wrapper">
    <div class="wbg-hero-headline__heading">
      <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
    </div>
  </div>
</div>