<?php
/**
 * Card - Staff: front-end render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks markup (unused).
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

// Rich text values (stored as HTML strings).
$wbg_name     = isset( $attributes['name'] ) ? (string) $attributes['name'] : '';
$wbg_position = isset( $attributes['position'] ) ? (string) $attributes['position'] : '';

// Wrapper: padding + colors from block supports (background image is skipped).
$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => $wbg_has_image ? 'wbg-card-staff has-image' : 'wbg-card-staff',
	)
);
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <?php if ( $wbg_has_image ) : ?>
  <div class="wbg-card-staff__image has-background-image" style="<?php echo esc_attr( $wbg_image_style ); ?>"
    aria-hidden="true"></div>
  <?php endif; ?>
  <?php if ( '' !== trim( $wbg_name ) || '' !== trim( $wbg_position ) ) : ?>
  <div class="wbg-card-staff__content">
    <?php if ( '' !== trim( $wbg_name ) ) : ?>
    <h3 class="wp-block-heading wbg-card-staff__name"><?php echo wp_kses_post( $wbg_name ); ?></h3>
    <?php endif; ?>
    <?php if ( '' !== trim( $wbg_position ) ) : ?>
    <p class="wbg-card-staff__position"><?php echo wp_kses_post( $wbg_position ); ?></p>
    <?php endif; ?>
  </div>
  <?php endif; ?>
</div>