<?php
/**
 * Slide - Testimonial: front-end render.
 *
 * Shows ONE testimonial, passed in by the parent Testimonial Slider through
 * block context (postId / postType). The parent runs the query and renders
 * this block once per testimonial; this file only reads the post it's given.
 *
 * In the editor, ServerSideRender sends the post as `post_id`, and WP turns
 * that into the same postId context.
 *
 * Field mapping:
 * - Featured image -> image (right on desktop)
 * - Post title     -> name (bottom-left)
 * - quote (ACF)    -> quote, under the name
 *
 * Markup
 * The slide shares the slider's grid (CSS subgrid). Its __placeholder is an
 * empty top-left cell that keeps room for the slider's static heading, text
 * and buttons.
 *
 * Name heading level: one below the slider's lowest heading, so the page
 * outline nests (it always looks like an h3):
 * - Slider heading + subheading: h4.fake--h3
 * - Only one of them:            h3
 * - Neither:                     h2.fake--h3
 *
 * Accessibility
 * - The quote is a <blockquote>; its curly quotes are hidden from screen
 *   readers, which otherwise may read them out.
 * - The image's alt text comes from the Media Library. A portrait next to
 *   the person's name can leave it empty (decorative).
 * - The line and the top-left placeholder are decorative (aria-hidden).
 *
 * @var array    $attributes Block attributes (none).
 * @var string   $content    Unused (no inner blocks).
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

/*
 * Post: from block context.
 * ------------------------------------------------------------------------ */

$wbg_post_id = isset( $block->context['postId'] ) ? absint( $block->context['postId'] ) : 0;
$wbg_post    = $wbg_post_id ? get_post( $wbg_post_id ) : null;

// Only a published Testimonial. This also skips the extra copy WP renders
// as the parent's $content before the parent runs its query (that copy gets
// the page's own ID).
if (
	! $wbg_post instanceof WP_Post
	|| 'publish' !== $wbg_post->post_status
	|| 'testimonial' !== $wbg_post->post_type
) {
	return;
}

$wbg_post_id = $wbg_post->ID;

/*
 * Helpers.
 * ------------------------------------------------------------------------ */

// True when a value has visible text (ignores tags and &nbsp;).
$wbg_has_text = static function ( $value ) {
	return '' !== trim( str_replace( '&nbsp;', ' ', wp_strip_all_tags( (string) $value ) ) );
};

/*
 * Post data.
 * ------------------------------------------------------------------------ */

$wbg_name = get_the_title( $wbg_post_id );

// ACF value (formatted), falling back to raw post meta if ACF is inactive.
$wbg_quote = function_exists( 'get_field' )
	? get_field( 'quote', $wbg_post_id )
	: get_post_meta( $wbg_post_id, 'quote', true );
$wbg_quote = is_string( $wbg_quote ) ? $wbg_quote : '';

// The textarea's "New Lines" setting may add <br> or <p> tags. Turn them
// back into plain line breaks so the markup is always the same.
$wbg_quote = preg_replace( '#<br\s*/?>#i', "\n", $wbg_quote );
$wbg_quote = preg_replace( '#</p>\s*<p[^>]*>#i', "\n\n", $wbg_quote );
  $wbg_quote = trim( wp_strip_all_tags( $wbg_quote ) );

  // The slide adds its own curly quotes, so drop any typed into the field.
  $wbg_quote = (string) preg_replace( '/^[\s"\'“”‘’]+|[\s"\'“”‘’]+$/u', '', $wbg_quote );

  /*
  * Name heading level.
  * ------------------------------------------------------------------------ */

  $wbg_slider_heading = isset( $block->context['wbg-blocks/sliderHeading'] ) ? (string)
  $block->context['wbg-blocks/sliderHeading'] : '';
  $wbg_slider_subheading = isset( $block->context['wbg-blocks/sliderSubheading'] ) ? (string)
  $block->context['wbg-blocks/sliderSubheading'] : '';

  $wbg_has_slider_heading = $wbg_has_text( $wbg_slider_heading );
  $wbg_has_slider_subheading = $wbg_has_text( $wbg_slider_subheading );

  // One level below the slider's lowest heading, so the outline nests:
  // subheading h2 > heading h3 > name h4.
  if ( $wbg_has_slider_heading && $wbg_has_slider_subheading ) {
  $wbg_name_tag = 'h4';
  } elseif ( $wbg_has_slider_heading || $wbg_has_slider_subheading ) {
  $wbg_name_tag = 'h3';
  } else {
  $wbg_name_tag = 'h2';
  }

  // Always looks like an h3.
  $wbg_name_class = 'h3' === $wbg_name_tag
  ? 'wbg-slide-testimonial__name'
  : 'wbg-slide-testimonial__name fake--h3';

  /*
  * Featured image.
  * ------------------------------------------------------------------------ */

  $wbg_image = '';
  if ( has_post_thumbnail( $wbg_post_id ) ) {
  $wbg_image = wp_get_attachment_image(
  get_post_thumbnail_id( $wbg_post_id ),
  'large',
  false,
  array(
  'class' => 'wbg-slide-testimonial__image',
  'sizes' => '(min-width: 900px) 500px, 80vw',
  )
  );
  }

  /*
  * Output.
  * ------------------------------------------------------------------------ */

  $wbg_wrapper_attributes = get_block_wrapper_attributes(
  array(
  'class' => 'wbg-slide-testimonial',
  )
  );
  ?>
  <div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
    <div class="wbg-slide-testimonial__placeholder" aria-hidden="true"></div>

    <?php if ( '' !== $wbg_image ) : ?>
    <div class="wbg-slide-testimonial__image-container">
      <?php echo $wbg_image; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- wp_get_attachment_image(). ?>
    </div>
    <?php endif; ?>

    <div class="wbg-slide-testimonial__content">
      <?php if ( $wbg_has_text( $wbg_name ) ) : ?>
      <div class="wbg-slide-testimonial__name-row">
        <<?php echo esc_html( $wbg_name_tag ); ?> class="<?php echo esc_attr( $wbg_name_class ); ?>">
          <?php echo wp_kses_post( $wbg_name ); ?></<?php echo esc_html( $wbg_name_tag ); ?>>
        <span class="wbg-slide-testimonial__line" aria-hidden="true"></span>
      </div>
      <?php endif; ?>

      <?php if ( '' !== $wbg_quote ) : ?>
      <blockquote class="wbg-slide-testimonial__quote">
        <p><span aria-hidden="true">&ldquo;</span><?php echo nl2br( esc_html( $wbg_quote ) ); ?><span
            aria-hidden="true">&rdquo;</span></p>
      </blockquote>
      <?php endif; ?>
    </div>
  </div>