<?php
/**
 * Content - Overlay - 2-Column: front-end render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks markup (paragraph, list, image, buttons).
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'wbg_content_overlay_2_col_css_value' ) ) {
	/**
	 * Convert a block style value (e.g. "var:preset|spacing|40" or
	 * "var:preset|color|green") to a CSS value.
	 *
	 * @param mixed $value Raw style value. blockGap may be an array ( top/left ).
	 * @return string
	 */
	function wbg_content_overlay_2_col_css_value( $value ) {
		if ( is_array( $value ) ) {
			$value = $value['top'] ?? '';
		}

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

// Content position.
$wbg_is_content_left = isset( $attributes['contentPosition'] ) && 'content-left' === $attributes['contentPosition'];

// Headings. The subheading only renders when "Show subheading" is on.
$wbg_subheading      = $attributes['subheading'] ?? '';
$wbg_heading         = $attributes['heading'] ?? '';
$wbg_show_subheading = ! empty( $attributes['showSubHeading'] );
$wbg_has_subheading  = $wbg_show_subheading && '' !== trim( wp_strip_all_tags( $wbg_subheading ) );
$wbg_has_heading     = '' !== trim( wp_strip_all_tags( $wbg_heading ) );

// Image overhang in px (how far the image rises above the panel).
$wbg_overhang = isset( $attributes['overhang'] ) ? absint( $attributes['overhang'] ) : 80;

// Bottom padding, passed to the CSS so the image can sit on the panel's bottom edge on mobile.
$wbg_pad_bottom = wbg_content_overlay_2_col_css_value( $attributes['style']['spacing']['padding']['bottom'] ?? null );
$wbg_wrapper_css = '--wbg-overhang:' . $wbg_overhang . 'px;' . ( $wbg_pad_bottom ? '--wbg-pad-bottom:' . $wbg_pad_bottom . ';' : '' );

// Block gap (applies to the inner blocks body only; serialization skipped in block.json).
$wbg_gap       = wbg_content_overlay_2_col_css_value( $attributes['style']['spacing']['blockGap'] ?? null );
$wbg_gap_style = $wbg_gap ? safecss_filter_attr( '--wbg-block-gap:' . $wbg_gap ) : '';

// Background image (serialization skipped in block.json so it lands on the media div, not the wrapper).
$wbg_background  = $attributes['style']['background'] ?? array();
$wbg_bg_image    = $wbg_background['backgroundImage'] ?? null;
$wbg_bg_url      = is_array( $wbg_bg_image ) ? ( $wbg_bg_image['url'] ?? '' ) : ( is_string( $wbg_bg_image ) ? $wbg_bg_image : '' );
$wbg_media_style = '';

if ( $wbg_bg_url ) {
	$wbg_declarations = array(
		'background-image'    => "url('" . esc_url_raw( $wbg_bg_url ) . "')",
		'background-size'     => $wbg_background['backgroundSize'] ?? 'cover',
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

// Wrapper attributes: top/bottom padding, background color and text color come from block supports.
$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => trim( 'wbg-content-overlay-2-col alignfull' . ( $wbg_is_content_left ? ' content--left' : '' ) ),
		'style' => safecss_filter_attr( $wbg_wrapper_css ),
	)
);
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <div class="wbg-content-overlay-2-col__media"
    <?php echo $wbg_media_style ? ' style="' . esc_attr( $wbg_media_style ) . '"' : ''; ?> aria-hidden="true"></div>

  <div class="wbg-content-overlay-2-col__wrapper">
    <div class="wbg-content-overlay-2-col__content">
      <?php if ( $wbg_has_subheading ) : ?>
      <h2 class="wbg-content-overlay-2-col__subheading fake--h6"><?php echo wp_kses_post( $wbg_subheading ); ?></h2>
      <?php if ( $wbg_has_heading ) : ?>
      <h3 class="wbg-content-overlay-2-col__heading h2--alt-small"><?php echo wp_kses_post( $wbg_heading ); ?></h3>
      <?php endif; ?>
      <?php elseif ( $wbg_has_heading ) : ?>
      <h2 class="wbg-content-overlay-2-col__heading h2--alt-small"><?php echo wp_kses_post( $wbg_heading ); ?></h2>
      <?php endif; ?>

      <?php if ( '' !== trim( $content ) ) : ?>
      <div class="wbg-content-overlay-2-col__body"
        <?php echo $wbg_gap_style ? ' style="' . esc_attr( $wbg_gap_style ) . '"' : ''; ?>>
        <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
      </div>
      <?php endif; ?>
    </div>
  </div>
</div>