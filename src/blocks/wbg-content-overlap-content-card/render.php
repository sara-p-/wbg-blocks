<?php
/**
 * Content Overlap Content Card: front-end render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks markup (one Content Overlap Content Card Child).
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'wbg_content_overlap_content_card_css_value' ) ) {
	/**
	 * Convert a block style value (e.g. "var:preset|spacing|40") to a CSS value.
	 *
	 * @param mixed $value Raw style value.
	 * @return string
	 */
	function wbg_content_overlap_content_card_css_value( $value ) {
		if ( ! is_string( $value ) || '' === $value ) {
			return '';
		}

		if ( str_starts_with( $value, 'var:' ) ) {
			$parts = array_map( 'sanitize_key', explode( '|', substr( $value, 4 ) ) );
			return 'var(--wp--' . implode( '--', $parts ) . ')';
		}

		return $value;
	}
}

// Image position: which edge each side lines up with, plus a push past it (px).
$wbg_anchor_x    = ( $attributes['imageAnchorX'] ?? 'section' ) === 'card' ? 'card' : 'section';
$wbg_anchor_y    = ( $attributes['imageAnchorY'] ?? 'section' ) === 'card' ? 'card' : 'section';
$wbg_offset_x    = (int) ( $attributes['imageOffsetX'] ?? 0 );
$wbg_offset_y    = (int) ( $attributes['imageOffsetY'] ?? 0 );
$wbg_image_width = absint( $attributes['imageWidth'] ?? 620 );

// Image. Library images go through wp_get_attachment_image() for srcset/sizes;
// images inserted from a URL fall back to a plain <img>.
$wbg_image_id   = absint( $attributes['imageId'] ?? 0 );
$wbg_image_url  = $attributes['imageUrl'] ?? '';
$wbg_image_alt  = $attributes['imageAlt'] ?? '';
$wbg_image_size = sanitize_key( $attributes['imageSizeSlug'] ?? 'large' );
$wbg_image_size = $wbg_image_size ? $wbg_image_size : 'large';
$wbg_image_html = '';

if ( $wbg_image_id ) {
	$wbg_image_html = wp_get_attachment_image(
		$wbg_image_id,
		$wbg_image_size,
		false,
		array(
			'class'    => 'wbg-content-overlap-content-card__image',
			'alt'      => $wbg_image_alt,
			'decoding' => 'async',
		)
	);
}

if ( ! $wbg_image_html && $wbg_image_url ) {
	$wbg_image_html = sprintf(
		'<img class="wbg-content-overlap-content-card__image" src="%1$s" alt="%2$s" decoding="async" loading="lazy" />',
		esc_url( $wbg_image_url ),
		esc_attr( $wbg_image_alt )
	);
}

// Bottom padding, passed to the CSS so the image can line up with the card's bottom edge.
$wbg_pad_bottom = wbg_content_overlap_content_card_css_value( $attributes['style']['spacing']['padding']['bottom'] ?? null );

// Custom properties for the CSS.
$wbg_wrapper_css  = '--wbg-image-width:' . $wbg_image_width . 'px;';
$wbg_wrapper_css .= '--wbg-image-offset-x:' . $wbg_offset_x . 'px;';
$wbg_wrapper_css .= '--wbg-image-offset-y:' . $wbg_offset_y . 'px;';

if ( $wbg_pad_bottom ) {
	$wbg_wrapper_css .= '--wbg-pad-bottom:' . $wbg_pad_bottom . ';';
}

// Wrapper attributes: padding, background color and background image come from block supports.
$wbg_wrapper_classes = array(
	'wbg-content-overlap-content-card',
	'alignfull',
	'is-image-x-' . $wbg_anchor_x,
	'is-image-y-' . $wbg_anchor_y,
);

if ( ! $wbg_image_html ) {
	$wbg_wrapper_classes[] = 'has-no-image';
}

$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => implode( ' ', $wbg_wrapper_classes ),
		'style' => safecss_filter_attr( $wbg_wrapper_css ),
	)
);
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <div class="wbg-content-overlap-content-card__wrapper">
    <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
  </div>

  <?php if ( $wbg_image_html ) : ?>
  <div class="wbg-content-overlap-content-card__media">
    <?php echo $wbg_image_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
  </div>
  <?php endif; ?>
</div>