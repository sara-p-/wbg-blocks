<?php
/**
 * Card icon helper.
 *
 * Lives in <plugin>/inc/ and is loaded from the main plugin file with:
 *     require_once plugin_dir_path( __FILE__ ) . 'inc/icon-helper.php';
 *
 * It must NOT live in render.php: render.php is included once per block
 * instance, so declaring a function there causes a "cannot redeclare" fatal
 * the second time the block appears on a page.
 *
 * @package wbg-blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'wbg_blocks_get_icon_svg' ) ) {

	/**
	 * Returns the inline SVG markup for a card icon slug, or '' if none/missing.
	 *
	 * Only slugs in the allowlist below can be loaded, so a tampered attribute
	 * can't be used to read arbitrary files.
	 *
	 * @param string $slug Icon slug saved in the block's "icon" attribute.
	 * @return string
	 */
	function wbg_blocks_get_icon_svg( $slug ) {
		static $cache = array();

		$icons = array(
			'bonsai'    => 'bonsai.svg',
			'building'  => 'building.svg',
			'butterfly' => 'butterfly.svg',
			'education' => 'education.svg',
			'flowers'   => 'flowers.svg',
			'group'     => 'group.svg',
			'heron'     => 'heron.svg',
			'lilypads'  => 'lilypads.svg',
			'planting'  => 'planting.svg',
		);

		if ( ! isset( $icons[ $slug ] ) ) {
			return '';
		}

		if ( isset( $cache[ $slug ] ) ) {
			return $cache[ $slug ];
		}

		// This file is in <plugin>/inc/, so __DIR__'s parent is the plugin root.
		// plugin_dir_path( __DIR__ ) returns that root with a trailing slash.
		$path = plugin_dir_path( __DIR__ ) . 'assets/icons/' . $icons[ $slug ];

		if ( ! is_readable( $path ) ) {
			return '';
		}

		$svg = (string) file_get_contents( $path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents

		// Drop the XML prolog, doctype and comments that design tools often add.
		$svg = preg_replace( '/<\?xml.*?\?>|<!DOCTYPE.*?>|
  <!--.*?-->/is', '', $svg );

  // Keep it out of the tab order (old Edge/IE focus SVGs otherwise).
  $processor = new WP_HTML_Tag_Processor( $svg );
  if ( $processor->next_tag( 'svg' ) ) {
  $processor->set_attribute( 'focusable', 'false' );
  $svg = $processor->get_updated_html();
  }

  $cache[ $slug ] = trim( $svg );

  return $cache[ $slug ];
  }
  }