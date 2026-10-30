<?php
/**
 * Layout - 2-Column: front-end render.
 *
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks markup (paragraph + buttons).
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'wbg_layout_2_col_css_value' ) ) {
	/**
	 * Convert a block style value (e.g. "var:preset|spacing|40") to a CSS value.
	 *
	 * @param mixed $value Raw style value. blockGap may be an array ( top/left ).
	 * @return string
	 */
	function wbg_layout_2_col_css_value( $value ) {
		if ( is_array( $value ) ) {
			$value = $value['top'] ?? '';
		}

		if ( ! is_string( $value ) || '' === $value ) {
			return '';
		}

		$prefix = 'var:preset|spacing|';

		if ( str_starts_with( $value, $prefix ) ) {
			return 'var(--wp--preset--spacing--' . sanitize_key( substr( $value, strlen( $prefix ) ) ) . ')';
		}

		return $value;
	}
}

// Content position.
$wbg_is_content_left = isset( $attributes['contentPosition'] ) && 'content-left' === $attributes['contentPosition'];

// Headings.
$wbg_subheading     = $attributes['subheading'] ?? '';
$wbg_heading        = $attributes['heading'] ?? '';
$wbg_has_subheading = '' !== trim( wp_strip_all_tags( $wbg_subheading ) );
$wbg_has_heading    = '' !== trim( wp_strip_all_tags( $wbg_heading ) );

// Block gap (applies to the inner blocks only).
$wbg_gap       = wbg_layout_2_col_css_value( $attributes['style']['spacing']['blockGap'] ?? null );
$wbg_gap_style = $wbg_gap ? safecss_filter_attr( '--wbg-block-gap:' . $wbg_gap ) : '';

// Background image (serialization skipped in block.json so it lands on the media block, not the wrapper).
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

// Parent wrapper attributes (padding, colors, align handled by block supports).
$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => trim( 'wbg-layout-2-col' . ( $wbg_is_content_left ? ' content--left' : '' ) ),
	)
);
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <div class="wbg-layout-2-col__media"
    <?php echo $wbg_media_style ? ' style="' . esc_attr( $wbg_media_style ) . '"' : ''; ?> aria-hidden="true"></div>

  <div class="wbg-layout-2-col__wrapper">
    <div class="wbg-layout-2-col__content">
      <?php if ( $wbg_has_subheading ) : ?>
      <h2 class="wbg-layout-2-col__subheading fake--h6"><?php echo wp_kses_post( $wbg_subheading ); ?></h2>
      <?php if ( $wbg_has_heading ) : ?>
      <h3 class="wbg-layout-2-col__heading fake--h2"><?php echo wp_kses_post( $wbg_heading ); ?></h3>
      <?php endif; ?>
      <?php elseif ( $wbg_has_heading ) : ?>
      <h2 class="wbg-layout-2-col__heading"><?php echo wp_kses_post( $wbg_heading ); ?></h2>
      <?php endif; ?>

      <?php if ( '' !== trim( $content ) ) : ?>
      <div class="wbg-layout-2-col__body"
        <?php echo $wbg_gap_style ? ' style="' . esc_attr( $wbg_gap_style ) . '"' : ''; ?>>
        <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
      </div>
      <?php endif; ?>
    </div>
  </div>
</div>