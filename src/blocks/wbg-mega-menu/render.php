<?php
/**
 * WBG Mega Menu – front-end render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block inner content (unused).
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

if ( ! function_exists( 'wbg_mega_menu_render_panel' ) ) {
	/**
	 * Render a Mega Menu Panel template part.
	 *
	 * Panels are stored as the template part ID ("theme//slug"). Rendering
	 * through core/template-part keeps all of core's behavior: block
	 * supports, global styles, user customizations and recursion protection.
	 *
	 * @param string $panel_id Template part ID.
	 * @return string Rendered HTML, or an empty string.
	 */
	function wbg_mega_menu_render_panel( $panel_id ) {
		if ( empty( $panel_id ) || ! is_string( $panel_id ) ) {
			return '';
		}

		$parts = explode( '//', $panel_id, 2 );

		if ( 2 === count( $parts ) ) {
			list( $theme, $slug ) = $parts;
		} else {
			$theme = get_stylesheet();
			$slug  = $parts[0];
		}

		return render_block(
			array(
				'blockName'    => 'core/template-part',
				'attrs'        => array(
					'slug'    => $slug,
					'theme'   => $theme,
					'tagName' => 'div',
				),
				'innerBlocks'  => array(),
				'innerHTML'    => '',
				'innerContent' => array(),
			)
		);
	}
}

$desktop_html = wbg_mega_menu_render_panel( $attributes['megaMenuPanel'] ?? '' );
$mobile_html  = wbg_mega_menu_render_panel( $attributes['mobileMenuPanel'] ?? '' );

// Nothing to open, so don't output a dead button.
if ( '' === trim( $desktop_html ) && '' === trim( $mobile_html ) ) {
	return;
}

$has_mobile = '' !== trim( $mobile_html );

// Trim first so a field containing only spaces falls back to the default.
$button_text = trim( (string) ( $attributes['buttonText'] ?? '' ) );
$close_text  = trim( (string) ( $attributes['closeButtonText'] ?? '' ) );

if ( '' === $button_text ) {
	$button_text = __( 'Menu', 'wbg-blocks' );
}

if ( '' === $close_text ) {
	$close_text = __( 'Close', 'wbg-blocks' );
}

$uid      = wp_unique_id( 'wbg-mega-menu-' );
$panel_id = $uid . '-panel';

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => trim( 'wbg-mega-menu ' . ( $has_mobile ? 'has-mobile-panel' : '' ) ),
	)
);
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <button type="button" class="wbg-mega-menu__toggle wp-element-button" aria-expanded="false"
    aria-controls="<?php echo esc_attr( $panel_id ); ?>" data-open-text="<?php echo esc_attr( $button_text ); ?>"
    data-close-text="<?php echo esc_attr( $close_text ); ?>"><span
      class="wbg-mega-menu__toggle-text"><?php echo esc_html( $button_text ); ?></span></button>

  <div id="<?php echo esc_attr( $panel_id ); ?>" class="wbg-mega-menu__panel" tabindex="-1">

    <?php if ( '' !== trim( $desktop_html ) ) : ?>
    <div class="wbg-mega-menu__content wbg-mega-menu__content--desktop">
      <?php echo $desktop_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Rendered block markup. ?>
    </div>
    <?php endif; ?>

    <?php if ( $has_mobile ) : ?>
    <div class="wbg-mega-menu__content wbg-mega-menu__content--mobile">
      <?php echo $mobile_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Rendered block markup. ?>
    </div>
    <?php endif; ?>
  </div>
</div>