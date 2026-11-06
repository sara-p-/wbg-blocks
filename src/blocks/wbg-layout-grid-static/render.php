<?php
/**
 * Layout - Grid - Static: front-end render.
 *
 * Above the grid, a heading row holds the H1 heading and a paragraph of text,
 * laid out in one column (heading above text) or two (heading left, text
 * right), depending on the headingType attribute.
 *
 * Beneath the grid, an optional footer holds a short centred paragraph and
 * an optional centred button. The button only renders when it has both
 * text and a link.
 *
 * Padding, background color and background image are applied to the wrapper
 * by WordPress' native block supports via get_block_wrapper_attributes()
 * (background image is injected by the core background support filter).
 * Text color serialization is skipped on the wrapper (see block.json) and
 * applied to the heading and text here instead.
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

$wbg_heading_type = $attributes['headingType'] ?? '1-col';
$wbg_heading_type = in_array( $wbg_heading_type, array( '1-col', '2-col' ), true ) ? $wbg_heading_type : '1-col';

/**
 * Returns true when a rich text value has visible text (not just tags,
 * whitespace or &nbsp;).
 */
$wbg_has_text = static function ( $value ) {
	return '' !== trim(
		str_replace( array( '&nbsp;', "\xC2\xA0" ), ' ', wp_strip_all_tags( (string) $value ) )
	);
};

// Heading: only bold, italic and line breaks are allowed through.
$wbg_heading = wp_kses(
	(string) ( $attributes['heading'] ?? '' ),
	array(
		'strong' => array(),
		'em'     => array(),
		'br'     => array(),
	)
);

// Text: the paragraph's default formats (bold, italic, links, etc.).
$wbg_text = wp_kses_post( (string) ( $attributes['text'] ?? '' ) );

// Footer text: same formatting as the text above the grid.
$wbg_footer_text = wp_kses_post( (string) ( $attributes['footerText'] ?? '' ) );

// Button: bold and italic only.
$wbg_button_text = wp_kses(
	(string) ( $attributes['buttonText'] ?? '' ),
	array(
		'strong' => array(),
		'em'     => array(),
	)
);
$wbg_button_url  = trim( (string) ( $attributes['buttonUrl'] ?? '' ) );

$wbg_has_heading     = $wbg_has_text( $wbg_heading );
$wbg_has_body        = $wbg_has_text( $wbg_text );
$wbg_has_cards       = '' !== trim( (string) $content );
$wbg_has_footer_text = $wbg_has_text( $wbg_footer_text );
$wbg_has_button      = $wbg_has_text( $wbg_button_text ) && '' !== $wbg_button_url;
$wbg_has_footer      = $wbg_has_footer_text || $wbg_has_button;

// Nothing to show at all.
if ( ! $wbg_has_heading && ! $wbg_has_body && ! $wbg_has_cards && ! $wbg_has_footer ) {
	return;
}

// Text color classes and style, shared by the heading and the text.
$wbg_color_classes = array();
$wbg_color_style   = '';
$wbg_text_color    = ! empty( $attributes['textColor'] ) ? $attributes['textColor'] : '';
$wbg_custom_color  = ! empty( $attributes['style']['color']['text'] ) ? $attributes['style']['color']['text'] : '';

if ( $wbg_text_color || $wbg_custom_color ) {
	$wbg_color_classes[] = 'has-text-color';
}

if ( $wbg_text_color ) {
	$wbg_color_classes[] = sprintf( 'has-%s-color', _wp_to_kebab_case( $wbg_text_color ) );
} elseif ( $wbg_custom_color ) {
	$wbg_styles      = wp_style_engine_get_styles( array( 'color' => array( 'text' => $wbg_custom_color ) ) );
	$wbg_color_style = ! empty( $wbg_styles['css'] ) ? $wbg_styles['css'] : '';
}

/**
 * Builds a class (and optional style) attribute string.
 *
 * @param array  $classes Class names.
 * @param string $style   Inline CSS.
 * @return string Escaped attribute string with a leading space.
 */
$wbg_attrs = static function ( array $classes, $style ) {
	$out = sprintf( ' class="%s"', esc_attr( implode( ' ', $classes ) ) );

	if ( $style ) {
		$out .= sprintf( ' style="%s"', esc_attr( $style ) );
	}

	return $out;
};

$wbg_heading_classes = array( 'wbg-layout-grid-static__heading', 'wp-block-heading' );

