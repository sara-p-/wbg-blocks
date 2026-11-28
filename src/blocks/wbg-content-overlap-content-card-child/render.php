<?php
/**
 * Content Overlap Content Card Child: front-end render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks markup (paragraph, buttons, content row, list, image).
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Headings. The subheading only renders when "Show subheading" is on and has text.
$wbg_subheading      = $attributes['subheading'] ?? '';
$wbg_heading         = $attributes['heading'] ?? '';
$wbg_show_subheading = ! empty( $attributes['showSubheading'] );
$wbg_has_subheading  = $wbg_show_subheading && '' !== trim( wp_strip_all_tags( $wbg_subheading ) );
$wbg_has_heading     = '' !== trim( wp_strip_all_tags( $wbg_heading ) );

// With a subheading: subheading is an <h2 class="fake--h6">, heading is an <h3 class="h1--alt">.
// Without one: heading is an <h2 class="h1--alt">.
$wbg_heading_tag = $wbg_has_subheading ? 'h3' : 'h2';

// Alignment of the subheading and heading together.
$wbg_heading_align = $attributes['headingAlign'] ?? 'center';
$wbg_heading_align = in_array( $wbg_heading_align, array( 'left', 'center', 'right' ), true ) ? $wbg_heading_align : 'center';

// Wrapper attributes: padding, background color, background image and text color come from block supports.
$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => 'wbg-content-overlap-content-card-child',
	)
);
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <div class="wbg-content-overlap-content-card-child__wrapper">
    <?php if ( $wbg_has_subheading || $wbg_has_heading ) : ?>
    <div class="wbg-content-overlap-content-card-child__header is-align-<?php echo esc_attr( $wbg_heading_align ); ?>">
      <?php if ( $wbg_has_subheading ) : ?>
      <h2 class="wbg-content-overlap-content-card-child__subheading fake--h6">
        <?php echo wp_kses_post( $wbg_subheading ); ?></h2>
      <?php endif; ?>

      <?php if ( $wbg_has_heading ) : ?>
      <<?php echo esc_html( $wbg_heading_tag ); ?> class="wbg-content-overlap-content-card-child__heading h1--alt">
        <?php echo wp_kses_post( $wbg_heading ); ?></<?php echo esc_html( $wbg_heading_tag ); ?>>
      <?php endif; ?>
    </div>
    <?php endif; ?>

    <?php if ( '' !== trim( $content ) ) : ?>
    <div class="wbg-content-overlap-content-card-child__row">
      <div class="wbg-content-overlap-content-card-child__content">
        <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
      </div>

      <div class="wbg-content-overlap-content-card-child__placeholder" aria-hidden="true"></div>
    </div>
    <?php endif; ?>
  </div>
</div>