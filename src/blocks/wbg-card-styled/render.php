<?php
/**
 * Card - Styled: front-end render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks markup (unused – this block has none).
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

$wbg_heading     = $attributes['heading'] ?? '';
$wbg_text        = $attributes['text'] ?? '';
$wbg_button_text = $attributes['buttonText'] ?? '';
$wbg_button_url  = $attributes['buttonUrl'] ?? '';
$wbg_new_tab     = ! empty( $attributes['buttonOpensInNewTab'] );
$wbg_aria_label  = trim( $attributes['buttonAriaLabel'] ?? '' );
$wbg_icon        = $attributes['icon'] ?? 'none';

$wbg_has_heading = '' !== trim( wp_strip_all_tags( $wbg_heading ) );
$wbg_has_text    = '' !== trim( wp_strip_all_tags( $wbg_text ) );
$wbg_has_button  = '' !== trim( wp_strip_all_tags( $wbg_button_text ) ) && '' !== $wbg_button_url;

// Inline SVG markup (empty string for "none" or a missing file).
$wbg_icon_svg = function_exists( 'wbg_blocks_get_icon_svg' ) ? wbg_blocks_get_icon_svg( $wbg_icon ) : '';

// Block gap -> CSS custom property on the inner column.
$wbg_gap          = $attributes['style']['spacing']['blockGap'] ?? '';
$wbg_column_style = '';
if ( is_string( $wbg_gap ) && '' !== $wbg_gap ) {
	if ( str_starts_with( $wbg_gap, 'var:' ) ) {
		$wbg_gap = 'var(--wp--' . str_replace( '|', '--', substr( $wbg_gap, 4 ) ) . ')';
	}
	$wbg_column_style = '--wbg-card-gap:' . $wbg_gap . ';';
}

$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => 'wbg-card-styled',
	)
);
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <div class="wbg-card-styled__column"
    <?php echo $wbg_column_style ? ' style="' . esc_attr( $wbg_column_style ) . '"' : ''; ?>>

    <?php if ( $wbg_has_heading || $wbg_has_text ) : ?>
    <div class="wbg-card-styled__row wbg-card-styled__row--content">
      <?php if ( $wbg_has_heading ) : ?>
      <h2 class="wbg-card-styled__heading wp-block-heading"><?php echo wp_kses_post( $wbg_heading ); ?></h2>
      <?php endif; ?>

      <?php if ( $wbg_has_text ) : ?>
      <p class="wbg-card-styled__text"><?php echo wp_kses_post( $wbg_text ); ?></p>
      <?php endif; ?>
    </div>
    <?php endif; ?>

    <?php if ( $wbg_has_button || $wbg_icon_svg ) : ?>
    <div class="wbg-card-styled__row wbg-card-styled__row--footer">
      <?php if ( $wbg_has_button ) : ?>
      <div class="wp-block-button is-style-small-size is-style-small-size--4 wbg-card-styled__button-wrap">
        <a class="wp-block-button__link wp-element-button wbg-card-styled__button"
          href="<?php echo esc_url( $wbg_button_url ); ?>" <?php if ( $wbg_new_tab ) : ?> target="_blank"
          rel="noopener noreferrer" <?php endif; ?> <?php if ( '' !== $wbg_aria_label ) : ?>
          aria-label="<?php echo esc_attr( $wbg_aria_label ); ?>"
          <?php endif; ?>><?php echo wp_kses_post( $wbg_button_text ); ?></a>
      </div>
      <?php endif; ?>

      <?php if ( $wbg_icon_svg ) : ?>
      <span class="wbg-card-styled__icon" aria-hidden="true">
        <?php echo $wbg_icon_svg; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted SVG from the plugin's own assets folder. ?>
      </span>
      <?php endif; ?>
    </div>
    <?php endif; ?>

  </div>
</div>