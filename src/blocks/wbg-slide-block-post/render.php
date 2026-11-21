<?php
/**
 * Slide - Block - Post: front-end render.
 *
 * Shows ONE post: the newest published Event. The parent slider
 * (wbg-slider-block-post) will take over the query later and pass each
 * post in.
 *
 * Field mapping (ACF field name -> slide part):
 * - date, time            -> meta column, h3: "date | time"
 * - price, member_price   -> meta column: "price Non-Members | member_price Members"
 * - button_1, button_2    -> meta column, buttons (ACF Link fields, Link Array)
 * - Post title            -> content column, h2 heading
 * - description           -> content column, text
 * - Featured image        -> the block's background image
 *
 * @var array    $attributes Block attributes (none).
 * @var string   $content    Unused (dynamic block, no inner blocks).
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

/*
 * Query: newest published Event.
 * ------------------------------------------------------------------------ */

$wbg_query_args = apply_filters(
	'wbg_slide_block_post_query_args',
	array(
		'post_type'           => 'event',
		'post_status'         => 'publish',
		'posts_per_page'      => 1,
		'orderby'             => 'date',
		'order'               => 'DESC',
		'ignore_sticky_posts' => true,
		'no_found_rows'       => true,
		'fields'              => 'ids',
	),
	$attributes,
	$block
);

$wbg_post_ids = get_posts( $wbg_query_args );
if ( empty( $wbg_post_ids ) ) {
	return; // Nothing to show. The editor shows its "No published Events" placeholder.
}
$wbg_post_id = (int) $wbg_post_ids[0];

/*
 * Helpers.
 * ------------------------------------------------------------------------ */

// ACF value (formatted), falling back to raw post meta if ACF is inactive.
$wbg_field = static function ( $name ) use ( $wbg_post_id ) {
	$value = function_exists( 'get_field' )
		? get_field( $name, $wbg_post_id )
		: get_post_meta( $wbg_post_id, $name, true );
	return $value;
};

$wbg_get = static function ( $name ) use ( $wbg_field ) {
	$value = $wbg_field( $name );
	return is_string( $value ) || is_numeric( $value ) ? (string) $value : '';
};

// True when a value has visible text (ignores tags and &nbsp;).
$wbg_has_text = static function ( $value ) {
	return '' !== trim( str_replace( '&nbsp;', ' ', wp_strip_all_tags( (string) $value ) ) );
};

/*
 * ACF Link field (Return Value: Link Array) -> button data.
 *
 * ACF returns array( 'title' => ..., 'url' => ..., 'target' => ... ), or
 * an empty value when the field is blank. A button needs both a title and
 * a URL to be output.
 */
$wbg_button = static function ( $name ) use ( $wbg_field ) {
	$link = $wbg_field( $name );
	if ( ! is_array( $link ) ) {
		return null;
	}

	$text   = isset( $link['title'] ) && is_string( $link['title'] ) ? trim( $link['title'] ) : '';
	$url    = isset( $link['url'] ) && is_string( $link['url'] ) ? trim( $link['url'] ) : '';
	$target = isset( $link['target'] ) && is_string( $link['target'] ) ? $link['target'] : '';

	if ( '' === $text || '' === $url ) {
		return null;
	}

	return array(
		'text'   => $text,
		'url'    => $url,
		'target' => $target,
	);
};

/*
 * Post data.
 * ------------------------------------------------------------------------ */

$wbg_date         = $wbg_get( 'date' );
$wbg_time         = $wbg_get( 'time' );
$wbg_price        = $wbg_get( 'price' );
$wbg_member_price = $wbg_get( 'member_price' );
$wbg_heading      = get_the_title( $wbg_post_id );
$wbg_text         = $wbg_get( 'description' );
$wbg_buttons      = array_filter( array( $wbg_button( 'button_1' ), $wbg_button( 'button_2' ) ) );

// Plain textarea values have no <p> tags; add them so spacing matches.
if ( $wbg_has_text( $wbg_text ) && false === stripos( $wbg_text, '<p' ) ) {
	$wbg_text = wpautop( $wbg_text );
}

/*
 * Meta lines: "date | time" and "price Non-Members | member_price Members".
 * ------------------------------------------------------------------------ */

