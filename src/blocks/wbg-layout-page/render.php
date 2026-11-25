<?php
/**
 * Layout - Page: front-end render.
 *
 * A full-width section that holds any inner blocks. The inner blocks are
 * rendered by WP and passed in as $content.
 *
 * Layout width (`layoutWidth`)
 * - standard (default): __wrapper is the WP wide width.
 * - wide: adds .layout--wide, and __wrapper is the theme.json
 *   settings.custom.layout.extra-wide width.
 *
 * Top/bottom padding, background color, background image and text color
 * come from WP's native block supports. get_block_wrapper_attributes() adds
 * the padding and color classes/styles, and WP adds the background image
 * styles to the outer div.
 *
 * Markup
 * - .wbg-layout-page.alignfull: background, colors, top/bottom padding.
 *   - __wrapper: the inner blocks. Width from the layout setting, with WP
 *     root padding left and right.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Rendered inner blocks.
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

/*
 * Attributes.
 * ------------------------------------------------------------------------ */

$wbg_is_wide = isset( $attributes['layoutWidth'] ) && 'wide' === $attributes['layoutWidth'];

/*
 * Output.
 * ------------------------------------------------------------------------ */

$wbg_classes = array( 'wbg-layout-page', 'alignfull' );
if ( $wbg_is_wide ) {
	$wbg_classes[] = 'layout--wide';
}

$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => implode( ' ', $wbg_classes ),
	)
);
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <div class="wbg-layout-page__wrapper">
    <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Rendered inner blocks. ?>
  </div>
</div>