if ( ! empty( $attributes['headingAlign'] ) ) {
	$wbg_heading_classes[] = 'has-text-align-' . sanitize_html_class( $attributes['headingAlign'] );
}

$wbg_text_classes = array( 'wbg-layout-grid-static__text' );

if ( ! empty( $attributes['textAlign'] ) ) {
	$wbg_text_classes[] = 'has-text-align-' . sanitize_html_class( $attributes['textAlign'] );
}

$wbg_heading_attributes = $wbg_attrs( array_merge( $wbg_heading_classes, $wbg_color_classes ), $wbg_color_style );
$wbg_text_attributes    = $wbg_attrs( array_merge( $wbg_text_classes, $wbg_color_classes ), $wbg_color_style );

$wbg_footer_text_attributes = $wbg_attrs( array_merge( array( 'wbg-layout-grid-static__footer-text' ), $wbg_color_classes ), $wbg_color_style );

// Button link attributes, mirroring the native link control options.
$wbg_button_link_attributes = '';

if ( $wbg_has_button ) {
	$wbg_button_link_attributes = sprintf( ' href="%s"', esc_url( $wbg_button_url ) );
	$wbg_rel                    = array();

	if ( ! empty( $attributes['buttonOpensInNewTab'] ) ) {
		$wbg_button_link_attributes .= ' target="_blank"';
		$wbg_rel[]                   = 'noreferrer';
		$wbg_rel[]                   = 'noopener';
	}

	if ( ! empty( $attributes['buttonNofollow'] ) ) {
		$wbg_rel[] = 'nofollow';
	}

	if ( $wbg_rel ) {
		$wbg_button_link_attributes .= sprintf( ' rel="%s"', esc_attr( implode( ' ', $wbg_rel ) ) );
	}
}

// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- Attributes escaped in $wbg_attrs(); content sanitized with wp_kses() / wp_kses_post() above.
$wbg_heading_html = $wbg_has_heading ? '<h1' . $wbg_heading_attributes . '>' . $wbg_heading . '</h1>' : '';
$wbg_text_html    = $wbg_has_body ? '<p' . $wbg_text_attributes . '>' . $wbg_text . '</p>' : '';
// phpcs:enable

// Wrapper classes.
$wbg_classes = array(
	'wbg-layout-grid-static',
	sprintf( 'wbg-layout-grid-static--cols-%d', $wbg_columns ),
);

if ( 'wide' === ( $attributes['contentWidth'] ?? 'normal' ) ) {
	$wbg_classes[] = 'is-width--wide';
}

$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => implode( ' ', $wbg_classes ),
	)
);

// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- Wrapper escaped by get_block_wrapper_attributes(); heading/text built above; $content is rendered inner blocks.
?>
<div <?php echo $wbg_wrapper_attributes; ?>>
  <div class="wbg-layout-grid-static__wrapper">
    <?php if ( $wbg_has_heading || $wbg_has_body ) : ?>
    <div class="wbg-layout-grid-static__row wbg-layout-grid-static__row--<?php echo esc_attr( $wbg_heading_type ); ?>">
      <?php if ( '2-col' === $wbg_heading_type ) : ?>
      <div class="wbg-layout-grid-static__col">
        <?php echo $wbg_heading_html; ?>
      </div>
      <div class="wbg-layout-grid-static__col">
        <?php echo $wbg_text_html; ?>
      </div>
      <?php else : ?>
      <div class="wbg-layout-grid-static__col">
        <?php echo $wbg_heading_html; ?>
        <?php echo $wbg_text_html; ?>
      </div>
      <?php endif; ?>
    </div>
    <?php endif; ?>

    <?php if ( $wbg_has_cards ) : ?>
    <div class="wbg-layout-grid-static__grid">
      <?php echo $content; ?>
    </div>
    <?php endif; ?>

    <?php if ( $wbg_has_footer ) : ?>
    <div class="wbg-layout-grid-static__footer">
      <?php if ( $wbg_has_footer_text ) : ?>
      <p<?php echo $wbg_footer_text_attributes; ?>><?php echo $wbg_footer_text; ?></p>
        <?php endif; ?>

        <?php if ( $wbg_has_button ) : ?>
        <div class="wp-block-button wbg-layout-grid-static__button">
          <a class="wp-block-button__link wp-element-button"
            <?php echo $wbg_button_link_attributes; ?>><?php echo $wbg_button_text; ?></a>
        </div>
        <?php endif; ?>
    </div>
    <?php endif; ?>
  </div>
</div>
<?php
// phpcs:enable