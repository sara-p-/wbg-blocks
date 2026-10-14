<?php
/**
 * Mega Menu Panels: a custom template part area.
 *
 * Registers a "Mega Menu Panel" area so users can create template parts for
 * it in the Site Editor (Patterns → Add new → Template part → "Mega Menu
 * Panel"). These are ordinary template parts, so every core block and design
 * control is available, including core/navigation.
 *
 *     
 *
 * @package wbg-blocks
 */

defined( 'ABSPATH' ) || exit;

/**
 * Area slug. Must match PANEL_AREA in src/wbg-mega-menu/edit.js.
 */
const WBG_MEGA_MENU_PANEL_AREA = 'mega-menu-panel';

/**
 * Register the template part area.
 *
 * @param array $areas Registered template part areas.
 * @return array
 */
function wbg_register_mega_menu_panel_area( $areas ) {
	$areas[] = array(
		'area'        => WBG_MEGA_MENU_PANEL_AREA,
		'area_tag'    => 'div',
		'label'       => __( 'Mega Menu Panel', 'wbg-blocks' ),
		'description' => __( 'Panels opened by the WBG Mega Menu block. Build them with navigation, columns, groups and any other blocks.', 'wbg-blocks' ),
		// Unknown icon names fall back to the generic template part icon.
		'icon'        => 'layout',
	);

	return $areas;
}
add_filter( 'default_wp_template_part_areas', 'wbg_register_mega_menu_panel_area' );

/**
 * Starter pattern offered when a user creates a new Mega Menu Panel.
 *
 * The "core/template-part/{area}" block type makes it show up as a starting
 * point for template parts in this area.
 */
function wbg_register_mega_menu_panel_patterns() {
	$column = sprintf(
		'<!-- wp:column -->
<div class="wp-block-column"><!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">%s</h3>
<!-- /wp:heading -->

<!-- wp:navigation {"overlayMenu":"never","layout":{"type":"flex","orientation":"vertical"}} /--></div>
<!-- /wp:column -->',
		esc_html__( 'Column heading', 'wbg-blocks' )
	);

	register_block_pattern(
		'wbg-blocks/mega-menu-panel-three-columns',
		array(
			'title'      => __( 'Mega Menu Panel: Three Columns', 'wbg-blocks' ),
			'categories' => array( 'header' ),
			'blockTypes' => array( 'core/template-part/' . WBG_MEGA_MENU_PANEL_AREA ),
			'content'    => '<!-- wp:group {"align":"full","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull"><!-- wp:columns -->
<div class="wp-block-columns">' . $column . $column . $column . '</div>
<!-- /wp:columns --></div>
<!-- /wp:group -->',
		)
	);
}
add_action( 'init', 'wbg_register_mega_menu_panel_patterns' );