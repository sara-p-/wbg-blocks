<?php
/**
 * Content Overlap: front-end render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks markup (paragraph, list, buttons, image).
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'wbg_content_overlap_css_value' ) ) {
	/**
	 * Convert a block style value (e.g. "var:preset|spacing|40") to a CSS value.
	 *
	 * @param mixed $value Raw style value.
	 * @return string
	 */
	function wbg_content_overlap_css_value( $value ) {
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

// Image position: "top-right" (default), "top-left", "bottom-left" or "bottom-right".
$wbg_positions      = array( 'top-left', 'bottom-left', 'bottom-right', 'top-right' );
$wbg_image_position = $attributes['imagePosition'] ?? 'top-right';
if ( ! in_array( $wbg_image_position, $wbg_positions, true ) ) {
	$wbg_image_position = 'top-right';
}
list( $wbg_image_vertical, $wbg_image_side ) = explode( '-', $wbg_image_position );

// Image size and overlap (px).
$wbg_image_width   = absint( $attributes['imageWidth'] ?? 450 );
$wbg_image_height  = absint( $attributes['imageHeight'] ?? 500 );
$wbg_image_overlap = absint( $attributes['imageOverlap'] ?? 150 );

// Content width: wrapper width (standard/wide) and content column width (%, desktop/tablet).
$wbg_is_content_wide   = isset( $attributes['contentWidth'] ) && 'wide' === $attributes['contentWidth'];
$wbg_content_col_width = min( 100, max( 10, absint( $attributes['contentColumnWidth'] ?? 50 ) ) );

// Headings. The subheading only renders when "Show subheading" is on and has text.
$wbg_subheading      = $attributes['subheading'] ?? '';
$wbg_heading         = $attributes['heading'] ?? '';
$wbg_show_subheading = ! empty( $attributes['showSubheading'] );
$wbg_has_subheading  = $wbg_show_subheading && '' !== trim( wp_strip_all_tags( $wbg_subheading ) );
$wbg_has_heading     = '' !== trim( wp_strip_all_tags( $wbg_heading ) );
$wbg_is_large        = isset( $attributes['headingSize'] ) && 'large' === $attributes['headingSize'];

// With a subheading: subheading is an <h2 class="fake--h6">, heading is an <h3 class="fake--h2">.
// Without one: heading is an <h2>. A large heading gets "h1--alt" in either case.
$wbg_heading_tag     = $wbg_has_subheading ? 'h3' : 'h2';
$wbg_heading_classes = array( 'wbg-content-overlap__heading' );

if ( $wbg_is_large ) {
	$wbg_heading_classes[] = 'h1--alt';
} elseif ( $wbg_has_subheading ) {
	$wbg_heading_classes[] = 'fake--h2';
}

// Top/bottom padding, passed to the CSS so the image can overlap the block above or below on mobile.
$wbg_pad_top    = wbg_content_overlap_css_value( $attributes['style']['spacing']['padding']['top'] ?? null );
$wbg_pad_bottom = wbg_content_overlap_css_value( $attributes['style']['spacing']['padding']['bottom'] ?? null );

// Background image (serialization skipped in block.json so it lands on the media div, not the wrapper).
$wbg_background  = $attributes['style']['background'] ?? array();
$wbg_bg_image    = $wbg_background['backgroundImage'] ?? null;
$wbg_bg_url      = is_array( $wbg_bg_image ) ? ( $wbg_bg_image['url'] ?? '' ) : ( is_string( $wbg_bg_image ) ? $wbg_bg_image : '' );
$wbg_media_style = '';

if ( $wbg_bg_url ) {
	$wbg_declarations = array(
		'background-image'    => "url('" . esc_url_raw( $wbg_bg_url ) . "')",
		'background-size'     => $wbg_background['backgroundSize'] ?? 'contain',
		'background-position' => $wbg_background['backgroundPosition'] ?? 'center',
		'background-repeat'   => $wbg_background['backgroundRepeat'] ?? 'no-repeat',
	);

	if ( ! empty( $wbg_background['backgroundAttachment'] ) ) {
		$wbg_declarations['background-attachment'] = $wbg_background['backgroundAttachment'];
	}

	$wbg_css = '';
	foreach ( $wbg_declarations as $wbg_property => $wbg_value ) {
		$wbg_css .= $wbg_property . ':' . $wbg_value . ';';
	}

	$wbg_media_style = safecss_filter_attr( $wbg_css );
}

// Custom properties for the CSS.
$wbg_wrapper_css  = '--wbg-image-width:' . $wbg_image_width . 'px;';
$wbg_wrapper_css .= '--wbg-image-height:' . $wbg_image_height . 'px;';
$wbg_wrapper_css .= '--wbg-image-overlap:' . $wbg_image_overlap . 'px;';
$wbg_wrapper_css .= '--wbg-content-width:' . $wbg_content_col_width . '%;';

if ( $wbg_pad_top ) {
	$wbg_wrapper_css .= '--wbg-pad-top:' . $wbg_pad_top . ';';
}
if ( $wbg_pad_bottom ) {
	$wbg_wrapper_css .= '--wbg-pad-bottom:' . $wbg_pad_bottom . ';';
}

// Wrapper attributes: padding, background color and text color come from block supports.
$wbg_wrapper_classes = array(
	'wbg-content-overlap',
	'alignfull',
	'image--' . $wbg_image_vertical,
	'image--' . $wbg_image_side,
);

if ( $wbg_is_content_wide ) {
	$wbg_wrapper_classes[] = 'is-content-wide';
}

$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => implode( ' ', $wbg_wrapper_classes ),
		'style' => safecss_filter_attr( $wbg_wrapper_css ),
	)
);
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <?php if ( $wbg_bg_url ) : ?>
  <div class="wbg-content-overlap__media" style="<?php echo esc_attr( $wbg_media_style ); ?>" aria-hidden="true"></div>
  <?php endif; ?>

  <div class="wbg-content-overlap__wrapper">
    <div class="wbg-content-overlap__content">
      <?php if ( $wbg_has_subheading ) : ?>
      <h2 class="wbg-content-overlap__subheading fake--h6"><?php echo wp_kses_post( $wbg_subheading ); ?></h2>
      <?php endif; ?>

      <?php if ( $wbg_has_heading ) : ?>
      <<?php echo esc_html( $wbg_heading_tag ); ?>
        class="<?php echo esc_attr( implode( ' ', $wbg_heading_classes ) ); ?>">
        <?php echo wp_kses_post( $wbg_heading ); ?></<?php echo esc_html( $wbg_heading_tag ); ?>>
      <?php endif; ?>

      <?php if ( '' !== trim( $content ) ) : ?>
      <div class="wbg-content-overlap__body">
        <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
      </div>
      <?php endif; ?>
    </div>

    <div class="wbg-content-overlap__placeholder" aria-hidden="true"></div>
  </div>
</div>