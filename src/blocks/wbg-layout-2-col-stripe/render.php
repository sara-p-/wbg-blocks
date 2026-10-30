<?php
/**
 * Layout - 2-Column - Stripe: front-end render.
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

if ( ! function_exists( 'wbg_layout_2_col_stripe_css_value' ) ) {
	/**
	 * Convert a block style value (e.g. "var:preset|spacing|40" or
	 * "var:preset|color|green") to a CSS value.
	 *
	 * @param mixed $value Raw style value. blockGap may be an array ( top/left ).
	 * @return string
	 */
	function wbg_layout_2_col_stripe_css_value( $value ) {
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

// Headings.
$wbg_subheading     = $attributes['subheading'] ?? '';
$wbg_heading        = $attributes['heading'] ?? '';
$wbg_has_subheading = '' !== trim( wp_strip_all_tags( $wbg_subheading ) );
$wbg_has_heading    = '' !== trim( wp_strip_all_tags( $wbg_heading ) );

// Block gap (applies to the inner blocks only).
$wbg_gap       = wbg_layout_2_col_stripe_css_value( $attributes['style']['spacing']['blockGap'] ?? null );
$wbg_gap_style = $wbg_gap ? safecss_filter_attr( '--wbg-block-gap:' . $wbg_gap ) : '';

// Background color (serialization skipped in block.json so it lands on the stripe, not the wrapper).
$wbg_bg_slug       = $attributes['backgroundColor'] ?? '';
$wbg_bg_custom     = wbg_layout_2_col_stripe_css_value( $attributes['style']['color']['background'] ?? null );
$wbg_stripe_class  = array( 'wbg-layout-2-col-stripe__stripe' );
$wbg_stripe_style  = '';

if ( $wbg_bg_slug ) {
	$wbg_stripe_class[] = 'has-background';
	$wbg_stripe_class[] = 'has-' . _wp_to_kebab_case( $wbg_bg_slug ) . '-background-color';
} elseif ( $wbg_bg_custom ) {
	$wbg_stripe_class[] = 'has-background';
	$wbg_stripe_style   = safecss_filter_attr( 'background-color:' . $wbg_bg_custom );
}

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

// Parent wrapper attributes (padding, text color, align handled by block supports).
$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => trim( 'wbg-layout-2-col-stripe alignfull' . ( $wbg_is_content_left ? ' content--left' : '' ) ),
	)
);
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <div class="wbg-layout-2-col-stripe__media"
    <?php echo $wbg_media_style ? ' style="' . esc_attr( $wbg_media_style ) . '"' : ''; ?> aria-hidden="true"></div>

  <div class="wbg-layout-2-col-stripe__wrapper">
    <div class="wbg-layout-2-col-stripe__content">
      <div class="<?php echo esc_attr( implode( ' ', $wbg_stripe_class ) ); ?>"
        <?php echo $wbg_stripe_style ? ' style="' . esc_attr( $wbg_stripe_style ) . '"' : ''; ?> aria-hidden="true">
      </div>

      <?php if ( $wbg_has_subheading ) : ?>
      <h2 class="wbg-layout-2-col-stripe__subheading fake--h6"><?php echo wp_kses_post( $wbg_subheading ); ?></h2>
      <?php if ( $wbg_has_heading ) : ?>
      <h3 class="wbg-layout-2-col-stripe__heading fake--h2"><?php echo wp_kses_post( $wbg_heading ); ?></h3>
      <?php endif; ?>
      <?php elseif ( $wbg_has_heading ) : ?>
      <h2 class="wbg-layout-2-col-stripe__heading"><?php echo wp_kses_post( $wbg_heading ); ?></h2>
      <?php endif; ?>

      <?php if ( '' !== trim( $content ) ) : ?>
      <div class="wbg-layout-2-col-stripe__body"
        <?php echo $wbg_gap_style ? ' style="' . esc_attr( $wbg_gap_style ) . '"' : ''; ?>>
        <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
      </div>
      <?php endif; ?>
    </div>
  </div>
</div>