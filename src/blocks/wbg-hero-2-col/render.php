<?php
/**
 * Hero - 2 Column: front-end render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks markup (core/buttons).
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

if ( ! function_exists( 'wbg_hero_2_col_has_text' ) ) {
	/**
	 * True if a rich text value contains visible text (not just tags/whitespace).
	 *
	 * @param string $html Rich text HTML.
	 * @return bool
	 */
	function wbg_hero_2_col_has_text( $html ) {
		return '' !== trim( html_entity_decode( wp_strip_all_tags( (string) $html ), ENT_QUOTES, 'UTF-8' ) );
	}
}

$wbg_subheading  = $attributes['subheading'] ?? '';
$wbg_heading     = $attributes['heading'] ?? '';
$wbg_layout = $attributes['layout'] ?? 'content-right';

$wbg_has_subheading = wbg_hero_2_col_has_text( $wbg_subheading );
$wbg_has_heading    = wbg_hero_2_col_has_text( $wbg_heading );

// With a subheading: subheading = h1.fake--h6, heading = h2.fake--h1.
// Without one: heading = plain h1.
$wbg_heading_tag   = $wbg_has_subheading ? 'h2' : 'h2';
$wbg_heading_class = 'wp-block-heading wbg-hero-2-col__heading' . ( $wbg_has_subheading ? ' fake--h2' : '' );

$wbg_wrapper_classes = array( 'wbg-hero-2-col' );

if ( 'content-left' === $wbg_layout ) {
	$wbg_wrapper_classes[] = 'layout--content-left';
}

$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => implode( ' ', $wbg_wrapper_classes ),
	)
);
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <div class="wbg-hero-2-col__wrapper">
    <div class="wbg-hero-2-col__row">
      <div class="wbg-hero-2-col__col wbg-hero-2-col__headings">
        <?php if ( $wbg_has_subheading ) : ?>
        <h1 class="wp-block-heading wbg-hero-2-col__subheading fake--h6"><?php echo wp_kses_post( $wbg_subheading ); ?>
        </h1>
        <?php endif; ?>

        <?php if ( $wbg_has_heading ) : ?>
        <<?php echo esc_html( $wbg_heading_tag ); ?> class="<?php echo esc_attr( $wbg_heading_class ); ?>">
          <?php echo wp_kses_post( $wbg_heading ); ?></<?php echo esc_html( $wbg_heading_tag ); ?>>
        <?php endif; ?>
      </div>
      <div class="wbg-hero-2-col__col">
        <?php if ( '' !== trim( $content ) ) : ?>
        <div class="wbg-hero-2-col__content">
          <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
        </div>
        <?php endif; ?>
      </div>
    </div>
  </div>
</div>