<?php
/**
 * Card - Image: front-end render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks markup.
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

$wbg_style = isset( $attributes['style'] ) && is_array( $attributes['style'] ) ? $attributes['style'] : array();

/*
 * Background image.
 * Serialization is skipped in block.json, so the native background
 * values are applied to the image div instead of the wrapper.
 */
$wbg_background  = isset( $wbg_style['background'] ) && is_array( $wbg_style['background'] ) ? $wbg_style['background'] : array();
$wbg_image       = $wbg_background['backgroundImage'] ?? null;
$wbg_image_url   = is_array( $wbg_image ) ? ( $wbg_image['url'] ?? '' ) : (string) $wbg_image;
$wbg_has_image   = '' !== $wbg_image_url;
$wbg_image_style = '';

if ( $wbg_has_image ) {
	// Match core's defaults for background images.
	if ( empty( $wbg_background['backgroundSize'] ) ) {
		$wbg_background['backgroundSize'] = 'cover';
	}
	if ( 'contain' === $wbg_background['backgroundSize'] && empty( $wbg_background['backgroundPosition'] ) ) {
		$wbg_background['backgroundPosition'] = '50% 50%';
	}

	$wbg_image_styles = wp_style_engine_get_styles( array( 'background' => $wbg_background ) );
	$wbg_image_style  = $wbg_image_styles['css'] ?? '';
}

/*
 * Block gap.
 * Serialization is skipped in block.json; the value is passed to the
 * inner-blocks div as a custom property consumed by the stylesheet.
 */
$wbg_gap           = $wbg_style['spacing']['blockGap'] ?? null;
$wbg_content_style = '';

if ( is_array( $wbg_gap ) ) {
	$wbg_gap = $wbg_gap['top'] ?? null;
}

// Same sanitization core uses for gap values (rejects "(", "&", "=", "}", comments).
if ( is_string( $wbg_gap ) && '' !== $wbg_gap && ! preg_match( '%[\\\(&=}]|/\*%', $wbg_gap ) ) {
	if ( str_starts_with( $wbg_gap, 'var:preset|spacing|' ) ) {
		$wbg_slug = substr( $wbg_gap, strrpos( $wbg_gap, '|' ) + 1 );
		$wbg_gap  = 'var(--wp--preset--spacing--' . _wp_to_kebab_case( $wbg_slug ) . ')';
	}
	$wbg_content_style = '--wbg-card-gap:' . $wbg_gap . ';';
}

// Wrapper: padding + colors from block supports (background image is skipped).
$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => $wbg_has_image ? 'wbg-card-image has-image' : 'wbg-card-image',
	)
);
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <?php if ( $wbg_has_image ) : ?>
  <div class="wbg-card-image__image has-background-image" style="<?php echo esc_attr( $wbg_image_style ); ?>"
    aria-hidden="true"></div>
  <?php endif; ?>
  <div class="wbg-card-image__content"
    <?php echo $wbg_content_style ? ' style="' . esc_attr( $wbg_content_style ) . '"' : ''; ?>>
    <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
  </div>
</div>