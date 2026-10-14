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

$button_text = ! empty( $attributes['buttonText'] ) ? $attributes['buttonText'] : __( 'Menu', 'wbg-blocks' );
$close_text  = ! empty( $attributes['closeButtonText'] ) ? $attributes['closeButtonText'] : __( 'Close', 'wbg-blocks' );

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
    aria-controls="<?php echo esc_attr( $panel_id ); ?>">
    <?php echo esc_html( $button_text ); ?>
  </button>

  <div id="<?php echo esc_attr( $panel_id ); ?>" class="wbg-mega-menu__panel" tabindex="-1">
    <button type="button" class="wbg-mega-menu__close">
      <?php echo esc_html( $close_text ); ?>
    </button>

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