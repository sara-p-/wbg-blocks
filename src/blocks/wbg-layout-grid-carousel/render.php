<?php
/**
 * Layout - Grid - Carousel: front-end render.
 *
 * Padding, background color and background image are applied to the wrapper
 * by WordPress' native block supports via get_block_wrapper_attributes()
 * (background image is injected by the core background support filter).
 * Text color serialization is skipped on the wrapper (see block.json) and
 * applied to the heading, text and carousel dots here instead.
 *
 * Header (only when showHeader is on): an H1 heading and a paragraph of
 * text, laid out as one column (heading above text) or two (heading left,
 * text right), depending on the headingType attribute. Empty fields are left
 * out, and the row is left out when both are empty.
 *
 * Footer (only when showFooter is on): a short centred paragraph and a
 * centred button beneath the grid. The button only renders when it has both
 * text and a link.
 *
 * On tablet and mobile the grid becomes a manual carousel (see view.js). The
 * arrows and dots are rendered hidden; view.js reveals them only when there
 * are more cards than fit in view.
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

$wbg_show_header = ! empty( $attributes['showHeader'] );
$wbg_show_footer = ! empty( $attributes['showFooter'] );

$wbg_heading_type = isset( $attributes['headingType'] ) && '2-col' === $attributes['headingType'] ? '2-col' : '1-col';

/**
 * Plain-text version of a rich text value, with tags, whitespace and
 * &nbsp; removed, so fields that only hold markup count as empty.
 *
 * @param string $html Rich text value.
 * @return string Plain text.
 */
$wbg_plain_text = static function ( $html ) {
	return trim(
		str_replace( array( '&nbsp;', "\xC2\xA0" ), ' ', wp_strip_all_tags( (string) $html ) )
	);
};

// Heading: only bold, italic and line breaks are allowed through.
$wbg_heading = wp_kses(
	isset( $attributes['heading'] ) ? (string) $attributes['heading'] : '',
	array(
		'strong' => array(),
		'em'     => array(),
		'br'     => array(),
	)
);

// Text: the usual post formatting (bold, italic, links…) is allowed through.
$wbg_text = wp_kses_post( isset( $attributes['text'] ) ? (string) $attributes['text'] : '' );

// Footer text: same formatting as the text above the grid.
$wbg_footer_text = wp_kses_post( isset( $attributes['footerText'] ) ? (string) $attributes['footerText'] : '' );

// Button: bold and italic only.
$wbg_button_text = wp_kses(
	isset( $attributes['buttonText'] ) ? (string) $attributes['buttonText'] : '',
	array(
		'strong' => array(),
		'em'     => array(),
	)
);
$wbg_button_url  = isset( $attributes['buttonUrl'] ) ? (string) $attributes['buttonUrl'] : '';

$wbg_heading_text = $wbg_plain_text( $wbg_heading );
$wbg_has_heading  = $wbg_show_header && '' !== $wbg_heading_text;
$wbg_has_text     = $wbg_show_header && '' !== $wbg_plain_text( $wbg_text );
$wbg_has_row      = $wbg_has_heading || $wbg_has_text;
$wbg_has_cards    = '' !== trim( (string) $content );

$wbg_has_footer_text = $wbg_show_footer && '' !== $wbg_plain_text( $wbg_footer_text );
$wbg_has_button      = $wbg_show_footer && '' !== $wbg_plain_text( $wbg_button_text ) && '' !== trim( $wbg_button_url );
$wbg_has_footer      = $wbg_has_footer_text || $wbg_has_button;

// Nothing to show at all.
if ( ! $wbg_has_row && ! $wbg_has_cards && ! $wbg_has_footer ) {
	return;
}

// Text color: shared by the heading, the text and the carousel dots.
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
 * Build a class + optional style attribute string.
 *
 * @param array  $classes Class names.
 * @param string $style   Inline CSS.
 * @return string Escaped attribute string with a leading space.
 */
