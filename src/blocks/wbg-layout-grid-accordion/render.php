<?php
/**
 * Layout - Grid - Accordion: front-end render.
 *
 * Outputs the card grid collapsed (class "is-collapsed") so only the first
 * rows are visible on load, with no layout shift. Which cards are hidden is
 * decided in CSS per breakpoint (see style.scss); view.js only toggles the
 * collapsed state, animates the height and swaps the button label.
 *
 * Padding, background color and background image are applied to the wrapper
 * by WordPress' native block supports via get_block_wrapper_attributes()
 * (background image is injected by the core background support filter).
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

// Nothing to show if there are no cards.
if ( '' === trim( (string) $content ) ) {
	return;
}

$wbg_columns = isset( $attributes['columns'] ) ? (int) $attributes['columns'] : 4;
$wbg_columns = max( 2, min( 4, $wbg_columns ) );

// Keep in sync with MAX_ROWS in edit.js and $wbg-max-rows in style.scss.
$wbg_rows = isset( $attributes['visibleRows'] ) ? (int) $attributes['visibleRows'] : 2;
$wbg_rows = max( 1, min( 6, $wbg_rows ) );

$wbg_grid_id    = wp_unique_id( 'wbg-grid-accordion-' );
$wbg_label_more = __( 'See More', 'wbg-blocks' );
$wbg_label_less = __( 'See Less', 'wbg-blocks' );

$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => sprintf(
			'wbg-layout-grid-accordion wbg-layout-grid-accordion--cols-%1$d wbg-layout-grid-accordion--rows-%2$d is-collapsed',
			$wbg_columns,
			$wbg_rows
		),
	)
);
?>
<div
  <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped by get_block_wrapper_attributes(). ?>>
  <div class="wbg-layout-grid-accordion__wrapper">
    <div class="wbg-layout-grid-accordion__grid" id="<?php echo esc_attr( $wbg_grid_id ); ?>">
      <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Rendered inner blocks. ?>
    </div>

    <div class="wbg-layout-grid-accordion__actions">
      <button type="button" class="wbg-layout-grid-accordion__toggle wp-element-button" aria-expanded="false"
        aria-controls="<?php echo esc_attr( $wbg_grid_id ); ?>"
        data-label-more="<?php echo esc_attr( $wbg_label_more ); ?>"
        data-label-less="<?php echo esc_attr( $wbg_label_less ); ?>">
        <span class="wbg-layout-grid-accordion__toggle-label"><?php echo esc_html( $wbg_label_more ); ?></span>
      </button>
    </div>
  </div>
</div>