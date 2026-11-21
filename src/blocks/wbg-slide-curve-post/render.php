<?php
/**
 * Slide - Curve - Post: front-end render.
 *
 * Shows ONE post, passed in by the parent Curve Slider - Post through block
 * context (postId / postType). The parent runs the query and renders this
 * block once per post; this file only reads the post it's given.
 *
 * In the editor, ServerSideRender sends the post as `post_id`, and WP turns
 * that into the same postId context.
 *
 * Field mapping (ACF field name -> slide part):
 * - date, time            -> meta line 1: "date | time"
 * - price, member_price   -> meta line 2: "$price Non-Members | $member Members"
 * - Post title            -> heading
 * - description           -> text (was the paragraph inner block)
 * - button_1, button_2    -> buttons (ACF Link fields, Link Array)
 * - Featured image        -> image (was the block's background image)
 *
 * Heading levels change with whether the parent slider has a title (its
 * title circle is an h2), so the page outline stays in order:
 * - Slider title:    heading h3.h2--alt-small, meta h4.fake--p
 * - No slider title: heading h2.h2--alt-small, meta h3.fake--p
 *
 * The slider title comes from block context ("wbg-blocks/sliderTitle"),
 * provided by wbg-blocks/wbg-slider-curve-post.
 *
 * @var array    $attributes Block attributes (none of its own).
 * @var string   $content    Unused (no inner blocks).
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

/*
 * Post: from block context.
 * ------------------------------------------------------------------------ */

// Same filter the parent slider uses for its Post type option.
$wbg_post_types = (array) apply_filters( 'wbg_slider_curve_post_post_types', array( 'event', 'program' ) );

$wbg_post_id = isset( $block->context['postId'] ) ? absint( $block->context['postId'] ) : 0;
$wbg_post    = $wbg_post_id ? get_post( $wbg_post_id ) : null;

// Only a published Event / Program. This also skips the extra copy WP
// renders as the parent's $content before the parent runs its query (that
// copy gets the page's own ID).
if (
	! $wbg_post instanceof WP_Post
	|| 'publish' !== $wbg_post->post_status
	|| ! in_array( $wbg_post->post_type, $wbg_post_types, true )
) {
	return;
}

$wbg_post_id = $wbg_post->ID;

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
$wbg_description  = $wbg_get( 'description' );
$wbg_buttons      = array_filter( array( $wbg_button( 'button_1' ), $wbg_button( 'button_2' ) ) );

// Plain textarea values have no <p> tags; add them so spacing matches.
if ( $wbg_has_text( $wbg_description ) && false === stripos( $wbg_description, '<p' ) ) {
	$wbg_description = wpautop( $wbg_description );
}

// Parent slider's title (block context).
$wbg_slider_title     = isset( $block->context['wbg-blocks/sliderTitle'] ) && is_string( $block->context['wbg-blocks/sliderTitle'] )
	? $block->context['wbg-blocks/sliderTitle']
	: '';
$wbg_has_slider_title = $wbg_has_text( $wbg_slider_title );

/*
 * Heading levels.
 * ------------------------------------------------------------------------ */

if ( $wbg_has_slider_title ) {
	// The slider's title circle is the h2.
	$wbg_heading_tag = 'h3';
	$wbg_meta_tag    = 'h4';
} else {
	$wbg_heading_tag = 'h2';
	$wbg_meta_tag    = 'h3';
}

/*
 * Meta lines: "date | time" and "$price Non-Members | $memberPrice Members".
 * ------------------------------------------------------------------------ */

$wbg_sep = ' <span class="wbg-slide-curve-post__sep" aria-hidden="true">|</span> ';

$wbg_line_datetime = array();
if ( $wbg_has_text( $wbg_date ) ) {
	$wbg_line_datetime[] = '<span class="wbg-slide-curve-post__date">' . wp_kses_post( $wbg_date ) . '</span>';
}
if ( $wbg_has_text( $wbg_time ) ) {
	$wbg_line_datetime[] = '<span class="wbg-slide-curve-post__time">' . wp_kses_post( $wbg_time ) . '</span>';
}

