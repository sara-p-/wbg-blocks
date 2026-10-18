<?php
/**
 * Hero - Simple: front-end render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks markup (core/buttons).
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

if ( ! function_exists( 'wbg_hero_simple_has_text' ) ) {
	/**
	 * True if a rich text value contains visible text (not just tags/whitespace).
	 *
	 * @param string $html Rich text HTML.
	 * @return bool
	 */
	function wbg_hero_simple_has_text( $html ) {
		return '' !== trim( html_entity_decode( wp_strip_all_tags( (string) $html ), ENT_QUOTES, 'UTF-8' ) );
	}
}

$wbg_subheading  = $attributes['subheading'] ?? '';
$wbg_heading     = $attributes['heading'] ?? '';
$wbg_text        = $attributes['text'] ?? '';
$wbg_text_size   = $attributes['textSize'] ?? 'normal';

$wbg_has_subheading = wbg_hero_simple_has_text( $wbg_subheading );
$wbg_has_heading    = wbg_hero_simple_has_text( $wbg_heading );
$wbg_has_text       = wbg_hero_simple_has_text( $wbg_text );

// With a subheading: subheading = h1.fake--h6, heading = h2.fake--h1.
// Without one: heading = plain h1.
$wbg_heading_tag   = $wbg_has_subheading ? 'h2' : 'h1';
$wbg_heading_class = 'wp-block-heading wbg-hero-simple__heading' . ( $wbg_has_subheading ? ' fake--h1' : '' );

$wbg_wrapper_classes = array( 'wbg-hero-simple' );

if ( 'large' === $wbg_text_size ) {
	$wbg_wrapper_classes[] = 'font-size--large';
}

$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => implode( ' ', $wbg_wrapper_classes ),
	)
);
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <div class="wbg-hero-simple__wrapper">
    <div class="wbg-hero-simple__content">
      <?php if ( $wbg_has_subheading ) : ?>
      <h1 class="wp-block-heading wbg-hero-simple__subheading fake--h6"><?php echo wp_kses_post( $wbg_subheading ); ?>
      </h1>
      <?php endif; ?>

      <?php if ( $wbg_has_heading ) : ?>
      <div class="wbg-hero-simple__heading-container">
        <<?php echo esc_html( $wbg_heading_tag ); ?> class="<?php echo esc_attr( $wbg_heading_class ); ?>">
          <?php echo wp_kses_post( $wbg_heading ); ?></<?php echo esc_html( $wbg_heading_tag ); ?>>
      </div>
      <?php endif; ?>

      <?php if ( $wbg_has_text ) : ?>
      <div class="wbg-hero-simple__text-container">
        <p class="wbg-hero-simple__text"><?php echo wp_kses_post( $wbg_text ); ?></p>
      </div>
      <?php endif; ?>
    </div>

    <?php if ( '' !== trim( $content ) ) : ?>
    <div class="wbg-hero-simple__buttons">
      <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div>
    <?php endif; ?>
  </div>
</div>