$wbg_build_attributes = static function ( array $classes, $style ) {
	$output = sprintf( ' class="%s"', esc_attr( implode( ' ', array_filter( $classes ) ) ) );

	if ( $style ) {
		$output .= sprintf( ' style="%s"', esc_attr( $style ) );
	}

	return $output;
};

$wbg_heading_classes = array( 'wbg-layout-grid-carousel__heading', 'wp-block-heading' );

if ( ! empty( $attributes['headingAlign'] ) ) {
	$wbg_heading_classes[] = 'has-text-align-' . sanitize_html_class( $attributes['headingAlign'] );
}

$wbg_heading_attributes = $wbg_build_attributes(
	array_merge( $wbg_heading_classes, $wbg_color_classes ),
	$wbg_color_style
);

$wbg_text_classes = array( 'wbg-layout-grid-carousel__text' );

if ( ! empty( $attributes['textAlign'] ) ) {
	$wbg_text_classes[] = 'has-text-align-' . sanitize_html_class( $attributes['textAlign'] );
}

$wbg_text_attributes = $wbg_build_attributes(
	array_merge( $wbg_text_classes, $wbg_color_classes ),
	$wbg_color_style
);

$wbg_footer_text_attributes = $wbg_build_attributes(
	array_merge( array( 'wbg-layout-grid-carousel__footer-text' ), $wbg_color_classes ),
	$wbg_color_style
);

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

$wbg_heading_html = $wbg_has_heading
	? sprintf( '<h1%s>%s</h1>', $wbg_heading_attributes, $wbg_heading )
	: '';

$wbg_text_html = $wbg_has_text
	? sprintf( '<p%s>%s</p>', $wbg_text_attributes, $wbg_text )
	: '';

$wbg_controls_attributes = $wbg_build_attributes(
	array_merge( array( 'wbg-layout-grid-carousel__controls' ), $wbg_color_classes ),
	$wbg_color_style
);

// Arrows use fixed colors (light-green circle, green chevron) like the
// Slider block, so they don't take the text color classes.
$wbg_arrow_attributes = array(
	'prev' => $wbg_build_attributes(
		array( 'wbg-layout-grid-carousel__arrow', 'wbg-layout-grid-carousel__arrow--prev' ),
		''
	),
	'next' => $wbg_build_attributes(
		array( 'wbg-layout-grid-carousel__arrow', 'wbg-layout-grid-carousel__arrow--next' ),
		''
	),
);

$wbg_track_id = wp_unique_id( 'wbg-grid-carousel-' );

// Translated strings for view.js.
$wbg_config = array(
	'i18n' => array(
		'carousel' => $wbg_has_heading ? $wbg_heading_text : __( 'Cards', 'wbg-blocks' ),
		/* translators: 1: slide number, 2: total number of slides. */
		'slide'    => __( '%1$d of %2$d', 'wbg-blocks' ),
		/* translators: %d: slide number. */
		'goTo'     => __( 'Go to slide %d', 'wbg-blocks' ),
	),
);

// Wrapper classes.
$wbg_classes = array(
	'wbg-layout-grid-carousel',
	'alignfull',
	sprintf( 'wbg-layout-grid-carousel--cols-%d', $wbg_columns ),
);

if ( 'wide' === ( $attributes['contentWidth'] ?? 'normal' ) ) {
	$wbg_classes[] = 'is-width--wide';
}

// Default background image.
//
// The background image in block.json is part of the `style` attribute's
// default. Core's background support (wp_render_background_support) only
// reads the attributes saved in the post, not defaults, so it never outputs
// that default image. When the block has no saved `style` at all (the
// editor hasn't changed padding, background, etc.), output the default
// background here. Once anything in `style` is changed, the whole object,
// including the background or its removal, is saved and core handles it.
$wbg_extra_styles = '';
$wbg_saved_attrs  = $block->parsed_block['attrs'] ?? array();