$wbg_line_pricing = array();
if ( $wbg_has_text( $wbg_price ) ) {
	$wbg_line_pricing[] = sprintf(
		'<span class="wbg-slide-curve-post__price">%1$s <span class="wbg-slide-curve-post__price-label">%2$s</span></span>',
		wp_kses_post( $wbg_price ),
		esc_html__( 'Non-Members', 'wbg-blocks' )
	);
}
if ( $wbg_has_text( $wbg_member_price ) ) {
	$wbg_line_pricing[] = sprintf(
		'<span class="wbg-slide-curve-post__member-price">%1$s <span class="wbg-slide-curve-post__price-label">%2$s</span></span>',
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
 * Featured image -> the __image div.
 * Size/position/repeat come from the defaults in style.scss.
 * ------------------------------------------------------------------------ */

$wbg_image_url = get_the_post_thumbnail_url( $wbg_post_id, 'full' );
$wbg_image_css = $wbg_image_url ? 'background-image:url("' . esc_url( $wbg_image_url ) . '");' : '';

/*
 * Output.
 * ------------------------------------------------------------------------ */

// Content is always on the left, image on the right.
$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => 'wbg-slide-curve-post',
	)
);
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <div class="wbg-slide-curve-post__row">
    <div class="wbg-slide-curve-post__col wbg-slide-curve-post__col--content">
      <div class="wbg-slide-curve-post__content">
        <?php if ( $wbg_meta_lines ) : ?>
        <div class="wbg-slide-curve-post__meta">
          <?php foreach ( $wbg_meta_lines as $wbg_line ) : ?>
          <<?php echo esc_html( $wbg_meta_tag ); ?> class="wbg-slide-curve-post__meta-line fake--p">
            <?php echo $wbg_line; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped above. ?>
          </<?php echo esc_html( $wbg_meta_tag ); ?>>
          <?php endforeach; ?>
        </div>
        <?php endif; ?>

        <?php if ( $wbg_has_text( $wbg_heading ) ) : ?>
        <<?php echo esc_html( $wbg_heading_tag ); ?> class="wbg-slide-curve-post__heading h2--alt-small">
          <?php echo wp_kses_post( $wbg_heading ); ?></<?php echo esc_html( $wbg_heading_tag ); ?>>
        <?php endif; ?>

        <?php if ( $wbg_has_text( $wbg_description ) || $wbg_buttons ) : ?>
        <div class="wbg-slide-curve-post__inner">
          <?php if ( $wbg_has_text( $wbg_description ) ) : ?>
          <div class="wbg-slide-curve-post__description">
            <?php echo wp_kses_post( $wbg_description ); ?>
          </div>
          <?php endif; ?>

          <?php if ( $wbg_buttons ) : ?>
          <div class="wp-block-buttons wbg-slide-curve-post__buttons">
            <?php foreach ( $wbg_buttons as $wbg_btn ) : ?>
            <div class="wp-block-button">
              <a class="wp-block-button__link wp-element-button" href="<?php echo esc_url( $wbg_btn['url'] ); ?>"
                <?php if ( '_blank' === $wbg_btn['target'] ) : ?> target="_blank" rel="noopener"
                <?php endif; ?>><?php echo esc_html( $wbg_btn['text'] ); ?></a>
            </div>
            <?php endforeach; ?>
          </div>
          <?php endif; ?>
        </div>
        <?php endif; ?>
      </div>
    </div>

    <div class="wbg-slide-curve-post__col wbg-slide-curve-post__col--spacer fake-image-container"></div>

    <?php if ( '' !== $wbg_image_css ) : ?>
    <div class="wbg-slide-curve-post__image-container">
      <div class="wbg-slide-curve-post__image" style="<?php echo esc_attr( $wbg_image_css ); ?>"></div>
    </div>
    <?php endif; ?>
  </div>
</div>