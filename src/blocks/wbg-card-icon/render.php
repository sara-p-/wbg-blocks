<?php
/**
 * Card - Icon: front-end render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks markup.
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

$wbg_icon = isset( $attributes['icon'] ) ? $attributes['icon'] : 'none';

// Inline SVG markup (empty string for "none" or a missing file).
$wbg_icon_svg = function_exists( 'wbg_blocks_get_icon_svg' ) ? wbg_blocks_get_icon_svg( $wbg_icon ) : '';

/*
 * Block spacing (blockGap) from the native Dimensions control.
 * Core only outputs blockGap for blocks with layout support on the wrapper,
 * so we pass it to the content div as a custom property instead.
 */
$wbg_gap = $attributes['style']['spacing']['blockGap'] ?? '';

if ( is_array( $wbg_gap ) ) {
	$wbg_gap = $wbg_gap['top'] ?? '';
}

$wbg_gap = is_string( $wbg_gap ) ? $wbg_gap : '';

// "var:preset|spacing|40" -> "var(--wp--preset--spacing--40)".
if ( str_starts_with( $wbg_gap, 'var:' ) ) {
	$wbg_gap = 'var(--wp--' . str_replace( '|', '--', substr( $wbg_gap, 4 ) ) . ')';
}

// Only allow characters that belong in a length, var() or calc() value.
if ( ! preg_match( '/^[\w\s.%(),+*\/-]+$/', $wbg_gap ) ) {
	$wbg_gap = '';
}

$wbg_content_style = $wbg_gap
	? sprintf( ' style="--wbg-card-icon-gap:%s"', esc_attr( $wbg_gap ) )
	: '';

$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => 'wbg-card-icon',
	)
);
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <?php if ( $wbg_icon_svg ) : ?>
  <div class="wbg-card-icon__icon" aria-hidden="true">
    <?php echo $wbg_icon_svg; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted SVG from the plugin's own assets folder. ?>
  </div>
  <?php endif; ?>
  <div class="wbg-card-icon__content"
    <?php echo $wbg_content_style; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above. ?>>
    <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- rendered inner blocks. ?>
  </div>
</div>