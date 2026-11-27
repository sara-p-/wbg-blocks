<?php
/**
 * Content Overlap Card Child: front-end render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks markup (shortcode, html, paragraph, heading, list, buttons, image).
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'wbg_content_overlap_card_child_css_value' ) ) {
	/**
	 * Convert a block style value (e.g. "var:preset|spacing|40") to a CSS value.
	 *
	 * @param mixed $value Raw style value.
	 * @return string
	 */
	function wbg_content_overlap_card_child_css_value( $value ) {
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

// Layout: space left of the content column (%), image size and overhang (px).
$wbg_content_position = min( 100, absint( $attributes['contentPosition'] ?? 30 ) );
$wbg_overhang_top     = absint( $attributes['imageOverhangTop'] ?? 40 );
$wbg_overhang_left    = absint( $attributes['imageOverhangLeft'] ?? 75 );
$wbg_image_width      = absint( $attributes['imageWidth'] ?? 437 );
$wbg_image_height     = absint( $attributes['imageHeight'] ?? 586 );

// Image. Library images go through wp_get_attachment_image() for srcset/sizes;
// images inserted from a URL fall back to a plain <img>.
$wbg_image_id    = absint( $attributes['imageId'] ?? 0 );
$wbg_image_url   = $attributes['imageUrl'] ?? '';
$wbg_image_alt   = $attributes['imageAlt'] ?? '';
$wbg_image_size  = sanitize_key( $attributes['imageSizeSlug'] ?? 'large' );
$wbg_image_size  = $wbg_image_size ? $wbg_image_size : 'large';
$wbg_image_cover = isset( $attributes['imageScale'] ) && 'cover' === $attributes['imageScale'];
$wbg_image_html  = '';

if ( $wbg_image_id ) {
	$wbg_image_html = wp_get_attachment_image(
		$wbg_image_id,
		$wbg_image_size,
		false,
		array(
			'class'    => 'wbg-content-overlap-card-child__image',
			'alt'      => $wbg_image_alt,
			'decoding' => 'async',
		)
	);
}

if ( ! $wbg_image_html && $wbg_image_url ) {
	$wbg_image_html = sprintf(
		'<img class="wbg-content-overlap-card-child__image" src="%1$s" alt="%2$s" decoding="async" loading="lazy" />',
		esc_url( $wbg_image_url ),
		esc_attr( $wbg_image_alt )
	);
}

// Headings. The subheading only renders when "Show subheading" is on and has text.
$wbg_subheading      = $attributes['subheading'] ?? '';
$wbg_heading         = $attributes['heading'] ?? '';
$wbg_show_subheading = ! empty( $attributes['showSubheading'] );
$wbg_has_subheading  = $wbg_show_subheading && '' !== trim( wp_strip_all_tags( $wbg_subheading ) );
$wbg_has_heading     = '' !== trim( wp_strip_all_tags( $wbg_heading ) );

// With a subheading: subheading is an <h2 class="fake--h6">, heading is an <h3 class="h2--alt-small">.
// Without one: heading is an <h2 class="h2--alt-small">.
$wbg_heading_tag = $wbg_has_subheading ? 'h3' : 'h2';

// Top padding, passed to the CSS so the image can still overhang the top of the card on mobile.
$wbg_pad_top = wbg_content_overlap_card_child_css_value( $attributes['style']['spacing']['padding']['top'] ?? null );

// Custom properties for the CSS.
$wbg_wrapper_css  = '--wbg-content-position:' . $wbg_content_position . ';'; // Unitless (a percentage).
$wbg_wrapper_css .= '--wbg-image-overhang-top:' . $wbg_overhang_top . 'px;';
$wbg_wrapper_css .= '--wbg-image-overhang-left:' . $wbg_overhang_left . 'px;';
$wbg_wrapper_css .= '--wbg-image-width:' . $wbg_image_width . 'px;';
$wbg_wrapper_css .= '--wbg-image-height:' . $wbg_image_height . 'px;';

if ( $wbg_pad_top ) {
	$wbg_wrapper_css .= '--wbg-pad-top:' . $wbg_pad_top . ';';
}

// Wrapper attributes: padding, background color, background image and text color come from block supports.
$wbg_wrapper_classes = array( 'wbg-content-overlap-card-child' );

if ( $wbg_image_cover ) {
	$wbg_wrapper_classes[] = 'is-image-cover';
}

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
  <?php if ( $wbg_image_html ) : ?>
  <div class="wbg-content-overlap-card-child__media">
    <?php echo $wbg_image_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
  </div>
  <?php endif; ?>

  <div class="wbg-content-overlap-card-child__wrapper">
    <div class="wbg-content-overlap-card-child__placeholder" aria-hidden="true"></div>

    <div class="wbg-content-overlap-card-child__content">
      <?php if ( $wbg_has_subheading ) : ?>
      <h2 class="wbg-content-overlap-card-child__subheading fake--h6"><?php echo wp_kses_post( $wbg_subheading ); ?>
      </h2>
      <?php endif; ?>

      <?php if ( $wbg_has_heading ) : ?>
      <<?php echo esc_html( $wbg_heading_tag ); ?> class="wbg-content-overlap-card-child__heading h2--alt-small">
        <?php echo wp_kses_post( $wbg_heading ); ?></<?php echo esc_html( $wbg_heading_tag ); ?>>
      <?php endif; ?>

      <?php if ( '' !== trim( $content ) ) : ?>
      <div class="wbg-content-overlap-card-child__body">
        <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
      </div>
      <?php endif; ?>
    </div>
  </div>
</div>