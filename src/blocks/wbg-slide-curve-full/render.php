<?php
/**
 * Slide - Curve - Full: front-end render.
 *
 * Heading levels change with the fields that are
 * filled in, so the page outline stays in order:
 *
 * - Subheading:    subheading h2.fake--h6, heading h3.h2--alt-small, meta h4.fake--p
 * - No subheading: heading h2.h2--alt-small, meta h3.fake--p
 *
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks markup
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

/*
 * Helpers.
 * ------------------------------------------------------------------------ */

$wbg_get = static function ( $key ) use ( $attributes ) {
	return isset( $attributes[ $key ] ) && is_string( $attributes[ $key ] ) ? $attributes[ $key ] : '';
};

// True when a RichText value has visible text (ignores tags and &nbsp;).
$wbg_has_text = static function ( $value ) {
	return '' !== trim( str_replace( '&nbsp;', ' ', wp_strip_all_tags( (string) $value ) ) );
};

/*
 * Attributes.
 * ------------------------------------------------------------------------ */

$wbg_date         = $wbg_get( 'date' );
$wbg_time         = $wbg_get( 'time' );
$wbg_price        = $wbg_get( 'price' );
$wbg_member_price = $wbg_get( 'memberPrice' );
$wbg_subheading   = $wbg_get( 'subheading' );
$wbg_heading      = $wbg_get( 'heading' );

$wbg_has_subheading = $wbg_has_text( $wbg_subheading );
$wbg_is_right       = 'content-right' === $wbg_get( 'contentPosition' );

/*
 * Heading levels (front end only; the editor uses fixed tags).
 * ------------------------------------------------------------------------ */


if ( $wbg_has_subheading ) {
	$wbg_subheading_tag = 'h2';
	$wbg_heading_tag    = 'h3';
	$wbg_meta_tag       = 'h4';
} else {
	$wbg_subheading_tag = 'h2'; // Not output: subheading is empty.
	$wbg_heading_tag    = 'h2';
	$wbg_meta_tag       = 'h3';
}

/*
 * Meta lines: "date | time" and "$price Non-Members | $memberPrice Members".
 * ------------------------------------------------------------------------ */

$wbg_sep = ' <span class="wbg-slide-curve-full__sep" aria-hidden="true">|</span> ';

$wbg_line_datetime = array();
if ( $wbg_has_text( $wbg_date ) ) {
	$wbg_line_datetime[] = '<span class="wbg-slide-curve-full__date">' . wp_kses_post( $wbg_date ) . '</span>';
}
if ( $wbg_has_text( $wbg_time ) ) {
	$wbg_line_datetime[] = '<span class="wbg-slide-curve-full__time">' . wp_kses_post( $wbg_time ) . '</span>';
}

$wbg_line_pricing = array();
if ( $wbg_has_text( $wbg_price ) ) {
	$wbg_line_pricing[] = sprintf(
		'<span class="wbg-slide-curve-full__price">%1$s <span class="wbg-slide-curve-full__price-label">%2$s</span></span>',
		wp_kses_post( $wbg_price ),
		esc_html__( 'Non-Members', 'wbg-blocks' )
	);
}
if ( $wbg_has_text( $wbg_member_price ) ) {
	$wbg_line_pricing[] = sprintf(
		'<span class="wbg-slide-curve-full__member-price">%1$s <span class="wbg-slide-curve-full__price-label">%2$s</span></span>',
		wp_kses_post( $wbg_member_price ),
		esc_html__( 'Members', 'wbg-blocks' )
	);
}

$wbg_meta_lines = array_filter(
	array(
		implode( $wbg_sep, $wbg_line_datetime ),
		implode( $wbg_sep, $wbg_line_pricing ),
	)
);

/*
 * Block supports we apply ourselves (serialization is skipped in block.json).
 * ------------------------------------------------------------------------ */

// Background image -> the __image div, not the block wrapper.
// Size/position/repeat fall back to the defaults in style.scss.
$wbg_background = isset( $attributes['style']['background'] ) && is_array( $attributes['style']['background'] )
	? $attributes['style']['background']
	: array();

