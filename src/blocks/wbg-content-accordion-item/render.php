<?php
/**
 * Content - Accordion Item: front-end render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks markup.
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

$wbg_heading  = isset( $attributes['heading'] ) ? $attributes['heading'] : '';
$wbg_id       = wp_unique_id( 'wbg-accordion-item-' );
$wbg_toggle   = $wbg_id . '-toggle';
$wbg_panel    = $wbg_id . '-panel';

$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => 'wbg-content-accordion-item',
	)
);
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <h3 class="wbg-content-accordion-item__heading fake--h5">
    <button type="button" id="<?php echo esc_attr( $wbg_toggle ); ?>" class="wbg-content-accordion-item__toggle"
      aria-expanded="false" aria-controls="<?php echo esc_attr( $wbg_panel ); ?>">
      <span class="wbg-content-accordion-item__heading-text"><?php echo wp_kses_post( $wbg_heading ); ?></span>
      <span class="wbg-content-accordion-item__icon" aria-hidden="true"></span>
    </button>
  </h3>

  <div id="<?php echo esc_attr( $wbg_panel ); ?>" class="wbg-content-accordion-item__panel" role="region"
    aria-labelledby="<?php echo esc_attr( $wbg_toggle ); ?>" inert>
    <div class="wbg-content-accordion-item__panel-inner">
      <div class="wbg-content-accordion-item__panel-content">
        <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
      </div>
    </div>
  </div>
</div>