$wbg_sep = ' <span class="wbg-slide-block-post__sep" aria-hidden="true">|</span> ';

$wbg_line_datetime = array();
if ( $wbg_has_text( $wbg_date ) ) {
	$wbg_line_datetime[] = '<span class="wbg-slide-block-post__date">' . wp_kses_post( $wbg_date ) . '</span>';
}
if ( $wbg_has_text( $wbg_time ) ) {
	$wbg_line_datetime[] = '<span class="wbg-slide-block-post__time">' . wp_kses_post( $wbg_time ) . '</span>';
}

$wbg_line_pricing = array();
if ( $wbg_has_text( $wbg_price ) ) {
	$wbg_line_pricing[] = sprintf(
		'<span class="wbg-slide-block-post__price">%1$s <span class="wbg-slide-block-post__price-label">%2$s</span></span>',
		wp_kses_post( $wbg_price ),
		esc_html__( 'Non-Members', 'wbg-blocks' )
	);
}
if ( $wbg_has_text( $wbg_member_price ) ) {
	$wbg_line_pricing[] = sprintf(
		'<span class="wbg-slide-block-post__member-price">%1$s <span class="wbg-slide-block-post__price-label">%2$s</span></span>',
		wp_kses_post( $wbg_member_price ),
		esc_html__( 'Members', 'wbg-blocks' )
	);
}

/*
 * Featured image -> the block's background.
 * Size/position/repeat come from the defaults in style.scss.
 * ------------------------------------------------------------------------ */

$wbg_image_url = get_the_post_thumbnail_url( $wbg_post_id, 'full' );
$wbg_image_css = $wbg_image_url ? 'background-image:url("' . esc_url( $wbg_image_url ) . '");' : '';

/*
 * Output.
 * ------------------------------------------------------------------------ */

$wbg_wrapper_args = array( 'class' => 'wbg-slide-block-post' );
if ( '' !== $wbg_image_css ) {
	$wbg_wrapper_args['style'] = $wbg_image_css;
}
$wbg_wrapper_attributes = get_block_wrapper_attributes( $wbg_wrapper_args );
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <div class="wbg-slide-block-post__inner">
    <div class="wbg-slide-block-post__col wbg-slide-block-post__col--meta">
      <?php if ( $wbg_line_datetime || $wbg_line_pricing ) : ?>
      <div class="wbg-slide-block-post__meta">
        <?php if ( $wbg_line_datetime ) : ?>
        <h3 class="wp-block-heading wbg-slide-block-post__meta-line wbg-slide-block-post__datetime">
          <?php echo implode( $wbg_sep, $wbg_line_datetime ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped above. ?>
        </h3>
        <?php endif; ?>

        <?php if ( $wbg_line_pricing ) : ?>
        <p class="wbg-slide-block-post__meta-line wbg-slide-block-post__pricing">
          <?php echo implode( $wbg_sep, $wbg_line_pricing ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped above. ?>
        </p>
        <?php endif; ?>
      </div>
      <?php endif; ?>

      <?php if ( $wbg_buttons ) : ?>
      <div class="wp-block-buttons wbg-slide-block-post__buttons">
        <?php foreach ( $wbg_buttons as $wbg_btn ) : ?>
        <div class="wp-block-button wbg-slide-block-post__button">
          <a class="wp-block-button__link wp-element-button" href="<?php echo esc_url( $wbg_btn['url'] ); ?>"
            <?php if ( '_blank' === $wbg_btn['target'] ) : ?> target="_blank" rel="noreferrer noopener"
            <?php endif; ?>><?php echo esc_html( $wbg_btn['text'] ); ?></a>
        </div>
        <?php endforeach; ?>
      </div>
      <?php endif; ?>
    </div>

    <div class="wbg-slide-block-post__col wbg-slide-block-post__col--content">
      <?php if ( $wbg_has_text( $wbg_heading ) ) : ?>
      <h2 class="wp-block-heading wbg-slide-block-post__heading"><?php echo wp_kses_post( $wbg_heading ); ?></h2>
      <?php endif; ?>

      <?php if ( $wbg_has_text( $wbg_text ) ) : ?>
      <div class="wbg-slide-block-post__text">
        <?php echo wp_kses_post( $wbg_text ); ?>
      </div>
      <?php endif; ?>
    </div>
  </div>
</div>