$wbg_image_css = '';
if ( ! empty( $wbg_background['backgroundImage'] ) ) {
	$wbg_image_styles = wp_style_engine_get_styles( array( 'background' => $wbg_background ) );
	$wbg_image_css    = isset( $wbg_image_styles['css'] ) ? $wbg_image_styles['css'] : '';
}

// Block spacing -> the __inner div only.
$wbg_gap = isset( $attributes['style']['spacing']['blockGap'] ) ? $attributes['style']['spacing']['blockGap'] : '';
if ( is_array( $wbg_gap ) ) {
	$wbg_gap = isset( $wbg_gap['top'] ) ? $wbg_gap['top'] : '';
}
$wbg_gap = is_string( $wbg_gap ) ? trim( $wbg_gap ) : '';

if ( 0 === strpos( $wbg_gap, 'var:preset|spacing|' ) ) {
	// Preset, e.g. "var:preset|spacing|40" -> var(--wp--preset--spacing--40).
	$wbg_gap_slug = preg_replace( '/[^a-z0-9\-]/i', '', substr( $wbg_gap, strlen( 'var:preset|spacing|' ) ) );
	$wbg_gap      = '' !== $wbg_gap_slug ? 'var(--wp--preset--spacing--' . $wbg_gap_slug . ')' : '';
} elseif ( preg_match( '%[\\\(&=}]|/\*%', $wbg_gap ) ) {
	// Custom value: same safety check core uses for gap values.
	$wbg_gap = '';
}

$wbg_inner_style = '' !== $wbg_gap ? '--wbg-scf-block-gap:' . $wbg_gap . ';' : '';

/*
 * Output.
 * ------------------------------------------------------------------------ */

$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => implode(
			' ',
			array_filter(
				array(
					'wbg-slide-curve-full',
					$wbg_is_right ? 'content--right' : '',
				)
			)
		),
	)
);
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <div class="wbg-slide-curve-full__row">
    <div class="wbg-slide-curve-full__col wbg-slide-curve-full__col--content">
      <div class="wbg-slide-curve-full__content">
        <?php if ( $wbg_meta_lines ) : ?>
        <div class="wbg-slide-curve-full__meta">
          <?php foreach ( $wbg_meta_lines as $wbg_line ) : ?>
          <<?php echo esc_html( $wbg_meta_tag ); ?> class="wbg-slide-curve-full__meta-line fake--p">
            <?php echo $wbg_line; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped above. ?>
          </<?php echo esc_html( $wbg_meta_tag ); ?>>
          <?php endforeach; ?>
        </div>
        <?php endif; ?>

        <?php if ( $wbg_has_subheading ) : ?>
        <<?php echo esc_html( $wbg_subheading_tag ); ?> class="wbg-slide-curve-full__subheading fake--h6">
          <?php echo wp_kses_post( $wbg_subheading ); ?></<?php echo esc_html( $wbg_subheading_tag ); ?>>
        <?php endif; ?>

        <?php if ( $wbg_has_text( $wbg_heading ) ) : ?>
        <<?php echo esc_html( $wbg_heading_tag ); ?> class="wbg-slide-curve-full__heading h2--alt-small">
          <?php echo wp_kses_post( $wbg_heading ); ?></<?php echo esc_html( $wbg_heading_tag ); ?>>
        <?php endif; ?>
        <div class="wbg-slide-curve-full__inner"
          <?php echo '' !== $wbg_inner_style ? ' style="' . esc_attr( $wbg_inner_style ) . '"' : ''; ?>>
          <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Inner blocks markup. ?>
        </div>
      </div>
    </div>

    <div class="wbg-slide-curve-full__col wbg-slide-curve-full__col--spacer fake-image-container"></div>

    <?php if ( '' !== $wbg_image_css ) : ?>
    <div class="wbg-slide-curve-full__image-container">
      <div class="wbg-slide-curve-full__image" style="<?php echo esc_attr( $wbg_image_css ); ?>"></div>
    </div>
    <?php endif; ?>
  </div>
</div>