<?php
/**
 * Content - Curve - Images: front-end render.
 *
 * Markup mirrors edit.js. The title circle sits in its own row above the
 * two-column flex row. Heading levels change with the fields that are
 * filled in, so the page outline stays in order:
 *
 * - Title (with or without subheading): title h2.h2--alt-small,
 *   subheading p.fake--h6, heading h3.h2--alt-small, meta h4.fake--p
 * - No title, subheading:  subheading h2.fake--h6, heading h3.h2--alt-small, meta h4.fake--p
 * - No title, no subheading: heading h2.h2--alt-small, meta h3.fake--p
 *
 * The slider is decorative, so it is hidden from screen readers and its
 * controls are taken out of the tab order.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks markup (the Slider - Curve block).
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

$wbg_title        = $wbg_get( 'title' );
$wbg_date         = $wbg_get( 'date' );
$wbg_time         = $wbg_get( 'time' );
$wbg_price        = $wbg_get( 'price' );
$wbg_member_price = $wbg_get( 'memberPrice' );
$wbg_subheading   = $wbg_get( 'subheading' );
$wbg_heading      = $wbg_get( 'heading' );
$wbg_text         = $wbg_get( 'text' );

$wbg_has_title      = $wbg_has_text( $wbg_title );
$wbg_has_subheading = $wbg_has_text( $wbg_subheading );
$wbg_is_right       = 'content-right' === $wbg_get( 'contentPosition' );

/*
 * Heading levels (front end only; the editor uses fixed tags).
 * ------------------------------------------------------------------------ */

