<?php
/**
 * Card - Circle: front-end render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks markup.
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

$wbg_heading    = isset( $attributes['heading'] ) ? trim( $attributes['heading'] ) : '';
$wbg_background = isset( $attributes['style']['background'] ) && is_array( $attributes['style']['background'] )
	? $attributes['style']['background']
	: array();

// Background support skips serialization, so core leaves the wrapper alone
// and we apply the chosen image to the circle instead.
$wbg_circle_css = '';
if ( ! empty( $wbg_background['backgroundImage'] ) ) {
	$wbg_circle_styles = wp_style_engine_get_styles( array( 'background' => $wbg_background ) );
	$wbg_circle_css    = isset( $wbg_circle_styles['css'] ) ? $wbg_circle_styles['css'] : '';
}

$wbg_circle_classes = 'wbg-card-circle__circle' . ( '' !== $wbg_circle_css ? ' has-image' : '' );

$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => 'wbg-card-circle',
	)
);
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <div class="<?php echo esc_attr( $wbg_circle_classes ); ?>"
    <?php echo '' !== $wbg_circle_css ? ' style="' . esc_attr( $wbg_circle_css ) . '"' : ''; ?> aria-hidden="true">
  </div>
  <?php if ( '' !== $wbg_heading ) : ?>
  <h2 class="wp-block-heading wbg-card-circle__heading"><?php echo wp_kses_post( $wbg_heading ); ?></h2>
  <?php endif; ?>
  <?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
</div>