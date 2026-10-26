<?php
/**
 * Layout - Grid - Static: front-end render.
 *
 * Padding, background color and background image are applied to the wrapper
 * by WordPress' native block supports via get_block_wrapper_attributes()
 * (background image is injected by the core background support filter).
 * Text color serialization is skipped on the wrapper (see block.json) and
 * applied to the optional heading here instead.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks markup (card blocks).
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$wbg_columns = isset( $attributes['columns'] ) ? (int) $attributes['columns'] : 3;
$wbg_columns = max( 2, min( 4, $wbg_columns ) );

$wbg_show_heading = ! empty( $attributes['showHeading'] );

// Heading: only bold, italic and line breaks are allowed through.
$wbg_heading = '';

if ( $wbg_show_heading && isset( $attributes['heading'] ) ) {
	$wbg_heading = wp_kses(
		(string) $attributes['heading'],
		array(
			'strong' => array(),
			'em'     => array(),
			'br'     => array(),
		)
	);
}

// Treat headings that are only tags, whitespace or &nbsp; as empty.
$wbg_heading_text = trim(
	str_replace( array( '&nbsp;', "\xC2\xA0" ), ' ', wp_strip_all_tags( $wbg_heading ) )
);
$wbg_has_heading  = $wbg_show_heading && '' !== $wbg_heading_text;
$wbg_has_cards    = '' !== trim( (string) $content );

// Nothing to show at all.
if ( ! $wbg_has_heading && ! $wbg_has_cards ) {
	return;
}

$wbg_heading_attributes = '';

if ( $wbg_has_heading ) {
	$wbg_heading_classes = array( 'wbg-layout-grid-static__heading', 'wp-block-heading' );
	$wbg_heading_style   = '';

	if ( ! empty( $attributes['headingAlign'] ) ) {
		$wbg_heading_classes[] = 'has-text-align-' . sanitize_html_class( $attributes['headingAlign'] );
	}

	$wbg_text_color   = ! empty( $attributes['textColor'] ) ? $attributes['textColor'] : '';
	$wbg_custom_color = ! empty( $attributes['style']['color']['text'] ) ? $attributes['style']['color']['text'] : '';

	if ( $wbg_text_color || $wbg_custom_color ) {
		$wbg_heading_classes[] = 'has-text-color';
	}

	if ( $wbg_text_color ) {
		$wbg_heading_classes[] = sprintf( 'has-%s-color', _wp_to_kebab_case( $wbg_text_color ) );
	} elseif ( $wbg_custom_color ) {
		$wbg_styles        = wp_style_engine_get_styles( array( 'color' => array( 'text' => $wbg_custom_color ) ) );
		$wbg_heading_style = ! empty( $wbg_styles['css'] ) ? $wbg_styles['css'] : '';
	}

	$wbg_heading_attributes = sprintf( ' class="%s"', esc_attr( implode( ' ', $wbg_heading_classes ) ) );

	if ( $wbg_heading_style ) {
		$wbg_heading_attributes .= sprintf( ' style="%s"', esc_attr( $wbg_heading_style ) );
	}
}

$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => sprintf(
			'wbg-layout-grid-static wbg-layout-grid-static--cols-%d',
			$wbg_columns
		),
	)
);
?>
<div
  <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped by get_block_wrapper_attributes(). ?>>
  <div class="wbg-layout-grid-static__wrapper">
    <?php if ( $wbg_has_heading ) : ?>
    <h1<?php echo $wbg_heading_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped above. ?>>
      <?php echo $wbg_heading; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Sanitized with wp_kses() above. ?>
      </h1>
      <?php endif; ?>

      <?php if ( $wbg_has_cards ) : ?>
      <div class="wbg-layout-grid-static__grid">
        <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Rendered inner blocks. ?>
      </div>
      <?php endif; ?>
  </div>
</div>