if ( $wbg_has_title ) {
	$wbg_subheading_tag = 'p';
	$wbg_heading_tag    = 'h3';
	$wbg_meta_tag       = 'h4';
} elseif ( $wbg_has_subheading ) {
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

$wbg_sep = ' <span class="wbg-slider-curve-images-parent__sep" aria-hidden="true">|</span> ';

$wbg_line_datetime = array();
if ( $wbg_has_text( $wbg_date ) ) {
	$wbg_line_datetime[] = '<span class="wbg-slider-curve-images-parent__date">' . wp_kses_post( $wbg_date ) . '</span>';
}
if ( $wbg_has_text( $wbg_time ) ) {
	$wbg_line_datetime[] = '<span class="wbg-slider-curve-images-parent__time">' . wp_kses_post( $wbg_time ) . '</span>';
}

$wbg_line_pricing = array();
if ( $wbg_has_text( $wbg_price ) ) {
	$wbg_line_pricing[] = sprintf(
		'<span class="wbg-slider-curve-images-parent__price">%1$s <span class="wbg-slider-curve-images-parent__price-label">%2$s</span></span>',
		wp_kses_post( $wbg_price ),
		esc_html__( 'Non-Members', 'wbg-blocks' )
	);
}
if ( $wbg_has_text( $wbg_member_price ) ) {
	$wbg_line_pricing[] = sprintf(
		'<span class="wbg-slider-curve-images-parent__member-price">%1$s <span class="wbg-slider-curve-images-parent__price-label">%2$s</span></span>',
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
 * Buttons. Each one needs both text and a link to be output.
 * ------------------------------------------------------------------------ */

$wbg_buttons = array();

foreach (
	array(
		'button1' => '',
		'button2' => 'wbg-slider-curve-images-parent__button--outline',
	) as $wbg_prefix => $wbg_modifier
) {
	$wbg_button_text = $wbg_get( $wbg_prefix . 'Text' );
	$wbg_button_url  = $wbg_get( $wbg_prefix . 'Url' );

	if ( ! $wbg_has_text( $wbg_button_text ) || '' === trim( $wbg_button_url ) ) {
		continue;
	}

	$wbg_new_tab = ! empty( $attributes[ $wbg_prefix . 'OpensInNewTab' ] );
	$wbg_rel     = array();

	if ( $wbg_new_tab ) {
		$wbg_rel[] = 'noopener';
	}
	if ( ! empty( $attributes[ $wbg_prefix . 'Nofollow' ] ) ) {
		$wbg_rel[] = 'nofollow';
	}

	$wbg_buttons[] = sprintf(
		'<a class="%1$s" href="%2$s"%3$s%4$s>%5$s%6$s</a>',
		esc_attr( trim( 'wp-element-button wbg-slider-curve-images-parent__button ' . $wbg_modifier ) ),
		esc_url( $wbg_button_url ),
		$wbg_new_tab ? ' target="_blank"' : '',
		$wbg_rel ? ' rel="' . esc_attr( implode( ' ', $wbg_rel ) ) . '"' : '',
		wp_kses_post( $wbg_button_text ),
		$wbg_new_tab
			? '<span class="screen-reader-text"> ' . esc_html__( '(opens in a new tab)', 'wbg-blocks' ) . '</span>'
			: ''
	);
}

/*
 * Slider (decorative). Hidden from screen readers with aria-hidden on its
 * container, so nothing inside it may be focusable either.
 * ------------------------------------------------------------------------ */

$wbg_slider = '';

if ( '' !== trim( (string) $content ) ) {
	$wbg_processor = new WP_HTML_Tag_Processor( $content );

	while ( $wbg_processor->next_tag() ) {
		if (
			in_array( $wbg_processor->get_tag(), array( 'A', 'BUTTON' ), true ) ||
			null !== $wbg_processor->get_attribute( 'tabindex' )
		) {
			$wbg_processor->set_attribute( 'tabindex', '-1' );
		}
	}

	$wbg_slider = $wbg_processor->get_updated_html();
}

/*
 * Output.
 * ------------------------------------------------------------------------ */

$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => implode(
			' ',
			array_filter(
				array(
					'wbg-slider-curve-images-parent',
					'alignfull',
					$wbg_is_right ? 'content--right' : '',
				)
			)
		),
	)
);
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <?php if ( $wbg_has_title ) : ?>
  <div class="wbg-slider-curve-images-parent__title-row">
    <div class="wbg-slider-curve-images-parent__title-container">
      <h2 class="wbg-slider-curve-images-parent__title h2--alt-small"><?php echo wp_kses_post( $wbg_title ); ?></h2>
    </div>
  </div>
  <?php endif; ?>

  <div class="wbg-slider-curve-images-parent__row">
    <div class="wbg-slider-curve-images-parent__col wbg-slider-curve-images-parent__col--content">
      <div class="wbg-slider-curve-images-parent__content">
        <?php if ( $wbg_meta_lines ) : ?>
        <div class="wbg-slider-curve-images-parent__meta">
          <?php foreach ( $wbg_meta_lines as $wbg_line ) : ?>
          <<?php echo esc_html( $wbg_meta_tag ); ?> class="wbg-slider-curve-images-parent__meta-line fake--p">
            <?php echo $wbg_line; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped above. ?>
          </<?php echo esc_html( $wbg_meta_tag ); ?>>
          <?php endforeach; ?>
        </div>
        <?php endif; ?>

        <?php if ( $wbg_has_subheading ) : ?>
        <<?php echo esc_html( $wbg_subheading_tag ); ?> class="wbg-slider-curve-images-parent__subheading fake--h6">
          <?php echo wp_kses_post( $wbg_subheading ); ?></<?php echo esc_html( $wbg_subheading_tag ); ?>>
        <?php endif; ?>

        <?php if ( $wbg_has_text( $wbg_heading ) ) : ?>
        <<?php echo esc_html( $wbg_heading_tag ); ?> class="wbg-slider-curve-images-parent__heading h2--alt-small">
          <?php echo wp_kses_post( $wbg_heading ); ?></<?php echo esc_html( $wbg_heading_tag ); ?>>
        <?php endif; ?>

        <?php if ( $wbg_has_text( $wbg_text ) ) : ?>
        <p class="wbg-slider-curve-images-parent__text"><?php echo wp_kses_post( $wbg_text ); ?></p>
        <?php endif; ?>

        <?php if ( $wbg_buttons ) : ?>
        <div class="wbg-slider-curve-images-parent__buttons">
          <?php echo implode( '', $wbg_buttons ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped above. ?>
        </div>
        <?php endif; ?>
      </div>
    </div>

    <div class="wbg-slider-curve-images-parent__col wbg-slider-curve-images-parent__col--spacer fake-slider-container"></div>

    <?php if ( $wbg_slider ) : ?>
    <div class="wbg-slider-curve-images-parent__slider-container" aria-hidden="true">
      <div class="wbg-slider-curve-images-parent__slider">
        <?php echo $wbg_slider; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Inner blocks markup. ?>
      </div>
    </div>
    <?php endif; ?>
  </div>
</div>