<?php
/**
 * Content - Pill Image: front-end render.
 *
 * The native Background panel stores its values in style.background, but
 * serialization is skipped in block.json, so the wrapper only receives the
 * background colour and padding. The image is applied to the inner pill.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content (unused).
 * @var WP_Block $block      Block instance.
 *
 * @package wbg-blocks
 */

$wbg_background = $attributes['style']['background'] ?? array();
$wbg_image      = $wbg_background['backgroundImage'] ?? null;
$wbg_image_url  = is_array( $wbg_image ) ? ( $wbg_image['url'] ?? '' ) : (string) $wbg_image;

// Nothing to show without an image.
if ( '' === $wbg_image_url ) {
	return;
}

$wbg_pill_styles = wp_style_engine_get_styles(
	array(
		'background' => array(
			'backgroundImage'    => array( 'url' => esc_url_raw( $wbg_image_url ) ),
			'backgroundSize'     => $wbg_background['backgroundSize'] ?? null,
			'backgroundPosition' => $wbg_background['backgroundPosition'] ?? null,
			'backgroundRepeat'   => $wbg_background['backgroundRepeat'] ?? null,
		),
	)
);

$wbg_pill_css = $wbg_pill_styles['css'] ?? '';

$wbg_wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => 'wbg-content-pill-image alignfull',
	)
);
?>
<div <?php echo $wbg_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
  <div class="wbg-content-pill-image__inner">
    <div class="wbg-content-pill-image__pill" style="<?php echo esc_attr( $wbg_pill_css ); ?>"></div>
  </div>
</div>