if ( ! isset( $wbg_saved_attrs['style'] ) && ! empty( $attributes['style']['background']['backgroundImage']['url'] ) ) {
	$wbg_background = $attributes['style']['background'];

	// Relative upload paths (e.g. /wp-content/uploads/...) resolve against the site URL.
	if ( 0 === strpos( $wbg_background['backgroundImage']['url'], '/' ) && 0 !== strpos( $wbg_background['backgroundImage']['url'], '//' ) ) {
		$wbg_background['backgroundImage']['url'] = home_url( $wbg_background['backgroundImage']['url'] );
	}

	$wbg_background_styles = wp_style_engine_get_styles( array( 'background' => $wbg_background ) );
	$wbg_extra_styles      = ! empty( $wbg_background_styles['css'] ) ? $wbg_background_styles['css'] : '';
}

$wbg_wrapper_args = array(
	'class'             => implode( ' ', $wbg_classes ),
	'data-wbg-carousel' => wp_json_encode( $wbg_config ),
);

if ( $wbg_extra_styles ) {
	$wbg_wrapper_args['style'] = $wbg_extra_styles;
}

$wbg_wrapper_attributes = get_block_wrapper_attributes( $wbg_wrapper_args );
?>
<div
  <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped by get_block_wrapper_attributes(). ?>>
  <div class="wbg-layout-grid-carousel__wrapper">
    <?php if ( $wbg_has_row ) : ?>
    <div
      class="wbg-layout-grid-carousel__row wbg-layout-grid-carousel__row--<?php echo esc_attr( $wbg_heading_type ); ?>">
      <?php if ( '2-col' === $wbg_heading_type ) : ?>
      <div class="wbg-layout-grid-carousel__col">
        <?php echo $wbg_heading_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Sanitized and escaped above. ?>
      </div>
      <div class="wbg-layout-grid-carousel__col">
        <?php echo $wbg_text_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Sanitized and escaped above. ?>
      </div>
      <?php else : ?>
      <div class="wbg-layout-grid-carousel__col">
        <?php echo $wbg_heading_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Sanitized and escaped above. ?>
        <?php echo $wbg_text_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Sanitized and escaped above. ?>
      </div>
      <?php endif; ?>
    </div>
    <?php endif; ?>

    <?php if ( $wbg_has_cards ) : ?>
    <div class="wbg-layout-grid-carousel__stage">
      <div class="wbg-layout-grid-carousel__grid" id="<?php echo esc_attr( $wbg_track_id ); ?>">
        <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Rendered inner blocks. ?>
      </div>

      <button type="button"
        <?php echo $wbg_arrow_attributes['prev']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped above. ?>
        aria-controls="<?php echo esc_attr( $wbg_track_id ); ?>"
        aria-label="<?php esc_attr_e( 'Previous slide', 'wbg-blocks' ); ?>" hidden>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>

      <button type="button"
        <?php echo $wbg_arrow_attributes['next']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped above. ?>
        aria-controls="<?php echo esc_attr( $wbg_track_id ); ?>"
        aria-label="<?php esc_attr_e( 'Next slide', 'wbg-blocks' ); ?>" hidden>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <div<?php echo $wbg_controls_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped above. ?>
      hidden>
      <div class="wbg-layout-grid-carousel__dots"></div>
  </div>
  <?php endif; ?>

  <?php if ( $wbg_has_footer ) : ?>
  <div class="wbg-layout-grid-carousel__footer">
    <?php if ( $wbg_has_footer_text ) : ?>
    <p<?php echo $wbg_footer_text_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped above. ?>>
      <?php echo $wbg_footer_text; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Sanitized with wp_kses_post() above. ?>
      </p>
      <?php endif; ?>

      <?php if ( $wbg_has_button ) : ?>
      <div class="wp-block-button wbg-layout-grid-carousel__button">
        <a class="wp-block-button__link wp-element-button"
          <?php echo $wbg_button_link_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped above. ?>><?php echo $wbg_button_text; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Sanitized with wp_kses() above. ?></a>
      </div>
      <?php endif; ?>
  </div>
  <?php endif; ?>
</div>
</div>