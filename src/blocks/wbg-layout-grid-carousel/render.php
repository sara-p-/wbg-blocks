<?php
/**
 * Layout - Grid - Carousel: front-end render.
 *
 * Padding, background color and background image are applied to the wrapper
 * by WordPress' native block supports via get_block_wrapper_attributes()
 * (background image is injected by the core background support filter).
 * Text color serialization is skipped on the wrapper (see block.json) and
 * applied to the optional heading and the carousel controls here instead.
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

// Text color: shared by the heading and the carousel controls.
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

$wbg_heading_attributes = '';

if ( $wbg_has_heading ) {
	$wbg_heading_classes = array( 'wbg-layout-grid-carousel__heading', 'wp-block-heading' );

	if ( ! empty( $attributes['headingAlign'] ) ) {
		$wbg_heading_classes[] = 'has-text-align-' . sanitize_html_class( $attributes['headingAlign'] );
	}

	$wbg_heading_attributes = $wbg_build_attributes(
		array_merge( $wbg_heading_classes, $wbg_color_classes ),
		$wbg_color_style
	);
}

$wbg_controls_attributes = $wbg_build_attributes(
	array_merge( array( 'wbg-layout-grid-carousel__controls' ), $wbg_color_classes ),
	$wbg_color_style
);

$wbg_arrow_attributes = array(
	'prev' => $wbg_build_attributes(
		array_merge(
			array( 'wbg-layout-grid-carousel__arrow', 'wbg-layout-grid-carousel__arrow--prev' ),
			$wbg_color_classes
		),
		$wbg_color_style
	),
	'next' => $wbg_build_attributes(
		array_merge(
			array( 'wbg-layout-grid-carousel__arrow', 'wbg-layout-grid-carousel__arrow--next' ),
			$wbg_color_classes
		),
		$wbg_color_style
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

$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class'             => sprintf(
			'wbg-layout-grid-carousel wbg-layout-grid-carousel--cols-%d',
			$wbg_columns
		),
		'data-wbg-carousel' => wp_json_encode( $wbg_config ),
	)
);
?>
<div
  <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped by get_block_wrapper_attributes(). ?>>
  <div class="wbg-layout-grid-carousel__wrapper">
    <?php if ( $wbg_has_heading ) : ?>
    <h1<?php echo $wbg_heading_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped above. ?>>
      <?php echo $wbg_heading; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Sanitized with wp_kses() above. ?>
      </h1>
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
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button type="button"
          <?php echo $wbg_arrow_attributes['next']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped above. ?>
          aria-controls="<?php echo esc_attr( $wbg_track_id ); ?>"
          aria-label="<?php esc_attr_e( 'Next slide', 'wbg-blocks' ); ?>" hidden>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div<?php echo $wbg_controls_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped above. ?>
        hidden>
        <div class="wbg-layout-grid-carousel__dots"></div>
  </div>
  <?php endif; ?>
</div>
</div>